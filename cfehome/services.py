from datetime import datetime, timedelta
from app.schwab import Schwab
from app.sheet import Sheet
from app.config import Settings
import re



class AppService:
    def __init__(self):
        self._schwab = Schwab()
        self._sheet = Sheet()
        self.today = datetime.now()
        self.tomorrow = self.today + timedelta(days=1)


    def get_account_data(self):
        try:
            account_hash = self._schwab.account_numbers()[0].get("hashValue")
            if not account_hash:
                raise ValueError("No account hash found")

            account_data = self._schwab.account_number(account_hash, "positions")
            if not account_data:
                raise ValueError("No account data returned from Schwab API")
            
            initial_cash_balance = account_data["securitiesAccount"]["initialBalances"]["cashBalance"]
            current_balances = account_data["securitiesAccount"]["currentBalances"]

            total_cash = current_balances["totalCash"]
            cash_available_for_trading = current_balances["cashAvailableForTrading"]
            cash_available_for_withdrawal = current_balances["cashAvailableForWithdrawal"]

            # Calculate total gain/loss
            total_gain_loss = total_cash - initial_cash_balance

            # Create the new dictionary
            portfolio_data = {
                "totalCash": total_cash,
                "cashAvailableForTrading": cash_available_for_trading,
                "cashAvailableForWithdrawal": cash_available_for_withdrawal,
                "totalGainLoss": total_gain_loss
            }

            return portfolio_data
        except ValueError as e:
            return {"error": str(e)}
        except Exception as e:
            return {"error": f"An error occurred: {str(e)}"}
        

    def get_performance_sheet(self):
        df = self._sheet.read_sheet()
        data_dict = df.to_dict(orient="records")

        # Keys to remove
        keys_to_remove = ['Tgt$Gain', 'Tgt$Balance', 'Tot$Risk', 'Tot%Risk', 'Act$Risk']

        data_dict = [
            {
                key.lower().replace('$', '__').replace('#', '_').replace('%', '_').replace('-', ''): value 
                for key, value in record.items() 
                if key not in keys_to_remove
            }
            for record in data_dict
            ]
        return data_dict
    

    def get_account_orders(self):
        all_account_orders = self._schwab.all_orders(fromEnteredTime=self.order_date(), toEnteredTime=self.tomorrow.strftime("%Y-%m-%d"), maxResults=50, status='FILLED')

        order_dict = []

        for record in all_account_orders:
            # Extract quantity, price, and time
            quantity = record["quantity"]
            price = record["price"]
            enter_time = record["enteredTime"]

            # Convert ISO time to regular time
            dt = datetime.strptime(enter_time, '%Y-%m-%dT%H:%M:%S%z')
            date = time = dt.strftime('%Y-%m-%d')
            time = dt.strftime('%H:%M:%S')

            # Navigate to the instrument details
            instrument_details = record["orderLegCollection"][0]["instrument"]
            order_type = record["orderLegCollection"][0]["instruction"]

            # Extract the order type
            if order_type.startswith('S'):
                order_type = order_type[:4]
            else:
                order_type = order_type[:3]

            # Extract putCall, underlyingSymbol, and description
            option_type = instrument_details["putCall"]
            ticker = instrument_details["underlyingSymbol"]
            description = instrument_details["description"]


            # Extract strike price using regex
            match = re.search(r'\$\d{3}', description)
            strike = match.group() if match else None

            # Add the extracted details to the order_dict
            order_dict.append({
                    "order": order_type,
                    "date": date,
                    "time": time,
                    "contract": description,
                    "quantity": quantity,
                    "price": price,
                    "type": option_type,
                    "ticker": ticker,
                    "strike": strike,
                })        
        return order_dict
        

    def order_date(self):
        within_60_days = 360
        from_entered_date = self.today - timedelta(days=within_60_days)
        return from_entered_date.strftime("%Y-%m-%d")
    

app_service = AppService()
