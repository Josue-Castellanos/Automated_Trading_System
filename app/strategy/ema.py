import pandas as pd
import numpy as np


def ema(data, period, series):
    """
    Exponential Moving Average (EMA) strategy.
    """
    ema_values = data[series].ewm(span=period, adjust=False).mean()
    
    return [{
        'time': row['time'],
        'value': ema
    } for row, ema in zip(data, ema_values)]