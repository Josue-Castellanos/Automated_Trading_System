import pandas as pd
import numpy as np
import json


def indicator_manager(data, indicator_settings):
    """
    Calculate technical indicators from DataFrame
    
    Args:
        price_data (pd.DataFrame): DataFrame with OHLCV data and time column
        indicator_settings (list): List of indicator configurations
        
    Returns:
        dict: Dictionary of calculated indicators
    """
    # Convert to DataFrame first
    df = pd.DataFrame(data['candles'])
    
    # Ensure proper datetime handling without changing the format
    if 'datetime' in df.columns:
        df['time'] = df['datetime']
        
    if not isinstance(indicator_settings, list):
        if isinstance(indicator_settings, str):
            try:
                indicator_settings = json.loads(indicator_settings)
            except json.JSONDecodeError:
                indicator_settings = []
        else:
            indicator_settings = []

    # Ensure time column exists and is proper format
    if 'time' not in df.columns:
        if isinstance(df.index, pd.DatetimeIndex):
            df = df.reset_index().rename(columns={'index': 'time'})
        else:
            raise ValueError("DataFrame must have 'time' column or DatetimeIndex")

    indicator_data = {}

    for indicator in indicator_settings:
        try:
            indicator_name = indicator['label']
            settings = indicator['settings']
            
            if indicator_name == 'EMA':
                period = settings.get('period')  # default to 14 if not specified
                series = settings.get('series')  # default to 'close'
                
                values = df[series].ewm(span=period, adjust=False).mean()
                
                indicator_data['EMA'] = [
                    {
                        'time': int(row['time']), 
                        'value': round(float(value), 4) if not pd.isna(value) else None
                    }
                    for row, value in zip(df.to_dict('records'), values)
                ]
                
            elif indicator_name == 'SMA':
                period = settings.get('period')
                series = settings.get('series')
                
                values = df[series].rolling(window=period).mean()
                
                indicator_data['SMA'] = [
                    {
                        'time': int(row['time']), 
                        'value': round(float(value), 4) if not pd.isna(value) else None
                    }
                    for row, value in zip(df.to_dict('records'), values)
                ]
            
            elif indicator_name == 'SMA50':
                period = 50
                series = settings.get('series')
                
                values = df[series].rolling(window=period).mean()
                
                indicator_data['SMA50'] = [
                    {
                        'time': int(row['time']), 
                        'value': round(float(value), 4) if not pd.isna(value) else None
                    }
                    for row, value in zip(df.to_dict('records'), values)
                ]
    
                indicator_data['SMA50_slope'] = indicator_data['SMA50'].rolling(window=20).apply(lambda x: np.polyfit(range(20), x, 1)[0], raw=True)
            
            elif indicator_name == 'SMA200':
                period = 200
                series = settings.get('series')
                
                values = df[series].rolling(window=period).mean()
                
                indicator_data['SMA200'] = [
                    {
                        'time': int(row['time']), 
                        'value': round(float(value), 4) if not pd.isna(value) else None
                    }
                    for row, value in zip(df.to_dict('records'), values)
                ]
            
                indicator_data['SMA200_slope'] = indicator_data['SMA200'].rolling(window=20).apply(lambda x: np.polyfit(range(20), x, 1)[0], raw=True)

        except Exception as e:
            print(f"Error processing {indicator_name}: {str(e)}")
            continue

        # Convert DataFrame to dict with NaN handling
        price_data = []
        for record in df.to_dict('records'):
            cleaned_record = {}
            for key, value in record.items():
                if pd.api.types.is_float(value) and pd.isna(value):
                    cleaned_record[key] = None
                elif pd.api.types.is_float(value):
                    cleaned_record[key] = float(value)
                else:
                    cleaned_record[key] = value
            price_data.append(cleaned_record)
    
    return {
        'price_data': price_data, 
        'indicators': indicator_data
        }