from datetime import datetime, timedelta
import pandas as pd

def dates():
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
    today = datetime.now()
    within_60_days = 360
    from_entered_date = today - timedelta(days=within_60_days)
    return from_entered_date.strftime("%Y-%m-%d")


def convert_epoch_to_datetime(epoch_ms):
    """Convert milliseconds epoch time to a datetime object adjusted for timezone."""
    datetime_parsed = pd.to_datetime(epoch_ms, unit='ms')
    datetime_adjusted = datetime_parsed - timedelta(hours=7)  # Adjust for PST
    return datetime_adjusted


def create_candle_dataframe(candles):
    """Convert API response to a DataFrame."""
    data = [
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
    df = pd.DataFrame(data)
    df.set_index('Datetime', inplace=True)
    return df


def fetch_price_data(schwab, symbol, start, end):
    """Fetch price history from Schwab API."""
    response = schwab.price_history(symbol, 'day', 1, 'minute', 5, start, end, True, True)
    df = create_candle_dataframe(response.json()) if response.ok else None
    # df.to_csv("/Users/josuecastellanos/Documents/Automated_Trading_System/market.csv", mode='w', index=True)
    return df


def stream_price_data(schwab, symbol, start, end):
    """Fetch price history from Schwab API."""
    response = schwab.price_history(symbol, 'day', 1, 'minute', 5, start, end, True, True)
    df = create_candle_dataframe(response.json()) if response.ok else None
    # df.to_csv("/Users/josuecastellanos/Documents/Automated_Trading_System/5min_candles.csv", mode='w', index=True)
    return df


def fetch_price_data_from_file(file_path):
    """Fetch price history from market.csv file."""
    try:
        df = pd.read_csv(file_path, parse_dates=['Datetime'])
        df.set_index('Datetime', inplace=True)

        return df if not df.empty else None
    except Exception as e:
        print(f"Error loading market data: {e}")
        return None
    
