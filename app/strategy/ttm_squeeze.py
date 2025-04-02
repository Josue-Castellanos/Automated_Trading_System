import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import scipy.optimize as opt



def ttm_squeeze_momentum(data, length=20, nBB=2.0, nK_Mid=1.5, nK_Low=2.0, nK_High=1.0):
    # Exponential Moving Average (Keltner Midline)
    data['Keltner_Mid'] = data['Close'].ewm(span=length, adjust=False).mean()   #.rolling(window=length).mean()

    # True Range Calculation for ATR
    data['tr1'] = data['High'] - data['Low']
    data['tr2'] = abs(data['High'] - data['Close'].shift(1))
    data['tr3'] = abs(data['Low'] - data['Close'].shift(1))
    data['true_range'] = data[['tr1', 'tr2', 'tr3']].max(axis=1)
    data['atr'] = data['true_range'].ewm(span=length, adjust=False).mean()

    # Keltner Channel Bands
    data['KeltHigh'] = data['Keltner_Mid'] + nK_High * data['atr']
    data['KeltMid'] = data['Keltner_Mid'] + nK_Mid * data['atr']
    data['KeltLow'] = data['Keltner_Mid'] + nK_Low * data['atr']
    data['KeltLower'] = data['Keltner_Mid'] - nK_Mid * data['atr']

    # Bollinger Bands Upper & Lower
    data['BB_Upper'] = data['Close'].ewm(span=length, adjust=False).mean() + (data['Close'].rolling(window=length).std() * nBB)
    data['BB_Lower'] = data['Close'].ewm(span=length, adjust=False).mean() - (data['Close'].rolling(window=length).std() * nBB)

    # Squeeze
    data['squeezeHigh'] = data['BB_Upper'] - data['KeltHigh']
    data['squeezeMid'] = data['BB_Upper'] - data['KeltMid']
    data['squeezeBlue'] = data['BB_Upper'] - data['KeltLow']
    data['squeeze_on'] = (data['BB_Lower'] > data['KeltLower']) & (data['BB_Upper'] < data['KeltMid'])
    data['squeeze_color'] = data.apply(_classify_squeeze, axis=1)
    data.loc[(data['BB_Lower'] > data['KeltLower']) & (data['BB_Upper'] < data['KeltMid']), 'squeeze_color'] = 'gold'

    # Momentum
    data["momentum"] = data["Close"].rolling(length).apply(_linear_regression, raw=True)
    data['momentum_color'] = [_classify_momentum(data, i) for i in range(len(data))]

    return _filter_market_hours(data)


def _filter_market_hours(data, market_open="06:30", market_close="13:00"):
    """
    Filter data for market hours and keep the last N records.
    """
    # Ensure the index is converted to datetime format
    if not isinstance(data.index, pd.DatetimeIndex):
        data.index = pd.to_datetime(data.index, format='%Y-%m-%d %H:%M:%S', errors='coerce')

    # Now, filter based on market hours
    data_filtered = data.between_time(market_open, market_close)

    # Return the last N records
    return data_filtered


def _linear_regression(close_prices):
    """
    Perform linear regression on price data.
    """
    slope, _ = np.polyfit(np.arange(len(close_prices)), close_prices, 1)
    return slope


def _classify_squeeze(row):
    if row['squeezeHigh'] < 0 and row['squeezeMid'] < 0 and row['squeezeBlue'] < 0:
        return 'gold'  # Strong Squeeze
    elif row['squeezeMid'] < 0 and row['squeezeBlue'] < 0:
        return 'grey'  # Medium Squeeze
    elif row['squeezeBlue'] < 0:
        return 'blue'  # Weak Squeeze
    else:
        return None  # No Squeeze


def _classify_momentum(data, i):
    """
    Assign ThinkorSwim-style coloring based on momentum.
    """
    if i == 0:
        return "gray"
    prev_momentum = data['momentum'].iloc[i-1]
    curr_momentum = data['momentum'].iloc[i]
    
    if prev_momentum < curr_momentum:  # Momentum increasing
        return 'cyan' if curr_momentum >= 0 else 'darkblue'
    else:  # Momentum decreasing
        return 'purple' if curr_momentum >= 0 else 'magenta'


def plot_ttm_squeeze_momentum(data):
    """
    Plot TTM Squeeze histogram.
    """
    
    plt.figure(figsize=(15, 6))
    timestamps = data.index.strftime('%H:%M')

    for i, (timestamp, row) in enumerate(data.iterrows()):
        # Plot momentum as a dot
        plt.scatter(i, row['momentum'], color=row['momentum_color'], label="_nolegend_")

        # Add vertical line and squeeze dot if squeeze_on is True
        if row['squeeze_color'] is not None:
            plt.axvline(x=i, color='purple', linestyle='--', linewidth=0.8, alpha=0.7)
            plt.scatter(i, 0, color=row['squeeze_color'], marker='o', s=10, label='Squeeze On')


    plt.xticks(ticks=range(len(data)), labels=timestamps, rotation=45, fontsize=9)
    plt.axhline(0, color='gray', linestyle='--', linewidth=1)
    plt.xlabel("Timestamp (Pacific Time)")
    plt.ylabel("Momentum")
    plt.title("TTM Squeeze Histogram (ThinkorSwim Style) - SPY")
    plt.grid(True, linestyle='--', alpha=0.6)
    plt.show()

