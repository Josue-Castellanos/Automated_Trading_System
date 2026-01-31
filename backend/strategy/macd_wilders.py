import pandas as pd
from .moving_averages import wilder_ma


def process_and_merge_timeframes(df):
    """
    Compute Wilder's MA trend and MACD crossovers on df.
    Expects columns 'Close', 'high', 'low'.
    """
    # MACD value line (Wilder's)
    value = wilder_ma(df['Close'], 9) - wilder_ma(df['Close'], 14)
    avg = wilder_ma(value, 8)
    diff = value - avg

    macd_cross_above = (diff.shift(1) <= 0) & (diff > 0)
    macd_cross_below = (diff.shift(1) >= 0) & (diff < 0)

    # EMA trend logic replaced with Wilder's MA trend logic
    exu = wilder_ma(df['Close'], 9) >= wilder_ma(df['Close'], 20)
    exd = wilder_ma(df['Close'], 9) <= wilder_ma(df['Close'], 20)

    return pd.DataFrame({
        'EXU': exu,
        'EXD': exd,
        'macd_cross_above': macd_cross_above,
        'macd_cross_below': macd_cross_below
    }, index=df.index)


def macd_wilder_signals(data_dict):
    """
    Process multiple timeframe dataframes, compute MACD signals,
    and merge Call/Put bubble conditions into one DataFrame.

    Args:
        data_dict (dict): keys are timeframe labels, values are DataFrames
                          with 'Close', 'high', 'low' cols.

    Returns:
        pd.DataFrame: merged signal DataFrame with columns like 'Call15', 'Put15', etc.
    """
    calls_dict = {}
    puts_dict = {}


    for tf, df in data_dict.items():
        if tf == '1d':
            continue

        else:
            signals = process_and_merge_timeframes(df)

            prev_not_above = signals['macd_cross_above'].shift(1) == False
            prev_not_below = signals['macd_cross_below'].shift(1) == False

            calls_dict[f'call{tf}'] = prev_not_above & signals['macd_cross_above'] & signals['EXU']
            puts_dict[f'put{tf}'] = prev_not_below & signals['macd_cross_below'] & signals['EXD']

    calls_df = pd.DataFrame(calls_dict).sort_index()
    puts_df = pd.DataFrame(puts_dict).sort_index()

    return {'Calls': calls_df, 'Puts': puts_df}
