import yfinance as yf
import matplotlib.pyplot as plt
import pandas as pd
import sys
# sys.path.append("/home/ubuntu/Automated_Trading_System")
sys.path.append("/Users/josuecastellanos/Documents/Automated_Trading_System")
from app.utils import dates, datetime


def retrieveData():
    SYMBOL = 'SPY'
    call_data, put_data = _GetOptionsData(SYMBOL)
    return call_data, put_data 


# Retrieve options data for a given symbol
def _GetOptionsData(symbol):
    today_exp, tomorrow_exp = dates()

    current_time = datetime.now()
    cutoff_time = current_time.replace(hour=13, minute=15, second=0, microsecond=0)

    if current_time >= cutoff_time:
        options = yf.Ticker(symbol).option_chain(tomorrow_exp)
    
    else: 
        options = yf.Ticker(symbol).option_chain(today_exp)
    
    return options.calls, options.puts


def sortedData(call_data, put_data):
    call_data_sorted = call_data.sort_values(by='openInterest', ascending=False)
    put_data_sorted = put_data.sort_values(by='openInterest', ascending=False)

    call_strikes = []
    call_open_interest = []
    put_strikes = []
    put_open_interest = []

    for i in range(5):  # Adjust the range if you want more or fewer strikes
        call_strikes.append(call_data_sorted.iloc[i]['strike'])
        call_open_interest.append(call_data_sorted.iloc[i]['openInterest'])
        put_strikes.append(put_data_sorted.iloc[i]['strike'])
        put_open_interest.append(put_data_sorted.iloc[i]['openInterest'])


    result = pd.DataFrame({
        'Call Strike': call_strikes,
        'Call Open Interest': call_open_interest,
        'Put Strike': put_strikes,
        'Put Open Interest': put_open_interest
    })

    # return call_strikes, put_strikes
    return result


def plotHighestOILevels(call_data, put_data, symbol):
    fig, ax = plt.subplots(figsize=(15, 8))

    call_data_sorted = call_data.sort_values(by='openInterest', ascending=False)
    put_data_sorted = put_data.sort_values(by='openInterest', ascending=False)
    # filtered_calls = call_data_sorted[call_data_sorted['openInterest'] < 1000]
    # filtered_puts = put_data_sorted[put_data_sorted['openInterest'] < 1000]

    colors_calls = ['#E0ECFF', '#BFDFFF', '#80BFFF', '#408FFF', '#0066FF', '#0055CC', '#0044AA', '#003388', '#002266', '#001144']
    colors_puts = ['#FFE0F0', '#FFBFD4', '#FF80AA', '#FF4080', '#FF0055', '#CC0044', '#AA0036', '#880028', '#66001A', '#44000D']

    for i in range(7):
        # Plot Calls
        call_strike = call_data_sorted.iloc[i]['strike']
        call_oi = call_data_sorted.iloc[i]['openInterest']
        put_strike = put_data_sorted.iloc[i]['strike']
        put_oi = put_data_sorted.iloc[i]['openInterest']

        ax.axhline(y=call_strike, linestyle='-', color=colors_calls[i], label=f'Call_{i+1}: {call_strike}  OI: {call_oi}')
        ax.annotate(f"{call_oi}", xy=(1, call_strike), xytext=(10, 0),
                        textcoords='offset points', fontsize=10, color=colors_calls[i], ha='left', va='center')
        ax.axhline(y=put_strike, linestyle='-', color=colors_puts[i], label=f'Put_{i+1}: {put_strike}  OI: {put_oi}')
        ax.annotate(f"{put_oi}", xy=(1, put_strike), xytext=(10, 0),
                        textcoords='offset points', fontsize=10, color=colors_puts[i], ha='left', va='center')
        
    ax.set_ylabel('Strike Price')
    ax.set_title(f'Highest Open Interest Volume Levels: {symbol}')
    ax.legend()
    plt.show()

