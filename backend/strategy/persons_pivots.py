import pandas as pd
import numpy as np


# def persons_pivot(df, market_threshold=0.0025):
#     """
#     Calculate RR, PP, SS pivot lines similar to ThinkScript.
    
#     Args:
#         df (pd.DataFrame): Must have columns 'high', 'low', 'close' with datetime index.
#         market_threshold (float): Threshold used for market type detection.
#         apply_persons_levels_filter (bool): Toggle applying the person's level filter.
#         show_only_today (bool): If True, hides pivot lines except today's (not implemented).
    
#     Returns:
#         pd.DataFrame with RR, PP, SS columns.
#     """
    
#     # Calculate PP2 = high[-2] + low[-2] + close[-2]
#     # Using shift(2) because shift(1) is "1 bar ago" in pandas
#     PP2 = df['High'].shift(2) + df['Low'].shift(2) + df['Close'].shift(2)
    
#     # Calculate rolling average of PP2[-1], PP2, PP2[1] for market type decision
#     # Since ThinkScript indexing can be tricky, approximate as:
#     # mean of PP2 shifted by 1, 0, -1 bars
#     PP2_minus1 = PP2.shift(1)
#     PP2_plus1 = PP2.shift(-1)
    
#     PP2_avg = (PP2_minus1 + PP2 + PP2_plus1) / 3

#     # Define marketType similarly
#     def market_type_row(row):
#         if row['PP2_minus1'] > row['PP2_avg'] + market_threshold:
#             return "BULLISH"
#         elif row['PP2_minus1'] < row['PP2_avg'] - market_threshold:
#             return "BEARISH"
#         else:
#             return "BULLISH" # NEUTRAL

#     market_df = pd.DataFrame({
#         'PP2_minus1': PP2_minus1,
#         'PP2': PP2,
#         'PP2_plus1': PP2_plus1,
#         'PP2_avg': PP2_avg
#     })

#     market_df['market_type'] = market_df.apply(market_type_row, axis=1)

#     # Calculate classic pivot points based on 1 bar ago values (shift 1)
#     high_1 = df['High'].shift(1)
#     low_1 = df['Low'].shift(1)
#     close_1 = df['Close'].shift(1)

#     PP = (high_1 + low_1 + close_1) / 3
#     R1 = 2 * PP - low_1
#     R2 = PP + (high_1 - low_1)
#     R3 = R2 + (high_1 - low_1)
#     S1 = 2 * PP - high_1
#     S2 = PP - (high_1 - low_1)
#     S3 = S2 - (high_1 - low_1)

#     # Determine RR and SS depending on market_type
#     def rr_value(row):
#         mt = row['market_type']
#         if mt in ["BEARISH", "NEUTRAL"]:
#             return row['R1']
#         else:
#             return row['R2']

#     def ss_value(row):
#         mt = row['market_type']
#         if mt in ["BULLISH", "NEUTRAL"]:
#             return row['S1']
#         else:
#             return row['S2']

#     pivots = pd.DataFrame({
#         'PP': PP,
#         'R1': R1,
#         'R2': R2,
#         'R3': R3,
#         'S1': S1,
#         'S2': S2,
#         'S3': S3,
#         'market_type': market_df['market_type']
#     })

#     pivots['RR'] = pivots.apply(rr_value, axis=1)
#     pivots['SS'] = pivots.apply(ss_value, axis=1)


#     # Return only relevant columns
#     return pivots[['RR', 'PP', 'SS']]



def persons_pivot_levels(df, market_threshold=0.0025, timeframe="W", show_only_today=True):
    """
    Convert ThinkScript Persons Levels logic into Python with correct PP2 double-shift logic.
    
    Args:
        df (pd.DataFrame): Must have columns ["high", "low", "close"].
        market_threshold (float): Threshold for determining bullish/bearish marketType.
        timeframe (str): Pandas resample frequency ("D", "W", "M", etc.).
        show_only_today (bool): Whether to hide values except for current day.
        apply_persons_levels_filter (bool): Apply Persons Levels filter logic.

    Returns:
        pd.DataFrame: Original df with added PP, R1, R2, R3, RR, S1, S2, S3, SS columns.
    """

    # Resample to given timeframe (like ThinkScript's period = timeFrame)
    ohlc = df.resample(timeframe).agg({
        "High": "max",
        "Low": "min",
        "Close": "last"
    })

    # --- Correct PP2 logic (ThinkScript: PP2 = high[2] + low[2] + close[2]) ---
    pp2_base = (
        ohlc["High"].shift(2) +
        ohlc["Low"].shift(2) +
        ohlc["Close"].shift(2)
    )

    # Now apply [-1], [0], [1] relative to pp2_base
    pp2_prev = pp2_base.shift(1)   # PP2[-1] → 3 periods ago
    pp2_curr = pp2_base            # PP2[0]  → 2 periods ago
    pp2_next = pp2_base.shift(-1)  # PP2[1]  → 1 period ago

    # --- MarketType calculation ---
    market_type = np.full(len(ohlc), "DISABLED", dtype=object)
    avg_val = (pp2_prev + pp2_curr + pp2_next) / 3
    cond_bullish = pp2_prev > (avg_val + market_threshold)
    cond_bearish = pp2_prev < (avg_val - market_threshold)
    market_type[cond_bullish] = "BULLISH"
    market_type[cond_bearish] = "BEARISH"
    market_type[~(cond_bullish | cond_bearish)] = "BULLISH" #"NEUTRAL"

    # --- Pivot Point & Levels ---
    high1 = ohlc["High"].shift(1)
    low1 = ohlc["Low"].shift(1)
    close1 = ohlc["Close"].shift(1)

    PP = (high1 + low1 + close1) / 3
    R1 = 2 * PP - low1
    R2 = PP + (high1 - low1)
    R3 = R2 + (high1 - low1)
    S1 = 2 * PP - high1
    S2 = PP - (high1 - low1)
    S3 = S2 - (high1 - low1)

    # --- RR / SS logic ---
    RR = np.where((market_type == "BEARISH") | (market_type == "NEUTRAL"), R1, R2)
    SS = np.where((market_type == "BULLISH") | (market_type == "NEUTRAL"), S1, S2)

    # # --- Hide values if show_only_today ---
    # if show_only_today:
    #     today = ohlc.index[-1]
    #     mask = ohlc.index != today
    #     PP[mask] = np.nan
    #     # R1[mask] = np.nan
    #     # R2[mask] = np.nan
    #     # R3[mask] = np.nan
    #     # S1[mask] = np.nan
    #     # S2[mask] = np.nan
    #     # S3[mask] = np.nan
    #     RR[mask] = np.nan
    #     SS[mask] = np.nan

    # --- Combine results ---
    result = ohlc.copy()
    result["PP"] = PP
    # result["R1"] = R1
    # result["R2"] = R2
    # result["R3"] = R3
    # result["S1"] = S1
    # result["S2"] = S2
    # result["S3"] = S3
    result["RR"] = RR
    result["SS"] = SS
    result["MarketType"] = market_type

    return result
