from crypt import methods
import json
import threading
import time
from datetime import datetime
from setting.dates  import dates
from cloud_services.apiV2 import Gmail
from data.data_manager import DataManager
from schwab.apiV2 import Schwab
from strategy import high_open_interest


class Client():
    def __init__(self):
        #self.call_strikes, self.put_strikes = high_open_interest.retrieveData()
        self.schwab = Schwab()
        self.gmail = Gmail()
        self.database = DataManager()
        self.max_position_size = None
        self.max_profit_percentage = None
        self.max_loss_percentage = None
        self.max_contract_price = None
        self.least_delta = None
        self.adjusted_balance = None
        self.DAY = 0
        self.today, self.tomorrow = dates()
        self.initialize()


    def initialize(self):
        """

        """
        self.set_settings()
        self.schwab.update_tokens_automatic()

        # Make a Database in sql and authenticate the account here
        #self.database.create_dataframe('high_oi', self.call_strikes)
        #self.database.create_dataframe('high_oi', self.put_strikes)

        threading.Thread(target=self.handleCallEvent, daemon=True).start()
        threading.Thread(target=self.handlePutEvent, daemon=True).start()  
              
        # Check for open positions
        self.check_position(self.position_type())
        self.gmail.set_checker(True)
        self.gmail.check_email_automatic()


    def handlePutEvent(self):
        """

        """
        while True:
            self.gmail.get_put_event().wait()
            
            open_position = self.gmail.get_current_position()

            if open_position != 'PUT':
                self.sell_position()
                put_contract = self.best_contract('PUT')

                if put_contract is not None:
                    self.buy_position(put_contract, 'PUT')
                    self.gmail.set_current_position('PUT')
                    self.check_position('PUT')
                    
                self.gmail.reset_position()

            self.gmail.get_put_event().clear()


    def handleCallEvent(self):
        """

        """
        while True:
            self.gmail.get_call_event().wait()
            
            open_position = self.gmail.get_current_position()

            if open_position != 'CALL':
                self.sell_position()
                call_contract = self.best_contract('CALL')

                if call_contract is not None:
                    self.buy_position(call_contract, 'CALL')
                    self.gmail.set_current_position('CALL')

                    self.check_position('CALL')
                    
                self.gmail.reset_position()

            self.gmail.get_call_event().clear()


    def best_contract(self, type):
        """

        """        
        # Request the option chain
        options = self.schwab.get_chains('SPY', type, '7', 'TRUE', '', '', '', 'OTM', self.today, self.today).json()
        # Create a dataframe of the options
        strike_price_df = self.database.create_dataframe('options', options)

        if type == 'PUT':
            filtered_delta_result = strike_price_df.loc[strike_price_df['Delta'] <= -abs(self.get_least_delta())]
        elif type == 'CALL':
            filtered_delta_result = strike_price_df.loc[strike_price_df['Delta'] >= self.get_least_delta()]

        filtered_ask_result = filtered_delta_result.loc[filtered_delta_result['Ask'] <= self.get_max_contract_price()]

        if not filtered_ask_result.empty:
            contract = filtered_ask_result.iloc[0]
            buy_order = self.create_order(contract.get('Ask'), contract.get('Symbol'), 'BUY')
            return buy_order
        else:
            return None


    def buy_position(self, order, type):
        """

        """        
        # Request Hash value
        hash = self.schwab.account_numbers().json()[0].get('hashValue')
        
        # Lets create the buy order with the best contract
        symbol = order["orderLegCollection"][0]["instrument"]["symbol"]
        
        # Buy in price
        price = order["price"]

        try:
            # Post Buy Order
            self.schwab.post_orders(order, accountNumber=hash).json()
        except json.decoder.JSONDecodeError:
            # Update database
            self.database.create_dataframe('order', order)
            # Update trades table
        

    def check_position(self, type):
        """

        """
        if type is None:
            return
        
        # Request Hash value
        hash = self.schwab.account_numbers().json()[0].get('hashValue')
            
        inPosition = True
        while inPosition:
            time.sleep(1)
            # Request open positions from account 
            open_position = self.schwab.account_number(hash, "positions").json()
            try:
                # Symbol of open position
                symbol = open_position["securitiesAccount"]["positions"][0]["instrument"]["symbol"]

                # Average price of initial buy
                price = open_position["securitiesAccount"]["positions"][0]["averagePrice"]
                
                # Current Market Value of contract
                market_value = open_position["securitiesAccount"]["positions"][0]["marketValue"] / 100

                # Contract profit and loss percentage
                price_change = market_value - price
                profit_percentage = (price_change / price) * 100
                
                # Update positions table
                """
                TODO: Remove % logic and use the market value to determine
                """
                if profit_percentage >= self.get_max_profit_percentage() or profit_percentage <= self.get_max_loss_percentage():
                    self.sell_position(type)
                    inPosition = False
                    break   
            except KeyError as e:
                inPosition = False
                break
    

    # TODO: Fix this logic becasue it sells when it doenst need
    def sell_position(self):
        """

        """        
        # Request hash value
        hash = self.schwab.account_numbers().json()[0].get('hashValue')
        
        # Request all open positions
        order = self.schwab.account_number(hash, "positions").json()

        try:
            # Market value of the first order
            market_value = order["securitiesAccount"]["positions"][0]["marketValue"] / 100
            
            # Average price of initial buy
            price = order["securitiesAccount"]["positions"][0]["averagePrice"]
            
            # Order Symbol
            symbol = order["securitiesAccount"]["positions"][0]["instrument"]["symbol"]
            
            # Contract profit and loss percentage
            price_change = market_value - price
            profit_percentage = (price_change / price) * 100
            
            # Create Sell Order
            sell_order = self.create_order(round(market_value, 2), symbol, 'SELL')
            
            # Post Sell Order
            self.schwab.post_orders(sell_order, accountNumber=hash).json()
        except json.decoder.JSONDecodeError:
            # Update database
            self.database.create_dataframe('order', order)
            
            # TODO: figure out how to keep track of the quantity and what alert
        except KeyError as e:
            return


    def create_order(self, price, symbol, type, var='OPEN'):
        """

        """
        # Read the settings.txt file and apply the settings of quantity and risk % of account
        # Add a way to check balance here and check if you have used a certain % of account already.
        # Total balance, Risk Target Balance, Current Balance
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
                'quantity': self.get_max_position_size(),
                'instrument': {
                    'symbol': symbol,
                    'assetType': 'OPTION'
                }
            }]
        }
        return order
    

    def position_type(self):
        """

        """
        hash = self.schwab.account_numbers().json()[0].get('hashValue')
        order = self.schwab.account_number(hash, "positions").json()
        type = None
        try:
            # Symbol of open position
            symbol = order["securitiesAccount"]["positions"][0]["instrument"]["symbol"]

            type = symbol[12:13]

            if type == 'C':
                self.gmail.set_current_position('CALL')
               
            elif type == 'P':
                self.gmail.set_current_position('PUT')
            return self.gmail.get_current_position()  
            
        except KeyError as e:
            return None


    def get_candle_history(self, ticker, periodType, period, frequencyType, frequency, startDate, endDate, fileName):
        """

        """
        # response = self.schwab.price_history('SPY', 'day', 10, 'minute', 1, datetime.strptime('2024-01-05', "%Y-%m-%d"), datetime.strptime('2024-08-12', "%Y-%m-%d"), True, True)
        response = self.schwab.price_history(ticker, periodType, period, frequencyType, frequency, datetime.strptime(startDate, "%Y-%m-%d"), datetime.strptime(endDate, "%Y-%m-%d"), True, True)

        if response.ok:
            data = response.json()
            temp = data
            self.convert_epoch_to_datetime(temp["candles"])
            df = self.database.create_dataframe('candles', data)
            self.database.store_data('candles', df, fileName)


    def convert_epoch_to_datetime(self, candles):
        """

        """
        for candle in candles:
            epoch = candle["datetime"]
            dt = datetime.fromtimestamp(epoch / 1000.0)
            candle["datetime"] = dt.strftime('%Y-%m-%d %H:%M:%S')


    def set_schedule_auto_start(self, time):
        """

        """
        # Implementation for scheduling auto start
        self.schedule_auto_start = time


    def set_max_position_size(self, size):
        """

        """
        # Implementation for setting max position size
        self.max_position_size = size


    def set_max_profit_percentage(self, profit_percentage):
        """

        """
        # Implementation for setting max profit percentage
        self.max_profit_percentage = profit_percentage


    def set_max_loss_percentage(self, loss_percentage):
        """

        """
        # Implementation for setting max loss percentage
        self.max_loss_percentage = -abs(100 - loss_percentage)


    def set_max_contract_price(self, contract_price):
        """
        
        """
        # Implementation for setting max loss percentage
        self.max_contract_price = contract_price


    def set_least_delta(self, delta):
        """
        
        """
        # Implementation for setting max loss percentage
        self.least_delta = delta


    def set_strategies(self, strategies):
        """
        
        """
        # Implementation for setting strategies
        self.strategies = strategies


    def get_schedule_auto_start(self):
        """
        
        """
        return self.schedule_auto_start
    

    def get_max_position_size(self):
        """
        
        """
        return self.max_position_size
    

    def get_max_profit_percentage(self):
        """
        
        """
        return self.max_profit_percentage
    

    def get_max_loss_percentage(self):
        """
        
        """
        return self.max_loss_percentage
    

    def get_max_contract_price(self):
        """
        
        """
        return self.max_contract_price
    

    def get_least_delta(self):
        """
        
        """
        return self.least_delta

    
    def set_settings(self):
        df = self.gmail.read_sheet()
        self.DAY = 0

        # This is something I can check to see If I had  Green or red day
        self.adjusted_balance = int(df.at[self.DAY,'Adj$Balance'][1:])

        self.set_max_position_size(int(df.at[self.DAY,'Pos#Open']))
        self.max_profit_percentage = float(df.at[self.DAY,'Pos%Tgt'][:5])
        self.max_loss_percentage = -abs(float(df.at[self.DAY,'Tot%Risk'][:5]))
        self.max_contract_price = int(df.at[self.DAY,'Pos$Size'][1:])
        self.least_delta = 0.20
    

    def save_settings(self):
        # Request the accounts balance and send it to sheet
        sheet_name = 'perf'
        column = 'P'
        row = 20 + self.DAY
        
        range = f'{sheet_name}!{column}{row}'

        self.gmail.update_sheet(range, 317.79)
