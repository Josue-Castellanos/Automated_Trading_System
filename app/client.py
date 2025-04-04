import json
import threading
import time
import math
from schwab import Schwab
from sheet import Sheet
from datetime import datetime
from utils  import dates, order_date, create_order, create_option_dataframe, fetch_price_data
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
        self.hash = None
        
        self.today, self.tomorrow = dates()
        self.now = datetime.now().strftime("%-m/%-d/%Y")
        self.loss_percentage = float(-50.00)
        self.profit_percentage = None             
        self.position_size = None
        self.total_risk = None
        self.contract_price = None
        self.adjusted_balance = None
        self.day = None
        self.account_balance = None
        self.momentum_call_colors = ['darkblue', 'cyan']
        self.momentum_put_colors = ['purple', 'magenta']

        self.get_hash()
        self.set_settings()

        threading.Thread(target=self.handleCallEvent, daemon=True).start()
        threading.Thread(target=self.handlePutEvent, daemon=True).start()

        self.check_position(self.get_position_type())

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

            print("\nStep 1: CHECK SQUEEZE")
            momentum, squeeze = self.check_momentum_chain()

            if squeeze:
                print("MARKET IN SQUEEZE!")
                pass
            else:
                # Here we will use the Momentum chain, checking funds, and current position.
                print("\nStep 2: CHECK MOMENTUM")
                if momentum in self.momentum_put_colors:
                    print("\nStep 3: SELL ANY ACTIVE POSITIONS")
                    self.sell_position()
                    print("\nStep 4: CHECK FOR SUFFICIENT FUNDS")
                    if self.account_balance >= self.contract_price:
                        print("\nStep 5: SELECT BEST CONTRACT")
                        put_contract = self.best_contract('PUT')
                        if put_contract is None:
                            pass
                        else:
                            print("\nStep 6: ENTER POSITION")
                            response = self.buy_position(put_contract, 'PUT')
                            if response is None:
                                pass
                            else:
                                print("\nStep 7: CHECK POSITION")
                                self.check_position('PUT')
                    else:
                        print("ERROR: INSUFFICIENT FUNDS!")
                        pass
                else:
                    print("ERROR: MOMENTUM DOES NOT MATCH WITH ALERT!")
                    pass
            print("\nStep 8: RESET CURRENT POSITION AND CLEAR EVENT\n")
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

            print("\nStep 1: CHECK SQUEEZE")
            momentum, squeeze = self.check_momentum_chain()

            if squeeze:
                print("MARKET IN SQUEEZE!")
                pass
            else:
                # Here we will use the Momentum chain, checking funds, and current position.
                print("\nStep 2: CHECK MOMENTUM")
                if momentum in self.momentum_call_colors:
                    print("\nStep 3: SELL ANY ACTIVE POSITIONS")
                    self.sell_position()
                    print("\nStep 4: CHECK FOR SUFFICIENT FUNDS")
                    if self.account_balance >= self.contract_price:
                        print("\nStep 5: SELECT BEST CONTRACT")
                        call_contract = self.best_contract('CALL')
                        if call_contract is None:
                            pass
                        else:
                            print("\nStep 6: ENTER POSITION")
                            response = self.buy_position(call_contract, 'CALL')
                            if response is None:
                                pass
                            else:
                                print("\nStep 7: CHECK POSITION")
                                self.check_position('CALL')
                    else:
                        print("ERROR: INSUFFICIENT FUNDS!")
                        pass
                else:
                    print("ERROR: MOMENTUM DOES NOT MATCH WITH ALERT!!")
                    pass
            print("\nStep 8: RESET CURRENT POSITION AND CLEAR EVENT")
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
            strike_price_df = create_option_dataframe(options)
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
            buy_order = create_order(contract.get('Ask'), contract.get('Symbol'), 'BUY', self.position_size)
            print("BUY ORDER CREATED.")

            print("POSTING BUY ORDER...")
            self.schwab.post_orders(buy_order, accountNumber=self.hash).json()
        except json.decoder.JSONDecodeError:
            print("BUY ORDER POSTED, AWAIT CONFIRMATION...")
        finally:
            max_attempts = 0
            while max_attempts < 4:
                time.sleep(8)
                if self.get_position_type() is None:
                    print(f"BUY ORDER REPLACEMENT: {max_attempts + 1}.")
                    self.replace_position(order_type=type)
                else:
                    print("CONTRACT BOUGHT!")
                    self.account_balance = self.account_balance - (self.contract_price * self.position_size)
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
            sell_order = create_order(round(market_value, 2), symbol, 'SELL', self.position_size)
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
            if self.get_position_type() is None:
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
                order_replacement = create_order(round(market_value, 2), symbol, 'SELL', self.position_size)

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

                # RASIE KEY EXCEPTION: If list is empty
                active_positions = open_position["securitiesAccount"]["positions"]
                profit_loss_percentage = float(active_positions[0]["currentDayProfitLossPercentage"])
                profit_loss_value = int(active_positions[0]["currentDayProfitLoss"])
                
                print("UPDATE:")
                print(f"Contracts Percentage: {profit_loss_percentage}%")
                print(f"Contracts Profit/Loss: ${profit_loss_value}\n")

                # STOP LOSS
                if profit_loss_percentage <= self.loss_percentage:
                    print("STOPLOSS TRIGGERED: SELL!")
                    self.sell_position()
                    continue
                
                elif profit_loss_value >= self.daily_goal:
                    if type == 'CALL':
                        if self.check_momentum_chain() in self.momentum_call_colors:
                            print("MOVING WITH MOMENTUM: HOLD!")
                            continue
                        else: 
                            print("LOSING MOMENTUM: SELL!")
                            self.sell_position()
                            continue
                    elif type == 'PUT':
                        if self.check_momentum_chain() in self.momentum_put_colors:
                            print("MOVING WITH MOMENTUM: HOLD!")
                            continue
                        else:
                            print("LOSING MOMENTUM: SELL!")
                            self.sell_position()
                            continue
                    else:
                        pass
                else: 
                    pass
        except KeyError:
            print("CONTRACT WAS SOLD!")
            return


    def check_momentum_chain(self, count=1):
        """
        
        """
        data = fetch_price_data(self.schwab, 'SPY', 'minute', 3, self.today, self.today)
        momentum_data = ttm_squeeze_momentum(data)
        color = momentum_data['color'].iloc[-count]
        squeeze = momentum_data['squeeze_on'].iloc[-count]
        return color, squeeze


# *******************************************************************************************************************
# ************************************************** GETTERS ********************************************************
# *******************************************************************************************************************
    def get_hash(self):
        """
        
        """
        while True:
            try:
                self.hash = self.schwab.account_numbers()[0].get('hashValue')
                break
            except Exception:
                print("Invalid Hash returned, needs new token")


    def get_position_type(self):
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
        df = self.fetch_price_data()
        self.stream = Stream(streamer_info)          
        self.stream.set_dataframe(df)

        # Start stream with new data processing function
        async def data_in_df(data, *args):
            await process_data(data, self.stream)

        self.stream.start(data_in_df)


    def set_settings(self):
        """
        
        """
        df = self.sheet.read_sheet()
        row = df[df['Date'] == self.now]

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


# ******************************************************************************************************************
# ************************************************ SETTINGS ********************************************************
# ******************************************************************************************************************
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
