
def return_on_investment(atm_price: float, strike_price_df: float) -> float:
    """
    Calculate the Return on Investment (ROI) for a trading strategy.
    
    This function computes the ROI based on the initial investment and the final value of the investment.
    
    Returns:
        float: The ROI as a percentage.
    """

   # ((ATM STRIKE PRICE / OTM STRIKE PRICE) - 1) * 100 
    roi = ((atm_price / strike_price_df) - 1) * 100  
    return roi