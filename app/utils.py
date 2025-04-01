from datetime import datetime, timedelta
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
                    'ITM': option.get('inTheMoney')
                }
                data.append(option_data)
    return pd.DataFrame(data)


def create_candle_dataframe(candles, freq):
    """
    Convert API response to a DataFrame.
    """
    data = []
    aggregated_data = []

    if freq in [1, 5, 10, 15, 30]:
        aggregated_data = [
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
    else:
        for ohlcv in candles['candles']:
            if ohlcv.get('datetime') is None:
                continue

            new_candle = {
                'Datetime': convert_epoch_to_datetime(ohlcv['datetime']),
                'Open': ohlcv.get('open'),
                'High': ohlcv.get('high'),
                'Low': ohlcv.get('low'),
                'Close': ohlcv.get('close'),
                'Volume': ohlcv.get('volume')
            }

            data.append(new_candle)

            # Check if we have candles to aggregate
            if len(data) == freq:
                aggregated_candle = {
                    'Datetime': data[0]["Datetime"],   # Timestamp of first candle in the group
                    'Open': data[0]["Open"],           # Open price from first candle
                    'High': max(candle["High"] for candle in data),
                    'Low': min(candle["Low"] for candle in data),
                    'Close': data[-1]["Close"],        # Close price from last candle
                    'Volume': sum(candle["Volume"] for candle in data),
                }
                aggregated_data.append(aggregated_candle)
                data.clear()  # Reset for next batch
    df = pd.DataFrame(aggregated_data)
    df.set_index('Datetime', inplace=True)
    return df


def fetch_price_data(schwab, symbol, time, freq, start, end):
    """
    Fetch price history from Schwab API.
    """
    if freq in [1, 5, 10, 15, 30]:
        response = schwab.price_history(symbol, 'day', 1, time, freq, start, end, True, True)
    else:
        response = schwab.price_history(symbol, 'day', 1, time, 1, start, end, True, True)
    df = create_candle_dataframe(response.json(), freq) if response.ok else None
    # df.to_csv("/Users/josuecastellanos/Documents/Automated_Trading_System/market.csv", mode='w', index=True)
    return df


def stream_price_data(schwab, symbol, start, end):
    """
    Fetch price history from Schwab API.
    """
    response = schwab.price_history(symbol, 'day', 1, 'minute', 5, start, end, True, True)
    df = create_candle_dataframe(response.json()) if response.ok else None
    # df.to_csv("/Users/josuecastellanos/Documents/Automated_Trading_System/5min_candles.csv", mode='w', index=True)
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
    
