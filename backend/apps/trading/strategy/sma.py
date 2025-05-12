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
