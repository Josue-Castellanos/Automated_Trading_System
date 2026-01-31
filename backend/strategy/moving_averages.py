def sma(data, period, series):
    """
    Simple Moving Average (SMA) strategy.

    Parameters:
    data (pd.DataFrame): DataFrame containing the stock data with 'Close' prices.
    period (int): The number of periods to calculate the SMA.

    Returns:
    pd.Series: A Series containing the SMA values.
    """
    sma_values = data[series].rolling(window=period).mean()

    return [{"time": row["time"], "value": sma} for row, sma in zip(data, sma_values)]



def ema(series, length):
    """
    Exponential Moving Average (EMA) calculation for a given series and period.

    Args:
        data (str): the candlestick data for a given timeframe.
        period (int): the period for which to calculate the EMA.
        series (str): the series to calculate the EMA on (e.g., 'Close', 'Open', 'High', 'Low').

    Returns:
        list: A list containing the ema values.
    """
    # This is for API compatibility
    # ema_values = data[series].ewm(span=period, adjust=False).mean()
    # return [{"time": row["time"], "value": ema} for row, ema in zip(data, ema_values)]

    return series.ewm(span=length, adjust=False).mean()


def wilder_ma(series, length):
    """Wilder's Moving Average"""
    alpha = 1 / length
    return series.ewm(alpha=alpha, adjust=False).mean()