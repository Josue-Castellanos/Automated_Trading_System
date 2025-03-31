import json
import time
import math
import threading
from schwab import Schwab
from sheet import Sheet
from datetime import datetime
from utils  import dates, order_date, fetch_price_data
from strategy.ttm_squeeze import ttm_squeeze_momentum
from stream import Stream, process_data


class Client:
    """
    A class representing a client for automated trading operations.

    This class integrates various components such as Schwab API, signals API,
    and a database manager to perform automated trading operations.
    """
    def __init__(self):
        """
        This method sets up initial settings, starts background threads
        for handling call and put events, checks for open positions, and starts
        pooling emails or data streaming.
        """
        # Client
        self.schwab = Schwab()
        self.sheet = Sheet()
        self.stream = None
        self.hash = None
        
        # Sheet
        self.today, self.tomorrow = dates()
        self.profit_percentage = None             
        self.position_size = None
        self.total_risk = None
        self.contract_price = None
        self.adjusted_balance = None
        self.day = None
        self.account_balance = None

        # Strategy
        self.momentum_call_colors = ['darkblue', 'cyan']
        self.momentum_put_colors = ['purple', 'magenta']

        # Settings
        self.fetch_hash()
        self.set_settings()

        try:
            self.set_stream()
        except Exception:
            def checker():
                while True:
                    self.check_momentum_chain()
                    time.sleep(180)         # 3-minutes
            threading.Thread(target=checker, daemon=True).start()


# ************************************************************************************************************************
# **************************************************** MOMENTUM **********************************************************
# ************************************************************************************************************************
    def check_momentum_chain(self, count=2):
        """
        Checks market momentum based on TTM Squeeze indicator.
        Executes trades based on momentum color signals and position status.
        
        Args:
            count (int): The index offset for fetching the most recent momentum data.
        """
        try:
            print("\nStep 1: FETCH DATA")
            data = self.stream.df if self.stream else fetch_price_data(self.schwab, 'SPY', 'minute', 3, self.today, self.today)

            print("\nStep 2: CHECK MOMENTUM")
            momentum_data = ttm_squeeze_momentum(data)

            # Catch potential IndexError early
            if len(momentum_data) < count:
                print("ERROR: NOT ENOUGH DATA FOR MOMENTUM ANALYSIS!")
                return

            color = momentum_data['color'].iloc[-count]       # RAISE INDEX ERROR
            squeeze = momentum_data['squeeze_on'].iloc[-count]

            # If no active position and market is in a squeeze, wait
            if self.position_type() is None and squeeze:
                print("ERROR: MARKET IN SQUEEZE, WAIT!")
                return

            # Determine trade action based on momentum color
            if color in self.momentum_call_colors:
                trade_type = "CALL"
            elif color in self.momentum_put_colors:
                trade_type = "PUT"
            else:
                print("ERROR: MOMENTUM DOTS DO NOT MATCH!")
                return

            # Handle existing positions
            current_position = self.position_type()
            if current_position == trade_type:
                print("UPDATE: MOVING WITH MOMENTUM, HOLD!")
                return
            elif current_position is not None:
                print("\nStep 3: SELL ACTIVE POSITIONS")
                self.sell_position()

            # Check funds and enter position
            print("\nStep 4: CHECK FOR SUFFICIENT FUNDS")
            if not self.is_enough_funds():
                print("ERROR: INSUFFICIENT FUNDS!")
                return

            print("\nStep 5: SELECT BEST CONTRACT")
            contract = self.best_contract(trade_type)
            if contract is None:
                return

            print("\nStep 6: ENTER POSITION")
            response = self.buy_position(contract, trade_type)
            if response is None:
                return
        except IndexError:
            return


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
        try:
            print(f"SEARCHING FOR BEST {type} CONTRACT...")
            options = self.schwab.get_chains('SPY', type, '10', 'TRUE', '', '', '', 'OTM', self.today, self.today)
            strike_price_df = self.create_option_dataframe(options)
            filtered_ask_result = strike_price_df.loc[strike_price_df['Ask'] <= self.contract_price]

            if type == 'PUT':
                filtered_ask_result = filtered_ask_result[::-1]

            # RAISE EXCEPTION: If dataframe is empty
            contract = filtered_ask_result.iloc[0]
            print("BEST CONTRACT FOUND!")

            return contract
        except IndexError:
            print("NO SUITABLE CONTRACT FOUND.")
            return None
    

    def buy_position(self, contract, type):
        """
        Execute a buy order for the given contract.

        Args:
            order (dict): The order details for buying the contract.
            type (str): The type of the contract ('PUT' or 'CALL').

        Returns:
            None
        """
        try:
            print("CREATING BUY ORDER...")
            buy_order = self.create_order(contract.get('Ask'), contract.get('Symbol'), 'BUY')
            print("BUY ORDER CREATED.")

            print("POSTING BUY ORDER...")
            self.schwab.post_orders(buy_order, accountNumber=self.hash).json()
        except json.decoder.JSONDecodeError:
            print("BUY ORDER POSTED, AWAIT CONFIRMATION...")
        finally:
            max_attempts = 0
            while max_attempts < 4:
                time.sleep(8)
                if self.position_type() is None:
                    print(f"BUY ORDER REPLACEMENT: {max_attempts + 1}.")
                    self.replace_position(order_type=type)
                else:
                    print("CONTRACT BOUGHT!")
                    self.calculate_remaining_balance()
                    return "BOUGHT"
                max_attempts += 1

            print("CONTRACT CANNOT BE BOUGHT, TOO MUCH VOLATILITY!")
            self.delete_pending_position()
            print("BUY ORDER CANCELLED.")

            return None


    def sell_position(self):
        """
        Sell the current open position.

        This method attempts to sell the currently open position based on
        the current market value and the initial purchase price.

        Returns:
            None
        """
        try:
            open_position = self.schwab.account_number(self.hash, "positions")

            # RASIE KEY EXCEPTION: If there are no open positions, exit.
            print("SEARCHING FOR ACTIVE CONTRACTS...")
            market_value = open_position["securitiesAccount"]["positions"][0]["marketValue"] / 100
            symbol = open_position["securitiesAccount"]["positions"][0]["instrument"]["symbol"] 
            print("ACTIVE CONTRACT FOUND!")

            print("CREATING SELL ORDER...")
            sell_order = self.create_order(round(market_value, 2), symbol, 'SELL')
            print("SELL ORDER CREATED.")

            print("POSTING SELL ORDER...")
            self.schwab.post_orders(sell_order, accountNumber=self.hash).json()
        except json.decoder.JSONDecodeError:
            print("SELL ORDER POSTED, PENDING ACTIVATION...")
        except KeyError:
            print("NO ACTIVE CONTRACTS FOUND TO SELL.")
            return 
        max_attempts = 0
        while True:
            time.sleep(15)
            if self.position_type() is None:
                print("CONTRACT SOLD!")
                break
            else:
                print(f"ERROR: ORDER REPLACEMENT: {max_attempts + 1}.")
                self.replace_position(order_status='SELL')
            max_attempts += 1
        

    def replace_position(self, order_type=None, order_status=None):
        """
        
        """
        try:
            if order_status == 'SELL':
                print("SEARCHING FOR PENDING ACTIVATION ORDERS...")
                account_orders = self.schwab.account_orders(maxResults=1, fromEnteredTime=order_date(), toEnteredTime=self.tomorrow, accountNumber=self.hash, status="WORKING")
                order = account_orders[0]    # RAISE INDEX EXCEPTION
                print("PENDING ACTIVATION ORDER FOUND!")

                print("EXTRACTING ID FROM PENDING ORDER...")
                orderId = order.get('orderId')  

                print("NOW SEARCHING FOR ACTIVE CONTRACTS...")
                open_positions = self.schwab.account_number(self.hash, "positions")
                active_contract = open_positions["securitiesAccount"]["positions"][0]         # RASIE KEY EXCEPTION -> ["positions"]
                print("ACTIVE CONTRACT FOUND!")

                print("EXTRACTING MARKET VALUE...")
                market_value = active_contract["marketValue"] / 100          

                symbol = active_contract["instrument"]["symbol"]
                print("CREATING A NEW SELL ORDER...")
                order_replacement = self.create_order(round(market_value, 2), symbol, 'SELL')

            else:
                print("SEARCHING FOR PENDING ACTIVATION ORDERS...")
                account_orders = self.schwab.account_orders(maxResults=5, fromEnteredTime=order_date(), toEnteredTime=self.tomorrow, accountNumber=self.hash, status="PENDING_ACTIVATION")
                # RAISE INDEX EXCEPTION: The pending order was executed If the list is empty
                orderId = account_orders[0].get('orderId')
                print("PENDING ACTIVATION ORDER FOUND!")

                order_replacement = self.best_contract(order_type)

                if order_replacement is None:
                    return
            print("POSTING REPLACEMNT ORDER...")  
            self.schwab.order_replace(accountNumber=self.hash, orderId=orderId, order=order_replacement)     # RASIE TYPE EXCEPTION
        except json.decoder.JSONDecodeError:
            print("REPLACEMENT ORDER POSTED, PENDING ACTIVATION...")
        except IndexError:
            print("PENDING ACTIVATION ORDER IS ACTIVE, CANCEL REPLACMENT.")
            return
        except KeyError:
            print("NO ACTIVE CONTRACT FOUND!")
            return
        except TypeError as e:
            print(f"REPLACEMENT ORDER CANCELED: {e}")
            return


    def delete_pending_position(self):
        """
        
        """
        try:
            account_orders = self.schwab.account_orders(maxResults=5, fromEnteredTime=order_date(), toEnteredTime=self.tomorrow, accountNumber=self.hash, status="PENDING_ACTIVATION")
            
            # RAISE INDEX EXCEPTION: The pending order was executed If the list is empty
            orderId = account_orders[0].get('orderId')
            self.schwab.delete_order_id(orderId, self.hash)
        except json.decoder.JSONDecodeError:
            print("PENDING ORDER DELETED.")
        except IndexError:
            print("PENDING ORDER WAS ACCEPTED, CANCEL DELETE.")
            return
        

# *******************************************************************************************************************
# ************************************************ UTILITIES ********************************************************
# *******************************************************************************************************************
    def fetch_hash(self):
        """
        
        """
        while True:
            try:
                self.hash = self.schwab.account_numbers()[0].get('hashValue')
                break
            except Exception:
                print("Invalid Hash returned, needs new token")


    def position_type(self):
        """
        Determine the type of the current open position.

        Returns:
            str or None: The type of the current position ('CALL' or 'PUT'), or None if no position is open.
        """

        try:
            order = self.schwab.account_number(self.hash, "positions")

            # RASIE EXCEPTION: If there are no open positions
            symbol = order["securitiesAccount"]["positions"][0]["instrument"]["symbol"]

            type = symbol[12:13]
            if type == 'C':
                return 'CALL'
            elif type == 'P':
                return 'PUT'
        except KeyError:
            return None
           

    def get_total_cash(self):
        """
        Retrieve the total cash balance of the account.

        Returns:
            float: The total cash balance in the account.
        """

        account_info = self.schwab.account_number(self.hash, "positions")
        total_cash = account_info["securitiesAccount"]["currentBalances"]["totalCash"]
        
        return total_cash 


    def is_enough_funds(self):
        """
        
        """
        return self.account_balance >= self.contract_price
    

    def calculate_remaining_balance(self):
        """
        
        """
        self.account_balance = self.account_balance - (self.contract_price * self.position_size)


# *****************************************************************************************************************
# ************************************************ SETTERS ********************************************************
# *****************************************************************************************************************
    def set_account_balance(self, balance):
        """
        Set the account balance.

        Args:
            balance (float): The balance to set.

        Returns:
            None
        """
        self.account_balance = balance
        print(f"Account Balance: ${self.account_balance}")


    def set_day(self, day):
        """
        Set the current trading day.

        Args:
            day (int): The day to set.

        Returns:
            None
        """
        self.day = day
        print(f"Day: {self.day}")


    def set_daily_goal(self, daily_goal):
        """
        
        """
        self.daily_goal = daily_goal
        print(f"Goal Per Trade: ${self.daily_goal}")


    def set_total_risk(self, total_risk):
        """
        
        """
        self.total_risk = total_risk
        print(f"Risk Per Trade: ${self.total_risk}")


    def set_adjusted_balance(self, adjusted_balance):
        """
        Set the adjusted account balance.

        Args:
            adjusted_balance (float): The adjusted balance to set.

        Returns:
            None
        """
        self.adjusted_balance = adjusted_balance
        print(f"Account Goal By EOD: ${self.adjusted_balance}")


    def set_position_size(self, size):
        """
        Set the maximum position size.

        Args:
            size (int): The maximum position size to set.

        Returns:
            None
        """
        position_size = math.ceil(self.total_risk / 50)
        self.position_size = position_size
        self.position_size = 1
        print(f"Quantity: {self.position_size}")


    def set_profit_percentage(self, profit_percentage):
        """
        Set the maximum profit percentage.

        Args:
            profit_percentage (float): The maximum profit percentage to set.

        Returns:
            None
        """
        self.profit_percentage = profit_percentage
        print(f"Goal Per Trade: {self.profit_percentage}%")


    def set_contract_price(self, price):
        """
        Set the maximum contract price.

        Args:
            contract_price (float): The maximum contract price to set.

        Returns:
            None
        """
        contract_price = 55.0
        self.contract_price = contract_price / 100
        print(f"Price: ${int(contract_price)}")
    

    def set_stream(self):
        """
        
        """
        streamer_info = self.schwab.preferences().get('streamerInfo', None)[0] 
        df = fetch_price_data(self.schwab, 'SPY', 'minute', 3, self.today, self.today)
        self.stream = Stream(streamer_info, self.check_momentum_chain)         
        self.stream.set_dataframe(df)

        # Start stream with new data processing function
        async def data_in_df(data, *args):
            await process_data(data, self.stream)

        self.stream.start(data_in_df)
        self.stream = None


# ******************************************************************************************************************
# ************************************************ SETTINGS ********************************************************
# ******************************************************************************************************************
    def set_settings(self):
        """
        
        """
        df = self.sheet.read_sheet()
        row = df[df['Date'] == datetime.now().strftime("%-m/%-d/%Y")]

        # The Row # in excel sheet
        self.set_day(int(row.iloc[0]['Day']))

        # The Current Account Balance
        self.set_account_balance(self.get_total_cash())

        # The Daily account balance goal by eod
        self.set_adjusted_balance(int(row.iloc[0]['Adj$Balance'][1:]))

        # The Daily profit goal per trade
        self.set_daily_goal(int(row.iloc[0]['Adj$Gain'][1:]))

        # The Daily percentage goal per trade
        self.set_profit_percentage(float(row.iloc[0]['Pos%Tgt'][:-1]))

        # The Daily total risk $ per trade
        self.set_total_risk(int(row.iloc[0]['Tot$Risk'][1:]))

        # The Contract Price
        self.set_contract_price(float(row.iloc[0]['Pos$Size'][1:]))

        # The Number of Contracts Per Trade
        self.set_position_size(int(row.iloc[0]['Pos#Open']))


    def save_settings(self):
        """
        
        """
        # Request the accounts balance and send it to sheet
        sheet_name = 'perf'
        column = 'P'
        row = 10 + self.day
        
        range = f'{sheet_name}!{column}{row}'
        
        # Use a cuurent balanace from the api
        self.sheet.update_sheet(range, self.get_total_cash())
