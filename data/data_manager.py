import os
import pandas as pd
from datetime import datetime, timedelta

PUT_OI_CSV_PATH = "./data/high_oi/puts_oi.csv"
CALL_OI_CSV_PATH = "./data/high_oi/calls_oi.csv"
OPTION_CSV_PATH = './data/option_chains/option_chain.csv'
CANDLE_CSV_PATH = './data/candle_history/candle_history.csv'

# MAKE INTO 1 FILE  
PUT_CSV_PATH = './data/option_chains/put_orders.csv'
CALL_CSV_PATH = './data/option_chains/call_orders.csv'

now = datetime.now().strftime("%m/%d/%Y")

def storeData(candle = None, option = None, call = None, put = None, calls = None, puts = None):

    # --------HIGH OPEN INTEREST LEVELS FOR PUTS/CALLS-----------
    if calls is not None:
        # -----------Create a CALL DataFrame with the new data--------------

        # Check if the file already exists
        file_exists = os.path.isfile(CALL_OI_CSV_PATH)

        # Append to the file if it exists
        if file_exists:
            with open(CALL_OI_CSV_PATH, 'a') as f:
                calls.to_csv(f, header=False, index=False, float_format='%.2f', sep='\t')
        else:
            # Write the header along with the data if the file doesn't exist
            calls.to_csv(CALL_OI_CSV_PATH, index=False, float_format='%.2f', sep='\t')

    elif puts is not None:
        # -----------Create a PUT DataFrame with the new data------------

        # Check if the file already exists
        file_exists = os.path.isfile(PUT_OI_CSV_PATH)

        # Append to the file if it exists
        if file_exists:
            with open(PUT_OI_CSV_PATH, 'a') as f:
                puts.to_csv(f, header=False, index=False, float_format='%.2f', sep='\t')
        else:
            # Write the header along with the data if the file doesn't exist
            puts.to_csv(PUT_OI_CSV_PATH, index=False, float_format='%.2f', sep='\t')


    # ----------PUT ORDERS PLACED---------------
    elif put is not None:

        # Check if the file already exists
        file_exists = os.path.isfile(PUT_CSV_PATH)

        # Append to the file if it exists
        if file_exists:
            with open(PUT_CSV_PATH, 'a') as f:
                put.to_csv(f, header=False, index=False, float_format='%.2f', sep='\t')
        else:
            # Write the header along with the data if the file doesn't exist
            put.to_csv(PUT_CSV_PATH, index=False, float_format='%.2f', sep='\t')


    # ----------CALL ORDERS PLACED--------------
    elif call is not None:

        # Check if the file already exists
        file_exists = os.path.isfile(CALL_CSV_PATH)

        # Append to the file if it exists
        if file_exists:
            with open(CALL_CSV_PATH, 'a') as f:
                call.to_csv(f, header=False, index=False, float_format='%.2f', sep='\t')
        else:
            # Write the header along with the data if the file doesn't exist
            call.to_csv(CALL_CSV_PATH, index=False, float_format='%.2f', sep='\t')


    # ------------PRICE HISTORY---------------
    elif candle is not None:

        # Check if the file already exists
        file_exists = os.path.isfile(CANDLE_CSV_PATH)

        # Append to the file if it exists
        if file_exists:
            with open(CANDLE_CSV_PATH, 'w') as f:
                candle.to_csv(f, header=False, index=False, float_format='%.2f', sep='\t')
        else:
            # Write the header along with the data if the file doesn't exist
            candle.to_csv(CANDLE_CSV_PATH, index=False, float_format='%.2f', sep='\t')


    # ------------OPTION CHAIN FOR CONTRACTS---------------
    elif option is not None:
        
        # Check if the file already exists
        file_exists = os.path.isfile(OPTION_CSV_PATH)

        # Append to the file if it exists
        if file_exists:
            with open(OPTION_CSV_PATH, 'w') as f:
                option.to_csv(f, index=False, float_format='%.2f', sep='\t')
        else:
            option.to_csv(OPTION_CSV_PATH, index=False, float_format='%.2f', sep='\t')
    

# CREATE DATAFRAMES
def createDataFrame(candles = None, options = None, calls = None, puts = None, call = None, put = None, type = None):

    if candles is not None:
        # Extracting the 'candles' part
        candles_ohlcv= candles['candles']

        # Create empty array to flatten structure
        data = []
        
        for ohlcv in candles_ohlcv:
            candle_data = {
                'Datetime'.ljust(20): str(pd.to_datetime(ohlcv.get('datetime'), unit='ms') - timedelta(hours=7)).ljust(20),
                'Open'.ljust(8): str(ohlcv.get('open')).ljust(8),
                'High'.ljust(8): str(ohlcv.get('high')).ljust(8),
                'Low'.ljust(8): str(ohlcv.get('low')).ljust(8),
                'Close'.ljust(8): str(ohlcv.get('close')).ljust(8),
                'Volume'.ljust(8): str(ohlcv.get('volume')).ljust(8)
            }
            data.append(candle_data)
        # Creating DataFrame directly from JSON item
        candles_df = pd.DataFrame(data)

        # Set 'datetime' column as index
        candles_df.set_index('Datetime'.ljust(20), inplace=True)

        # Reset index to keep 'datetime' as a regular column
        candles_df.reset_index(inplace=True)

        # Save data
        storeData(candle=candles_df)
        return candles_df

    elif options is not None:
        if type == "CALL":

            # Extracting the 'callExpDateMap' part
            call_exp_date_map = options['callExpDateMap']

            # Create empty array to flatten structure
            data = []

            # Creating dataframe directly from JSON items
            for exp_date, strikes in call_exp_date_map.items():     # Two items - expiration_datetime:days_to_exp and strike_candle
                for strike, options in strikes.items():     # Each strike_candle has option data
                    for option in options:      # For each option item needed add to dataframe
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
            # Creating DataFrame from array
            options_df = pd.DataFrame(data, index=range(1, len(data) + 1))
            # Save data
            storeData(option=options_df)
            return options_df
        
        elif type == "PUT":
            # Extracting the 'callExpDateMap' part
            put_exp_date_map = options['putExpDateMap']

            # Create empty array to flatten structure
            data = []

            # Creating dataframe directly from JSON items
            for exp_date, strikes in put_exp_date_map.items():     # Two items - expiration_datetime:days_to_exp and strike_candle
                for strike, options in strikes.items():     # Each strike_candle has option data
                    for option in options:      # For each option item needed add to dataframe
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
            # Creating DataFrame from array
            options_df = pd.DataFrame(data, index=range(1, len(data) + 1))
            # Save data
            storeData(option=options_df)
            return options_df            

    elif calls is not None:
        calls_df = pd.DataFrame({
            'Datetime': [now],
            'Call1': [str(calls[0]).ljust(10)],
            'OpenInterest1': [str(calls[1]).ljust(10)],
            'Call2': [str(calls[2]).ljust(10)],
            'OpenInterest2': [str(calls[3]).ljust(10)],
            'Call3': [str(calls[4]).ljust(10)],
            'OpenInterest3': [str(calls[5]).ljust(10)],            
            'Call4': [str(calls[6]).ljust(10)],
            'OpenInterest4': [str(calls[7]).ljust(10)],
            'Call5': [str(calls[8]).ljust(10)],
            'OpenInterest5': [str(calls[9]).ljust(10)]
        })
        # Set 'datetime' column as index
        calls_df.set_index('Datetime', inplace=True)
        print(calls_df, "\n")

        # Reset index to keep 'datetime' as a regular column
        calls_df.reset_index(inplace=True)

        storeData(calls=calls_df)

        if puts is not None:
            puts_df = pd.DataFrame({
                'Datetime': [now],
                'Put1': [str(puts[0]).ljust(10)],
                'OpenInterest1': [str(puts[1]).ljust(10)],
                'Put2': [str(puts[2]).ljust(10)],
                'OpenInterest2': [str(puts[3]).ljust(10)],
                'Put3': [str(puts[4]).ljust(10)],
                'OpenInterest3': [str(puts[5]).ljust(10)],
                'Put4': [str(puts[6]).ljust(10)],
                'OpenInterest4': [str(puts[7]).ljust(10)],
                'Put5': [str(puts[8]).ljust(10)],
                'OpenInterest5': [str(puts[9]).ljust(10)]
            })
            # Set 'datetime' column as index
            puts_df.set_index('Datetime', inplace=True)
            print(puts_df, "\n")

            # Reset index to keep 'datetime' as a regular column
            puts_df.reset_index(inplace=True)
            storeData(puts=puts_df)
        
    elif call is not None:
        call_df = pd.DataFrame(call)

        # Extract data from the nested 'orderLegCollection' structure
        call_df['Instruction'] = call_df['orderLegCollection'].apply(lambda x: x['instruction'])
        call_df['Quantity'] = call_df['orderLegCollection'].apply(lambda x: x['quantity'])
        call_df['Symbol'] = call_df['orderLegCollection'].apply(lambda x: x['instrument']['symbol'])
        call_df['AssetType'] = call_df['orderLegCollection'].apply(lambda x: x['instrument']['assetType'])
        call_df.drop(columns=['orderLegCollection'], inplace=True)

        call_df = call_df[['Instruction', 'Symbol', 'price', 'Quantity', 'AssetType']]
        storeData(call=call_df)

    elif put is not None:
        put_df = pd.DataFrame(put)
        
        # Extract data from the nested 'orderLegCollection' structure
        put_df['Instruction'] = put_df['orderLegCollection'].apply(lambda x: x['instruction'])
        put_df['Quantity'] = put_df['orderLegCollection'].apply(lambda x: x['quantity'])
        put_df['Symbol'] = put_df['orderLegCollection'].apply(lambda x: x['instrument']['symbol'])
        put_df['AssetType'] = put_df['orderLegCollection'].apply(lambda x: x['instrument']['assetType'])
        put_df.drop(columns=['orderLegCollection'], inplace=True)

        put_df = put_df[['Instruction', 'Symbol', 'price', 'Quantity', 'AssetType']]
        storeData(put=put_df)
