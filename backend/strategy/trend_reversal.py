import pandas as pd
import numpy as np

from .moving_averages import ema

# --- EMA matching ThinkScript ---

# --- Wilder's ATR ---
def atr_wilder(df, length):
    tr1 = df['High'] - df['Low']
    tr2 = (df['High'] - df['Close'].shift()).abs()
    tr3 = (df['Low'] - df['Close'].shift()).abs()
    tr = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)

    atr = [tr.iloc[0]]
    for val in tr.iloc[1:]:
        atr.append((atr[-1]*(length-1) + val)/length)
    return pd.Series(atr, index=df.index)

# --- ZigZagHighLow replication with method option ---
def zigzag_highlow(df, method, percentamount=0.005, revAmount=0.02, atrlength=3, atrreversal=1.0, averagelength=5):
    price_high = df['High']
    price_low = df['Low']

    # Use EMA smoothing if method == 'average', else raw high/low
    if method == 'average':
        price_high = ema(price_high, averagelength)
        price_low = ema(price_low, averagelength)


    atr = atr_wilder(df, atrlength)

    EI = [np.nan]*len(df)
    last_pivot = np.nan
    last_dir = 0  # 1=up, -1=down

    for i in range(1, len(df)):
        reversal_up = False
        reversal_down = False
        if not np.isnan(last_pivot):
            reversal_up = (price_high.iloc[i] - last_pivot >= revAmount) or (price_high.iloc[i] - last_pivot >= atr.iloc[i]*atrreversal)
            reversal_down = (last_pivot - price_low.iloc[i] >= revAmount) or (last_pivot - price_low.iloc[i] >= atr.iloc[i]*atrreversal)

        if last_dir <= 0 and reversal_up:
            EI[i] = price_high.iloc[i]
            last_pivot = EI[i]
            last_dir = 1
        elif last_dir >= 0 and reversal_down:
            EI[i] = price_low.iloc[i]
            last_pivot = EI[i]
            last_dir = -1
        else:
            EI[i] = np.nan if np.isnan(last_pivot) else last_pivot

    return pd.Series(EI, index=df.index)

# --- Full Trend Reversal Scanner ---
def trend_reversal_scanner(df, method,
                            superfast_length=5,
                            fast_length=9,
                            slow_length=13,
                            percentamount=0.005,
                            revAmount=0.02,
                            atrreversal=1.0,
                            atrlength=3,
                            averagelength=5):

    df = df.copy()
    price = df['Close']

    # --- EMAs ---
    df['mov_avg9'] = ema(price, superfast_length)
    df['mov_avg14'] = ema(price, fast_length)
    df['mov_avg21'] = ema(price, slow_length)

    # --- Buy/Sell persistent signals ---
    buysignal = [0]
    sellsignal = [0]

    for i in range(1, len(df)):
        buy = df['mov_avg9'].iloc[i] > df['mov_avg14'].iloc[i] and df['mov_avg14'].iloc[i] > df['mov_avg21'].iloc[i] and df['Low'].iloc[i] > df['mov_avg9'].iloc[i]
        stopbuy = df['mov_avg9'].iloc[i] <= df['mov_avg14'].iloc[i]
        buynow = buy and not (df['mov_avg9'].iloc[i-1] > df['mov_avg14'].iloc[i-1] and df['mov_avg14'].iloc[i-1] > df['mov_avg21'].iloc[i-1] and df['Low'].iloc[i-1] > df['mov_avg9'].iloc[i-1])

        if buynow and not stopbuy:
            buysignal.append(1)
        elif buysignal[-1] == 1 and stopbuy:
            buysignal.append(0)
        else:
            buysignal.append(buysignal[-1])

        sell = df['mov_avg9'].iloc[i] < df['mov_avg14'].iloc[i] and df['mov_avg14'].iloc[i] < df['mov_avg21'].iloc[i] and df['High'].iloc[i] < df['mov_avg9'].iloc[i]
        stopsell = df['mov_avg9'].iloc[i] >= df['mov_avg14'].iloc[i]
        sellnow = sell and not (df['mov_avg9'].iloc[i-1] < df['mov_avg14'].iloc[i-1] and df['mov_avg14'].iloc[i-1] < df['mov_avg21'].iloc[i-1] and df['High'].iloc[i-1] < df['mov_avg9'].iloc[i-1])

        if sellnow and not stopsell:
            sellsignal.append(1)
        elif sellsignal[-1] == 1 and stopsell:
            sellsignal.append(0)
        else:
            sellsignal.append(sellsignal[-1])

    buysignal = pd.Series(buysignal, index=df.index)
    sellsignal = pd.Series(sellsignal, index=df.index)

    df['Buy_Signal'] = (buysignal.shift(1, fill_value=0) == 0) & (buysignal == 1)
    df['Sell_Signal'] = (sellsignal.shift(1, fill_value=0) == 0) & (sellsignal == 1)

    # --- ZigZag & directional signals ---
    EI = zigzag_highlow(df, method, percentamount, revAmount, atrlength, atrreversal, averagelength)
    EISave = [np.nan]*len(df)
    EIL = [np.nan]*len(df)
    EIH = [np.nan]*len(df)
    dir_arr = [0]*len(df)
    signal_arr = [0]*len(df)

    for i in range(len(df)):
        # Track last pivot
        if not np.isnan(EI.iloc[i]):
            EISave[i] = EI.iloc[i]
        else:
            EISave[i] = EISave[i-1] if i>0 else np.nan

        chg = (df['High'].iloc[i] if EISave[i] == df['High'].iloc[i] else df['Low'].iloc[i]) - (EISave[i-1] if i>0 else 0)
        isUp = chg >= 0

        EIL[i] = df['Low'].iloc[i] if not np.isnan(EI.iloc[i]) and not isUp else (EIL[i-1] if i>0 else df['Low'].iloc[i])
        EIH[i] = df['High'].iloc[i] if not np.isnan(EI.iloc[i]) and isUp else (EIH[i-1] if i>0 else df['High'].iloc[i])

        if i==0:
            dir_arr[i] = 0
        elif EIL[i] != EIL[i-1] or (df['Low'].iloc[i] == EIL[i-1] and df['Low'].iloc[i] == EISave[i]):
            dir_arr[i] = 1
        elif EIH[i] != EIH[i-1] or (df['High'].iloc[i] == EIH[i-1] and df['High'].iloc[i] == EISave[i]):
            dir_arr[i] = -1
        else:
            dir_arr[i] = dir_arr[i-1]

        if dir_arr[i] > 0 and df['Low'].iloc[i] > EIL[i]:
            signal_arr[i] = 1 if signal_arr[i-1] <= 0 else signal_arr[i-1]
        elif dir_arr[i] < 0 and df['High'].iloc[i] < EIH[i]:
            signal_arr[i] = -1 if signal_arr[i-1] >= 0 else signal_arr[i-1]
        else:
            signal_arr[i] = signal_arr[i-1]

    df['UpArrow'] = [(signal_arr[i] > 0 and (signal_arr[i-1] if i>0 else 0) <= 0) for i in range(len(df))]
    df['DownArrow'] = [(signal_arr[i] < 0 and (signal_arr[i-1] if i>0 else 0) >= 0) for i in range(len(df))]

    # --- Exit signals ---
    df['ExitLong'] = (buysignal.shift(1, fill_value=0) == 1) & (buysignal == 0)
    df['ExitShort'] = (sellsignal.shift(1, fill_value=0) == 1) & (sellsignal == 0)

    return df
