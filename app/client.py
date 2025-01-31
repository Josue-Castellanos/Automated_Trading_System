from crypt import methods
import json
import threading
import time
import pandas as pd
from schwab import Schwab
from sheet import Sheet
from datetime import datetime
from utils  import dates
from gmail import Gmail


class Client:
    """
    A class representing a client for automated trading operations.

    This class integrates various components such as Schwab API, Gmail API,
    and a database manager to perform automated trading operations.
    """
    def __init__(self):
        """
        Initialize the Client instance with necessary components, attributes, and starting background processes.

        This method sets up initial settings, starts background threads
        for handling call and put events, checks for open positions, and starts
        automatic email checking (Daemon Thread).
        """
        self.gmail = Gmail()
        self.schwab = Schwab()
        self.sheet = Sheet()
        self.today, self.tomorrow = dates()
        self.now = datetime.now().strftime("%-m/%-d/%Y")        
        self.loss_percentage = -50.00                           # ADJUST: (-50.00%) change if you need to adjust risk
        self.position_size = None
        self.profit_percentage = None
        self.contract_price = None
        self.adjusted_balance = None
        self.day = None
        self.balance = None
        self.set_settings()

        threading.Thread(target=self.handleCallEvent, daemon=True).start()
        threading.Thread(target=self.handlePutEvent, daemon=True).start()  
        self.check_position(self.position_type())
        self.gmail.set_checker(True)
        self.gmail.check_email_automatic()



# ************************************************************************************************************************
# ************************************************ EVENTS ****************************************************************
# ************************************************************************************************************************
    def handlePutEvent(self):
        """
        Handle put option events in a continuous loop.

        This method waits for put events, sells existing positions if necessary,
        finds the best put contract, and buys a new position if a suitable contract is found.

        Returns:
            None
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
                    self.calculate_remaining_balance()
                    self.check_position('PUT')
                    
                self.gmail.reset_position()

            self.gmail.get_put_event().clear()


    def handleCallEvent(self):
        """
        Handle call option events in a continuous loop.

        This method waits for call events, sells existing positions if necessary,
        finds the best call contract, and buys a new position if a suitable contract is found.

        Returns:
            None
        """
        while True:
            self.gmail.get_call_event().wait()
            open_position = self.gmail.get_current_position()

            if open_position != 'CALL' and self.is_enough_funds():
                self.sell_position()
                call_contract = self.best_contract('CALL')

                if call_contract is not None:
                    self.buy_position(call_contract, 'CALL')
                    self.gmail.set_current_position('CALL')
                    self.calculate_remaining_balance()
                    self.check_position('CALL')
                    
                self.gmail.reset_position()

            self.gmail.get_call_event().clear()


# ************************************************************************************************************************
# ************************************************ TRADING SYSTEM ********************************************************
# ************************************************************************************************************************
    def best_contract(self, type):
        """
        Find the best contract based on the given type (PUT or CALL).

        Args:
            type (str): The type of option contract to find ('PUT' or 'CALL').

        Returns:
            dict or None: A dictionary representing the best contract order, or None if no suitable contract is found.
        """
        options = self.schwab.get_chains('SPY', type, '7', 'TRUE', '', '', '', 'OTM', self.today, self.today)
        strike_price_df = self.create_dataframe(options)
        if type=='PUT':
            filtered_ask_result = strike_price_df.loc[strike_price_df['Ask'] <= self.contract_price][::-1]
        else:
            filtered_ask_result = strike_price_df.loc[strike_price_df['Ask'] <= self.contract_price]

        if not filtered_ask_result.empty:
            contract = filtered_ask_result.iloc[0]
            buy_order = self.create_order(contract.get('Ask'), contract.get('Symbol'), 'BUY')
            return buy_order
        else:
            return None
    

    def buy_position(self, order, type):
        """
        Execute a buy order for the given contract.

        Args:
            order (dict): The order details for buying the contract.
            type (str): The type of the contract ('PUT' or 'CALL').

        Returns:
            None
        """
        hash = self.schwab.account_numbers()[0].get('hashValue')
        symbol = order["orderLegCollection"][0]["instrument"]["symbol"]
        price = order["price"]

        try:
            self.schwab.post_orders(order, accountNumber=hash).json()
        except json.decoder.JSONDecodeError:
            pass


    def check_position(self, type):
        """
        Continuously check the status of an open position and sell if certain conditions are met.

        Args:
            type (str): The type of the position to check ('PUT' or 'CALL').

        Returns:
            None
        """
        if type is None:
            return
        
        hash = self.schwab.account_numbers()[0].get('hashValue')
            
        inPosition = True
        while inPosition:
            time.sleep(1)
            open_position = self.schwab.account_number(hash, "positions")
            try:
                symbol = open_position["securitiesAccount"]["positions"][0]["instrument"]["symbol"]
                profit_loss_percentage = open_position["securitiesAccount"]["positions"][0]["currentDayProfitLossPercentage"]
                # This logic here has to be chamged to the market value diff or somehting else
                # *****************************************************************************
                price = open_position["securitiesAccount"]["positions"][0]["averagePrice"]
                market_value = open_position["securitiesAccount"]["positions"][0]["marketValue"] / 100
                price_change = market_value - price
                profit_percentage = (price_change / price) * 100
                # *****************************************************************************


                
                if profit_loss_percentage >= self.profit_percentage or profit_loss_percentage <= self.loss_percentage:
                    self.sell_position(type)
                    inPosition = False
                    break   
            except KeyError as e:
                inPosition = False
                break


    def sell_position(self):
        """
        Sell the current open position.

        This method attempts to sell the currently open position based on
        the current market value and the initial purchase price.

        Returns:
            None
        """
        print("Found Put Signal")
        hash = self.schwab.account_numbers()[0].get('hashValue')
        order = self.schwab.account_number(hash, "positions")

        try:
            market_value = order["securitiesAccount"]["positions"][0]["marketValue"] / 100
            symbol = order["securitiesAccount"]["positions"][0]["instrument"]["symbol"] 
            sell_order = self.create_order(round(market_value, 2), symbol, 'SELL')
            self.schwab.post_orders(sell_order, accountNumber=hash).json()
        except json.decoder.JSONDecodeError:
            pass
        except KeyError as e:
            return


# ************************************************************************************************************************
# ************************************************ CREATE ORDER **********************************************************
# ************************************************************************************************************************
    def create_order(self, price, symbol, type, var='OPEN'):
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
                'quantity': self.position_size,
                'instrument': {
                    'symbol': symbol,
                    'assetType': 'OPTION'
                }
            }]
        }
        return order


    def create_dataframe(self, options):
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


# *******************************************************************************************************************
# ************************************************ UTILITIES ********************************************************
# *******************************************************************************************************************
    def position_type(self):
        """
        Determine the type of the current open position.

        Returns:
            str or None: The type of the current position ('CALL' or 'PUT'), or None if no position is open.
        """
        hash = self.schwab.account_numbers()[0].get('hashValue')
        order = self.schwab.account_number(hash, "positions")
        type = None
        try:
            symbol = order["securitiesAccount"]["positions"][0]["instrument"]["symbol"]
            type = symbol[12:13]

            if type == 'C':
                self.gmail.set_current_position('CALL')
            elif type == 'P':
                self.gmail.set_current_position('PUT')
            return self.gmail.get_current_position()  
            
        except KeyError as e:
            return None
        

    def total_cash(self):
        """
        Retrieve the total cash balance of the account.

        Returns:
            float: The total cash balance in the account.
        """
        while True:
            try:
                # Attempt to get hash until succeeded
                hash = self.schwab.account_numbers()[0].get('hashValue')
                break  # Exit the loop if successful
            except KeyError:
                # Handle the error and retry
                print("Invalid Hash returned.")
        account_info = self.schwab.account_number(hash, "positions")
        total_cash = account_info["securitiesAccount"]["currentBalances"]["totalCash"]
        return total_cash 
    

    def convert_epoch_to_datetime(self, candles):
        """
        Convert epoch timestamps in candle data to human-readable datetime strings.

        Args:
            candles (list): A list of candle data dictionaries.

        Returns:
            None
        """
        for candle in candles:
            epoch = candle["datetime"]
            dt = datetime.fromtimestamp(epoch / 1000.0)
            candle["datetime"] = dt.strftime('%Y-%m-%d %H:%M:%S')


    def is_enough_funds(self):
        return self.balance >= self.contract_price
    

    def calculate_remaining_balance(self):
        self.balance = self.balance - (self.contract_price * self.position_size)

# *****************************************************************************************************************
# ************************************************ SETTERS ********************************************************
# *****************************************************************************************************************
    def set_balance(self, balance):
        """
        Set the account balance.

        Args:
            balance (float): The balance to set.

        Returns:
            None
        """
        self.balance = balance


    def set_day(self, day):
        """
        Set the current trading day.

        Args:
            day (int): The day to set.

        Returns:
            None
        """
        self.day = day


    def set_daily_goal(self, daily_goal):
        """
        
        """
        self.daily_goal = daily_goal


    def set_adjusted_balance(self, adjusted_balance):
        """
        Set the adjusted account balance.

        Args:
            adjusted_balance (float): The adjusted balance to set.

        Returns:
            None
        """
        self.adjusted_balance = adjusted_balance


    def set_position_size(self, size):
        """
        Set the maximum position size.

        Args:
            size (int): The maximum position size to set.

        Returns:
            None
        """
        self.position_size = size


    def set_profit_percentage(self, profit_percentage):
        """
        Set the maximum profit percentage.

        Args:
            profit_percentage (float): The maximum profit percentage to set.

        Returns:
            None
        """
        self.profit_percentage = profit_percentage


    def set_contract_price(self, contract_price):
        """
        Set the maximum contract price.

        Args:
            contract_price (float): The maximum contract price to set.

        Returns:
            None
        """
        self.contract_price = contract_price
    

# ******************************************************************************************************************
# ************************************************ SETTINGS ********************************************************
# ******************************************************************************************************************
    def set_settings(self):
        """
        
        """
        df = self.sheet.read_sheet()
        row = df[df['Date'] == self.now]
        # TODO:// Use the date in the spread sheet

        # This is something I can check to see If I had  Green or red day
        self.set_day(int(row.iloc[0]['Day']))       # Theres an error in production where on the weekends, this causes a server error becasue days are not availabel in the weekend on the spreed sheet
        #     self.set_day(int(row.iloc[0]['Day']))
        #                      ~~~~~~~~^^^
        #   File "/home/ubuntu/Automated_Trading_System/venv/lib/python3.12/site-packages/pandas/core/indexing.py", line 1191, in __getitem__
        #     return self._getitem_axis(maybe_callable, axis=axis)
        #            ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
        #   File "/home/ubuntu/Automated_Trading_System/venv/lib/python3.12/site-packages/pandas/core/indexing.py", line 1752, in _getitem_axis
        #     self._validate_integer(key, axis)
        #   File "/home/ubuntu/Automated_Trading_System/venv/lib/python3.12/site-packages/pandas/core/indexing.py", line 1685, in _validate_integer
        #     raise IndexError("single positional indexer is out-of-bounds")
        # IndexError: single positional indexer is out-of-bounds



        self.set_daily_goal(int(row.iloc[0]['Adj$Gain'][1:]))
        self.set_adjusted_balance(int(row.iloc[0]['Adj$Balance'][1:]))
        self.set_position_size(int(row.iloc[0]['Pos#Open']))
        self.set_profit_percentage(float(row.iloc[0]['Pos%Tgt'][:-1]))
        self.set_contract_price(int(row.iloc[0]['Pos$Size'][1:]))
        self.set_balance(self.total_cash())
    

    def save_settings(self):
        """
        
        """
        # Request the accounts balance and send it to sheet
        sheet_name = 'perf'
        column = 'P'
        row = 10 + self.day()
        
        range = f'{sheet_name}!{column}{row}'
        
        # Use a cuurent balanace from the api
        self.sheet.update_sheet(range, self.total_cash())
