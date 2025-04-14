import numpy as np

def stochastic_hull(data, k_period=8, d_period=2, overbought=90, oversold=10):
    """
    Calculate Hull-weighted Stochastic Oscillator
    """
    # Calculate Weighted Moving Average (as proxy for Hull)
    def hull_ma(series, period):
        wma1 = wma(series, period//2)
        wma2 = wma(series, period)
        return wma(2 * wma1 - wma2, int(np.sqrt(period)))

    def wma(series, period):
        weights = np.arange(1, period+1)
        return series.rolling(period).apply(lambda x: np.dot(x, weights)/weights.sum(), raw=True)
    
    # Calculate raw Stochastic values
    low_min = data['Low'].rolling(window=k_period).min()
    high_max = data['High'].rolling(window=k_period).max()
    raw_stoch = 100 * ((data['Close'] - low_min) / (high_max - low_min))
    
    # Apply Hull weighting (using WMA as approximation)
    data['stoch_k'] = hull_ma(raw_stoch, k_period)
    data['stoch_d'] = hull_ma(data['stoch_k'], d_period)
    
    # Detect breakouts
    data['stoch_overbought'] = data['stoch_d'] >= overbought
    data['stoch_oversold'] = data['stoch_d'] <= oversold
    data['stoch_bullish_break'] = (data['stoch_d'] > overbought) & (data['stoch_d'].shift(1) <= overbought)
    data['stoch_bearish_break'] = (data['stoch_d'] < oversold) & (data['stoch_d'].shift(1) >= oversold)
    data['stoch_bearish_reverse'] = (data['stoch_d'] > oversold) & (data['stoch_d'].shift(1) <= oversold)
    data['stoch_bullish_reverse'] = (data['stoch_d'] < overbought) & (data['stoch_d'].shift(1) >= overbought)
    return data