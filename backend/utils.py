from datetime import datetime, time, timedelta
import re
import pandas as pd
import yfinance as yf
import logging
logger = logging.getLogger("trading")

def dates(symbol):
    """
    SPY, QQQ, DIA, IWM - Get today's expiration and the weekly expiration (Friday).
    Tickers with weekly options expire on Fridays.

    Rules:
    * Note: Daylight saving time will add/deduct an hour, adjust accordingly.
    - If current time is past 17:00 → move "today" to the next trading day.
    - If today is Friday:
        - Before 16:00 → today=Friday, weekly=next Friday.
        - After 16:00 → today=Monday, weekly=next Friday.
    - If today is Saturday or Sunday → today=Monday.
    - Otherwise (Mon–Thu):
        - "today" is today (or tomorrow if past 17:00).
        - "weekly" is the upcoming Friday.

    Returns:
        today_str (str): Date for today's expiration
        friday_str (str): Date for weekly expiration
    """
    now = datetime.now()
    cutoff_time = now.replace(hour=16, minute=0, second=0, microsecond=0)

    # Base today (move to next calendar day if past cutoff)
    if now >= cutoff_time:
        today = now + timedelta(days=1)
    else:
        today = now

    # --- Ensure today is a trading day (Mon–Fri) ---
    while today.weekday() > 4:  # 5=Saturday, 6=Sunday
        today += timedelta(days=1)

    day_of_week = today.weekday()  # Mon=0 ... Fri=4

    if day_of_week == 4:  # Friday
        if now >= cutoff_time:
            # After cutoff Friday → today=Monday, weekly=next Friday
            today += timedelta(days=3)   # Monday
            friday = today + timedelta(days=4)
        else:
            # Before cutoff Friday → today=Friday, weekly=next Friday
            friday = today + timedelta(days=7)
    else:
        # Regular Mon–Thu case → find this week's Friday
        days_until_friday = (4 - day_of_week) % 7
        friday = today + timedelta(days=days_until_friday)

    if symbol in ['SPY', 'QQQ', 'IWM', 'DIA']:
        return today.strftime("%Y-%m-%d"), friday.strftime("%Y-%m-%d")
    else:
        # For other symbols without daily options, return this weeks firday and next friday
        next_friday = friday + timedelta(days=7)
        return friday.strftime("%Y-%m-%d"), next_friday.strftime("%Y-%m-%d")

def order_date():
    """ """
    today = datetime.now()
    within_60_days = 360
    from_entered_date = today - timedelta(days=within_60_days)
    return from_entered_date.strftime("%Y-%m-%d")


def convert_epoch_to_datetime(epoch_ms):
    """
    Convert milliseconds epoch time to a datetime object adjusted for timezone.
    Daylight Saving Time (DST) is not considered here; adjust as needed.
    """
    datetime_parsed = pd.to_datetime(epoch_ms, unit="ms")
    datetime_adjusted = datetime_parsed - timedelta(hours=8)  # Adjust for daylight saving
    return datetime_adjusted


def create_order(price, symbol, type, position_size, var="OPEN"):
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
    if type != "BUY":
        var = "CLOSE"

    order = {
        "orderType": "LIMIT",
        "session": "NORMAL",
        "price": price,
        "duration": "DAY",
        "orderStrategyType": "SINGLE",
        "orderLegCollection": [
            {
                "instruction": f"{type}_TO_{var}",
                "quantity": position_size,
                "instrument": {"symbol": symbol, "assetType": "OPTION"},
            }
        ],
    }
    return order


def create_option_dataframe(options):
    """ """
    data = []
    exp_date_map = options.get("callExpDateMap") or options.get("putExpDateMap")
    for exp_date, strikes in exp_date_map.items():
        for strike, options_list in strikes.items():
            for option in options_list:
                option_data = {
                    "Put/Call": option.get("putCall"),
                    "Symbol": option.get("symbol"),
                    "Description": option.get("description"),
                    "Bid": option.get("bid"),
                    "Ask": option.get("ask"),
                    "Volume": option.get("totalVolume"),
                    "Delta": option.get("delta"),
                    "OI": option.get("openInterest"),
                    "Expiration": exp_date,
                    "Strike": strike,
                    "IV": option.get("volatility"),
                    "DTE": option.get("daysToExpiration"),
                    "ITM": option.get("inTheMoney"),
                }
                data.append(option_data)
    return pd.DataFrame(data)


def _merge_candle_dataframe(candles, freq, replacement_candles=None):
    """
    Convert API response to a DataFrame.
    """
    candle_data = []
    aggregated_data = []

    schwab_data = [
        {
            "Datetime": convert_epoch_to_datetime(ohlcv["datetime"]),
            "Open": ohlcv.get("open"),
            "High": ohlcv.get("high"),
            "Low": ohlcv.get("low"),
            "Close": ohlcv.get("close"),
            "Volume": ohlcv.get("volume"),
        }
        for ohlcv in candles["candles"]
        if ohlcv.get("datetime") is not None
    ]

    if replacement_candles is not None:
        # Create main DataFrame and set index
        df_missing = pd.DataFrame(schwab_data)
        df_missing.set_index("Datetime", inplace=True)

        # Change Timezone and format of replacement datetime index
        replacement_candles = replacement_candles.drop(
            columns=["Dividends", "Stock Splits", "Capital Gains"]
        )
        replacement_candles.index = pd.to_datetime(
            replacement_candles.index, unit="ms"
        ) - timedelta(hours=3)
        replacement_candles.index = (
            replacement_candles.index.tz_localize(None)
        ).strftime("%Y-%m-%d %H:%M:%S")
        replacement_candles.index = pd.to_datetime(replacement_candles.index)

        # Merge with replacement_candles and re-sort
        df_complete = pd.concat([df_missing, replacement_candles])
        df_complete = df_complete.sort_index()
        df_complete = df_complete.loc[~df_complete.index.duplicated(keep="first")]

        # **Fill missing datetime indices**
        expected_freq = "1min"  # Adjust this if needed (1-minute candlesticks assumed)
        df_complete = df_complete.resample(
            expected_freq
        ).ffill()  # Forward-fill missing timestamps
        df_complete = df_complete[
            :-1
        ]  # Remove the last row, its a yfinance real-time 1-minute candle

        if freq > 1:
            for index, ohlcv in df_complete.iterrows():
                new_candle = {
                    "Datetime": index,
                    "Open": ohlcv["Open"],
                    "High": ohlcv["High"],
                    "Low": ohlcv["Low"],
                    "Close": ohlcv["Close"],
                    "Volume": ohlcv["Volume"],
                }

                candle_data.append(new_candle)

                # Aggregate candles based on frequency
                if len(candle_data) == freq:
                    aggregated_candle = {
                        "Datetime": candle_data[0][
                            "Datetime"
                        ],  # Timestamp of first candle in the group
                        "Open": candle_data[0]["Open"],  # Open price from first candle
                        "High": max(candle["High"] for candle in candle_data),
                        "Low": min(candle["Low"] for candle in candle_data),
                        "Close": candle_data[-1][
                            "Close"
                        ],  # Close price from last candle
                        "Volume": sum(candle["Volume"] for candle in candle_data),
                    }
                    aggregated_data.append(aggregated_candle)
                    candle_data.clear()  # Reset for next batch

            # ===============COMMENT OUT THIS IF YOU WANT TO RETURN THE AGGREGATED DATA===============
            # This is for when call upon the function to fetch data before the candle has been closed.
            # For example fetching 4-minute data at 6:33 am when the 4-minute candle still hasnt closed.
            # It will aggregate the last 3 minutes of data and return it as a 4-minute candle.
            if len(candle_data) > 0:
                aggregated_candle = {
                    'Datetime': candle_data[0]["Datetime"],   # Timestamp of first candle in the group
                    'Open': candle_data[0]["Open"],           # Open price from first candle
                    'High': max(candle["High"] for candle in candle_data),
                    'Low': min(candle["Low"] for candle in candle_data),
                    'Close': candle_data[-1]["Close"],        # Close price from last candle
                    'Volume': sum(candle["Volume"] for candle in candle_data),
                }
                aggregated_data.append(aggregated_candle)
                candle_data.clear()
            # ==========================================================================================

            candle_data.clear()  # Reset for next batch
            agdf = pd.DataFrame(aggregated_data)
            agdf.set_index("Datetime", inplace=True)
            return agdf
        return df_complete
    df = pd.DataFrame(schwab_data)
    df.set_index("Datetime", inplace=True)
    return df


def _create_candle_dataframe(candles):
    """
    Convert API response to a DataFrame.
    """

    schwab_data = [
        {
            "Datetime": convert_epoch_to_datetime(ohlcv["datetime"]),
            "Open": ohlcv.get("open"),
            "High": ohlcv.get("high"),
            "Low": ohlcv.get("low"),
            "Close": ohlcv.get("close"),
            "Volume": ohlcv.get("volume"),
        }
        for ohlcv in candles["candles"]
        if ohlcv.get("datetime") is not None
    ]

    df = pd.DataFrame(schwab_data)
    df.set_index("Datetime", inplace=True)
    return df


def _aggregate_candle_dataframe(candles, freq_hours):
    """
    Aggregates 30-minute candle data into larger timeframes (1H, 2H, 3H, 4H, etc.).

    Parameters:
        candles (dict): API response containing 'candles' list with OHLCV data.
        freq_hours (int): Number of hours per aggregated candle (1, 2, 3, 4, 5).

    Returns:
        pd.DataFrame: Aggregated OHLCV DataFrame indexed by Datetime.
    """
    # Convert API dict to DataFrame
    df = pd.DataFrame([{
        "Datetime": convert_epoch_to_datetime(c["datetime"]),
        "Open": c.get("open"),
        "High": c.get("high"),
        "Low": c.get("low"),
        "Close": c.get("close"),
        "Volume": c.get("volume"),
    } for c in candles["candles"]])

    # Ensure chronological order
    df.sort_values("Datetime", inplace=True)
    df.reset_index(drop=True, inplace=True)

    # Number of 30-min candles per aggregated candle
    normal_chunk_size = int(freq_hours * 2)

    aggregated_data = []

    # Group by date for day-wise processing
    df['Date'] = df['Datetime'].dt.date
    for date, group in df.groupby('Date'):
        group = group.reset_index(drop=True)

        i = 0
        while i < len(group):
            if freq_hours == 4:
                # For 4-hour aggregation, special handling for first chunk of day
                first_hour = group.loc[0, 'Datetime'].hour
                # If first hour is 0 or 4, chunk size for first candle is 4 (2 hours * 4 = 4 candles)
                # Else adjust the first chunk size to 4 (2 hours * 4 = 4 candles) starting at first_hour
                # You mentioned first real candle should start at 2 or 6 - so we just always take first 4 candles?
                # So let's assume first chunk is always 4 candles for first chunk of the day

                if i == 0:
                    chunk_size = 4
                else:
                    chunk_size = normal_chunk_size
            else:
                # For other frequencies, just normal chunk size
                chunk_size = normal_chunk_size

            chunk = group.iloc[i:i + chunk_size]
            if len(chunk) == 0:
                break

            aggregated_data.append({
                "Datetime": chunk.iloc[0]["Datetime"],
                "Open": chunk.iloc[0]["Open"],
                "High": chunk["High"].max(),
                "Low": chunk["Low"].min(),
                "Close": chunk.iloc[-1]["Close"],
                "Volume": chunk["Volume"].sum(),
            })
            i += chunk_size

    agdf = pd.DataFrame(aggregated_data)
    agdf.set_index("Datetime", inplace=True)
    return agdf


def filter_options(df, type):
    if type == "CALL":
        df = df[::-1]

        indexes_to_drop = []
        counter = 1

        for index, row in df.iterrows():
            if row["ITM"] is False:  # Check if 'ITM' column is True
                continue

            elif row["ITM"] is True and counter == 1:
                counter -= 1
                continue

            indexes_to_drop.append(index)

        # Drop the collected indexes
        df = df.drop(indexes_to_drop)
        df = df[::-1]
        return df
    else:
        indexes_to_drop = []
        counter = 1

        for index, row in df.iterrows():
            if row["ITM"] is False:  # Check if 'ITM' column is True
                continue

            elif row["ITM"] is True and counter == 1:
                counter -= 1
                continue

            indexes_to_drop.append(index)

        # Drop the collected indexes
        df = df.drop(indexes_to_drop)
        df = df[::-1]
        return df


def fetch_price_data(schwab, symbol, periodType, periods, time, freq, start, end):
    """
    Fetch price history from Schwab API.
    """
    if freq in [5, 10, 15, 30] and time == "minute" or periodType in ["year", "ytd", "month", "week"] or time == "day":
        response = schwab.price_history(
            symbol, periodType, periods, time, freq, start, end, True, True
        )
        df = _create_candle_dataframe(response) if len(response) > 0 else None
        # This removes the last row since its real-time
        # It can fluctuate into false signals.
        df = df.iloc[:-1]

    elif time == "hour":
        # For hourly data we need to fetch 30-minute intervals
        response = schwab.price_history(
            symbol, periodType, periods, "minute", 30, start, end, True, True
        )
        df = _aggregate_candle_dataframe(response, freq) if len(response) > 0 else None


    elif freq < 5 and time == "minute":
        response = schwab.price_history(
            symbol, periodType, periods, time, freq, start, end, True, True
        )
        price_history = yf.Ticker(symbol).history(
            period="1d", interval="1m", prepost=True
        )
        df = (
          _merge_candle_dataframe(response, freq, price_history)
           if response.ok
           else None
        )

    
    return df


def stream_price_data(schwab, symbol, start, end):
    """
    Fetch price history from Schwab API.
    """
    response = schwab.price_history(
        symbol, "day", 1, "minute", 5, start, end, True, True
    )
    df = _create_candle_dataframe(response) if response.ok else None
    return df


def fetch_price_data_from_file(file_path):
    """
    Fetch price history from market.csv file.
    """
    try:
        df = pd.read_csv(file_path, parse_dates=["Datetime"])
        df.set_index("Datetime", inplace=True)

        return df if not df.empty else None
    except Exception as e:
        logger.error(f"Error loading market data: {e}")
        return None


def market_is_open():
    """
    Check if the current time is within market hours
    """
    now = datetime.now()
    market_open = time(6, 30)  # e.g., 6:30 AM
    market_close = time(13,00)  # e.g., 12:58 PM
    return market_open <= now.time() <= market_close


def filter_market_hours(data, freq, date, market_open="06:30", market_close="13:00"):
    """
    Filter data for market hours and keep the last N records.
    """
    # Ensure the index is converted to datetime format
    if not isinstance(data.index, pd.DatetimeIndex):
        data.index = pd.to_datetime(
            data.index, format="%Y-%m-%d %H:%M:%S", errors="coerce"
        )

    if freq in [12, 16]:
        market_open = "06:24"
    if freq in [11, 14]:
        market_open = "06:26"

    unique_dates = data.index.normalize().unique()
    unique_dates = [d.date() for d in unique_dates]

    data_filtered = data.loc[
        (data.index.date == unique_dates[date - 1])
        & (data.index.time >= pd.to_datetime(market_open).time())
        & (data.index.time <= pd.to_datetime(market_close).time())
    ]
    return data_filtered


# --- universal parser ---
def _tf_minutes_from_name(name: str) -> int:
    """
    Extract timeframe in minutes from signal column name.
    Handles:
      - Call5, call15, Put30, put1h, Put1d
      - C1, CALL5, C30, CALL1H, CALL4H
      - P1, PUT5, P30, PUT1H, PUT4H
    Returns -1 if no match.
    """
    if not isinstance(name, str):
        return -1

    # match optional prefix + number + optional unit
    m = re.search(r'(?i)(?:up|dn|call|put|c|p)?\s*(\d+)\s*([mhdw]?)$', name.strip())
    if not m:
        return -1

    n = int(m.group(1))
    unit = m.group(2).lower()

    if unit == '' or unit == 'm':
        mult = 1
        if n == 1:
            return (n + 4) * mult
    elif unit == 'h':
        mult = 60
    elif unit == 'd':
        mult = 1440
    elif unit == 'w':
        mult = 10080
    else:
        mult = 1
    
    return n * mult

def strongest(cols):
    """Return (col, strength_minutes) for the strongest timeframe."""
    scored = [(c, _tf_minutes_from_name(c)) for c in cols]
    scored = [s for s in scored if s[1] >= 0]
    return max(scored, key=lambda x: x[1]) if scored else (None, -1)


def resolve_signals(call_signals: pd.DataFrame, put_signals: pd.DataFrame) -> pd.DataFrame:
    """
    Resolve signals row-by-row:
    - strongest CALL if multiple calls
    - strongest PUT if multiple puts
    - strongest overall if both CALL and PUT
    - None if no signals
    Returns DataFrame with columns:
    [time, winner_type, signal, strength_minutes, signals]
    """
    rows = []

    for idx in call_signals.index:
        # Collect True signals only
        call_hits = [c for c, v in call_signals.loc[idx].dropna().items() if bool(v)]
        put_hits  = [c for c, v in put_signals.loc[idx].dropna().items() if bool(v)]

        # strongest in each group
        call_col, call_w = strongest(call_hits)
        put_col,  put_w  = strongest(put_hits)

        # Build the "signals" string from all active signals
        active_signals = call_hits + put_hits
        signals_str = " vs ".join(active_signals) if active_signals else None

        if call_col and not put_col:  # only call
            rows.append((idx, "CALL", call_col, call_w, signals_str))
        elif put_col and not call_col:  # only put
            rows.append((idx, "PUT", put_col, put_w, signals_str))
        elif call_col and put_col:  # both
            if call_w > put_w:
                rows.append((idx, "CALL", call_col, call_w, signals_str))
            elif put_w > call_w:
                rows.append((idx, "PUT", put_col, put_w, signals_str))
            else:
                rows.append((idx, "TIE", f"{call_col} vs {put_col}", call_w, signals_str))
        else:  # neither
            rows.append((idx, None, False, 0, None))

    return pd.DataFrame(rows, columns=["time", "winner_signal_type", "winner_signal", "strength_minutes", "signals"])


# --- conflict resolution ---
def resolve_conflicts(call_signals: pd.DataFrame, put_signals: pd.DataFrame) -> pd.DataFrame:
    """
    Compare call/put signals row by row.
    If both fire: keep only the stronger one based on timeframe.
    Returns DataFrame with columns: 
      [time, winner_type, signal, strength_minutes, signals]
    """
    both_signals = call_signals.any(axis=1) & put_signals.any(axis=1)
    rows = []

    for idx in call_signals.index[both_signals]:
        # collect True signals only (ignore NaN/False)
        call_hits = [c for c, v in call_signals.loc[idx].dropna().items() if bool(v)]
        put_hits  = [c for c, v in put_signals.loc[idx].dropna().items() if bool(v)]
        if not call_hits or not put_hits:
            continue

        call_col, call_w = strongest(call_hits)
        put_col,  put_w  = strongest(put_hits)

        # all competing signals
        signals_str = " vs ".join(call_hits + put_hits)

        if call_w > put_w:
            rows.append((idx, "CALL", call_col, call_w, signals_str))
        elif put_w > call_w:
            rows.append((idx, "PUT",  put_col,  put_w, signals_str))
        else:
            rows.append((idx, "TIE", f"{call_col} vs {put_col}", call_w, signals_str))

    return pd.DataFrame(rows, columns=["time", "winner_signal_type", "winner_signal", "strength_minutes", "signals"])


def track_signal_lifetime(df: pd.DataFrame) -> pd.DataFrame:
    """
    Tracks intraday signals from 4:00 AM forward.
    Each signal lasts for Strength_Minutes unless replaced by a new signal.
    """

    df = df.copy()
    df["active_signal_type"] = None
    df["active_signal"] = None
    df["signal_expires"] = pd.NaT

    current_signal = None
    current_type = None
    signal_expiry = None

    for i, row in df.iterrows():
        ts = row["time"]

        # Reset at start of new trading day (4:00 AM)
        if ts.time() >= pd.to_datetime("04:00").time() and (
            i == 0 or df.loc[i-1, "time"].date() != ts.date()
        ):
            current_signal = None
            signal_expiry = None
            current_type = None

        # Check if signal triggered at this candle
        if pd.notna(row["winner_signal_type"]):
            strength = int(row["strength_minutes"])
            candidate_expiry = ts + pd.Timedelta(minutes=strength)

            # Replace if stronger (longer duration) or current expired
            if current_signal is None or candidate_expiry > signal_expiry:
                current_signal = row["winner_signal"]
                current_type = row["winner_signal_type"]
                signal_expiry = candidate_expiry

        # Expire if past due
        if signal_expiry is not None and ts > signal_expiry:
            current_signal = None
            signal_expiry = None
            current_type = None

        df.at[i, "active_signal_type"] = current_type
        df.at[i, "active_signal"] = current_signal
        df.at[i, "signal_expires"] = signal_expiry

    return df

