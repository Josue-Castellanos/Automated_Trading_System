from datetime import datetime, timedelta, time
import yfinance as yf
import pandas as pd


def dates():
    """
    
    """
    today = datetime.now()
    day_of_week = today.weekday()

    if day_of_week in [4, 5, 6]:  # Friday, Saturday, or Sunday
        # Calculate the number of days until the next Monday
        days_until_monday = 7 - day_of_week

        if day_of_week == 4:
            next_monday = today 
            next_tuesday = next_monday + timedelta(days=days_until_monday)
        else:
            next_monday = today + timedelta(days=days_until_monday)
            next_tuesday = next_monday + timedelta(days=1)
        return next_monday.strftime("%Y-%m-%d"), next_tuesday.strftime("%Y-%m-%d")
    else:
        tomorrow = today + timedelta(days=1)
        return today.strftime("%Y-%m-%d"), tomorrow.strftime("%Y-%m-%d")
    

def order_date():
    """
    
    """
    today = datetime.now()
    within_60_days = 360
    from_entered_date = today - timedelta(days=within_60_days)
    return from_entered_date.strftime("%Y-%m-%d")


def convert_epoch_to_datetime(epoch_ms):
    """
    Convert milliseconds epoch time to a datetime object adjusted for timezone.
    """
    datetime_parsed = pd.to_datetime(epoch_ms, unit='ms')
    datetime_adjusted = datetime_parsed - timedelta(hours=7)  # Adjust for PST
    return datetime_adjusted


def create_order(price, symbol, type, position_size, var='OPEN'):
    """
    Create an order dictionary for buying or selling a position.

    Args:
        price (float): The price at which to place the order.
        symbol (str): The symbol of the instrument to trade.
        type (str): The type of order ('BUY' or 'SELL').
        var (str, optional): The variability of the order ('OPEN' or 'CLOSE'). Defaults to 'OPEN'.

    Returns:
        dict: A dictionary representing the order details.
    """
    if type != 'BUY':
        var='CLOSE'

    order = {
        'orderType': 'LIMIT',
        'session': 'NORMAL',
        'price': price,
        'duration': 'DAY',
        'orderStrategyType': 'SINGLE',
        'orderLegCollection': [{
            'instruction': f'{type}_TO_{var}',
            'quantity': position_size,
            'instrument': {
                'symbol': symbol,
                'assetType': 'OPTION'
            }
        }]
    }
    return order


def create_option_dataframe(options):
    """
    
    """
    data = []
    exp_date_map = options.get('callExpDateMap') or options.get('putExpDateMap')
    for exp_date, strikes in exp_date_map.items():
        for strike, options_list in strikes.items():
            for option in options_list:
                option_data = {
                    'Put/Call': option.get('putCall'),
                    'Symbol': option.get('symbol'),
                    'Description': option.get('description'),
                    'Bid': option.get('bid'),
                    'Ask': option.get('ask'),
                    'Volume': option.get('totalVolume'),
                    'Delta': option.get('delta'),
                    'OI': option.get('openInterest'),
                    'Expiration': exp_date,
                    'Strike': strike,
                    'IV': option.get('volatility'),
                    'DTE': option.get('daysToExpiration'),
                    'ITM': option.get('inTheMoney')
                }
                data.append(option_data)
    return pd.DataFrame(data)


def create_candle_dataframe(candles, freq, replacement_candles=None):
    """
    Convert API response to a DataFrame.
    """
    candle_data = []
    aggregated_data = []

    schwab_data = [
        {
            'Datetime': convert_epoch_to_datetime(ohlcv['datetime']),
            'Open': ohlcv.get('open'),
            'High': ohlcv.get('high'),
            'Low': ohlcv.get('low'),
            'Close': ohlcv.get('close'),
            'Volume': ohlcv.get('volume')
        }
        for ohlcv in candles['candles'] if ohlcv.get('datetime') is not None
    ]

    if replacement_candles is not None: 
        # Create main DataFrame and set index
        df_missing = pd.DataFrame(schwab_data)
        df_missing.set_index('Datetime', inplace=True)
    
        # Change Timezone and format of replacement datetime index
        replacement_candles = replacement_candles.drop(columns=['Dividends', 'Stock Splits', 'Capital Gains'])
        replacement_candles.index = pd.to_datetime(replacement_candles.index, unit='ms') - timedelta(hours=3)
        replacement_candles.index = (replacement_candles.index.tz_localize(None)).strftime("%Y-%m-%d %H:%M:%S")
        replacement_candles.index = pd.to_datetime(replacement_candles.index)

        
        # Merge with replacement_candles and re-sort
        df_complete = pd.concat([df_missing, replacement_candles])
        df_complete = df_complete.sort_index()
        df_complete = df_complete.loc[~df_complete.index.duplicated(keep='first')]

        # **Fill missing datetime indices**
        expected_freq = '1min'  # Adjust this if needed (1-minute candlesticks assumed)
        df_complete = df_complete.resample(expected_freq).ffill()  # Forward-fill missing timestamps
        df_complete = df_complete[:-1]    # Remove the last row, its a yfinance real-time 1-minute candle 

        if freq > 1:
            for index, ohlcv in df_complete.iterrows():
                new_candle = {
                    'Datetime': index, 
                    'Open': ohlcv['Open'],
                    'High': ohlcv['High'],
                    'Low': ohlcv['Low'],
                    'Close': ohlcv['Close'],
                    'Volume': ohlcv['Volume']
                }
                
                candle_data.append(new_candle)

                # Aggregate candles based on frequency
                if len(candle_data) == freq:
                    aggregated_candle = {
                        'Datetime': candle_data[0]["Datetime"],   # Timestamp of first candle in the group
                        'Open': candle_data[0]["Open"],           # Open price from first candle
                        'High': max(candle["High"] for candle in candle_data),
                        'Low': min(candle["Low"] for candle in candle_data),
                        'Close': candle_data[-1]["Close"],        # Close price from last candle
                        'Volume': sum(candle["Volume"] for candle in candle_data),
                    }
                    aggregated_data.append(aggregated_candle)
                    candle_data.clear()  # Reset for next batch

            # Real-Time Indicator Data
            # if len(candle_data) > 0:
            #     aggregated_candle = {
            #         'Datetime': candle_data[0]["Datetime"],   # Timestamp of first candle in the group
            #         'Open': candle_data[0]["Open"],           # Open price from first candle
            #         'High': max(candle["High"] for candle in candle_data),
            #         'Low': min(candle["Low"] for candle in candle_data),
            #         'Close': candle_data[-1]["Close"],        # Close price from last candle
            #         'Volume': sum(candle["Volume"] for candle in candle_data),
            #     }
            #     aggregated_data.append(aggregated_candle)
            #     candle_data.clear() 
            candle_data.clear()  # Reset for next batch
            agdf = pd.DataFrame(aggregated_data)
            agdf.set_index('Datetime', inplace=True)
            return agdf  
        return df_complete 
    df = pd.DataFrame(schwab_data)
    df.set_index('Datetime', inplace=True)
    return df


def filter_options(df, type):
    if type == 'CALL':
        df = df[::-1]

        indexes_to_drop = []
        counter = 1

        for index, row in df.iterrows():
            if row['ITM'] == False:  # Check if 'ITM' column is True
                continue

            elif row['ITM'] == True and counter == 1:
                counter -= 1
                continue

            indexes_to_drop.append(index)
                
        # Drop the collected indexes
        df = df.drop(indexes_to_drop)
        df = df[::-1]
        return df
    else:
        indexes_to_drop = []
        counter = 1

        for index, row in df.iterrows():
            if row['ITM'] == False:  # Check if 'ITM' column is True
                continue

            elif row['ITM'] == True and counter == 1:
                counter -= 1
                continue

            indexes_to_drop.append(index)
                
        # Drop the collected indexes
        df = df.drop(indexes_to_drop)
        df = df[::-1]
        return df
        

def fetch_price_data(schwab, symbol, time, freq, start, end):
    """
    Fetch price history from Schwab API.
    """
    if freq in [5, 10, 15, 30]:
        response = schwab.price_history(symbol, 'day', 1, time, freq, start, end, True, True)
        df = create_candle_dataframe(response.json(), freq) if response.ok else None
        # This removes the last row since its real-time
        # It can fluctuate into false signals.
        df = df[:-1]
    else:
        response = schwab.price_history(symbol, 'day', 1, time, 1, start, end, True, True)
        price_history =  yf.Ticker(symbol).history(period='1d', interval='1m', prepost=True)
        df = create_candle_dataframe(response.json(), freq, price_history) if response.ok else None
    return df


def stream_price_data(schwab, symbol, start, end):
    """
    Fetch price history from Schwab API.
    """
    response = schwab.price_history(symbol, 'day', 1, 'minute', 5, start, end, True, True)
    df = create_candle_dataframe(response.json()) if response.ok else None
    return df


def fetch_price_data_from_file(file_path):
    """
    Fetch price history from market.csv file.
    """
    try:
        df = pd.read_csv(file_path, parse_dates=['Datetime'])
        df.set_index('Datetime', inplace=True)

        return df if not df.empty else None
    except Exception as e:
        print(f"Error loading market data: {e}")
        return None
    

def market_is_open():
    """
    Check if the current time is within market hours
    """
    now = datetime.now()
    market_open = time(6, 30)  # e.g., 6:30 AM
    market_close = time(12, 49)  # e.g., 12:58 PM
    return market_open <= now.time() <= market_close