import pandas as pd
import numpy as np
import matplotlib.pyplot as plt


def ttm_squeeze_momentum(data, length=20, nBB=2.0, nK_Mid=1.5, nK_Low=1.0, nK_High=2.0):
    """Calculate TTM Squeeze indicators."""
    rolling_mean = data['Close'].rolling(window=length).mean()
    rolling_std = data['Close'].rolling(window=length).std()
    
    data['upper_band'] = rolling_mean + (rolling_std * nBB)
    data['lower_band'] = rolling_mean - (rolling_std * nBB)
    
    high_low = data['High'] - data['Low']
    high_close = np.abs(data['High'] - data['Close'].shift())
    low_close = np.abs(data['Low'] - data['Close'].shift())
    
    true_range = pd.concat([high_low, high_close, low_close], axis=1).max(axis=1)
    atr = true_range.rolling(window=length).mean()
    
    data['kc_upper'] = rolling_mean + (atr * nK_Mid)
    data['kc_lower'] = rolling_mean - (atr * nK_Mid)

    # Detect Squeeze
    data['squeeze_on'] = (data['lower_band'] > data['kc_lower']) & (data['upper_band'] < data['kc_upper'])

    # Calculate momentum
    data["momentum"] = data["Close"].rolling(length).apply(_precise_linear_regression, raw=True)

    #Apply coloring logic to data.
    data['color'] = [_get_color(data, i) for i in range(len(data))]

    return _filter_market_hours(data)


def _filter_market_hours(data, market_open="06:30", market_close="13:00", last_n=79):
    """Filter data for market hours and keep the last N records."""
    # Ensure the index is converted to datetime format
    # This causes an error:
        #UserWarning: Could not infer format, so each element will be parsed individually, falling back to `dateutil`. To ensure parsing is consistent and as-expected, please specify a format.
    if not isinstance(data.index, pd.DatetimeIndex):
        data.index = pd.to_datetime(data.index)  # Convert index to datetime

    # Now, filter based on market hours
    data_filtered = data.between_time(market_open, market_close)

    # Return the last N records
    return data_filtered.tail(last_n)


def _precise_linear_regression(close_prices):
    """Perform linear regression on price data."""
    N = len(close_prices)
    x = np.arange(N, dtype=np.float64)
    y = np.array(close_prices, dtype=np.float64)
    
    sum_x = np.sum(x)
    sum_y = np.sum(y)
    sum_xy = np.sum(x * y)
    sum_x2 = np.sum(x**2)
    
    return (N * sum_xy - sum_x * sum_y) / (N * sum_x2 - sum_x**2)


def _get_color(data, i):
    """Assign ThinkorSwim-style coloring based on momentum."""
    if i == 0:
        return "gray"
    prev_momentum = data['momentum'].iloc[i-1]
    curr_momentum = data['momentum'].iloc[i]
    
    if prev_momentum < curr_momentum:  # Momentum increasing
        return 'cyan' if curr_momentum >= 0 else 'darkblue'
    else:  # Momentum decreasing
        return 'purple' if curr_momentum >= 0 else 'magenta'


def plot_ttm_squeeze(data):
    """Plot TTM Squeeze histogram."""
    plt.figure(figsize=(12, 6))
    timestamps = data.index.strftime('%H:%M')
    
    for i, (timestamp, row) in enumerate(data.iterrows()):
        plt.scatter(i, row['momentum'], color=row['color'], label="_nolegend_")
    
    plt.xticks(ticks=range(len(data)), labels=timestamps, rotation=45, fontsize=9)
    plt.axhline(0, color='gray', linestyle='--', linewidth=1)
    plt.xlabel("Timestamp (Pacific Time)")
    plt.ylabel("Momentum")
    plt.title("TTM Squeeze Histogram (ThinkorSwim Style) - SPY")
    plt.grid(True, linestyle='--', alpha=0.6)
    plt.show()

