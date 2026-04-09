from datetime import datetime, time
import numpy as np
import logging
logger = logging.getLogger("trading")

def calculate_fractional_dte_hours():
    """
    Returns fractional trading days left until 4:00 PM Eastern
    based on current time.
    """
    now = datetime.now()
    market_open = datetime.combine(now.date(), time(6, 30))
    market_close = datetime.combine(now.date(), time(13, 0))

    # If market is closed, return 0
    if now >= market_close:
        return 0.0
    if now < market_open:
        hours_left = (market_close - market_open).seconds / 3600
    else:
        hours_left = (market_close - now).seconds / 3600

    trading_hours = 6.5
    return hours_left / trading_hours  # fraction of 1 trading day


def expected_move_tos_style(stock_price, atm_iv, dte):
    """
    Matches Thinkorswim's Expected Move calculation in parentheses.
    atm_iv is in decimal (e.g., 0.2058 for 20.58%)
    """
    if dte > 0:
        # Regular DTE calculation
        return stock_price * atm_iv * np.sqrt(dte / 365)
    else:
        # 0-DTE fractional hours adjustment
        fractional_dte = calculate_fractional_dte_hours()
        return stock_price * atm_iv * np.sqrt(fractional_dte / 365)

def compute_expected_move_bounds(open_price):
    # Ask user to input the expected move (float)
    try:
        logger.info("COMPUTING EXPECTED MOVE BOUNDS...")
        # Get the expected move from the user
        em = float(input("Enter the expected move in dollars: "))

        # Calculate upper and lower bounds
        upper_bound = open_price + em
        lower_bound = open_price - em
        logger.info(f"UPPER BOUND: {upper_bound}, LOWER BOUND: {lower_bound}")
        return upper_bound, lower_bound
    except Exception as e:
        logger.info(f"ERROR IN COMPUTING EXPECTED MOVE BOUNDS: {str(e)}")

    