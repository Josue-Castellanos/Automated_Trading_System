import yfinance as yf
import pandas as pd
import sys
sys.path.append("/home/ubuntu/Automated_Trading_System")
from app.utils import dates
from datetime import datetime


def retrieveData():
    SYMBOL = 'SPY'
    call_data, put_data = _GetOptionsData(SYMBOL)
    # _PlotHighestOILevels(call_data, put_data, SYMBOL)
    return _SortedData(call_data, put_data)


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


# Sort the strikes levels and return the 5 highest volumes
# TPossibly turn this into a dataframe instead
def _SortedData(call_data, put_data):
    call_data_sorted = call_data.sort_values(by='openInterest', ascending=False)
    put_data_sorted = put_data.sort_values(by='openInterest', ascending=False)

    # call_strikes = []
    # put_strikes = []

    # for i in range(5):
    #     call_strikes.append(call_data_sorted.iloc[i]['strike'])
    #     call_strikes.append(call_data_sorted.iloc[i]['openInterest'])
    #     put_strikes.append(put_data_sorted.iloc[i]['strike'])
    #     put_strikes.append(put_data_sorted.iloc[i]['openInterest'])

    # Prepare the result as lists for DataFrame construction
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





