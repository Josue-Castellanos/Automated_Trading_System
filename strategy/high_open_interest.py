import yfinance as yf
import matplotlib.pyplot as plt
from datetime import datetime, timedelta

SYMBOL = 'SPY'

def retrieveData():
    call_data, put_data = _GetOptionsData()
    return _SortedData(call_data, put_data)


# Retrieve options data for a given symbol
def _GetOptionsData():
    expiration_date = _CheckMarketTime()
    options = yf.Ticker(SYMBOL).option_chain(expiration_date)
    return options.calls, options.puts

# Check for the appropriate high open interest date
def _CheckMarketTime():
    now = datetime.now()
    market_close_time = now.replace(hour=13, minute=30, second=0, microsecond=0)

    # Check if market is closed
    if now > market_close_time:
        date = now + timedelta(days=1)
    else:
        date = now + timedelta(days=1)
        
    return date.strftime("%Y-%m-%d")


# Sort the strikes levels and return the 5 highest volumes
# TPossibly turn this into a dataframe instead
def _SortedData(call_data, put_data):
    call_data_sorted = call_data.sort_values(by='openInterest', ascending=False)
    put_data_sorted = put_data.sort_values(by='openInterest', ascending=False)

    call_strikes = []
    put_strikes = []

    for i in range(5):
        call_strikes.append(call_data_sorted.iloc[i]['strike'])
        call_strikes.append(call_data_sorted.iloc[i]['openInterest'])
        put_strikes.append(put_data_sorted.iloc[i]['strike'])
        put_strikes.append(put_data_sorted.iloc[i]['openInterest'])

    return call_strikes, put_strikes


# Plothighest OI levels
def _PlotHighestOILevels(call_data, put_data):
    fig, ax = plt.subplots()
    call_data_sorted = call_data.sort_values(by='openInterest', ascending=False)
    put_data_sorted = put_data.sort_values(by='openInterest', ascending=False)
    for i in range(5):
        call_strike = call_data_sorted.iloc[i]['strike']
        put_strike = put_data_sorted.iloc[i]['strike']
        if i == 0:
            ax.axhline(y=call_strike, linestyle='-', color='cyan', label=f'Call_{i+1} OI: {call_strike}')
            ax.axhline(y=put_strike, linestyle='-', color='xkcd:bright magenta', label=f'Put_{i+1} OI: {put_strike}')
        elif i == 1:
            ax.axhline(y=call_strike, linestyle='-', color='xkcd:neon blue', label=f'Call_{i+1} OI: {call_strike}')
            ax.axhline(y=put_strike, linestyle='-', color='xkcd:bright pink', label=f'Put_{i+1} OI: {put_strike}')
        elif i == 2:
            ax.axhline(y=call_strike, linestyle='-', color='darkturquoise', label=f'Call_{i+1} OI: {call_strike}')
            ax.axhline(y=put_strike, linestyle='-', color='xkcd:pinky purple', label=f'Put_{i+1} OI: {put_strike}')
        elif i == 3:
            ax.axhline(y=call_strike, linestyle='-', color='xkcd:dark cyan', label=f'Call_{i+1} OI: {call_strike}')
            ax.axhline(y=put_strike, linestyle='-', color='xkcd:purpleish', label=f'Put_{i+1} OI: {put_strike}')
        elif i == 4:
            ax.axhline(y=call_strike, linestyle='-', color='xkcd:dark aqua', label=f'Call_{i+1} OI: {call_strike}')
            ax.axhline(y=put_strike, linestyle='-', color='darkmagenta', label=f'Put_{i+1} OI: {put_strike}')
    ax.set_xlabel('Open Interest')
    ax.set_ylabel('Strike Price')
    ax.set_title(f'Highest Open Interest Volume Levels: {SYMBOL}')
    ax.legend()
    plt.show()


