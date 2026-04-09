import pandas as pd
import numpy as np
from ..utils import filter_market_hours

def ichimoku(df, tenkan_period=9, kijun_period=26):
    """
    Calculate Ichimoku indicator values.
    
    Args:
        df (pd.DataFrame): DataFrame with columns: ['open', 'High', 'Low', 'Close']
        tenkan_period (int): Tenkan-sen period
        kijun_period (int): Kijun-sen period
        show_chikou (bool): Whether to calculate Chikou span
    
    Returns:
        pd.DataFrame: Original df with Ichimoku columns
    """

    # Tenkan-sen (Conversion Line)
    df['tenkan'] = (df['High'].rolling(tenkan_period).max() +
                    df['Low'].rolling(tenkan_period).min()) / 2

    # Kijun-sen (Base Line)
    df['kijun'] = (df['High'].rolling(kijun_period).max() +
                   df['Low'].rolling(kijun_period).min()) / 2

    # Senkou Span A (Leading Span A)
    df['span_a'] = ((df['tenkan'] + df['kijun']) / 2).shift(kijun_period)

    # Senkou Span B (Leading Span B)
    df['span_b'] = ((df['High'].rolling(2 * kijun_period).max() +
                     df['Low'].rolling(2 * kijun_period).min()) / 2).shift(kijun_period)


    df['chikou'] = df['Close'].shift(-kijun_period)
 

    # Bull/Bear signals (Tenkan crosses Kijun)
    df['tenk_bull'] = np.where(
        (df['tenkan'] > df['kijun']) & (df['tenkan'].shift(1) <= df['kijun'].shift(1)),
        df['Low'], np.nan
    )
    df['tenk_bear'] = np.where(
        (df['tenkan'] < df['kijun']) & (df['tenkan'].shift(1) >= df['kijun'].shift(1)),
        df['High'], np.nan
    )

    # Bullish / Bearish state
    df['is_bullish'] = df['Close'] > df['span_b']
    df['is_bearish'] = df['Close'] < df['span_b']

    return df
