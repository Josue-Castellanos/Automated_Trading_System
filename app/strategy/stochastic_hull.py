import numpy as np
from scipy.stats import linregress


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
    
    # ====== NEW: Candle Strength Analysis ======
    def calculate_strength(window):
        """Quantify momentum strength using linear regression"""
        x = np.arange(len(window))
        slope, _, _, _, _ = linregress(x, window)
        return slope * 100  # Scale for readability
    
    # Strength of recent candles (3-period lookback)
    data['stoch_strength'] = data['stoch_d'].rolling(3).apply(calculate_strength, raw=True)
    
    # Detect breakouts
    data['stoch_overbought'] = data['stoch_d'] >= overbought
    data['stoch_oversold'] = data['stoch_d'] <= oversold
    data['stoch_bullish_break'] = (data['stoch_d'] > overbought) & (data['stoch_d'].shift(1) <= overbought)
    data['stoch_bearish_break'] = (data['stoch_d'] < oversold) & (data['stoch_d'].shift(1) >= oversold)
    data['stoch_bearish_reverse'] = (data['stoch_d'] > oversold) & (data['stoch_d'].shift(1) <= oversold)
    data['stoch_bullish_reverse'] = (data['stoch_d'] < overbought) & (data['stoch_d'].shift(1) >= overbought)
    
    # ====== NEW: Reversal/Hold Signals ======
    conditions = [
        # Strong Trend Continuation (Hold)
        (data['stoch_strength'] > 15) & (data['stoch_d'] > 50),
        (data['stoch_strength'] < -15) & (data['stoch_d'] < 50),
        
        # Early Reversal Signals
        (data['stoch_d'] > overbought) & (data['stoch_strength'] < -5),
        (data['stoch_d'] < oversold) & (data['stoch_strength'] > 5),
        
        # Neutral/Weak Signals
        (abs(data['stoch_strength']) < 10)
    ]
    choices = [
        'strong_bull_hold', 
        'strong_bear_hold',
        'early_bear_reversal', 
        'early_bull_reversal',
        'neutral'
    ]
    data['stoch_signal'] = np.select(conditions, choices, default='neutral')
    
    # ====== Visual Markers ======
    data['stoch_color'] = np.where(
        data['stoch_signal'].str.contains('bull'), 'lime',
        np.where(
            data['stoch_signal'].str.contains('bear'), 'red',
            'gray'
        )
    )
    return data