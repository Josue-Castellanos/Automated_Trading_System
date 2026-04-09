import pandas as pd
from .moving_averages import ema

def crosses_above(series1, series2):
    """
    Exponential Moving Average (EMA) calculation for a given series and period.

    Args:
        data (str): the candlestick data for a given timeframe.
        period (int): the period for which to calculate the EMA.
        series (str): the series to calculate the EMA on (e.g., 'Close', 'Open', 'High', 'Low').

    Returns:
        list: A list containing the ema values.
    """
    return (series1.shift(1) <= series2.shift(1)) & (series1 > series2)


def crosses_below(series1, series2):
    """
    Exponential Moving Average (EMA) calculation for a given series and period.

    Args:
        data (str): the candlestick data for a given timeframe.
        period (int): the period for which to calculate the EMA.
        series (str): the series to calculate the EMA on (e.g., 'Close', 'Open', 'High', 'Low').

    Returns:
        list: A list containing the ema values.
    """
    return (series1.shift(1) >= series2.shift(1)) & (series1 < series2)


def ema_crossover_signals(data_dict):
    """
    Exponential Moving Average (EMA) calculation for a given series and period.

    Args:
        data (str): the candlestick data for a given timeframe.
        period (int): the period for which to calculate the EMA.
        series (str): the series to calculate the EMA on (e.g., 'Close', 'Open', 'High', 'Low').

    Returns:
        list: A list containing the ema values.
    """
    df_5m = data_dict['5']
    df_15m = data_dict['15']
    df_30m = data_dict['30']
    df_1h = data_dict['1h']
    df_2h = data_dict['2h']
    df_4h = data_dict['4h']
    df_1d = data_dict['1d']

    # ---- Base EMAs (main timeframe) ----
    EMA4 = ema(df_5m['Close'], 4)
    EMA8 = ema(df_5m['Close'], 8)
    EMA20 = ema(df_5m['Close'], 20)
    EMA9 = ema(df_5m['Close'], 9)

    # ---- Crossovers main timeframe ----
    UP48 = crosses_above(EMA4, EMA8)
    DN48 = crosses_below(EMA4, EMA8)
    UP920 = crosses_above(EMA9, EMA20)
    DN920 = crosses_below(EMA9, EMA20)

    # ---- 15m aggregated ----
    EMA9AGG15 = ema(df_15m['Close'], 9)
    EMA20AGG15 = ema(df_15m['Close'], 20)
    UP920AGG15 = crosses_above(EMA9AGG15, EMA20AGG15)
    DN920AGG15 = crosses_below(EMA9AGG15, EMA20AGG15)
    MTU15 = EMA9AGG15 >= EMA20AGG15
    MTD15 = EMA9AGG15 <= EMA20AGG15

    # ---- 30m aggregated ----
    EMA9AGG30 = ema(df_30m['Close'], 9)
    EMA20AGG30 = ema(df_30m['Close'], 20)
    UP920AGG30 = crosses_above(EMA9AGG30, EMA20AGG30)
    DN920AGG30 = crosses_below(EMA9AGG30, EMA20AGG30)
    MTU30 = EMA9AGG30 >= EMA20AGG30
    MTD30 = EMA9AGG30 <= EMA20AGG30

    # ---- 1h aggregated ----
    EMA9AGG1h = ema(df_1h['Close'], 9)
    EMA20AGG1h = ema(df_1h['Close'], 20)
    UP920AGG1h = crosses_above(EMA9AGG1h, EMA20AGG1h)
    DN920AGG1h = crosses_below(EMA9AGG1h, EMA20AGG1h)
    MTU1h = EMA9AGG1h >= EMA20AGG1h
    MTD1h = EMA9AGG1h <= EMA20AGG1h

    # ---- 2h aggregated ----
    EMA9AGG2h = ema(df_2h['Close'], 9)
    EMA20AGG2h = ema(df_2h['Close'], 20)
    UP920AGG2h = crosses_above(EMA9AGG2h, EMA20AGG2h)
    DN920AGG2h = crosses_below(EMA9AGG2h, EMA20AGG2h)
    MTU2h = EMA9AGG2h >= EMA20AGG2h
    MTD2h = EMA9AGG2h <= EMA20AGG2h

    # ---- 4h aggregated ----
    EMA9AGG4h = ema(df_4h['Close'], 9)
    EMA20AGG4h = ema(df_4h['Close'], 20)
    UP920AGG4h = crosses_above(EMA9AGG4h, EMA20AGG4h)
    DN920AGG4h = crosses_below(EMA9AGG4h, EMA20AGG4h)
    MTU4h = EMA9AGG4h >= EMA20AGG4h
    MTD4h = EMA9AGG4h <= EMA20AGG4h

    # ---- Daily aggregated ----
    EMA9AGG1d = ema(df_1d['Close'], 9)
    EMA20AGG1d = ema(df_1d['Close'], 20)
    MTU1d = EMA9AGG1d >= EMA20AGG1d
    MTD1d = EMA9AGG1d <= EMA20AGG1d

    # ---- Output DataFrame ----
    calls = pd.DataFrame(index=df_5m.index)
    puts = pd.DataFrame(index=df_5m.index)

    # 1m bubbles
    calls['C1'] = UP48
    puts['P1'] = DN48
    calls['CALL1'] = UP48 & (EMA9 >= EMA20)
    puts['PUT1'] = DN48 & (EMA9 <= EMA20)

    # 5m bubbles
    calls['C5'] =  UP920 & MTD15
    puts['P5'] = DN920 & MTU15
    calls['CALL5'] = UP920 & MTU15
    puts['PUT5'] = DN920 & MTD15

    # 15m bubbles
    calls['C15'] = UP920AGG15 & MTD30
    puts['P15'] = DN920AGG15 & MTU30
    calls['CALL15'] = UP920AGG15 & MTU30
    puts['PUT15'] = DN920AGG15 & MTD30

    # 30m bubbles
    calls['C30'] = UP920AGG30 & MTD1h
    puts['P30'] = DN920AGG30 & MTU1h
    calls['CALL30'] = UP920AGG30 & MTU1h
    puts['PUT30'] = DN920AGG30 & MTD1h

    # 1h bubbles
    calls['C1H'] = UP920AGG1h & MTD2h
    puts['P1H'] = DN920AGG1h & MTU2h
    calls['CALL1H'] = UP920AGG1h & MTU2h
    puts['PUT1H'] = DN920AGG1h & MTD2h

    # 2h bubbles
    calls['C2H'] = UP920AGG2h & MTD4h
    puts['P2H'] = DN920AGG2h & MTU4h
    calls['CALL2H'] = UP920AGG2h & MTU4h
    puts['PUT2H'] = DN920AGG2h & MTD4h

    # 4h bubbles
    calls['C4H'] = UP920AGG4h & MTD1d
    puts['P4H'] = DN920AGG4h & MTU1d
    calls['CALL4H'] = UP920AGG4h & MTU1d
    puts['PUT4H'] = DN920AGG4h & MTD1d


    out = {
        'Calls': calls,
        'Puts': puts
    }
    return out
