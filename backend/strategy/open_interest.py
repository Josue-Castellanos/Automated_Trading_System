import pandas as pd
import yfinance as yf
from backend.utils import dates, datetime


def high_open_interest(symbol, top_n, strike_proximity):
    """
    Get the highest OI strikes above/below open price, 
    but constrained to be close to the open price.
    :param symbol: Ticker symbol
    :param top_n: Number of strikes above/below to return
    :param strike_proximity: Max dollar distance from open price
    """
    # Get today's open price
    price_data = yf.Ticker(symbol).history(period="1d", interval="1m")
    if price_data.empty:
        raise ValueError(f"No price data found for {symbol}")
    opening_price = price_data.iloc[0]["Open"]

    todays_data, weekly_data = _get_options_data(symbol)

    todays_curated = curated_high_oi_proximity(
        todays_data.calls, todays_data.puts, opening_price, label="Today",
        top_n=top_n, strike_proximity=strike_proximity
    )
    weekly_curated = curated_high_oi_proximity(
        weekly_data.calls, weekly_data.puts, opening_price, label="Weekly",
        top_n=top_n, strike_proximity=strike_proximity
    )

    return pd.concat([todays_curated, weekly_curated], ignore_index=True)


def _get_options_data(symbol):
    today_exp, friday_exp = dates(symbol)

    todays_options = yf.Ticker(symbol).option_chain(today_exp)
    weekly_options = yf.Ticker(symbol).option_chain(friday_exp)
    return todays_options, weekly_options


def curated_high_oi_proximity(call_data, put_data, opening_price, label, top_n, strike_proximity):
    # Calls ABOVE open and close to open
    calls_above = call_data[(call_data["strike"] > opening_price) &
                            (call_data["strike"] <= opening_price + strike_proximity)]
    calls_above_sorted = calls_above.sort_values(by="openInterest", ascending=False).head(top_n)

    # Puts BELOW open and close to open
    puts_below = put_data[(put_data["strike"] < opening_price) &
                          (put_data["strike"] >= opening_price - strike_proximity)]
    puts_below_sorted = puts_below.sort_values(by="openInterest", ascending=False).head(top_n)

    # Check if they are the same length, if not, pad the shorter with Nan
    # max_length = max(len(calls_above_sorted), len(puts_below_sorted))
    # calls_above_sorted = calls_above_sorted.reindex(range(max_length))
    # puts_below_sorted = puts_below_sorted.reindex(range(max_length))

    # Check if they are the same length, if not, shorten to the smaller length
    min_length = min(len(calls_above_sorted), len(puts_below_sorted))
    calls_above_sorted = calls_above_sorted.head(min_length)
    puts_below_sorted = puts_below_sorted.head(min_length)

    return pd.DataFrame({
        "Expiration": [label] * len(calls_above_sorted),
        "Opening Price": [opening_price] * len(calls_above_sorted),
        "Call Strike Above Open": calls_above_sorted["strike"].values,
        "Call OI": calls_above_sorted["openInterest"].values,
        "Put Strike Below Open": puts_below_sorted["strike"].values,
        "Put OI": puts_below_sorted["openInterest"].values
    })

