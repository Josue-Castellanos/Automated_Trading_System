import numpy as np
import pandas as pd


def ttm_squeeze_momentum(
    data,
    length=20,
    nBB=2.0,
    nK_Mid=1.5,
    nK_Low=2.0,
    nK_High=1.0,
    fast=6,
    slow=12,
    signal=8,
):
    # --- Single DataFrame case ---
    if isinstance(data, pd.DataFrame):
        return _compute_ttm_squeeze(
            data.copy(), length, nBB, nK_Mid, nK_Low, nK_High, fast, slow, signal
        )

    # --- Dict of DataFrames case ---
    elif isinstance(data, dict):
        results = {}
        sqzs = {}
        for tf, df in data.items():
            results[tf] = _compute_ttm_squeeze(
                df.copy(), length, nBB, nK_Mid, nK_Low, nK_High, fast, slow, signal
            )
            sqzs[f'sqz{tf}'] = results[tf]['squeeze_color']


        sqzs_df = pd.concat(sqzs, axis=1).ffill()
        sqzs_df.fillna("black", inplace=True)
        sqzs_df.insert(0, "count", ((sqzs_df == "gold") | (sqzs_df == "blue")).sum(axis=1))

        return results, sqzs_df

    else:
        raise TypeError("Input must be a pandas DataFrame or dict of DataFrames.")


def _compute_ttm_squeeze(
    data, length, nBB, nK_Mid, nK_Low, nK_High, fast, slow, signal
):
    # Exponential Moving Average (Keltner Midline)
    data["Keltner_Mid"] = data["Close"].ewm(span=length, adjust=False).mean()

    # True Range Calculation for ATR
    data["tr1"] = data["High"] - data["Low"]
    data["tr2"] = abs(data["High"] - data["Close"].shift(1))
    data["tr3"] = abs(data["Low"] - data["Close"].shift(1))
    data["true_range"] = data[["tr1", "tr2", "tr3"]].max(axis=1)
    data["atr"] = data["true_range"].ewm(span=length, adjust=False).mean()

    # Keltner Channel Bands
    data["KeltHigh"] = data["Keltner_Mid"] + nK_High * data["atr"]
    data["KeltMid"] = data["Keltner_Mid"] + nK_Mid * data["atr"]
    data["KeltLow"] = data["Keltner_Mid"] + nK_Low * data["atr"]
    data["KeltLower"] = data["Keltner_Mid"] - nK_Mid * data["atr"]

    # Bollinger Bands Upper & Lower
    data["BB_Upper"] = data["Close"].ewm(span=length, adjust=False).mean() + (
        data["Close"].rolling(window=length).std() * nBB
    )
    data["BB_Lower"] = data["Close"].ewm(span=length, adjust=False).mean() - (
        data["Close"].rolling(window=length).std() * nBB
    )

    # Squeeze
    data["squeezeHigh"] = data["BB_Upper"] - data["KeltHigh"]
    data["squeezeMid"] = data["BB_Upper"] - data["KeltMid"]
    data["squeezeBlue"] = data["BB_Upper"] - data["KeltLow"]
    data["squeeze_on"] = (data["BB_Lower"] > data["KeltLower"]) & (
        data["BB_Upper"] < data["KeltMid"]
    )
    data["squeeze_color"] = data.apply(squeeze_colors, axis=1)
    data.loc[
        (data["BB_Lower"] > data["KeltLower"]) & (data["BB_Upper"] < data["KeltMid"]),
        "squeeze_color",
    ] = "gold"

    # MACD
    data["emaFast"] = data["Close"].ewm(span=fast, adjust=False).mean()
    data["emaSlow"] = data["Close"].ewm(span=slow, adjust=False).mean()
    data["macd"] = data["emaFast"] - data["emaSlow"]
    data["signal"] = data["macd"].ewm(span=signal, adjust=False).mean()
    data["histogram"] = data["macd"] - data["signal"]

    # Momentum
    data["momentum"] = data["Close"].rolling(length).apply(linear_regression, raw=True)
    data["momentum_color"] = [momentum_colors(data, i) for i in range(len(data))]
    
    df = data[["histogram", "squeeze_on", "momentum_color", "momentum", "squeeze_color"]]

    return df


def linear_regression(close_prices):
    slope, _ = np.polyfit(np.arange(len(close_prices)), close_prices, 1)
    return slope


def squeeze_colors(row):
    if row["squeezeHigh"] < 0 and row["squeezeMid"] < 0 and row["squeezeBlue"] < 0:
        return "white"  # Strong Squeeze
    elif row["squeezeMid"] < 0 and row["squeezeBlue"] < 0:
        return "gold"  # Medium Squeeze
    elif row["squeezeBlue"] < 0:
        return "blue"  # Weak Squeeze
    else:
        return "black"  # No Squeeze

    # # Match Thinkorswim color priority
    # if row["squeezeHigh"] <= 0:
    #     return "white"   # Strong squeeze (tightest)
    # elif row["squeezeMid"] <= 0:
    #     return "orange"  # Medium squeeze
    # elif row["squeezeBlue"] <= 0:
    #     return "blue"    # Weak squeeze
    # else:
    #     return None      # No squeeze



def momentum_colors(data, i):
    if i == 0:
        return "gray"
    prev_momentum = data["momentum"].iloc[i - 1]
    curr_momentum = data["momentum"].iloc[i]

    if prev_momentum < curr_momentum:  # Momentum increasing
        return "cyan" if curr_momentum >= 0 else "darkblue"
    else:  # Momentum decreasing
        return "purple" if curr_momentum >= 0 else "magenta"


def ttm_squeeze_signals(
    data_dict,
    length=20,
    nBB=2.0,
    nK_Mid=1.5,
    nK_Low=2.0,
    nK_High=1.0,
):
    """
    Compute TTM Squeeze fires across multiple timeframes
    and return two DataFrames:
        - Calls (bullish squeeze fires, True/False)
        - Puts (bearish squeeze fires, True/False)

    Args:
        data_dict (dict): { timeframe_label: DataFrame with OHLCV }
        length, nBB, nK_Mid, nK_Low, nK_High: squeeze parameters

    Returns:
        dict with:
          - 'Calls': pd.DataFrame (boolean bullish signals)
          - 'Puts': pd.DataFrame (boolean bearish signals)
    """
    bullish_results = []
    bearish_results = []

    for tf, df in data_dict.items():
        d = df.copy()

        # --- Keltner Midline & ATR ---
        d.loc[:, 'Keltner_Mid'] = d["Close"].ewm(span=length, adjust=False).mean()
        d.loc[:, 'tr1'] = d["High"] - d["Low"]
        d.loc[:, 'tr2'] = (d["High"] - d["Close"].shift(1)).abs()
        d.loc[:, 'tr3'] = (d["Low"] - d["Close"].shift(1)).abs()
        d.loc[:, 'true_range'] = d[["tr1", "tr2", "tr3"]].max(axis=1)
        d.loc[:, 'atr'] = d["true_range"].ewm(span=length, adjust=False).mean()

        # --- Keltner Bands ---
        d.loc[:, 'KeltMid'] = d["Keltner_Mid"] + nK_Mid * d["atr"]
        d.loc[:, 'KeltLower'] = d["Keltner_Mid"] - nK_Mid * d["atr"]

        # --- Bollinger Bands ---
        bb_mid = d["Close"].ewm(span=length, adjust=False).mean()
        d.loc[:, 'BB_Upper'] = bb_mid + d["Close"].rolling(window=length).std() * nBB
        d.loc[:,'BB_Lower'] = bb_mid - d["Close"].rolling(window=length).std() * nBB

        # --- Squeeze condition ---
        d.loc[:, 'squeeze_on'] = (d["BB_Lower"] > d["KeltLower"]) & (d["BB_Upper"] < d["KeltMid"])

        # --- Squeeze Fired Logic ---
        fired = (~d["squeeze_on"]) & (d["squeeze_on"].shift(1) == True)
        direction = np.where(
            fired & (d["Close"] > d["Close"].shift(1)),
            1,
            np.where(
                fired & (d["Close"] < d["Close"].shift(1)),
                -1,
                0,
            ),
        )

        # --- Boolean separation ---
        bullish_col = f"UP{tf}"
        bearish_col = f"DN{tf}"

        bullish_results.append(pd.DataFrame({bullish_col: direction == 1}, index=d.index))
        bearish_results.append(pd.DataFrame({bearish_col: direction == -1}, index=d.index))

    # --- Concat all timeframes along axis=1 ---
    calls_df = pd.concat(bullish_results, axis=1)
    puts_df = pd.concat(bearish_results, axis=1)

    return {"Calls": calls_df, "Puts": puts_df}