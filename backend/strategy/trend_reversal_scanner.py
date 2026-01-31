import pandas as pd
import numpy as np
from .moving_averages import ema


# --- Wilder's ATR ---
def atr_wilder(df, length):
    tr1 = df['High'] - df['Low']
    tr2 = (df['High'] - df['Close'].shift()).abs()
    tr3 = (df['Low'] - df['Close'].shift()).abs()
    tr = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)

    atr = [tr.iloc[0]]
    for val in tr.iloc[1:]:
        atr.append((atr[-1] * (length - 1) + val) / length)
    return pd.Series(atr, index=df.index)


# --- Retroactive ZigZagHighLow ---
def zigzag_highlow(df, method, percentamount, revAmount, atrlength, atrreversal, averagelength):
    pricehigh_raw = df['High']
    pricelow_raw = df['Low']

    # Smoothed prices for "average" mode
    mah = ema(pricehigh_raw, averagelength)
    mal = ema(pricelow_raw, averagelength)

    priceh = pricehigh_raw if method == "high_low" else mah
    pricel = pricelow_raw if method == "high_low" else mal

    atr = atr_wilder(df, atrlength)

    EI = [np.nan] * len(df)
    last_dir = 0  # 1=up, -1=down, 0=unknown
    extreme_price = None
    extreme_index = None

    for i in range(len(df)):
        ph = priceh.iloc[i]
        pl = pricel.iloc[i]

        if last_dir == 0:
            extreme_price = ph
            extreme_index = i
            last_dir = 1  # start assuming up swing

        elif last_dir == 1:
            # Up swing
            if ph >= extreme_price:
                extreme_price = ph
                extreme_index = i
            elif (extreme_price - pl >= revAmount) or (extreme_price - pl >= atr.iloc[i] * atrreversal):
                # Confirm pivot retroactively
                EI[extreme_index] = extreme_price
                last_dir = -1
                extreme_price = pl
                extreme_index = i

        elif last_dir == -1:
            # Down swing
            if pl <= extreme_price:
                extreme_price = pl
                extreme_index = i
            elif (ph - extreme_price >= revAmount) or (ph - extreme_price >= atr.iloc[i] * atrreversal):
                EI[extreme_index] = extreme_price
                last_dir = 1
                extreme_price = ph
                extreme_index = i

        # Carry forward last pivot value
        if i > 0 and np.isnan(EI[i]):
            EI[i] = EI[i - 1]

    return pd.Series(EI, index=df.index), priceh, pricel


# --- Full Trend Reversal Scanner ---
def trend_reversal_scanner(df, method='average',
                            superfast_length=5,
                            fast_length=9,
                            slow_length=13,
                            displace=0,
                            percentamount=0.005,
                            revAmount=0.02,
                            atrreversal=1.0,
                            atrlength=3,
                            averagelength=5):

    df = df.copy()
    price = df['Close'].shift(-displace)  # match TOS displacement

    # --- EMAs ---
    df['mov_avg9'] = ema(price, superfast_length)
    df['mov_avg14'] = ema(price, fast_length)
    df['mov_avg21'] = ema(price, slow_length)

    # --- Precompute buy/sell logic ---
    buy = (df['mov_avg9'] > df['mov_avg14']) & (df['mov_avg14'] > df['mov_avg21']) & (df['Low'] > df['mov_avg9'])
    stopbuy = df['mov_avg9'] <= df['mov_avg14']
    buynow = (~buy.shift(1, fill_value=False)) & buy

    sell = (df['mov_avg9'] < df['mov_avg14']) & (df['mov_avg14'] < df['mov_avg21']) & (df['High'] < df['mov_avg9'])
    stopsell = df['mov_avg9'] >= df['mov_avg14']
    sellnow = (~sell.shift(1, fill_value=False)) & sell

    # --- Persistent buy/sell signal arrays ---
    buysignal = [0]
    sellsignal = [0]

    for i in range(1, len(df)):
        if buynow.iloc[i] and not stopbuy.iloc[i]:
            buysignal.append(1)
        elif buysignal[-1] == 1 and stopbuy.iloc[i]:
            buysignal.append(0)
        else:
            buysignal.append(buysignal[-1])

        if sellnow.iloc[i] and not stopsell.iloc[i]:
            sellsignal.append(1)
        elif sellsignal[-1] == 1 and stopsell.iloc[i]:
            sellsignal.append(0)
        else:
            sellsignal.append(sellsignal[-1])

    buysignal = pd.Series(buysignal, index=df.index)
    sellsignal = pd.Series(sellsignal, index=df.index)

    df['Buy_Signal'] = (buysignal.shift(1, fill_value=0) == 0) & (buysignal == 1)
    df['Sell_Signal'] = (sellsignal.shift(1, fill_value=0) == 0) & (sellsignal == 1)

    # --- ZigZag & directional logic ---
    EI, priceh, pricel = zigzag_highlow(df, method, percentamount, revAmount, atrlength, atrreversal, averagelength)
    EISave = [np.nan] * len(df)
    EIL = [np.nan] * len(df)
    EIH = [np.nan] * len(df)
    dir_arr = [0] * len(df)
    signal_arr = [0] * len(df)

    for i in range(len(df)):
        # Track last pivot
        if not np.isnan(EI.iloc[i]):
            EISave[i] = EI.iloc[i]
        else:
            EISave[i] = EISave[i - 1] if i > 0 else np.nan

        chg = (priceh.iloc[i] if EISave[i] == priceh.iloc[i] else pricel.iloc[i]) - (EISave[i - 1] if i > 0 else np.nan)
        isUp = chg >= 0 if not np.isnan(chg) else False

        EIL[i] = pricel.iloc[i] if not np.isnan(EI.iloc[i]) and not isUp else (EIL[i - 1] if i > 0 else pricel.iloc[i])
        EIH[i] = priceh.iloc[i] if not np.isnan(EI.iloc[i]) and isUp else (EIH[i - 1] if i > 0 else priceh.iloc[i])

        if i == 0:
            dir_arr[i] = 0
        elif EIL[i] != EIL[i - 1] or (pricel.iloc[i] == EIL[i - 1] and pricel.iloc[i] == EISave[i]):
            dir_arr[i] = 1
        elif EIH[i] != EIH[i - 1] or (priceh.iloc[i] == EIH[i - 1] and priceh.iloc[i] == EISave[i]):
            dir_arr[i] = -1
        else:
            dir_arr[i] = dir_arr[i - 1]

        if dir_arr[i] > 0 and pricel.iloc[i] > EIL[i]:
            signal_arr[i] = 1 if (signal_arr[i - 1] if i > 0 else 0) <= 0 else signal_arr[i - 1]
        elif dir_arr[i] < 0 and priceh.iloc[i] < EIH[i]:
            signal_arr[i] = -1 if (signal_arr[i - 1] if i > 0 else 0) >= 0 else signal_arr[i - 1]
        else:
            signal_arr[i] = signal_arr[i - 1]

    df['UpArrow'] = [(signal_arr[i] > 0 and (signal_arr[i - 1] if i > 0 else np.nan) <= 0) for i in range(len(df))]
    df['DownArrow'] = [(signal_arr[i] < 0 and (signal_arr[i - 1] if i > 0 else np.nan) >= 0) for i in range(len(df))]

    # --- Exit signals ---
    df['ExitLong'] = (buysignal.shift(1, fill_value=0) == 1) & (buysignal == 0)
    df['ExitShort'] = (sellsignal.shift(1, fill_value=0) == 1) & (sellsignal == 0)

    return df
