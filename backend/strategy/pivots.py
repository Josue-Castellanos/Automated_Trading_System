# import pandas as pd
# import matplotlib.pyplot as plt

# def classic_pivots(df):
#     """
#     Calculate classic pivot points from previous period's high, low, close.

#     Args:
#         df (pd.DataFrame): Must have 'high', 'low', 'close' columns, datetime indexed.

#     Returns:
#         pd.DataFrame with columns: PP, R1, S1, R2, S2, R3, S3
#     """
#     high_1 = df['High'].shift(1)
#     low_1 = df['Low'].shift(1)
#     close_1 = df['Close'].shift(1)

#     PP = (high_1 + low_1 + close_1) / 3
#     R1 = 2 * PP - low_1
#     S1 = 2 * PP - high_1
#     R2 = PP + (high_1 - low_1)
#     S2 = PP - (high_1 - low_1)
#     R3 = high_1 + 2 * (PP - low_1)
#     S3 = low_1 - 2 * (high_1 - PP)

#     pivots = pd.DataFrame({
#         'PP': PP,
#         'R1': R1,
#         'S1': S1,
#         'R2': R2,
#         'S2': S2,
#         'R3': R3,
#         'S3': S3
#     }, index=df.index)

#     return pivots

import pandas as pd

def classic_pivots(df, period="W"):
    """
    Calculate Thinkorswim-style Pivot Points.

    Args:
        df (pd.DataFrame): Must have 'High', 'Low', 'Close' columns, daily candles.
        period (str): 'D' = daily pivots, 'W' = weekly pivots, 'M' = monthly pivots.

    Returns:
        pd.DataFrame with PP, R1, S1, R2, S2, R3, S3
    """
    if period == "D":
        # Yesterday's HLC
        high = df["High"].shift(1)
        low = df["Low"].shift(1)
        close = df["Close"].shift(1)

    elif period == "W":
        # Rolling last 5 trading days (previous week)
        high = df["High"].rolling(5).max().shift(1)
        low = df["Low"].rolling(5).min().shift(1)
        close = df["Close"].shift(1)

    elif period == "M":
        # Rolling last ~21 trading days (previous month)
        high = df["High"].rolling(21).max().shift(1)
        low = df["Low"].rolling(21).min().shift(1)
        close = df["Close"].shift(1)

    else:
        raise ValueError("period must be 'D', 'W', or 'M'")

    # Classic pivot formulas
    PP = (high + low + close) / 3
    R1 = 2 * PP - low
    S1 = 2 * PP - high
    R2 = PP + (high - low)
    S2 = PP - (high - low)
    R3 = high + 2 * (PP - low)
    S3 = low - 2 * (high - PP)

    pivots = pd.DataFrame({
        "PP": PP,
        "R1": R1, "S1": S1,
        "R2": R2, "S2": S2,
        "R3": R3, "S3": S3
    }, index=df.index)

    return pivots

