import json
import math
import threading
import time

# import numpy as np

from backend.apps.candles.schwab import Schwab
from backend.apps.candles.stream import Stream, process_data
from backend.apps.performance.sheet import Sheet
# from backend.apps.trading.strategy.ttm_squeeze import ttm_squeeze_momentum
from backend.apps.trading.utils import (create_option_dataframe, create_order,
                                        dates, datetime, fetch_price_data,
                                        filter_options, market_is_open,
                                        order_date, timedelta)


class Client:
    """
    A class representing a client for automated trading operations.

    This class integrates various components such as Schwab API, signals API,
    and a database manager to perform automated trading operations.
    """

    def __init__(self, freq):
        """
        This method sets up initial settings, starts background threads
        for handling call and put events, checks for open positions, and starts
        pooling emails or data streaming.
        """
        # Client
        self.schwab = Schwab()
        self.sheet = Sheet()
        self.stream = None
        self.thread = None

        # Sheet
        self.today, self.tomorrow = dates()
        self.prev_date = (
            (datetime.now() - timedelta(days=3)).strftime("%Y-%m-%d")
            if freq >= 10
            else self.today
        )
        self.profit_percentage = None
        self.position_size = None
        self.total_risk = None
        self.contract_price = None
        self.adjusted_balance = None
        self.day = None
        self.account_balance = None

        # Schwab
        self.hash = self.get_hash()

        # Strategy
        self.momentum_call_colors = [
            "darkblue",
            "cyan",
            "darkcyan",
            "deepskyblue",
            "paleturquoise",
            "lightcyan",
        ]
        self.momentum_put_colors = [
            "purple",
            "magenta",
            "darkmagenta",
            "mediumvioletred",
            "hotpink",
            "plum",
        ]
        # <- SUPER IMPORTNAT!! FREQUENCY OF THE SYSTEM IN MINUTES ->
        self.freq = freq
        # self.obos_counter = 0

        # Settings
        self.set_settings()

        # Stream
        self._check_momentum_chain_automatic()

    # ******************************************************************
    # ******** MOMENTUM *********************************************
    # ******************************************************************
    def check_stochastic_trading_signals(self, backtrack=3):
        """
        Executes trades based on our confirmed stochastic patterns:
        1. Extreme Capitulation Reversal (Long)
        2. Bearish Breakdown (Short)
        3. Overbought Reversal (Sell Longs)

        Args:
            backtrack (int):
            Number of previous candles to analyze for pattern confirmation
        """
        try:
            print("\nStep 1: FETCH MARKET DATA")
            data = (self.stream.df if self.stream else fetch_price_data(
                self.schwab,
                "SPY",
                "day",
                1,
                "minute",
                self.freq,
                self.prev_date,
                self.today,
                )
            )

            # momentum_data = ttm_squeeze_momentum(data, self.freq)

            # Ensure we have stochastic data columns
            if (
                "stoch_d" not in data.columns
                or "stoch_strength" not in data.columns
            ):
                print("ERROR: Missing required stochastic data columns")
                return

            # Get the most recent data points
            recent_data = data.iloc[-backtrack - 1:]
            current_position = self.get_position_type()

            print("\nStep 2: ANALYZE STOCHASTIC PATTERNS")
            # Current values
            current_stoch_d = recent_data["stoch_d"].iloc[-1]
            current_stoch_str = recent_data["stoch_strength"].iloc[-1]
            current_price = recent_data["Close"].iloc[-1]

            # Previous values for pattern confirmation
            prev_stoch_d = recent_data["stoch_d"].iloc[-2]
            prev_stoch_str = recent_data["stoch_strength"].iloc[-2]

            print(f"CURRENT POSITION: {current_position}")
            print(f"PRICE: {current_price}")
            print(f"STOCH_D: {current_stoch_d} (Prev: {prev_stoch_d})")
            print(
                f"STOCH_STRENGTH: {current_stoch_str}"
                f" (Prev: {prev_stoch_str})"
            )

            # Pattern 1: Extreme Capitulation Reversal (Long)
            capitulation = (
                prev_stoch_str <= -2500
                and prev_stoch_d < 20
                and current_stoch_str > (prev_stoch_str + 1000)
                and current_stoch_d > 5
            )

            # Pattern 2: Bearish Breakdown (Short)
            bearish = (
                prev_stoch_d > 50
                and current_stoch_d < 20
                and current_stoch_str <= -2000
            )

            # Pattern 3: Overbought Reversal (Sell Longs)
            overbought = (
                prev_stoch_d > 80
                and prev_stoch_str > 2000
                and current_stoch_str < (prev_stoch_str * 0.7)
            )  # 30%+ drop

            print("\nStep 3: CHECK FOR TRADE SIGNALS")
            # Handle existing positions first
            if current_position == "CALL" and overbought:
                print("SIGNAL: OVERBOUGHT REVERSAL - SELL LONG POSITION")
                self.sell_position()
                return

            if current_position == "PUT" and capitulation:
                print(
                    "SIGNAL: CAPITULATION REVERSAL - COVER SHORT POSITION"
                    )
                self.sell_position()
                return

            # Only enter new trades if no existing position
            if current_position is None:
                if capitulation:
                    print(
                        "SIGNAL: EXTREME CAPITULATION REVERSAL - ENTER LONG"
                    )
                    trade_type = "CALL"
                elif bearish:
                    print("SIGNAL: BEARISH BREAKDOWN - ENTER SHORT")
                    trade_type = "PUT"
                else:
                    print("NO VALID TRADE SIGNALS DETECTED")
                    return

                # Check funds before entering
                print("\nStep 4: CHECK FUNDS")
                if not self.account_balance >= 25.00:
                    print("INSUFFICIENT FUNDS!")
                    return

                print("\nStep 5: SELECT CONTRACT")
                contract = self.best_contract(trade_type)
                if contract is None:
                    return

                print("\nStep 6: ENTER POSITION")
                self.buy_position(contract, trade_type)

        except Exception as e:
            print(f"ERROR IN TRADING LOGIC: {str(e)}")
            return

    # ******************************************************************
    # ********************* TRADING SYSTEM *****************************
    # ******************************************************************
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
            options = self.schwab.get_chains(
                "SPY", type, "70", "TRUE", "", "", "", "OTM", self.today, self.today
            )

            options_df = create_option_dataframe(options)
            strike_price_df = filter_options(options_df, type)

            # Get the Underlying Price
            # stock_price = options["underlyingPrice"]

            # Get the ATM Price
            atm_price = strike_price_df.iloc[0]["Ask"]
            # Get the ATM Implied Volatility
            # atm_iv = strike_price_df.iloc[0]["IV"] / 100
            # Get the Days To Expire
            # atm_dte = strike_price_df.iloc[0]["DTE"]

            # Calculate ROI for each OTM strike
            strike_price_df["ROI"] = (
                (atm_price / strike_price_df["Ask"]) - 1
            ) * 100  # ((ATM STRIKE PRICE / OTM STRIKE PRICE) - 1) * 100

            # Expected Move Calculation
            # expected_move = stock_price * atm_iv * np.sqrt(atm_dte / 365)
            # expected_move_round = round(expected_move)

            # Good Contract ranges
            # exp_contracts = strike_price_df.iloc[: expected_move_round + 1][::-1]
            roi_contracts = strike_price_df.loc[
                (strike_price_df["ROI"] <= 6000) & (strike_price_df["Ask"] >= 0.25)
            ][::-1]
            # ask_contracts = strike_price_df.loc[strike_price_df["Ask"] <= self.contract_price]

            # RAISE EXCEPTION: If dataframe is empty
            contract = roi_contracts.iloc[0]
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
            buy_order = create_order(
                contract.get("Ask"), contract.get("Symbol"), "BUY", self.position_size
            )
            print("BUY ORDER CREATED.")

            print("POSTING BUY ORDER...")
            self.schwab.post_orders(buy_order, accountNumber=self.hash).json()
        except json.decoder.JSONDecodeError:
            print("BUY ORDER POSTED, AWAIT CONFIRMATION...")
        finally:
            max_attempts = 0
            while max_attempts < 4:
                time.sleep(5)
                if self.get_position_type() is None:
                    print(f"BUY ORDER REPLACEMENT: {max_attempts + 1}.")
                    self.replace_position(order_type=type)
                else:
                    print("CONTRACT BOUGHT!")
                    self.account_balance -= (25) * self.position_size
                    return
                max_attempts += 1

            print("CONTRACT CANNOT BE BOUGHT, TOO MUCH VOLATILITY!")
            self.delete_pending_position()

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
            market_value = (
                open_position["securitiesAccount"]["positions"][0]["marketValue"] / 100
            )
            symbol = open_position["securitiesAccount"]["positions"][0]["instrument"][
                "symbol"
            ]
            print("ACTIVE CONTRACT FOUND!")

            print("CREATING SELL ORDER...")
            sell_order = create_order(
                round(market_value, 2), symbol, "SELL", self.position_size
            )
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
            time.sleep(5)
            if self.get_position_type() is None:
                print("CONTRACT SOLD!")
                self.obos_counter = 0
                break
            else:
                print(f"ERROR: ORDER REPLACEMENT: {max_attempts + 1}.")
                self.replace_position(order_status="SELL")
            max_attempts += 1

    def replace_position(self, order_type=None, order_status=None):
        """ """
        try:
            print("SEARCHING FOR PENDING ACTIVATION ORDERS...")
            account_orders = self.schwab.account_orders(
                maxResults=1,
                fromEnteredTime=order_date(),
                toEnteredTime=self.tomorrow,
                accountNumber=self.hash,
                status="WORKING",
            )
            order = account_orders[0]  # RAISE INDEX EXCEPTION
            print("PENDING ACTIVATION ORDER FOUND!")

            print("EXTRACTING ID FROM PENDING ORDER...")
            orderId = order.get("orderId")

            if order_status == "SELL":
                print("NOW SEARCHING FOR ACTIVE CONTRACTS...")
                open_positions = self.schwab.account_number(self.hash, "positions")
                active_contract = open_positions["securitiesAccount"]["positions"][
                    0
                ]  # RASIE KEY EXCEPTION -> ["positions"]
                print("ACTIVE CONTRACT FOUND!")

                print("EXTRACTING MARKET VALUE...")
                market_value = active_contract["marketValue"] / 100

                symbol = active_contract["instrument"]["symbol"]
                print("CREATING A NEW SELL ORDER...")
                order_replacement = create_order(
                    round(market_value, 2), symbol, "SELL", self.position_size
                )

            else:
                order_replacement = self.best_contract(order_type)

                if order_replacement is None:
                    return
            print("POSTING REPLACEMNT ORDER...")
            self.schwab.order_replace(
                accountNumber=self.hash, orderId=orderId, order=order_replacement
            )  # RASIE TYPE EXCEPTION
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
        """ """
        try:
            account_orders = self.schwab.account_orders(
                maxResults=5,
                fromEnteredTime=order_date(),
                toEnteredTime=self.tomorrow,
                accountNumber=self.hash,
                status="PENDING_ACTIVATION",
            )

            # RAISE INDEX EXCEPTION: The pending order was executed If the list is empty
            orderId = account_orders[0].get("orderId")
            self.schwab.delete_order_id(orderId, self.hash)
        except json.decoder.JSONDecodeError:
            print("PENDING ORDER DELETED.")
        except IndexError:
            print("PENDING ORDER WAS ACCEPTED, CANCEL DELETE.")
            return

    # **************************************************
    # ********************** GETTERS *******************
    # **************************************************
    def get_hash(self):
        """ """
        while True:
            try:
                return self.schwab.account_numbers()[0].get("hashValue")
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
            if type == "C":
                return "CALL"
            elif type == "P":
                return "PUT"
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

    # **************************************************
    # ******************** SETTERS *********************
    # **************************************************
    def set_account_balance(self, balance):
        """
        Set the account balance.

        Args:
            balance (float): The balance to set.

        Returns:
            None
        """
        balance = 100.00  # Temp
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
        """ """
        self.daily_goal = daily_goal
        print(f"Goal Per Trade: ${self.daily_goal}")

    def set_total_risk(self, total_risk):
        """ """
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
        price = 50.0
        self.contract_price = price / 100
        print(f"Price: ${int(price)}")

    # **************************************************
    # ******************* SETTINGS *********************
    # **************************************************
    def set_settings(self):
        """ """
        df = self.sheet.read_sheet()
        row = df[df["Date"] == datetime.now().strftime("%-m/%-d/%Y")]

        # The Row # in excel sheet
        self.set_day(int(row.iloc[0]["Day"]))

        # The Current Account Balance
        self.set_account_balance(self.get_total_cash())

        # The Daily account balance goal by eod
        self.set_adjusted_balance(int(row.iloc[0]["Adj$Balance"][1:].replace(",", "")))

        # The Daily profit goal per trade
        self.set_daily_goal(int(row.iloc[0]["Adj$Gain"][1:].replace(",", "")))

        # The Daily percentage goal per trade
        self.set_profit_percentage(float(row.iloc[0]["Pos%Tgt"][:-1]))

        # The Daily total risk $ per trade
        self.set_total_risk(int(row.iloc[0]["Tot$Risk"][1:].replace(",", "")))

        # The Contract Price
        self.set_contract_price(float(row.iloc[0]["Pos$Size"][1:].replace(",", "")))

        # The Number of Contracts Per Trade
        self.set_position_size(int(row.iloc[0]["Pos#Open"]))

    def save_settings(self):
        """ """
        # Request the accounts balance and send it to sheet
        sheet_name = "perf"
        column = "P"
        row = 10 + self.day

        range = f"{sheet_name}!{column}{row}"

        # Use a cuurent balanace from the api
        self.sheet.update_sheet(range, self.get_total_cash())

    # **************************************************
    # ************* STREAM *****************************
    # **************************************************
    def _start_stream(self):
        """ """
        streamer_info = self.schwab.preferences().get("streamerInfo", None)[0]
        df = fetch_price_data(self.schwab, "SPY", "minute", 3, self.today, self.today)
        self.stream = Stream(streamer_info, self.check_momentum_chain)
        self.stream.set_dataframe(df)

        # Start stream with new data processing function
        async def data_in_df(data, *args):
            await process_data(data, self.stream)

        self.stream.start(data_in_df)

    def _check_momentum_chain_automatic(self):
        # try:
        #     self._start_stream()
        # except Exception:
        def checker():
            while market_is_open():
                now = datetime.now()
                minutes = now.minute

                # Find the next n-minute mark
                next_minute = (minutes // self.freq + 1) * self.freq

                # If next_minute exceeds 59, reset to 0 and increment hour
                next_time = now.replace(second=0, microsecond=0)

                if next_minute >= 60:
                    next_time += timedelta(hours=1)  # Move to the next hour
                    next_time = next_time.replace(minute=0)  # Reset to 00 minutes
                else:
                    next_time = next_time.replace(minute=next_minute)

                # Calculate sleep duration until the next n-minute mark
                sleep_duration = (next_time - now).total_seconds()

                # Add confirmation delay
                confirmation_delay = (self.freq / 2) * 60  # seconds
                sleep_duration += confirmation_delay

                print(
                    f"\nStep 1: SLEEPING FOR {sleep_duration:.2f}s, UNTIL {next_time.strftime('%H:%M')}"
                )

                if sleep_duration > 0:
                    time.sleep(sleep_duration)

                print(datetime.now())
                self.check_momentum_chain()

        self.thread = threading.Thread(target=checker, daemon=True)
        self.thread.start()
