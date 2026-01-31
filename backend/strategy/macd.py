# import pandas as pd

# def tos_ema(series: pd.Series, length: int) -> pd.Series:
#     """
#     Match ThinkScript's ExpAverage (EMA) behavior:
#     - Recursive formula
#     - adjust=False for ewm to avoid bias from older data
#     """
#     return series.ewm(span=length, adjust=False).mean()

# def process_timeframe(df: pd.DataFrame) -> pd.DataFrame:
#     """
#     Process a single timeframe's EMA trend and MACD cross logic with bubble conditions.
#     df: must have columns ['Close'] and datetime index.
#     """
#     # MACD components
#     value = tos_ema(df['Close'], 6) - tos_ema(df['Close'], 12)
#     avg = tos_ema(value, 8)
#     diff = value - avg

#     # Crossovers
#     macd_cross_above = (diff.shift(1) <= 0) & (diff > 0)
#     macd_cross_below = (diff.shift(1) >= 0) & (diff < 0)

#     # EMA trend direction
#     exu = tos_ema(df['Close'], 9) >= tos_ema(df['Close'], 20)
#     exd = tos_ema(df['Close'], 9) <= tos_ema(df['Close'], 20)

#     # "[1] == 0" condition from ThinkScript → previous bar was NOT a signal
#     call_signal = (~macd_cross_above.shift(1).fillna(False)) & macd_cross_above & exu
#     put_signal = (~macd_cross_below.shift(1).fillna(False)) & macd_cross_below & exd


#     return pd.DataFrame({
#         'Call': call_signal,
#         'Put': put_signal
#     }, index=df.index)

# def macd_signals(data_dict: dict) -> pd.DataFrame:
#     """
#     Merge signals from multiple timeframes into one DataFrame.
    
#     data_dict = {
#         '5': df_current,
#         '15': df_15m,
#         '30': df_30m,
#         '1h': df_1h,
#         '2h': df_2h,
#         '4h': df_4h
#     }
#     Each df must have 'Close' column and datetime index.
#     """
#     merged_df = None

#     for tf, df in data_dict.items():
#         sigs = process_timeframe(df)
#         sigs = sigs.rename(columns={
#             'Call': f'Call{tf}',
#             'Put': f'Put{tf}'
#         })

#         if merged_df is None:
#             merged_df = sigs
#         else:
#             merged_df = merged_df.merge(sigs, left_index=True, right_index=True, how='outer')

#     return merged_df.sort_index()


import pandas as pd

def tos_ema(series: pd.Series, length: int) -> pd.Series:
    return series.ewm(span=length, adjust=False).mean()

def process_timeframe(df: pd.DataFrame) -> pd.DataFrame:
    value = tos_ema(df['Close'], 6) - tos_ema(df['Close'], 12)
    avg = tos_ema(value, 8)
    diff = value - avg

    macd_cross_above = (diff.shift(1) <= 0) & (diff > 0)
    macd_cross_below = (diff.shift(1) >= 0) & (diff < 0)

    exu = tos_ema(df['Close'], 9) >= tos_ema(df['Close'], 20)
    exd = tos_ema(df['Close'], 9) <= tos_ema(df['Close'], 20)


    call_signal = macd_cross_above.infer_objects(copy=False) & macd_cross_above & exu
    put_signal = macd_cross_below.infer_objects(copy=False) & macd_cross_below & exd
    # call_signal = (~macd_cross_above.shift(1).fillna(False)) & macd_cross_above & exu
    # put_signal = (~macd_cross_below.shift(1).fillna(False)) & macd_cross_below & exd

    return pd.DataFrame({'Call': call_signal, 'Put': put_signal}, index=df.index)

def macd_signals(data_dict: dict) -> dict:
    """
    Returns a dict containing two DataFrames: 'Calls' and 'Puts'.
    """
    calls_dict = {}
    puts_dict = {}

    for tf, df in data_dict.items():
        if tf == '1d':
            continue
        else:
            sigs = process_timeframe(df)
            calls_dict[f'Call{tf}'] = sigs['Call']
            puts_dict[f'Put{tf}'] = sigs['Put']

    calls_df = pd.DataFrame(calls_dict).sort_index()
    puts_df = pd.DataFrame(puts_dict).sort_index()

    return {'Calls': calls_df, 'Puts': puts_df}
