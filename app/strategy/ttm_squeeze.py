import pandas as pd
import numpy as np
import matplotlib.pyplot as plt



def ttm_squeeze_momentum(data, freq, date=0, length=20, nBB=2.0, nK_Mid=1.5, nK_Low=2.0, nK_High=1.0, fast=12, slow=26, signal=9):
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
    data['squeeze_color'] = data.apply(squeeze_colors, axis=1)
    data.loc[(data['BB_Lower'] > data['KeltLower']) & (data['BB_Upper'] < data['KeltMid']), 'squeeze_color'] = 'gold'

    # MACD
    data['emaFast'] = data['Close'].ewm(span=fast, adjust=False).mean()
    data['emaSlow'] = data['Close'].ewm(span=slow, adjust=False).mean()
    data['macd'] = data['emaFast'] - data['emaSlow']
    data['signal'] = data['macd'].ewm(span=signal, adjust=False).mean()
    data['histogram'] = data['macd'] - data['signal']
    data['macd_hist_color'] = macd_colors(data['histogram'])

    # Momentum
    data["momentum"] = data["Close"].rolling(length).apply(linear_regression, raw=True)
    data['momentum_color'] = [momentum_colors(data, i) for i in range(len(data))]

    data['combined_color'] = combined_colors(data)
    
    data = enhanced_combined_indicator(data)

    return filter_market_hours(data, freq, date)


def filter_market_hours(data, freq, date, market_open="06:30", market_close="13:00"):
    """
    Filter data for market hours and keep the last N records.
    """
    # Ensure the index is converted to datetime format
    if not isinstance(data.index, pd.DatetimeIndex):
        data.index = pd.to_datetime(data.index, format='%Y-%m-%d %H:%M:%S', errors='coerce')

    if freq in [12, 16]:
        market_open="06:24"
    if freq in [14]:
        market_open="06:26"

    unique_dates = data.index.normalize().unique()
    unique_dates = [d.date() for d in unique_dates]

    data_filtered = data.loc[(data.index.date == unique_dates[date - 1]) & 
                            (data.index.time >= pd.to_datetime(market_open).time()) & 
                            (data.index.time <= pd.to_datetime(market_close).time())]
    return data_filtered


def linear_regression(close_prices):
    """
    Perform linear regression on price data.
    """
    slope, _ = np.polyfit(np.arange(len(close_prices)), close_prices, 1)
    return slope


## TESTING ##
def enhanced_combined_indicator(data, primary_length=20, confirmation_length=50, volume_threshold=1.2, smooth_period=3):
    """
    Enhanced combined indicator with:
    - Multi-timeframe confirmation
    - Volume weighting
    - Trend strength measurement
    - Dynamic smoothing
    - False signal filtering
    """
    # Calculate primary indicators
    
    # Add confirmation timeframe momentum
    data['confirmation_momentum'] = data["Close"].rolling(confirmation_length).apply(linear_regression, raw=True)
    
    # Calculate volume profile
    data['volume_ma'] = data['Volume'].rolling(primary_length).mean()
    data['volume_spike'] = data['Volume'] > (data['volume_ma'] * volume_threshold)
    
    # Calculate trend strength (0-100 scale)
    data['momentum_strength'] = data['momentum'].abs() / data['momentum'].rolling(primary_length).std()
    data['macd_strength'] = data['histogram'].abs() / data['histogram'].rolling(primary_length).std()
    data['combined_strength'] = (data['momentum_strength'] + data['macd_strength']) / 2
    
    # Dynamic smoothing based on volatility
    # atr = data['atr']
    # smooth_window = np.where(atr > atr.quantile(0.7), smooth_period * 2, 
    #                      np.where(atr < atr.quantile(0.3), 1, smooth_period))
    # data['smoothed_momentum'] = data['momentum'].rolling(window=smooth_window).mean()
    atr_quantiles = data['atr'].quantile([0.3, 0.7])
    data['smoothed_momentum'] = np.where(
        data['atr'] > atr_quantiles[0.7],
        data['momentum'].rolling(smooth_period * 2).mean(),
        np.where(
            data['atr'] < atr_quantiles[0.3],
            data['momentum'],
            data['momentum'].rolling(smooth_period).mean()
        )
    )
    # Generate enhanced colors
    data['enhanced_color'] = generate_enhanced_colors(data)
    
    return data


def generate_enhanced_colors(data):
    colors = []
    for i in range(len(data)):
        # Current values
        mom = data['momentum'].iloc[i]
        macd = data['histogram'].iloc[i]
        conf_mom = data['confirmation_momentum'].iloc[i]
        vol_spike = data['volume_spike'].iloc[i]
        strength = data['combined_strength'].iloc[i]
        squeeze = data['squeeze_color'].iloc[i]
        
        # Direction checks
        primary_bullish = mom > 0 and macd > 0
        primary_bearish = mom < 0 and macd < 0
        confirmation_bullish = conf_mom > 0
        confirmation_bearish = conf_mom < 0
        
        # Strength thresholds (adjust based on your asset)
        strong_threshold = 1.5
        weak_threshold = 0.5
        
        # Core logic
        if primary_bullish and confirmation_bullish:
            if strength > strong_threshold and vol_spike:
                color = 'darkgreen'  # Very strong bullish
            elif strength > weak_threshold:
                color = 'green'      # Strong bullish
            else:
                color = 'lime'       # Moderate bullish
                
        elif primary_bearish and confirmation_bearish:
            if strength > strong_threshold and vol_spike:
                color = 'darkred'    # Very strong bearish
            elif strength > weak_threshold:
                color = 'red'        # Strong bearish
            else:
                color = 'orangered'  # Moderate bearish
                
        # Divergence detection
        elif mom > 0 and macd < 0 and conf_mom > 0:
            color = 'gold' if squeeze else 'yellow'  # Bullish divergence
        elif mom < 0 and macd > 0 and conf_mom < 0:
            color = 'violet' if squeeze else 'pink'   # Bearish divergence
            
        # Squeeze special cases
        elif squeeze == 'gold' and vol_spike:
            color = 'gold'  # High probability breakout
        elif squeeze and not (primary_bearish or primary_bullish):
            color = 'gray'  # Squeeze but no clear direction
            
        # Default neutral
        else:
            color = 'gray'
            
        colors.append(color)
    
    return colors


def combined_colors(data):
    """
    Create a combined color indicator using both momentum and MACD signals.
    Rules:
    1. Strong Bullish (green): Both momentum and MACD bullish and increasing
    2. Bullish (light green): Both bullish but one is decreasing
    3. Neutral (gray): Mixed signals or weak momentum
    4. Bearish (light red): Both bearish but one is decreasing
    5. Strong Bearish (red): Both momentum and MACD bearish and increasing
    """
    combined_colors = []
    
    for i in range(len(data)):
        # Get current values
        mom_color = data['momentum_color'].iloc[i]
        macd_color = data['macd_hist_color'].iloc[i]
        mom_value = data['momentum'].iloc[i]
        macd_hist = data['histogram'].iloc[i]
        
        # Determine trend direction from momentum
        mom_trend = 'up' if mom_color in ['cyan', 'darkblue'] else 'down'
        mom_strength = 'strong' if (mom_color == 'cyan' and mom_trend == 'up') or \
                                 (mom_color == 'magenta' and mom_trend == 'down') else 'weak'
        
        # Determine trend direction from MACD
        macd_trend = 'up' if macd_color in ['cyan', 'magenta'] else 'down'
        macd_strength = 'strong' if (macd_color == 'cyan' and macd_trend == 'up') or \
                                   (macd_color == 'magenta' and macd_trend == 'down') else 'weak'
        
        # Combined Logic Color
        if mom_trend == 'up' and macd_trend == 'up':
            if mom_strength == 'strong' and macd_strength == 'strong':
                combined_colors.append(mom_color) #cyan # Strong bullish
            else:
                combined_colors.append(macd_color)  #darkblue') # Moderate bullish
        elif mom_trend == 'down' and macd_trend == 'down':
            if mom_strength == 'strong' and macd_strength == 'strong':
                combined_colors.append('white')    # Strong bearish
            else:
                combined_colors.append(macd_color)  #mom_color)  # Moderate bearish
        else:
            # Mixed signals - look for squeeze confirmation
            if data['squeeze_color'].iloc[i] is not None:
                if mom_value > 0:  # Favor bullish if momentum is positive
                    combined_colors.append(macd_color)  #mom_color)
                else:
                    combined_colors.append(macd_color)   #macd_color)
            else:
                combined_colors.append(macd_color)  # Neutral
    
    return combined_colors


def squeeze_colors(row):
    if row['squeezeHigh'] < 0 and row['squeezeMid'] < 0 and row['squeezeBlue'] < 0:
        return 'gold'  # Strong Squeeze
    elif row['squeezeMid'] < 0 and row['squeezeBlue'] < 0:
        return 'grey'  # Medium Squeeze
    elif row['squeezeBlue'] < 0:
        return 'blue'  # Weak Squeeze
    else:
        return None  # No Squeeze


def momentum_colors(data, i):
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


def macd_colors(hist):
    colors = []
    prev = hist.shift(1)

    for h, p in zip(hist, prev):
        if h >= 0 and h > p:
            colors.append('cyan')         # Bullish, increasing
        elif h >= 0 and h <= p:
            colors.append('purple')     # Bullish, decreasing
        elif h < 0 and h < p:
            colors.append('magenta')           # Bearish, increasing (more negative)
        else:
            colors.append('darkblue')       # Bearish, decreasing (less negative)

    return colors

    

def plot_ttm_squeeze_momentum(data):
    """
    Plot TTM Squeeze histogram.
    """
    plt.figure(figsize=(20, 6))
    timestamps = data.index.strftime('%H:%M')

    for i in range(len(data)):
        plt.bar(i, data['histogram'].iloc[i], color=data['momentum_color'].iloc[i], width=0.6, label='_nolegend_')

    for i, (timestamp, row) in enumerate(data.iterrows()):
        # Plot momentum as a dot
        plt.scatter(i, row['momentum'], color=row['combined_color'], label="_nolegend_")
        plt.scatter(i, row['momentum'], color=row['enhanced_color'], s=7, label="_nolegend_")


        if row['squeeze_color'] is not None:
            plt.axvline(x=i, color='purple', linestyle='--', linewidth=0.8, alpha=0.7)
            plt.scatter(i, 0, color=row['squeeze_color'], marker='o', s=10, label='Squeeze On')

    plt.xticks(ticks=range(len(data)), labels=timestamps, rotation=45, fontsize=9)
    plt.axhline(0, color='gray', linestyle='--', linewidth=1)
    plt.xlabel("Timestamp (Pacific Time)")
    plt.ylabel("Momentum")
    plt.title(f"TTM Squeeze Histogram - SPY {data.index[0]}")
    plt.grid(True, linestyle='--', alpha=0.6)
    plt.show()

