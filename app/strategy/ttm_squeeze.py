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
    data['macd_color'] = macd_colors(data['histogram'])
    
    # Stochastic
    data = stochastic_hull(data)
    
    # Momentum
    data["momentum"] = data["Close"].rolling(length).apply(linear_regression, raw=True)
    data['momentum_color'] = [momentum_colors(data, i) for i in range(len(data))]

    # data['combined_color'] = combined_colors(data)
    # data['combined_color_1'] = combined_colors_1(data)
    # data['combined_color_2'] = combined_colors_2(data)
    # data['combined_color_3'] = combined_colors_3(data)
    # data['combined_color_4'] = combined_colors_4(data)
    data['combined_color_5'] = combined_colors_5(data)
    # data = enhanced_combined_indicator(data)
    
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
    if freq in [11, 14]:
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


def combined_colors_5(data):
    """
    Enhanced combined color indicator with:
    - Cyan variations for bullish signals
    - Magenta variations for bearish signals
    - Advanced confirmation metrics for all cases
    """    
    colors = {
        # Bullish (cyan spectrum)
        'ultra_bullish': 'darkcyan',
        'strong_bullish': 'cyan',
        'confirmed_bullish': 'deepskyblue',
        'moderate_bullish': 'paleturquoise',
        'weak_bullish': 'lightcyan',
        'bullish': 'darkblue',
        
        # Bearish (magenta spectrum)
        'ultra_bearish': 'darkmagenta',
        'strong_bearish': 'magenta',
        'confirmed_bearish': 'mediumvioletred',
        'moderate_bearish': 'hotpink',
        'weak_bearish': 'plum',
        'bearish': 'purple'
    }
    
    combined_colors = []
    
    for i in range(len(data)):  # Start from 1 to allow lookback
        # try:
        # Get current values
        mom_color = data['momentum_color'].iloc[i]
        macd_color = data['macd_color'].iloc[i]
        mom_value = data['momentum'].iloc[i]
        macd_hist = data['histogram'].iloc[i]
        
        # Current state
        is_overbought = data['stoch_overbought'].iloc[i]
        is_oversold = data['stoch_oversold'].iloc[i]
        
        # Cross events
        cross_above_oversold = data['stoch_bearish_reverse'].iloc[i]
        cross_below_overbought = data['stoch_bullish_reverse'].iloc[i]
        cross_above_overbought= data['stoch_bullish_break'].iloc[i]
        cross_below_oversold = data['stoch_bearish_break'].iloc[i]
        
        # Determine trend direction and strength
        mom_trend = 'up' if mom_color in ['cyan', 'darkblue'] else 'down'
        mom_strength = 'strong' if (mom_color == 'cyan' and mom_trend == 'up') or \
                                    (mom_color == 'magenta' and mom_trend == 'down') else 'weak'
        
        macd_trend = 'up' if macd_color in ['cyan', 'magenta'] else 'down'
        macd_strength = 'strong' if (macd_color == 'cyan' and macd_trend == 'up') or \
                                    (macd_color == 'magenta' and macd_trend == 'down') else 'weak'

        # Common metrics
        price_above_ema20 = data['Close'].iloc[i] > data['Close'].ewm(span=20).mean().iloc[i]
        price_below_ema20 = not price_above_ema20
        atr_ratio = data['atr'].iloc[i] / data['atr'].rolling(20).mean().iloc[i]
        bullish_candle = data['Close'].iloc[i] > data['Open'].iloc[i]
        bearish_candle = not bullish_candle
        
        # STOCHASTIC CASES ==============================================
        # if is_overbought and cross_above_overbought:
        #     combined_colors.append('yellow')
        # elif is_overbought:
        #     combined_colors.append('yellow')
        # elif is_oversold and cross_below_oversold:
        #     combined_colors.append('gold')
        # elif is_oversold:
        #     combined_colors.append('gold')
        
        # BULLISH CASES ==============================================
        if mom_trend == 'up' and macd_trend == 'up':
            # Enhanced bullish confirmation
            volume_spike = data['Volume'].iloc[i] > data['Volume'].rolling(20).mean().iloc[i] * 1.2
            new_high = data['Close'].iloc[i] == data['Close'].rolling(10).max().iloc[i]
            volatility_ok = 0.8 < atr_ratio < 1.5
            mom_increasing = mom_value > data['momentum'].iloc[i-1]
            
            bull_score = sum([
                price_above_ema20,
                volume_spike,
                new_high,
                volatility_ok,
                bullish_candle,
                mom_increasing,
                macd_hist > data['histogram'].iloc[i-1]  # MACD strengthening
            ])
            
            if mom_strength == 'strong' and macd_strength == 'strong':
                if bull_score >= 6:
                    combined_colors.append(colors['ultra_bullish'])     # ultra_bullish
                elif bull_score >= 4:
                    combined_colors.append(colors['strong_bullish'])    # strong_bullish
                else:
                    combined_colors.append(colors['confirmed_bullish']) # confirmed_bullish
            else:
                if bull_score >= 5:
                    combined_colors.append(colors['confirmed_bullish']) # confirmed_bullish
                elif bull_score >= 3:
                    combined_colors.append(macd_color)                   # moderate_bullish
                else:
                    combined_colors.append(macd_color)                  # weak_bullish

        # BEARISH CASES ==============================================
        elif mom_trend == 'down' and macd_trend == 'down':
            # Enhanced bearish confirmation
            volume_spike = data['Volume'].iloc[i] > data['Volume'].rolling(20).mean().iloc[i] * 1.3
            new_low = data['Close'].iloc[i] == data['Close'].rolling(10).min().iloc[i]
            volatility_ok = 1.0 < atr_ratio < 2.5
            mom_decreasing = mom_value < data['momentum'].iloc[i-1]
            
            bear_score = sum([
                price_below_ema20,
                volume_spike,
                new_low,
                volatility_ok,
                bearish_candle,
                mom_decreasing,
                macd_hist < data['histogram'].iloc[i-1]  # MACD weakening
            ])
            
            if mom_strength == 'strong' and macd_strength == 'strong':
                if bear_score >= 6:
                    combined_colors.append(colors['ultra_bearish'])     # ultra_bearish
                elif bear_score >= 4:
                    combined_colors.append(colors['strong_bearish'])    # strong_bearish
                else:
                    combined_colors.append(colors['confirmed_bearish']) # confirmed_bearish
            else:
                if bear_score >= 5:
                    combined_colors.append(colors['confirmed_bearish']) # confirmed_bearish
                elif bear_score >= 4:
                    combined_colors.append(colors['moderate_bullish'])  # macd_color    # moderate_bearish
                elif bear_score >= 3:
                    if mom_strength == 'strong' and macd_strength == 'weak' and volume_spike:
                        combined_colors.append('red')     # mom_color   
                    elif mom_strength == 'strong':
                        combined_colors.append(colors['moderate_bearish']) # mom_color
                    elif macd_strength =='strong' and mom_strength == 'weak':
                        combined_colors.append('black')
                    elif macd_strength =='weak' and mom_strength == 'weak':
                        combined_colors.append(colors['weak_bearish'])
                    else:
                        combined_colors.append('white')
                else:
                    combined_colors.append(colors['moderate_bullish'])            

        # MIXED CASES ===============================================
        elif mom_trend == 'up' and macd_trend == 'down':
            # Bullish momentum, bearish MACD
            if mom_strength == 'strong':
                combined_colors.append(colors['moderate_bearish']) # macd_color     # moderate_bullish
            elif macd_strength == 'strong':
                combined_colors.append(colors['weak_bearish'])          # weak_bearish
            else:
                combined_colors.append(macd_color)                      # neautral
                
        elif mom_trend == 'down' and macd_trend == 'up':
            # Bearish momentum, bullish MACD
            if macd_strength == 'strong' and mom_strength =='strong':
                combined_colors.append(mom_color)
            elif macd_strength == 'strong':
                combined_colors.append(mom_color)                       # moderate_bullish
            elif mom_strength == 'strong':
                combined_colors.append(colors['weak_bearish'])   #mom_color       # weak_bearish
            else:
                combined_colors.append(macd_color)                      # neautral
                
        else:
            combined_colors.append('yellow')
        
    return combined_colors


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


def squeeze_colors(row):
    if row['squeezeHigh'] < 0 and row['squeezeMid'] < 0 and row['squeezeBlue'] < 0:
        return 'gold'  # Strong Squeeze
    elif row['squeezeMid'] < 0 and row['squeezeBlue'] < 0:
        return 'black'  # Medium Squeeze
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
        plt.bar(i, data['histogram'].iloc[i], color=data['macd_color'].iloc[i], width=0.6, label='_nolegend_')

    for i, (timestamp, row) in enumerate(data.iterrows()):
        # Plot momentum as a dot
        plt.scatter(i, row['momentum'], color=row['combined_color_5'], label="_nolegend_")


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

