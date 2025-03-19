import json
import threading
import time
import pandas as pd
from schwab import Schwab
from sheet import Sheet
from datetime import datetime
from utils  import dates, order_date, timedelta
from strategy.ttm_squeeze import ttm_squeeze_momentum
from signals import Signals
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
        self.signals = Signals()
        self.schwab = Schwab()
        self.sheet = Sheet()
        self.stream = None

        self.today, self.tomorrow = dates()
        self.now = datetime.now().strftime("%-m/%-d/%Y")
        self.loss_percentage = float(-50.00)              
        self.goal_percentage = float(100.00)
        self.position_size = None
        self.profit_percentage = None
        self.contract_price = None
        self.adjusted_balance = None
        self.day = None
        self.balance = None
        self.momentum_call_colors = ['darkblue', 'cyan']
        self.momentum_put_colors = ['purple', 'magenta']

        self.hash = None

        self.fetch_hash()
        self.set_settings()

        threading.Thread(target=self.handleCallEvent, daemon=True).start()
        threading.Thread(target=self.handlePutEvent, daemon=True).start()

        self.check_position(self.position_type())

        # self.set_stream()
        self.signals.idle_monitor()


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
            self.signals.get_put_event().wait()

            print("Step 1: CHECK MOMENTUM")
            # Here we will use the Momentum chain, checking funds, and current position.
            if self.check_momentum_chain() in self.momentum_put_colors:
                print("Step 2: SELL ANY ACTIVE POSITIONS")
                self.sell_position()
                print("Step 3: CHECK FOR SUFFICIENT FUNDS")
                if self.is_enough_funds():
                    print("Step 4: SELECT BEST CONTRACT")
                    put_contract = self.best_contract('PUT')
                    if put_contract is None:
                        pass
                    else:
                        print("Step 5: ENTER POSITION")
                        response = self.buy_position(put_contract, 'PUT')
                        if response is None:
                            pass
                        else:
                            print("Step 6: CHECK POSITION")
                            self.check_position('PUT')
                else:
                    print("ERROR: INSUFFICIENT FUNDS!")
                    pass
            else:
                print("ERROR: MOMENTUM DOES NOT MATCH WITH ALERT!")
                pass
            print("Step 7: RESET CURRENT POSITION AND CLEAR EVENT")
            self.signals.reset_position()
            self.signals.get_put_event().clear()


    def handleCallEvent(self):
        """
        Handle call option events in a continuous loop.

        This method waits for call events, sells existing positions if necessary,
        finds the best call contract, and buys a new position if a suitable contract is found.

        Returns:
            None
        """
        while True:
            self.signals.get_call_event().wait()

            print("Step 1: CHECK MOMENTUM")
            # Here we will use the Momentum chain, checking funds, and current position.
            if self.check_momentum_chain() in self.momentum_call_colors:
                print("\nStep 2: SELL ANY ACTIVE POSITIONS")
                self.sell_position()
                print("\nStep 3: CHECK FOR SUFFICIENT FUNDS")
                if self.is_enough_funds():
                    print("\nStep 4: SELECT BEST CONTRACT")
                    call_contract = self.best_contract('CALL')
                    if call_contract is None:
                        pass
                    else:
                        print("\nStep 5: ENTER POSITION")
                        response = self.buy_position(call_contract, 'CALL')
                        if response is None:
                            pass
                        else:
                            print("\nStep 6: CHECK POSITION")
                            self.check_position('CALL')
                else:
                    print("ERROR: INSUFFICIENT FUNDS!")
                    pass
            else:
                print("ERROR: MOMENTUM DOES NOT MATCH WITH ALERT!!")
                pass
            print("\nStep 7: RESET CURRENT POSITION AND CLEAR EVENT")
            self.signals.reset_position()
            self.signals.get_call_event().clear()


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
                self.replace_position(status='SELL')
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
                active_contract = open_positions["securitiesAccount"]["positions"][0]         # RASIE KEY EXCEPTION - ["positions"]
                print("ACTIVE CONTRACT FOUND!")

                print("EXTRACTING MARKET VALUE...")
                market_value = active_contract["marketValue"] / 100          

                symbol = active_contract["instrument"]["symbol"]
                print("CREATING A NEW SELL ORDER...")
                order_replacement = self.create_order(round(market_value, 2), symbol, 'SELL')

            else:
                # There might be an issue here where it would require a different status to retrieve a pending sell order.
                print("SEARCHING FOR PENDING ACTIVATION ORDERS...")
                account_orders = self.schwab.account_orders(maxResults=5, fromEnteredTime=order_date(), toEnteredTime=self.tomorrow, accountNumber=self.hash, status="PENDING_ACTIVATION")
                # RAISE INDEX EXCEPTION: The pending order was executed If the list is empty
                orderId = account_orders[0].get('orderId')
                print("PENDING ACTIVATION ORDER FOUND!")

                order_replacement = self.best_contract(order_type)

                if order_replacement is None:
                    return
            print("POSTING REPLACEMNT ORDER...")  
            self.schwab.order_replace(self, accountNumber=self.hash, orderId=orderId, order=order_replacement)
        except json.decoder.JSONDecodeError:
            print("REPLACEMENT ORDER POSTED, PENDING ACTIVATION...")
        except IndexError:
            print("PENDING ACTIVATION ORDER IS ACTIVE, CANCEL REPLACMENT.")
            return
        except KeyError:
            print("NO ACTIVE CONTRACT FOUND!")
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
        
        try:                
            while True:
                time.sleep(2)                 
                open_position = self.schwab.account_number(self.hash, "positions")

                # RASIE EXCEPTION: If list is empty
                profit_loss_percentage = float(open_position["securitiesAccount"]["positions"][0]["currentDayProfitLossPercentage"])
                profit_loss_value = int(open_position["securitiesAccount"]["positions"][0]["currentDayProfitLoss"])
                
                print("UPDATE:")
                print(f"Contracts Percentage: {profit_loss_percentage}%")
                print(f"Contracts Profit/Loss: ${profit_loss_value}\n")

                # STOP LOSS
                if profit_loss_percentage <= self.loss_percentage:
                    print("STOPLOSS TRIGGERED: SELL!")
                    self.sell_position()
                    break
                
                elif profit_loss_value >= self.daily_goal:
                    if type == 'CALL':
                        if self.check_momentum_chain(count=2) in self.momentum_call_colors:
                            print("MOVING WITH MOMENTUM: HOLD!")
                            continue
                        else: 
                            print("LOSING MOMENTUM: SELL!")
                            self.sell_position()
                            break
                    elif type == 'PUT':
                        if self.check_momentum_chain(count=2) in self.momentum_put_colors:
                            print("MOVING WITH MOMENTUM: HOLD!")
                            continue
                        else:
                            print("LOSING MOMENTUM: SELL!")
                            self.sell_position()
                            break
                    else:
                        pass
                else: 
                    pass
        except KeyError:
            print("CONTRACT WAS SOLD BY USER ON TOS")
            return


    def check_momentum_chain(self, count=1):
        """
        
        """
        data = self.fetch_price_data()
        data = ttm_squeeze_momentum(data)
        color = data['color'].iloc[-count]

        return color
    

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


    def create_option_dataframe(self, options):
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


    def create_candle_dataframe(self, candles):
        """
        Convert API response to a DataFrame.
        """
        data = [
            {
                'Datetime': self.convert_epoch_to_datetime(ohlcv['datetime']),
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


    def fetch_price_data(self):
        """
        Fetch price history from Schwab API.
        """
        response = self.schwab.price_history('SPY', 'day', 1, 'minute', 5, self.today, self.today, True, True)
        df = self.create_candle_dataframe(response.json()) if response.ok else None
        # df.to_csv("/Users/josuecastellanos/Documents/Automated_Trading_System/market.csv", mode='w', index=True)
        return df
    

    def convert_epoch_to_datetime(self, epoch_ms):
        """
        Convert milliseconds epoch time to a datetime object adjusted for timezone.
        """
        datetime_parsed = pd.to_datetime(epoch_ms, unit='ms')
        datetime_adjusted = datetime_parsed - timedelta(hours=7)  # Adjust for PST
        return datetime_adjusted.strftime('%H:%M')


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
           

    def total_cash(self):
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
        return self.balance >= self.contract_price
    

    def calculate_remaining_balance(self):
        """
        
        """
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
        self.contract_price = contract_price / 100
    

    def set_stream(self):
        """
        
        """
        streamer_info = self.schwab.preferences().get('streamerInfo', None)[0] 
        df = self.fetch_price_data()
        self.stream = Stream(streamer_info)          
        self.stream.set_dataframe(df)

        # Start stream with new data processing function
        async def data_in_df(data, *args):
            await process_data(data, self.stream)

        self.stream.start(data_in_df)
# ******************************************************************************************************************
# ************************************************ SETTINGS ********************************************************
# ******************************************************************************************************************
    def set_settings(self):
        """
        
        """
        df = self.sheet.read_sheet()
        row = df[df['Date'] == self.now]

        # The Row # in excel sheet
        self.set_day(int(row.iloc[0]['Day']))

        # The Daily trade goal per trade
        self.set_daily_goal(int(row.iloc[0]['Adj$Gain'][1:]))

        # The Daily account goal by eod
        self.set_adjusted_balance(int(row.iloc[0]['Adj$Balance'][1:]))

        # The Number of Contracts Per Trade
        # self.set_position_size(int(row.iloc[0]['Pos#Open']))
        self.set_position_size(int(1))              # TEMPORARY

        # The Total monye value of my risk above
        # self.set_total_risk(int(row.iloc[0]['Tot$Risk']))

        # The Percentage Goal For Each Trade
        self.set_profit_percentage(float(row.iloc[0]['Pos%Tgt'][:-1]))

        # The Contract Price
        # self.set_contract_price(float(row.iloc[0]['Pos$Size'][1:]))
        self.set_contract_price(float(60.0))        # TEMPORARY

        # The Current Account Balance
        self.set_balance(self.total_cash())
    

    def save_settings(self):
        """
        
        """
        # Request the accounts balance and send it to sheet
        sheet_name = 'perf'
        column = 'P'
        row = 10 + self.day
        
        range = f'{sheet_name}!{column}{row}'
        
        # Use a cuurent balanace from the api
        self.sheet.update_sheet(range, self.total_cash())
