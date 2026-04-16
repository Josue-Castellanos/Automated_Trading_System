import json
import threading
import time
import pandas as pd
from backend.schwab import Schwab
from backend.stream import Stream, process_data
from backend.sheet import Sheet
from .strategy.level_plan import build_level_plan
from .strategy.ttm_squeeze import ttm_squeeze_momentum, ttm_squeeze_signals
from .strategy.open_interest import high_open_interest
from .strategy.persons_pivots import persons_pivot_levels
from .strategy.exponential_moving_average import ema_crossover_signals
from .strategy.expected_move import compute_expected_move_bounds, expected_move_tos_style
from .strategy.macd import macd_signals
from .strategy.macd_wilders import macd_wilder_signals
from .strategy.ichimoku import ichimoku
from .strategy.fibonacci import fibonacci_retracement
from backend.utils import (create_option_dataframe, create_order,
                                        dates, datetime, fetch_price_data,
                                        filter_options, market_is_open,
                                        order_date, timedelta, resolve_signals, 
                                        track_signal_lifetime)
import logging
logger = logging.getLogger("trading")

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
        # Trading frequency in minutes
        self.freq = freq
        # Client
        self.schwab = Schwab()
        self.sheet = Sheet() # Comment out with settings
        self.stream = None
        self.thread = None
        # Schwab
        self.hash = self.get_hash()
        # GCP - Sheets
        self.daily_roi_per_trade_goal = None   # Goal for each contract
        self.position_size = None       #  quantity of contracts per trade, I'm removing this becasue there is no real amount, its based on 
        self.daily_total_risk = None
        self.daily_account_balance_goal = None
        self.day_in_sheet = None
        self.current_account_balance = None
        self.set_settings()
        # Strategy
        self.stock_list = ["SPY"]
        self.long_lookback_period = 40 
        self.short_lookback_period = 20
        self.active_signal_type = None
        self.active_signal = None
        self.signal_strength_minutes = 0
        self.signal_type = None     # winner signal type
        self.signal = None          # winner signal 
        self.all_signals = None       # all signals dataframe
        self.mode = None         # WAIT, CONSERVATIVE, MODERATE, AGGRESSIVE
        self.active_trades = {
            "contracts": {
                # "SPY": [
                    # { 
                        #   "symbol": symbol,
                        #   "entry_price": entry_price, 
                        #   "qty": qty, 
                        #   "total_invested": total_cost,
                        #   "current_price": current_price, 
                        #   "pnl": pnl,
                        #   "is_open": True,     
                        #   "signal": signal,
                        #   "type": ENTRY | ADDON
                    # }
                # ]
            },     
            "total_invested": 0.0,      # total $ invested in this trade so far
            "max_trades": self.max_trades_per_day,
            "max_capital": self.max_capital_per_trade * self.max_trades_per_day,  # max $ to invest in this trade    
        }
        self.level_plan = {}
        self.in_trade = False
        self.today, self.weekly = dates(self.stock_list[0])
        self.em_up = None
        self.em_dn = None
        
        self.compute_expected_move(self.stock_list[0])
        # Computes daily levels and bulds level plan
        self.compute_daily_levels(self.stock_list[0])
        # Initial sync of SPY open positions
        self.update_positions(self.stock_list[0])  
        # Start Thread
        self._check_momentum_chain()

    # ******************************************************************
    # ************* ENGINE *********************************************
    # ******************************************************************
    def update_positions(self, ticker):
        """
        Checks for open positions in the Schwab account and update internal state.
        This is called when the system starts to sync with existing positions.
        As well as after each trade to update the active trades structure.
        Lastly, it can be called periodically to ensure consistency and accuracy
        """
        try: 
            account_info = self.schwab.account_number(self.hash, "positions")

            # Reversing the Schwab contracts so the most recent cons are checked first
            open_positions = dict(reversed(account_info["securitiesAccount"]["positions"].items()))

            #Copy open positions to active_trades structure
            for pos in open_positions:
                # Only consider SPY positions for now...
                if not pos["instrument"]["symbol"].startswith(ticker):
                    continue # skip non ticker positions

                # Extract position details
                con_symbol = pos["instrument"]["symbol"]
                signal = "CALL" if con_symbol[12:13] == "C" else "PUT"
                entry_price = pos["averagePrice"]
                current_price = round(pos["marketValue"] / 100, 2) 
                qty = pos["longQuantity"]
                unrealized_pnl = pos["currentDayProfitLossPercentage"]
                total_cost = (entry_price * qty) * 100

                if ticker not in self.active_trades["contracts"]:
                    self.active_trades["contracts"][ticker] = []
                    logger.info(f"ADDED NEW TICKER TO {ticker}'s ACTIVE TRADES.")

                    self.active_trades["contracts"][ticker].append({
                        "symbol": con_symbol,
                        "entry_price": entry_price,
                        "qty": qty,
                        "total_position": total_cost,
                        "current_price": current_price,
                        "pnl": unrealized_pnl,
                        "is_open": True,
                        "signal": signal,
                        "type": "ENTRY"
                    })
                    logger.info("1 ADDED NEW CONTRACT POSITION TO ACTIVE TRADES.")
                    self.active_trades["total_invested"] += total_cost
                    continue


                found = False
                for con in self.active_trades["contracts"][ticker]:
                    # Find which trade this position belongs to
                    if con.get("symbol") == con_symbol & con.get("is_open"): 
                        logger.info(f"UPDATED {con_symbol} || {con["pnl"]}% --> {unrealized_pnl}%")
                        con["entry_price"] = entry_price
                        con["qty"] = qty
                        con["current_price"] = current_price
                        con["pnl"] = unrealized_pnl
                        found = True
                        break
                if not found:
                    # If not found, add to the first available trade slot
                    self.active_trades["contracts"][ticker].append({
                        "symbol": con_symbol,
                        "entry_price": entry_price,
                        "qty": qty,
                        "total_position": total_cost,
                        "current_price": current_price,
                        "pnl": unrealized_pnl,
                        "is_open": True,
                        "signal": signal,
                        "type": "ADDON"
                    })
                    self.active_trades["total_invested"] += total_cost # assuming 100 multiplier
                    logger.info("2 ADDED NEW CONTRACT POSITION TO ACTIVE TRADES.")
            logger.info("=== UPDATED EXISTING CONTRACT POSITIONS ====")
            logger.info(json.dumps(self.active_trades, indent=2, default=str))
        except KeyError:
            logger.error("NO ACTIVE CONTRACTS FOUND TO UPDATE.")
            return
   
    def check_triggers(self, ticker):        
        # Gets dataframes of signals, 5m, 4h
        track_signal = self.get_trigger_signals(ticker)

        logger.info(f"STEP 3: UPDATE TRADING SIGNALS - {self.mode} mode") 
        self.update_signal(track_signal)
        current_price = self.df_5m["Close"].iloc[-1]

        # SKIP signals if market not good for trading
        if self.mode == "WAIT":
            logger.error(f"STEP 4: MARKET SQUEEZING --> {self.mode} mode")
            return
        # SKIP signals if passed EM in same direction
        if self.signal_type == "CALL" and current_price > self.em_up:
            logger.info(f"STEP 4: PASSED EM UP LEVEL at {self.em_up}, cannot accept new CALL signals.")
            return
        # SKIP signals if passed EM in same direction
        if self.signal_type == "PUT" and current_price < self.em_dn:
            logger.info(f"STEP 4: PASSED EM DN LEVEL at {self.em_dn}, cannot accept new PUT signals.")
            return
        # # SKIP signals if it goes against the active signals timers. Ex: Call4h > P5
        # if self.active_signal_type == "CALL" and self.signal_type == "PUT":
        #     logger.info(f"STEP 4: {self.signal_type} -> {self.signal} vs {self.active_signal_type} -> {self.active_signal}")
        #     return
        # # SKIP signals if it goes against the active signals timers. Ex: Call4h > P5
        # if self.active_signal_type == "PUT" and self.signal_type == "CALL":
        #     logger.info(f"STEP 4: {self.signal_type} -> {self.signal} vs {self.active_signal_type} -> {self.active_signal}")
        #     return
        # SKIP if signal type is PUT and ticker is not ["SPY", "QQQ", "DIA", "IWM"]
        # if self.signal_type == "PUT" and ticker not in ["SPY", "QQQ", "DIA", "IWM"]:
        #     logger.info(f"STEP 4: SKIPPING PUT SIGNALS FOR {ticker} - Signal: {self.signal}  Type: {self.signal_type} --> Active: {self.active_signal}  Type: {self.active_signal_type}")
        #     return
        # SKIP if no valid signal
        if self.signal_type not in ["CALL", "PUT"]:
            logger.info(f"STEP 4: NO VALID SIGNAL - Signal: {self.signal}  Type: {self.signal_type} --> Active: {self.active_signal}  Type: {self.active_signal_type}")
            return
        # SKIP if 1hr, 2hr, 4hr signal received is not confirmed with lower timeframe signal as well.
        

        #FUTURE VERSION
        tickers = list(self.active_trades["contracts"].keys())
        contracts = self.active_trades["contracts"].get(ticker, [])

        #### FIX
        open_count = sum(1 for c in contracts if c.get("is_open")) if contracts else 0       # and c["signal"] == self.signal_type )
        self.in_trade = True if open_count >= 1 else False

        # If I received a trigger signal - Not TIE
        if self.signal_type in ["CALL", "PUT"]:
            logger.info(f"STEP 4: NEW SIGNAL DETECTED - {self.signal} <-- {self.all_signals} ({self.signal_type})")
            
            # IN A TRADE - ADD TO EXISTING POSITION
            if self.in_trade:
                # This basically checks if the open trades for this particular ticker
                # Share the same trend type like CALL or PUT as the trigger signal 
                if all(c["signal"] == self.signal_type for c in contracts if c["is_open"]):
                    con_info = contracts[-1]
                    # This basically checks if the recent contract on the stack is up 50% before adding%
                    if con_info["pnl"] < 50.0:
                        logger.info(f"Previous position needs to be over 50% --> {con_info["pnl"]}%")
                        return

                    # Step 1: Get the contract
                    contract = self.best_contract(self.signal_type, ticker) # FIX THIS TO ALWAYS GET THE BEST CONTRACT
                    # Contracts attributes
                    symbol = contract['Symbol']
                    signal = "CALL" if symbol[12:13] == "C" else "PUT"
                    ask = contract['Ask']
                    qty = 1   # This is based on the total amount for the day
                    total_cost = (ask * qty) * 100   # + (qty * 0.65) # assuming $0.65 commission per contract

                    if self.active_trades["total_invested"] + total_cost > self.active_trades["max_capital"]:
                        # If no position size found, return
                        logger.info(f"{symbol} ORDER EXCEEDS BUDGET: ${self.active_trades["max_capital"]} >= ${self.active_trades["total_invested"] + total_cost}")
                        return

                    # Add new contract to existing position
                    if self.can_add_contract(ticker, signal, symbol) and open_count >= 1:
                        # Buy Contract Here
                        self.buy_position(contract, self.signal_type, qty, ticker)                            
                        self.add_contract(tickers, ticker, symbol, ask, qty, total_cost, signal, "ADDON")

                        logger.info(f"ADDED TO {ticker}: {symbol} with {qty} contract @ {ask} for total ${total_cost:.2f}")
                        return
                    else:
                        logger.info(f"Contract {symbol} already in trade.")
                        return
                    
                # FIX - Here I need the CALL|PUT OF the open contracts, that will let me know what position im in
                # As far as position goes.
                if contracts[-1]["signal"] != self.active_signal_type and self.active_signal_type in ["CALL", "PUT"]:
                    self.sell_position(ticker, "REVERSE")
                    self.in_trade = False
                    logger.info(f"REVERSED POSITION TO --> {self.active_signal_type}.")
                    

            # NOT IN A TRADE - CREATE ENTRY POSITION
            if not self.in_trade:
                # Step 1: Get the contract
                contract = self.best_contract(self.signal_type, ticker) # FIX THIS TO ALWAYS GET THE BEST CONTRACT
                
                symbol = contract['Symbol']
                signal = "CALL" if symbol[12:13] == "C" else "PUT"
                ask = contract['Ask']
                qty = 1    # Feeler position
                total_cost = (ask * qty) * 100   # + (qty * 0.65) # assuming $0.65 commission per contract

                # Step 2: See if we can enter a new trade
          
                if total_cost + self.active_trades["total_invested"] > self.active_trades["max_capital"]:
                    print(f"Cannot enter trade for {symbol}, would exceed max capital per trade.")
                    return
                else:
                    if self.can_enter_contract(ticker, signal):
                        # Buy Contract Here
                        self.buy_position(contract, signal, qty, ticker)

                        self.add_contract(tickers, ticker, symbol, ask, qty, total_cost, signal, "ENTRY")

                        self.in_trade = True
                        logger.info(f"ENTERED {self.signal_type} FEELER → with {qty} contract @ {ask} for total ${total_cost:.2f}")
                    else:
                        logger.info(f"Cannot make entery {signal} for {symbol}: Either already in a {signal} trade or existing {signal} contracts are still open.")

    def check_build_path(self, ticker):
        # Current Candlestick Price Info
        current_price = self.df_5m["Close"].iloc[-1]
        high = self.df_5m["High"].iloc[-1]
        low = self.df_5m["Low"].iloc[-1]

        # This is where I locate the build path for the specific ticker

        # Checking for build path levels
        path = self.level_plan[ticker]["up"] if self.active_signal_type == "CALL" else self.level_plan[ticker]["down"]
        opposite_path = self.level_plan[ticker]["down"] if self.active_signal_type == "CALL" else self.level_plan[ticker]["up"]

        flipped_levels = []  # keep track of levels to flip

        for step in path[:]:  # copy since we may remove items
            level = step["level"]
            label = step["label"]
            action = step["action"]

            # --- Check for "HIT" ---
            # If the current price hits the level (close enough) by $0.10 dollars
            if abs(current_price - level) <= 0.1:  # within 10c tolerance                
                if self.in_trade:  # <--- FIX THIS GO THROUGH THE PROCESS OF STOCK LIST TO FIND OUT WHY
                    logger.info(f"HIT LEVEL: {label} @ {level}")
                    logger.info(f"ACTION: {action} ({step['size_to_close']*100:.0f}% size)")
                    
                    if action.startswith("Exit all"):
                        self.sell_position(ticker, "EXITALL")

                    elif "Trim" in action:
                        self.sell_position(ticker, "TRIM")

            # --- Check for "Broken" (close above for CALL path, below for PUT path) ---
            if self.active_signal_type == "CALL":                
                if current_price > level:
                    logger.info(f"LEVEL BROKEN (support → flipped to resistance): {label} @ {level}")
                    flipped_levels.append(step)
                    path.remove(step)

                elif high > level and current_price < level:
                    logger.info(f"LEVEL REJECTED: {label} @ {level}")
                    # flipped_levels.append(step)
                    # path.remove(step)

            else:  # PUT trade, tracking downside path
                if current_price < level:
                    logger.info(f"LEVEL BROKEN (resistance → flipped to support): {label} @ {level}")
                    flipped_levels.append(step)
                    path.remove(step)

                elif low < level and current_price > level:
                    logger.info(f"LEVEL REJECTED: {label} @ {level}")
                    # flipped_levels.append(step)
                    # path.remove(step)

        # --- Flip broken levels into opposite path with same logic ---
        logger.info("STEP 5: UPDATE LEVEL PATHS BASED ON BROKEN LEVELS")
        for step in flipped_levels:
            new_step = step.copy()
            if self.active_signal_type == "CALL":
                new_step["label"] = f"Flipped-{step['label']}-R"
            else:
                new_step["label"] = f"Flipped-{step['label']}-S"
            opposite_path.append(new_step)
            logger.info(f"--> Added flipped level to {'down' if self.active_signal_type=='CALL' else 'up'} path: {json.dumps(new_step, indent=4)}")

        # --- Re-sort the opposite path after adding flipped levels ---
        if self.active_signal_type == "CALL":
            # CALL trade flips support → resistance (downside path sorted high → low)
            opposite_path.sort(key=lambda x: x["level"], reverse=True)
        else:
            # PUT trade flips resistance → support (upside path sorted low → high)
            opposite_path.sort(key=lambda x: x["level"])
             
             
    # ******************************************************************
    # ********************* TRADING SYSTEM *****************************
    # ******************************************************************
    def can_enter_contract(self, ticker, signal):
        if ticker not in self.active_trades["contracts"]:
            return True  # No contracts for this ticker yet
        # Only allow entry if all contracts for this ticker are closed.
        return all(not c["is_open"] for c in self.active_trades["contracts"][ticker])
        
    def can_add_contract(self, ticker, signal, con_symbol):
        if ticker not in self.active_trades["contracts"]:
            return False  # No contracts for this ticker yet

        # Block if identical contract is already open
        if any(c["is_open"] and c.get("symbol") == con_symbol for c in self.active_trades["contracts"][ticker]):
            return False

        # Require at least one open contract with matching signal
        return any(c["is_open"] and c.get("signal") == signal for c in self.active_trades["contracts"][ticker])

    def get_trigger_signals(self, ticker):
        """
        Check for trading signals and execute trades based on the current market conditions.
        This method is called periodically based on the defined frequency.
        """
        logger.info("STEP 1: FETCH MARKET DATA")
        # TODO:// Make 5 minute data aggregation for the rest of the timeframes
        # Fetch price data for various timeframes
        df_5m = fetch_price_data(self.schwab, ticker, 'day', 10, 'minute', 5, None, self.today)
        df_15m = fetch_price_data(self.schwab, ticker, 'day', 10, 'minute', 15, None, self.today)
        df_30m = fetch_price_data(self.schwab, ticker, 'day', 10, 'minute', 30, None, self.today)
        df_1h = fetch_price_data(self.schwab, ticker, 'day', 10, 'hour', 1, None, self.today)
        df_2h = fetch_price_data(self.schwab, ticker, 'day', 10, 'hour', 2, None, self.today)
        df_4h = fetch_price_data(self.schwab, ticker, 'day', 10, 'hour', 4, None, self.today)
        df_1d = fetch_price_data(self.schwab, ticker, 'month', 2, 'daily', 1, None, self.today)
        df_1wk = fetch_price_data(self.schwab, ticker, 'year', 1, 'weekly', 1, None, self.today)

        signal_timeframes_data = {
            '5': df_5m,
            '15': df_15m,
            '30': df_30m,
            '1h': df_1h,
            '2h': df_2h,
            '4h': df_4h,
            '1d': df_1d
        }

        # Possibly remove the daily and weekly 
        squeeze_timeframes_data = {
            '5': df_5m,
            '15': df_15m,
            '30': df_30m,
            '1h': df_1h,
            '2h': df_2h,
            '4h': df_4h,
            '1d': df_1d,
            '1w': df_1wk
        }
        
        logger.info("STEP 2: ANALYZE MARKET DATA FOR TRADING SIGNALS")

        # TTM Squeeze Momentum
        ttm_squeeze_momentum_df, mtf_sqzs_df = ttm_squeeze_momentum(squeeze_timeframes_data)
        self.check_mtf_squeezes(mtf_sqzs_df)    #   - WAIT, CONSERVATIVE, AGGRESSIVE
      
        # logger.info("Step 3: ANALYZE TRADING SIGNALS")
        resolved_signals = self.compute_signals(signal_timeframes_data, squeeze_timeframes_data)
        track_signal = track_signal_lifetime(resolved_signals)

        self.df_5m = df_5m
        return track_signal #, df_4h
    
    def check_mtf_squeezes(self, df):
        sqz_count = df['count'].iloc[-1]

        # --- Trading Mode (aggressive vs conservative) ---
        # 5m Gold, 15m Gold, 30m Gold
        # 5m Gold, 15m Gold
        # if df['sqz5'] == "gold" and df['sqz15'] == "gold":
        #     self.mode = "WAIT"
        if sqz_count == 5:
            # WAIT: If 5 timeframes are in a squeeze
            # Market is in very tight range, wait for breakout
            self.mode = "WAIT"
        if sqz_count >= 4:
            # CONSERVATIVE: If 4 or more timeframes are in a squeeze
            # Only take 1 trade to EM of the day
            # Dont trade past EM in the same direction
            # Perhaps ignore P1/C1 signals entirely until the squeeze breaks out
            self.mode = "CONSERVATIVE"
        elif sqz_count >= 3:
            # SEMI-CONSERVATIVE: If 3  are in a squeeze
            # Only take 1 contract per trade up to EM of the day
            # Dont add/enter after EM in the same direction (Hold 1 runner)
            # Watch out for combo of 5m, 30m, and 15m squeezes
            self.mode = "MODERATE"
        else:
            # Else you can follow the plan entirely.
            self.mode = "AGGRESSIVE"

    def compute_signals(self, signal_timeframes_data, squeeze_timeframes_data):
        # ====== Entry and Exit Signals =======
        # MACD Crossover Signals
        macd_signals_df = macd_signals(signal_timeframes_data)
        macd_call_signals_df = macd_signals_df['Calls'].infer_objects(copy=False)
        macd_put_signals_df = macd_signals_df['Puts'].infer_objects(copy=False)

        # MACD Wilders Crossover Signals
        macd_wilder_signals_df = macd_wilder_signals(signal_timeframes_data)
        macd_wilder_call_signals_df = macd_wilder_signals_df['Calls'].infer_objects(copy=False)
        macd_wilder_put_signals_df = macd_wilder_signals_df['Puts'].infer_objects(copy=False)

        # EMA Crossover Signals
        ema_signals_df = ema_crossover_signals(signal_timeframes_data)
        ema_call_signals_df = ema_signals_df['Calls'].infer_objects(copy=False)
        ema_put_signals_df = ema_signals_df['Puts'].infer_objects(copy=False)

        # TTM Squeeze Signals
        ttm_squeeze_signals_df = ttm_squeeze_signals(squeeze_timeframes_data)
        sqz_call_signals_df = ttm_squeeze_signals_df['Calls'].infer_objects(copy=False)
        sqz_put_signals_df = ttm_squeeze_signals_df['Puts'].infer_objects(copy=False)

        # Combine all signals into a single DataFrame
        combined_call_signals = pd.concat([macd_call_signals_df, macd_wilder_call_signals_df, ema_call_signals_df, sqz_call_signals_df], axis=1)
        combined_put_signals = pd.concat([macd_put_signals_df, macd_wilder_put_signals_df, ema_put_signals_df, sqz_put_signals_df], axis=1)

        # Resolved Signal Dataframe
        resolve_signal = resolve_signals(combined_call_signals, combined_put_signals)

        return resolve_signal

    def update_signal(self, track_signal):
        # Extract the most recent signal information to self attributes
        current_signal = track_signal.iloc[-1]
        # Active Signal (Call5, C5, call5...etc)
        self.active_signal = current_signal['active_signal']
        # Plan Path for signal (PUT|CALL) ---> Level Plan Path to follow
        self.active_signal_type = current_signal['active_signal_type']
        # Triggered Signal (Call5, C5, call5...etc)
        self.signal = current_signal['winner_signal']
        # All Signals DataFrame
        self.all_signals = current_signal['signals']
        # Signal Type (PUT|CALL)
        self.signal_type = current_signal['winner_signal_type']
        # Duration of Triggered Signal
        self.signal_strength_minutes = current_signal['strength_minutes']
        # Signal expiration time
        self.signal_expires = current_signal['signal_expires']

    def update_stock_list(self):
        """
        Update the self.stock_list from the sheet, no duplicates.
        New symbols will be added if they don't already exist in the list.
        """
        sheet_stock_list = self.sheet.get_stock_list()
        for symbol in sheet_stock_list:
            if symbol not in self.stock_list:
                self.stock_list.append(symbol)
                logger.info(f"ADDED NEW SYMBOL TO STOCK LIST: {symbol}")

    def add_contract(self, tickers, ticker, symbol, ask, qty, total_cost, signal, otype):
        """Add a contract to the current trade if budget allows."""
        # Initialize ticker list if not exists
        if ticker not in tickers:
            self.active_trades["contracts"][ticker] = []

        # Store contract once buying is complete
        self.active_trades["contracts"][ticker].append({
            "symbol": symbol,
            "entry_price": ask,
            "qty": qty,
            "total_position": total_cost,
            "current_price": ask,
            "pnl": 0.0,
            "is_open": True,
            "signal": signal,
            "type": otype
        })
        self.active_trades["total_invested"] +=  total_cost  # total invested in dollars

    def summary(self, ticker):
        """Return current trade states."""
        for side in ["up","down"]:
            logger.info(f"--- {side.upper()} PATH ---")
            logger.info(json.dumps(self.level_plan[ticker][side], indent=4))
            # for step in self.level_plan[side]:
            #     logger.info(step)

# ###########################################################################
# *********************** SCHWAB API INTERACTIONS **************************
# ###########################################################################
    def compute_expected_move(self, symbol):
        call_options = self.schwab.get_chains(symbol, 'CALL', '100', 'TRUE', 'ANALYTICAL', '', '', 'OTM', self.today, self.today)
        put_options = self.schwab.get_chains(symbol, 'PUT', '100', 'TRUE', 'ANALYTICAL', '', '', 'OTM', self.today, self.today)

        # This can be from either call or put options since it's the same underlying price
        stock_price = call_options['underlyingPrice']

        call_strike_price_df = create_option_dataframe(call_options)
        call_strike_price_df = call_strike_price_df.iloc[:-1]
        call_strike_price_df = filter_options(call_strike_price_df, 'CALL')

        put_strike_price_df = create_option_dataframe(put_options)
        put_strike_price_df = put_strike_price_df.iloc[:-1]
        put_strike_price_df = filter_options(put_strike_price_df, 'PUT')

        # Call ATM option
        call_atm_iv = call_strike_price_df.iloc[0]['IV'] / 100  # decimal
        # print(call_atm_iv)
        call_atm_dte = call_strike_price_df.iloc[0]['DTE']

        # Put ATM option
        put_atm_iv = put_strike_price_df.iloc[0]['IV'] / 100  # decimal
        # print(put_atm_iv)
        put_atm_dte = put_strike_price_df.iloc[0]['DTE']

        # ===================== Expected Move Calculation ( Testing ) =====================
        # Average the call & put IVs
        atm_iv_avg = (call_atm_iv + put_atm_iv) / 2

        # Use DTE from either row (same for both)
        atm_dte = call_atm_dte  # || put_atm_dte

        # Calculate Expected Move
        self.em_up, self.em_dn = expected_move_tos_style(stock_price, atm_iv_avg, atm_dte)

    def compute_daily_levels(self, ticker):
        """
        Compute daily levels such as Persons Pivots, Previous Daily High & Low,
        and High Open Interest Levels.
        """
        df_1d = fetch_price_data(self.schwab, ticker, 'month', 2, 'daily', 1, None, self.today)
        df_1wk = fetch_price_data(self.schwab, ticker, 'year', 1, 'weekly', 1, None, self.today)
        df_1mo = fetch_price_data(self.schwab, ticker, 'year', 1, 'monthly', 1, None, self.today)
    
        # Persons Pivots
        weekly_persons_pivots_levels = persons_pivot_levels(df_1wk, timeframe='W')
        monthly_persons_pivots_levels = persons_pivot_levels(df_1mo, timeframe='ME')

        # Previous Daily High & Low
        pDH = df_1d['High'].iloc[-1]
        pDL = df_1d['Low'].iloc[-1]

        # Previous Weekly High & Low
        pWH = df_1wk['High'].iloc[-1]
        pWL = df_1wk['Low'].iloc[-1]

        # Todya & Weekly High Open Interest Levels
        high_open_interest_levels = high_open_interest(ticker, 8, 16)
        oi_calls = [float(x) for x in high_open_interest_levels['Call Strike Above Open']]
        oi_puts  = [float(x) for x in high_open_interest_levels['Put Strike Below Open']]

        # Fibonacci Retracement Levels
        fib_levels_daily = fibonacci_retracement(df_1d, '1d', self.short_lookback_period)

        # Expected Move
        open_price = float(df_1d.iloc[-1]['Open'])
        # self.em_up, self.em_dn = compute_expected_move_bounds(open_price)

        # Build list of significant levels
        sig_levels = []
        def add(lbl, val):
            if pd.notna(val):
                sig_levels.append((round(float(val), 2), lbl))

        add("M Persons RR", monthly_persons_pivots_levels.iloc[-1]['RR'])
        add("M Persons PP", monthly_persons_pivots_levels.iloc[-1]['PP'])
        add("M Persons SS", monthly_persons_pivots_levels.iloc[-1]['SS'])
        add("W Persons RR", weekly_persons_pivots_levels.iloc[-1]['RR'])
        add("W Persons PP", weekly_persons_pivots_levels.iloc[-1]['PP'])
        add("W Persons SS", weekly_persons_pivots_levels.iloc[-1]['SS'])
        add("Fib 50", fib_levels_daily.iloc[-1]['fib50'])
        add("Fib 61.8", fib_levels_daily.iloc[-1]['fib61_8'])
        add("Prev Daily High", pDH)
        add("Prev Daily Low", pDL)
        add("Prev Weekly High", pWH)
        add("Prev Weekly Low", pWL)

        # Expected Move bounds already in self.em_up, self.em_dn
        self.level_plan[ticker] = build_level_plan(
            open_price=open_price,
            oi_calls_above=oi_calls,
            oi_puts_below=oi_puts,
            significant_levels=sig_levels,
            expected_move_up=self.em_up,
            expected_move_down=self.em_dn,
            cluster_tol=0.25
        )

        # I should add it to a data structure to append more level plans for diff tickers
        logger.info("=== DAILY ROADMAP BUILT ===")
        self.summary(ticker)

    def best_contract(self, type, ticker):
        """
        Find the best contract based on the given type (PUT or CALL).

        Args:
            type (str): The type of option contract to find ('PUT' or 'CALL').

        Returns:
            dict or None: A dictionary representing the best contract order, or None if no suitable contract is found.
        """
        try:
            logger.info(f"SEARCHING FOR BEST {type} CONTRACT...")
            options = self.schwab.get_chains(
                ticker, type, "70", "TRUE", "", "", "", "OTM", self.today, self.today
            )

            options_df = create_option_dataframe(options)
            strike_price_df = filter_options(options_df, type)

            # Get the ATM Price
            atm_price = strike_price_df.iloc[0]["Ask"]

            # Calculate ROI for each OTM strike
            strike_price_df["ROI"] = (
                (atm_price / strike_price_df["Ask"]) - 1
            ) * 100  # ((ATM STRIKE PRICE / OTM STRIKE PRICE) - 1) * 100

            roi_contracts = strike_price_df.loc[
                (strike_price_df["ROI"] <= 6000) &
                (strike_price_df["Ask"] >= 0.12) &
                (strike_price_df["Delta"].abs() >= 0.10)
            ][::-1]
            # ask_contracts = strike_price_df.loc[strike_price_df["Ask"] <= self.contract_price]

            # RAISE EXCEPTION: If dataframe is empty
            contract = roi_contracts.iloc[0]
            logger.info("BEST CONTRACT FOUND!")

            return contract
        except IndexError:
            logger.error("NO SUITABLE CONTRACT FOUND.")
            return None

    def buy_position(self, contract, contype, qty, ticker):
        """
        Execute a buy order for the given contract.

        Args:
            order (dict): The order details for buying the contract.
            type (str): The type of the contract ('PUT' or 'CALL').

        Returns:
            None
        """
        try:
            buy_order = create_order(
                contract.get("Ask"), contract.get("Symbol"), "BUY", qty
            )
            logger.info("POSTING BUY ORDER...")
            self.schwab.post_orders(buy_order, accountNumber=self.hash).json()
        except json.decoder.JSONDecodeError:
            logger.error("BUY ORDER POSTED, AWAIT CONFIRMATION...")
        finally:
            max_attempts = 0
            while max_attempts < 4:
                time.sleep(5)
                if self.get_position_type() is None:
                    logger.info(f"BUY ORDER REPLACEMENT: {max_attempts + 1}.")
                    self.replace_position(qty, ticker, contype)
                else:
                    logger.info("CONTRACT BOUGHT!")
                    # self.account_balance -= (25) * self.position_size
                    break
                max_attempts += 1

            logger.info("CONTRACT CANNOT BE BOUGHT, TOO MUCH VOLATILITY!")
            self.delete_pending_position()

    def sell_position(self, ticker, action=None, qty=None):
        """
        Sell based on the action.

        TRIM: Sell 1/4 portion of each contract position except the first contract.
        EXITALL: Sell the entire position except 1 runner from the most recent contract.

        This method attempts to sell the currently open positions based on the action.

        Returns:
            None
        """

        # I have to make sure is_open is true before selling a contract to avoid errors
        # Maybe this has to be done in the driver code instead of here
    
        trim_percentage = 75.0

        contracts = self.active_trades["contracts"].get(ticker, [])  # get list of contracts safely

        # If there are no contracts in the trade, return
        if not contracts: # Empty list check
            logger.error("NO ACTIVE CONTRACTS FOUND TO SELL.")
            return

        for n, contract_info in enumerate(contracts):
            try:
                con_symbol = contract_info["symbol"]
                pnl = contract_info["pnl"]
                qty = contract_info["qty"]
                current_price = contract_info["current_price"]
                is_open = contract_info["is_open"]

                if action == "TRIM":
                    # Sell 1/4 of each contract execpt the first contract
                    if n == 0: # I can also use the ENUM type and is_open flag instead
                        logger.info(f"=== {con_symbol} - {pnl}% - SKIP ENTRY")
                        continue
                    
                    # Before you trim make sure the contracts are above 100 % before trimming
                    if pnl < trim_percentage:
                        logger.info(f"=== {con_symbol} - {pnl}% - SKIP BELOW {trim_percentage}% ===")
                        continue

                    qty_to_sell = (qty + 3) // 4 if qty > 1 else 0

                    if qty_to_sell > 0 and (qty - qty_to_sell) >= 1:
                        # CREATE SELL ORDER
                        sell_order = create_order(current_price, con_symbol, "SELL", qty_to_sell)
                        logger.info(f"=== {con_symbol} - {pnl}% - TRIMMING {qty_to_sell} ===")
                        self.schwab.post_orders(sell_order, accountNumber=self.hash).json()
                    else:
                        logger.info(f"=== {con_symbol} - QTY {qty} LEFT - HOLD! ===")
                        continue

                elif action == "EXITALL":
                    # Sell entire position except 1 runner from the first contract
                    if n == 0:
                        continue
    
                    else:
                        # CREATE SELL ORDER
                        sell_order = create_order(current_price, con_symbol, "SELL", qty)
                        logger.info(f"CLOSING ALL {qty_to_sell} CONTRACTS - {con_symbol}.")
                        self.schwab.post_orders(sell_order, accountNumber=self.hash).json()

                elif action == "REVERSE":
                    # sell the entire position this should be the remaing runner contract
                    # This else is for reverse signals so just sell runner since we are not
                    # Buying oast the EM on the same direction
                    
                    # CREATE SELL ORDER
                    if is_open:
                        sell_order = create_order(current_price, con_symbol, "SELL", qty)
                        logger.info(f"SELLING {qty} CONTRACTS OF {con_symbol}")
                        self.schwab.post_orders(sell_order, accountNumber=self.hash).json()
                        
            except json.decoder.JSONDecodeError:
                logger.error("SELL ORDER POSTED!!")
                if action in ["EXITALL", "REVERSE"]:
                    contract_info["is_open"] = False

    def replace_position(self, qty, ticker, order_type=None, order_status=None):
        """ """
        try:
            logger.info("SEARCHING FOR PENDING ACTIVATION ORDERS...")
            account_orders = self.schwab.account_orders(
                maxResults=1,
                fromEnteredTime=order_date(),
                toEnteredTime=self.today,  # self.tomorrow? This is casuing issues on friday's
                accountNumber=self.hash,
                status="WORKING",
            )
            order = account_orders[0]  # RAISE INDEX EXCEPTION
            logger.info("PENDING ACTIVATION ORDER FOUND!")

            logger.info("EXTRACTING ID FROM PENDING ORDER...")
            orderId = order.get("orderId")

            if order_status == "SELL":
                logger.info("NOW SEARCHING FOR ACTIVE CONTRACTS...")
                open_positions = self.schwab.account_number(self.hash, "positions")
                active_contract = open_positions["securitiesAccount"]["positions"][
                    0
                ]  # RASIE KEY EXCEPTION -> ["positions"]
                logger.info("ACTIVE CONTRACT FOUND!")

                logger.info("EXTRACTING MARKET VALUE...")
                market_value = active_contract["marketValue"] / 100

                symbol = active_contract["instrument"]["symbol"]
                logger.info("CREATING A NEW SELL ORDER...")
                order_replacement = create_order(
                    round(market_value, 2), symbol, "SELL", qty
                )

            else:
                order_replacement = self.best_contract(order_type, ticker)

                if order_replacement is None:
                    return
            logger.info("POSTING REPLACEMNT ORDER...")
            self.schwab.order_replace(
                accountNumber=self.hash, orderId=orderId, order=order_replacement
            )  # RASIE TYPE EXCEPTION
        except json.decoder.JSONDecodeError:
            logger.error("REPLACEMENT ORDER POSTED, PENDING ACTIVATION...")
        except IndexError:
            logger.error("PENDING ACTIVATION ORDER IS ACTIVE, CANCEL REPLACMENT.")
            return
        except KeyError:
            logger.error("NO ACTIVE CONTRACT FOUND!")
            return
        except TypeError as e:
            logger.error(f"REPLACEMENT ORDER CANCELED: {e}")
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
            logger.info("PENDING ORDER DELETED.")
        except IndexError:
            logger.info("PENDING ORDER WAS ACCEPTED, CANCEL DELETE.")
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
                logger.error("Invalid Hash returned, needs new token")

    def get_position_type(self):
        """
        Determine the type of the current open position.

        Returns:
            str or None: The type of the current position ('CALL' or 'PUT'), or None if no position is open.
        """

        try:
            order = self.schwab.account_number(self.hash, "positions")

            # RASIE EXCEPTION: If there are no open positions for SPY
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
    # ******************* SETTINGS *********************
    # **************************************************
    def set_settings(self):
        """ 
        Set the trading settings from the Google Sheet.
        """
        df = self.sheet.read_sheet()
        row = df[df["Date"] == datetime.now().strftime("%-m/%-d/%Y")]

        # The Row # in excel sheet
        self.day_in_sheet = int(row.iloc[0]["Day"])
        logger.info(f"Day: {self.day_in_sheet}")

        # The Current Account Balance
        try:
            self.current_account_balance = int(row.iloc[1]["Act$Balance"][1:].replace(",", "")) 
        except Exception:
            self.current_account_balance = self.get_total_cash()
        logger.info(f"Account Balance: ${self.current_account_balance}")

        # The Daily account balance goal by eod
        self.daily_account_balance_goal = int(row.iloc[0]["Adj$Balance"][1:].replace(",", ""))
        logger.info(f"Account Goal By EOD: ${self.daily_account_balance_goal}")

        # The Daily profit goal per trade
        self.daily_profit_goal = int(row.iloc[0]["Adj$Gain"][1:].replace(",", ""))
        logger.info(f"Daily Profit Goal: ${self.daily_profit_goal}")

        # The Daily percentage goal per trade
        self.daily_roi_per_trade_goal = float(row.iloc[0]["Pos%Tgt"][:-1])
        logger.info(f"ROI Per Trade: {self.daily_roi_per_trade_goal}%")

        # The Number of Contracts Per Trade
        self.max_trades_per_day = int(row.iloc[0]["Pos#Open"])
        logger.info(f"Max Trades Per Day: {self.max_trades_per_day}")

        # The Max $ Per Trade
        self.max_capital_per_trade = float(row.iloc[0]["Pos$Size"][1:].replace(",", ""))
        logger.info(f"Risk Per Trade: ${self.max_capital_per_trade}")

        # The Daily total risk $ per trade
        self.daily_total_risk = int(row.iloc[0]["Tot$Risk"][1:].replace(",", ""))
        logger.info(f"Total Risk: ${self.daily_total_risk}")

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

    def _check_momentum_chain(self):
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

                logger.info(
                    f"SLEEPING FOR {sleep_duration:.2f}s, UNTIL {next_time.strftime('%H:%M')}"
                )

                if sleep_duration > 0:
                    time.sleep(sleep_duration)

                # NEXT VERSION : Update stock list from sheet
                # self.update_stock_list()
                for ticker in self.stock_list:
                    self.update_positions(ticker)
                    self.check_triggers(ticker)
                    self.check_build_path(ticker)

        self.thread = threading.Thread(target=checker, daemon=True)
        self.thread.start()
