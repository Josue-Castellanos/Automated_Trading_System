from datetime import datetime, timedelta
from gmail import gmail_api
from data import data_manager
from datetime import datetime
from schwab import schwab_api
from schwab.schwab_api import Schwab
from strategy import high_open_interest
import time



CALL_STRIKES, PUT_STRIKES = high_open_interest.retrieveData()
YESTERDAY = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
TODAY = datetime.now().strftime("%Y-%m-%d")
FRIDAY = (datetime.now() + timedelta(days=3)).strftime("%Y-%m-%d")
SATURDAY = (datetime.now() + timedelta(days=2)).strftime("%Y-%m-%d")
TOMORROW = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")

def putEventHandler(PUTEVENT):
    while True:
        PUTEVENT.wait()
        # Check if there's an ACTIVE call order, if so, sell it and continue with buying process
        _CheckInPosition()

        #
        best_put_contract = _BestContract('PUT')
        if best_put_contract == None:
            pass
        else:
            _GetInPosition(best_put_contract, 'P')
        PUTEVENT.clear()
        

def callEventHandler(CALLEVENT):
    # Create Order Object
    while True:
        CALLEVENT.wait()
        # Check if there's an ACTIVE put order, if so, sell it and continue with buying process
        _CheckInPosition()

        #
        best_call_contract = _BestContract('CALL')
        if best_call_contract == None:
            pass
        else:
            _GetInPosition(best_call_contract, 'C')
        CALLEVENT.clear()


def _BestContract(type):
    # Check if there is a ACTIVE call order, if so, sell it and continue with buying process of put order
    # Get Chain Option                       6
    options = Schwab.getChains('SPY', type, '7', 'TRUE', '', '', '', 'OTM', TOMORROW, TOMORROW)
    strike_price_df = data_manager.createDataFrame(options = options, type = type)

    # Search through Dataframe to see whats the best delta and near the money contracts 
    if type == 'PUT':
        filtered_delta_result = strike_price_df.loc[strike_price_df['Delta'] <= -0.18]

    elif type == 'CALL':
        filtered_delta_result = strike_price_df.loc[strike_price_df['Delta'] >= 0.18]

    # Search through the filtered delta results for contracts with a reasonable Ask price
    filtered_ask_result = filtered_delta_result.loc[filtered_delta_result['Ask'] <= 0.46]

    # Calculate ROI for best contract

    # Pick the top contract
    if not filtered_ask_result.empty:
        contract = filtered_ask_result.iloc[0]

        # Create Order Object for post request
        buy_order = _CreateOrder(contract.get('Ask'), contract.get('Symbol'), 'BUY')
    
        return buy_order
    else:
        print("ERROR: No contracts met conditions, ignore signal")
        return None
  

def _GetInPosition(order,type):
    # Get encrypted account number (hash value)
    hash = Schwab.accountNumbers()[0].get('hashValue')
    # Place order
    Schwab.postOrders(order, accountNumber=hash)
    data_manager.createDataFrame(put=order)     # MERGER CALL AND PUT DATAFRAMES in DATAMANAGER

    # Periodically check the Delta
    while True:
        # Wait for 60 seconds
        time.sleep(5)

        inPosition = True
        # Get all orders
        orders = Schwab.getOrders(10, TODAY, FRIDAY, accountNumber=hash, status='PENDING_ACTIVATION') 
        # ACCEPTED, PENDING_ACTIVATION, REJECTED, CANCELED, REPLACED, FILLED, EXPIRED, NEW, 

        # Extract OrderID's to check the contracts ROI%
        order_ids = [order["orderId"] for order in orders]

        if not order_ids:
            break

        for order_id in order_ids:
            # Get Orders with OrderId's 
            contract = Schwab.getOrderId(order_id, accountNumber=hash)
            # Extract current prices --- THIS IS NOT WORKING DURING LIVE TRADING
            price = contract["price"]

            for leg in contract["orderLegCollection"]:
                symbol = leg["instrument"]["symbol"]
                print(f"Symbol: {symbol}, Price: {price}")

                if type == symbol[12:13]:
                    if price >= price * 1.5 or price <= price * 0.3:
                        sell_order = _CreateOrder(price, symbol, 'SELL')

                        Schwab.postOrders(sell_order, accountNumber=hash)
                        #data_manager.storeData(put=sell_order)      # MERGER CALL AND PUT DATAFRAMES in DATAMANAGER
                        break
                else: 
                    inPosition = False
                    break
            if not inPosition:
                break   
        if not inPosition:
            break


def _CheckInPosition():
    # Get encrypted account number (hash value)
    hash = Schwab.accountNumbers()[0].get('hashValue')

     # Get all orders
    orders = Schwab.getOrders(10, TODAY, FRIDAY, accountNumber=hash, status='PENDING_ACTIVATION') 
    # ACCEPTED, PENDING_ACTIVATION, REJECTED, CANCELED, REPLACED, FILLED, EXPIRED, NEW

    if not orders:
        pass
    else:
        # Extract OrderID's to check the contracts ROI%
        order_ids = [order["orderId"] for order in orders]

        for order_id in order_ids:
            # Get Orders with OrderId's 
            contract = Schwab.getOrderId(order_id, accountNumber=hash)
            # Extract current prices --- THIS IS NOT WORKING DURING LIVE TRADING
            price = contract["price"]

            for leg in contract["orderLegCollection"]:
                symbol = leg["instrument"]["symbol"]
                print(f"Symbol: {symbol}, Price: {price}")

                sell_order = _CreateOrder(price, symbol, 'SELL')

                Schwab.postOrders(sell_order, accountNumber=hash)
                #data_manager.storeData(put=sell_order)      # MERGER CALL AND PUT DATAFRAMES in DATAMANAGER


def _CreateOrder(price, symbol, type):
    order = {
        'orderType': 'LIMIT',
        'session': 'NORMAL',
        'price': price,  # Aiming for 100% ROI
        'duration': 'DAY',
        'orderStrategyType': 'SINGLE',
        'orderLegCollection': [{
            'instruction': f'{type}_TO_OPEN',
            'quantity': 1,
            'instrument': {
                'symbol': symbol,
                'assetType': 'OPTION'
                }
        }]
    }
    return order


def initiateTradingBot():
    # Save Levels To File
    data_manager.createDataFrame(calls=CALL_STRIKES, puts=PUT_STRIKES)

    # Start Email Scrapping Automatically, trigger event when signal is received 
    gmail_api.checkEmailAutomatic(gmail_api.CALLEVENT, gmail_api.PUTEVENT)
    
if __name__ == '__main__':
    print("Automated Robot Connecting To API's...")
    schwab_api.initialize()
    schwab_api.updateTokensAutomatic()
    print("Schwab API Authenticated")
    gmail_api.initialize()  
    print("Gmail API Authenticated")
    print("Automated Robot Connected...\n")
    initiateTradingBot()