import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from ..utils import filter_market_hours



def fibonacci_retracement(df, timeframe, lookback_period=40):
    """
    Replicates ThinkScript's dynamic Fibonacci recalculation logic.
    Returns a DataFrame with Fibonacci levels and trend context.
    """

    # 1. Resample to match ThinkScript's AggregationPeriod
    df_res = df.resample(timeframe).agg({
        'Open': 'first',
        'High': 'max',
        'Low': 'min',
        'Close': 'last'
    }).dropna()

    # 2. Calculate rolling high/low over lookback period
    highest_high = df_res['High'].rolling(lookback_period).max()
    lowest_low = df_res['Low'].rolling(lookback_period).min()

    # 3. Fibonacci levels
    fib50 = lowest_low + (highest_high - lowest_low) * 0.5
    fib61_8 = lowest_low + (highest_high - lowest_low) * 0.618
    fib38_2 = lowest_low + (highest_high - lowest_low) * 0.382

    # 4. Determine if close is above or below 50%
    is_above_50 = df_res['Close'] > fib50

    # 5. Conditional display like ThinkScript
    fib61_8_cond = fib61_8.where(is_above_50)   # only when above 50
    fib38_2_cond = fib38_2.where(~is_above_50)  # only when below 50

    # Return enriched DataFrame
    # return filter_market_hours(df_res.assign(
    #     highest_high=highest_high,
    #     lowest_low=lowest_low,
    #     fib50=fib50,
    #     fib61_8=fib61_8_cond,
    #     fib38_2=fib38_2_cond,
    #     is_above_50=is_above_50
    # ), 5, 0)
    
    return df_res.assign(
        highest_high=highest_high,
        lowest_low=lowest_low,
        fib50=fib50,
        fib61_8=fib61_8_cond,
        fib38_2=fib38_2_cond,
        is_above_50=is_above_50
    )


