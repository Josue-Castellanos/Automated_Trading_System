import os
import json
import time
import base64
import requests
import threading
import webbrowser
from .streamV2 import Stream
from pathlib import Path
from datetime import datetime
from dotenv import load_dotenv


class Schwab():
    def __init__(self):
        """
        Initialize the Schwab class.
        
        This constructor sets up the necessary attributes and performs initial checks.
        """
        self._load_env()
        self.refreshToken = None
        self.accessToken = None
        self.idToken = None
        self.refreshTokenDateTime = None
        self.accessTokenDateTime = None
        self.refreshTokenTimeout = 7  # in days
        self.accessTokenTimeout = 1800  # in seconds
        self.callback_url = None
        self.stream = Stream(self)
        self.timeout = 5
        self._check_keys()
        self._token_manager("init")
        self._check_tokens()


    def _load_env(self):
        """
        Load environment variables from a .env file.
        
        Sets up API keys, account numbers, and endpoint URLs.
        """
        load_dotenv(dotenv_path=Path('./schwab/app_info/.env'))
        self.APP_KEY = os.getenv("appKey")
        self.SECRET_KEY = os.getenv("secretKey")
        self.ACCOUNT_NUMBER = os.getenv("accountNumber")
        self.CALLBACK_URL = "https://127.0.0.1"
        self.ACCOUNT_ENDPOINT = "https://api.schwabapi.com/trader/v1"
        self.MARKET_ENDPOINT = "https://api.schwabapi.com/marketdata/v1"
        self.POST = "https://api.schwabapi.com/v1/oauth/token"


    def _check_keys(self):
        """
        Verify the length of APP_KEY and SECRET_KEY.
        
        Exits the program if the keys are not the correct length.
        """
        if len(self.APP_KEY) != 32 or len(self.SECRET_KEY) != 16:
            quit()


    def _check_tokens(self):
        """
        Check if the refresh token or access token needs to be updated.
        
        Calls the appropriate token refresh method if necessary.
        """
        if (datetime.now() - self.refreshTokenDateTime).days >= (self.refreshTokenTimeout - 1):
            self._refresh_token()
        elif ((datetime.now() - self.accessTokenDateTime).days >= 1) or \
             ((datetime.now() - self.accessTokenDateTime).seconds > (self.accessTokenTimeout - 60)):
            self._access_token()


    def _post_access_token(self, grant_type, code):
        """
        Post a request to obtain an access token.
        
        Args:
            grant_type (str): The type of grant being requested.
            code (str): The authorization code or refresh token.
        
        Returns:
            dict: The JSON response containing the access token information.
        """
        headers = {
            'Authorization': f'Basic {base64.b64encode(bytes(f"{self.APP_KEY}:{self.SECRET_KEY}", "utf-8")).decode("utf-8")}',
            'Content-Type': 'application/x-www-form-urlencoded'
        }
        if grant_type == 'authorization_code':
            data = {'grant_type': 'authorization_code', 'code': code, 'redirect_uri': self.CALLBACK_URL}
        elif grant_type == 'refresh_token':
            data = {'grant_type': 'refresh_token', 'refresh_token': code}
        else:
            return None
        return requests.post(self.POST, headers=headers, data=data).json()


    def _access_token(self):
        """
        Refresh the access token using the current refresh token.
        """
        accessTokenFileTime, refreshTokenFileTime, tokenDictionary = self._token_manager("getFile")
        self._token_manager("set", datetime.now(), refreshTokenFileTime, self._post_access_token('refresh_token', tokenDictionary.get('refresh_token')))


    def _refresh_token(self):
        """
        Obtain a new refresh token by opening the authorization URL in a web browser.
        """
        authUrl = f'https://api.schwabapi.com/v1/oauth/authorize?response_type=code&client_id={self.APP_KEY}&redirect_uri={self.CALLBACK_URL}'
        webbrowser.open(authUrl)

        callbackURL = input("Please enter the redirect URL:")

        code = f"{callbackURL.split('code=')[1].split('%40')[0]}@"
        tokenDictionary = self._post_access_token('authorization_code', code)
        self._token_manager("set", datetime.now(), datetime.now(), tokenDictionary)


    def set_callback_url(self, url):
        """
        Set the callback URL for the OAuth flow.
        
        Args:
            url (str): The callback URL to be set.
        """
        self.callback_url = url


    def _token_manager(self, todo=None, accessTokenTime=None, refreshTokenTime=None, tokenDict=None):
        """
        Manage token operations such as reading, writing, and updating token information.
        
        Args:
            todo (str): The operation to perform.
            accessTokenTime (datetime): The access token timestamp.
            refreshTokenTime (datetime): The refresh token timestamp.
            tokenDict (dict): The dictionary containing token information.
        
        Returns:
            tuple or None: Depending on the operation, may return token information.
        """
        envPath = "schwab/app_info/.env"
        accessTokenTimeFormat = "%Y-%m-%d %H:%M:%S"
        refreshTokenTimeFormat = "%Y-%m-%d %H:%M:%S"

        def write_token_var(att, rtt, td):
            """

            """
            self.refreshToken = td.get("refresh_token")
            self.accessToken = td.get("access_token")
            self.accessTokenDateTime = att
            self.refreshTokenDateTime = rtt
            self.idToken = td.get("id_token")

        def write_token_file(newAccessTokenTime, newRefreshTokenTime, newTokenDict):
            """

            """
            with open(envPath, "r") as file:
                lines = file.readlines()
            for i, line in enumerate(lines):
                if line.startswith("accessTokenDateTime"):
                    lines[i] = f"accessTokenDateTime = {newAccessTokenTime.strftime(accessTokenTimeFormat)}\n"
                elif line.startswith("refreshTokenDateTime"):
                    lines[i] = f"refreshTokenDateTime = {newRefreshTokenTime.strftime(refreshTokenTimeFormat)}\n"
                elif line.startswith("jsonDict"):
                    lines[i] = f"jsonDict = {json.dumps(newTokenDict)}\n"
                elif line.startswith("accessToken"):
                    lines[i] = f"accessToken = {newTokenDict.get('access_token')}\n"
                elif line.startswith("refreshToken"):
                    lines[i] = f"refreshToken = {newTokenDict.get('refresh_token')}\n"
                elif line.startswith("idToken"):
                    lines[i] = f"idToken = {newTokenDict.get('id_token')}\n"
                    break
            with open(envPath, "w") as file:
                file.writelines(lines)
                file.flush()

        def read_token_file():
            """

            """
            with open(envPath, "r") as file:
                formattedAccessTokenTime = datetime.strptime(file.readline().split('=')[1].strip(), accessTokenTimeFormat)
                formattedRefreshTokenTime = datetime.strptime(file.readline().split('=')[1].strip(), refreshTokenTimeFormat)
                formattedTokenDict = json.loads(file.readline().split('=')[1].strip())
                return formattedAccessTokenTime, formattedRefreshTokenTime, formattedTokenDict

        try:
            if todo == "getFile":
                return read_token_file()
            elif todo == "set":
                if accessTokenTime is not None and refreshTokenTime is not None and tokenDict is not None:
                    write_token_file(accessTokenTime, refreshTokenTime, tokenDict)
                    write_token_var(accessTokenTime, refreshTokenTime, tokenDict)
                else:
                    pass
            elif todo == "init":
                accessTokenTime, refreshTokenTime, tokenDict = read_token_file()
                write_token_var(accessTokenTime, refreshTokenTime, tokenDict)
        except Exception as e:
            self._refresh_token()


    def _request_handler(self, response):
        """
        Handle the API response and return the JSON content if successful.
        
        Args:
            response (requests.Response): The API response object.
        
        Returns:
            dict or None: The JSON content of the response if successful, None otherwise.
        """
        try:
            if response.ok:
                return response.json()
        except json.decoder.JSONDecodeError:
            return None
        except AttributeError:
            return None


    def _params_parser(self, params):
        """
        Parse and filter out None values from the parameter dictionary.
        
        Args:
            params (dict): The dictionary of parameters.
        
        Returns:
            dict: A new dictionary with None values removed.
        """
        return {k: v for k, v in params.items() if v is not None}


    def _time_converter(self, dt, format=None):
        """
        Convert datetime objects to the specified format.
        
        Args:
            dt (datetime or str): The datetime to convert.
            format (str): The desired output format ('epoch' or 'iso').
        
        Returns:
            int or str or None: The converted datetime, or None if input is None.
        """
        if format == "epoch" and dt is not None:
            return int(dt.timestamp() * 1000)
        elif format == "iso" and dt is not None:
            return dt + 'T00:00:00.000Z'
        elif dt is None:
            return None


    def update_tokens_automatic(self):
        """
        Start a background thread to automatically update tokens when they expire.
        """
        def checker():
            while True:
                self._check_tokens()
                time.sleep(60)
        threading.Thread(target=checker, daemon=True).start()


    def account_numbers(self):
        """
        Retrieve all linked account numbers and hashes.

        Returns:
            requests.Response: The API response containing account numbers and hashes.

        Note:
            Account numbers in plain text cannot be used outside of headers or request/response bodies.
            This method should be invoked first to retrieve encrypted account values for subsequent calls.
        """
        return requests.get(f'{self.ACCOUNT_ENDPOINT}/accounts/accountNumbers', 
                            headers={'Authorization': f'Bearer {self.accessToken}'})


    def accounts(self, fields=None):
        """
        Retrieve information for all linked accounts.

        Args:
            fields (str, optional): Fields to return (e.g., "positions").

        Returns:
            requests.Response: The API response containing details for all linked accounts.

        Note:
            Balances are displayed by default. Positions are displayed based on the "positions" flag.
        """
        return requests.get(f'{self.ACCOUNT_ENDPOINT}/accounts/', 
                            headers={'Authorization': f'Bearer {self.accessToken}'}, 
                            params=self._params_parser({'fields': fields}))


    def account_number(self, accountNumber=None, fields=None):
        """
        Retrieve information for a specific account.

        Args:
            accountNumber (str): Account hash from account_numbers().
            fields (str, optional): Fields to return.

        Returns:
            requests.Response: The API response containing details for the specified account.

        Note:
            Balance information is displayed by default. Positions are returned based on the "positions" flag.
        """
        return requests.get(f'{self.ACCOUNT_ENDPOINT}/accounts/{accountNumber}', 
                            headers={'accept': 'application/json', 'Authorization': f'Bearer {self.accessToken}'}, 
                            params=self._params_parser({'fields': fields}))


    def get_orders(self, maxResults, fromEnteredTime, toEnteredTime, accountNumber=None, status=None):
        """
        Retrieve orders for a specific account.

        Args:
            maxResults (int): Maximum number of results to return.
            fromEnteredTime (datetime | str): Start of the time range.
            toEnteredTime (datetime | str): End of the time range.
            accountNumber (str, optional): Account hash from account_linked().
            status (str, optional): Order status filter.

        Returns:
            requests.Response: The API response containing orders for the specified account.

        Note:
            Maximum date range is 1 year.
        """
        return requests.get(f'{self.ACCOUNT_ENDPOINT}/accounts/{accountNumber}/orders', 
                            headers={"Accept": "application/json", 'Authorization': f'Bearer {self.accessToken}'}, 
                            params=self._params_parser({
                                'maxResults': maxResults, 
                                'fromEnteredTime': self._time_converter(fromEnteredTime, format="iso"), 
                                'toEnteredTime': self._time_converter(toEnteredTime, format="iso"), 
                                'status': status
                            }))


    def post_orders(self, order, accountNumber=None):
        """
        Place an order for a specific account.

        Args:
            order (dict): Order details dictionary.
            accountNumber (str, optional): Account hash from account_linked().

        Returns:
            requests.Response: The API response containing the order number in the response header.

        Note:
            If the order is immediately filled, the order number may not be returned.
        """
        return requests.post(f'{self.ACCOUNT_ENDPOINT}/accounts/{accountNumber}/orders', 
                             headers={'Authorization': f'Bearer {self.accessToken}', 'Content-Type': 'application/json'}, 
                             json=order, timeout=self.timeout)


    def delete_order_id(self, orderId, accountNumber=None):
        """
        Cancel a specific order by its ID for a specific account.

        Args:
            orderId (str): The ID of the order to cancel.
            accountNumber (str, optional): Account hash from account_linked().

        Returns:
            requests.Response: The API response indicating the result of the cancellation.
        """
        return requests.delete(f'{self.ACCOUNT_ENDPOINT}/accounts/{accountNumber}/orders/{orderId}', 
                               headers={'Authorization': f'Bearer {self.accessToken}'})


    def get_order_id(self, orderId, accountNumber=None):
        """
        Retrieve details of a specific order by its ID for a specific account.

        Args:
            orderId (str): The ID of the order to retrieve.
            accountNumber (str, optional): Account hash from account_linked().

        Returns:
            requests.Response: The API response containing the order details.
        """
        return requests.get(f'{self.ACCOUNT_ENDPOINT}/accounts/{accountNumber}/orders/{orderId}', 
                            headers={"Accept": "application/json", 'Authorization': f'Bearer {self.accessToken}'})


    def get_chains(self, symbol, contractType=None, strikeCount=None, includeQuotes=None, 
                   strategy=None, interval=None, strike=None, range=None, fromDate=None, toDate=None, 
                   volatility=None, underlyingPrice=None, interestRate=None, daysToExpiration=None, 
                   expMonth=None, optionType=None, entitlement=None):
        """
        Retrieve option chain information for a given symbol.

        Args:
            symbol (str): The underlying symbol.
            contractType (str, optional): Type of contracts to return ("CALL", "PUT", "ALL").
            strikeCount (int, optional): The number of strikes to return above and below the current price.
            includeQuotes (bool, optional): Include quotes for options in the option chain.
            strategy (str, optional): Option strategy type.
            interval (float, optional): Strike interval for spread strategy chains.
            strike (float, optional): Strike price.
            range (str, optional): Range of contracts to return.
            fromDate (str, optional): Start date for contracts.
            toDate (str, optional): End date for contracts.
            volatility (float, optional): Volatility to use in calculations.
            underlyingPrice (float, optional): Underlying price to use in calculations.
            interestRate (float, optional): Interest rate to use in calculations.
            daysToExpiration (int, optional): Days to expiration to use in calculations.
            expMonth (str, optional): Expiration month.
            optionType (str, optional): Type of options to return.
            entitlement (str, optional): Entitlement to use in calculations.

        Returns:
            requests.Response: The API response containing the option chain information.
        """
        return requests.get(f'{self.MARKET_ENDPOINT}/chains', 
                            headers={"Accept": "application/json", 'Authorization': f'Bearer {self.accessToken}'}, 
                            params=self._params_parser({
                                'symbol': symbol, 'contractType': contractType, 'strikeCount': strikeCount, 
                                'includeQuotes': includeQuotes, 'strategy': strategy, 
                                'interval': interval, 'strike': strike, 'range': range, 'fromDate': fromDate, 
                                'toDate': toDate, 'volatility': volatility, 'underlyingPrice': underlyingPrice, 
                                'interestRate': interestRate, 'daysToExpiration': daysToExpiration, 
                                'expMonth': expMonth, 'optionType': optionType, 'entitlement': entitlement
                            }))


    def get_expiration_chain(self, symbol):
        """
        Retrieve the option expiration chain for a given symbol.

        Args:
            symbol (str): The underlying symbol.

        Returns:
            requests.Response: The API response containing the option expiration chain.
        """
        return requests.get(f'{self.MARKET_ENDPOINT}/expirationchain', 
                            headers={'Authorization': f'Bearer {self.accessToken}'}, 
                            params=self._params_parser({'symbol': symbol}))


    def order_replace(self, accountHash, orderId, order):
        """
        Replace an existing order for an account.

        Args:
            accountHash (str): Account hash from account_linked().
            orderId (str): The ID of the order to replace.
            order (dict): New order details.

        Returns:
            requests.Response: The API response indicating the result of the order replacement.

        Note:
            The existing order will be canceled and a new order will be created.
        """
        return requests.put(f'{self.ACCOUNT_ENDPOINT}/accounts/{accountHash}/orders/{orderId}',
                            headers={"Accept": "application/json", 'Authorization': f'Bearer {self.accessToken}',
                                     "Content-Type": "application/json"},
                            json=order)


    def account_orders_all(self, fromEnteredTime, toEnteredTime, maxResults=None, status=None):
        """
        Retrieve all orders for all accounts within a specified time range.

        Args:
            fromEnteredTime (datetime | str): Start of the time range.
            toEnteredTime (datetime | str): End of the time range.
            maxResults (int, optional): Maximum number of results to return (default is 3000).
            status (str, optional): Filter orders by status.

        Returns:
            requests.Response: The API response containing all orders across all accounts.
        """
        return requests.get(f'{self.ACCOUNT_ENDPOINT}/orders',
                            headers={"Accept": "application/json", 'Authorization': f'Bearer {self.accessToken}'},
                            params=self._params_parser(
                                {'maxResults': maxResults, 'fromEnteredTime': self._time_converter(fromEnteredTime, format="iso"),
                                 'toEnteredTime': self._time_converter(toEnteredTime, format="iso"), 'status': status}))


    def transactions(self, accountHash, startDate, endDate, types, symbol=None):
        """
        Retrieve transactions for a specific account within a date range.

        Args:
            accountHash (str): Account hash number.
            startDate (datetime | str): Start date for the transaction search.
            endDate (datetime | str): End date for the transaction search.
            types (str): Transaction types to include.
            symbol (str, optional): Symbol to filter transactions by.

        Returns:
            requests.Response: The API response containing the list of transactions.

        Note:
            Maximum number of transactions in response is 3000. Maximum date range is 1 year.
        """
        return requests.get(f'{self.ACCOUNT_ENDPOINT}/accounts/{accountHash}/transactions',
                            headers={'Authorization': f'Bearer {self.accessToken}'},
                            params=self._params_parser(
                                {'accountNumber': accountHash, 'startDate': self._time_converter(startDate, format="iso"),
                                 'endDate': self._time_converter(endDate, format="iso"), 'symbol': symbol, 'types': types}))


    def transaction_details(self, accountHash, transactionId):
        """
        Retrieve details of a specific transaction for a given account.

        Args:
            accountHash (str): Account hash number.
            transactionId (int): The ID of the transaction to retrieve.

        Returns:
            requests.Response: The API response containing the transaction details.
        """
        return requests.get(f'{self.ACCOUNT_ENDPOINT}/accounts/{accountHash}/transactions/{transactionId}',
                            headers={'Authorization': f'Bearer {self.accessToken}'},
                            params={'accountNumber': accountHash, 'transactionId': transactionId})


    def preferences(self):
        """
        Retrieve user preference information for the logged-in user.

        Returns:
            requests.Response: The API response containing user preferences and streaming info.
        """
        return requests.get(f'{self.ACCOUNT_ENDPOINT}/userPreference',
                            headers={'Authorization': f'Bearer {self.accessToken}'})


    # """
    # Market Data
    # """

    def price_history(self, symbol, periodType=None, period=None, frequencyType=None, frequency=None, 
                      startDate=None, endDate=None, needExtendedHoursData=None, needPreviousClose=None):
        """
        Retrieve price history for a specific symbol.

        Args:
            symbol (str): The symbol to retrieve price history for.
            periodType (str, optional): The type of period to show ("day", "month", "year", "ytd").
            period (int, optional): The number of periods to show.
            frequencyType (str, optional): The type of frequency with which to retrieve data ("minute", "daily", "weekly", "monthly").
            frequency (int, optional): The number of the frequencyType to be included in each candle.
            startDate (datetime | str, optional): Start date for results (inclusive).
            endDate (datetime | str, optional): End date for results (inclusive).
            needExtendedHoursData (bool, optional): Include extended hours data.
            needPreviousClose (bool, optional): Include previous close data.

        Returns:
            requests.Response: The API response containing the price history data.
        """
        return requests.get(f'{self.MARKET_ENDPOINT}/pricehistory', 
                            headers={"Accept": "application/json", 'Authorization': f'Bearer {self.accessToken}'}, 
                            params=self._params_parser({
                                'symbol': symbol, 'periodType': periodType, 'period': period, 
                                'frequencyType': frequencyType, 'frequency': frequency, 
                                'startDate': self._time_converter(startDate, format="epoch"), 
                                'endDate': self._time_converter(endDate, format="epoch"), 
                                'needExtendedHoursData': needExtendedHoursData, 
                                'needPreviousClose': needPreviousClose
                            }))
    

    def movers(self, symbol, sort=None, frequency=None):
        """
        Retrieve movers (most active stocks) for a specific index.

        Args:
            symbol (str): The index symbol (e.g., "$DJI", "$COMPX", "$SPX").
            sort (str, optional): Sorting criteria for the movers.
            frequency (int, optional): Frequency of the mover data.

        Returns:
            requests.Response: The API response containing the movers data.
        """
        return requests.get(f'{self.MARKET_ENDPOINT}/movers/{symbol}',
                            headers={'Authorization': f'Bearer {self.accessToken}'},
                            params=self._params_parser({'sort': sort, 'frequency': frequency}))


    def market_hours(self, symbols, date=None):
        """
        Retrieve market hours for specified markets on a given date.

        Args:
            symbols (list): List of market symbols (e.g., "equity", "option", "future").
            date (datetime | str, optional): The date to retrieve market hours for.

        Returns:
            requests.Response: The API response containing market hours information.
        """
        return requests.get(f'{self.MARKET_ENDPOINT}/markets',
                            headers={'Authorization': f'Bearer {self.accessToken}'},
                            params=self._params_parser(
                                {'markets': symbols,
                                 'date': self._time_converter(date, 'YYYY-MM-DD')}))


    def market_hour(self, market_id, date=None):
        """
        Retrieve market hours for a single market on a given date.

        Args:
            market_id (str): The market identifier (e.g., "equity", "option", "future").
            date (datetime | str, optional): The date to retrieve market hours for.

        Returns:
            requests.Response: The API response containing market hours information for the specified market.
        """
        return requests.get(f'{self.MARKET_ENDPOINT}/markets/{market_id}',
                            headers={'Authorization': f'Bearer {self.accessToken}'},
                            params=self._params_parser({'date': self._time_converter(date, 'YYYY-MM-DD')}))


    def instruments(self, symbol, projection):
        """
        Search for instruments based on specific criteria.

        This method allows searching for financial instruments using various projection types.

        Args:
            symbol (str): The symbol or search string to use for the instrument search.
            projection (str): The type of search to perform. Valid options are:
                - "symbol-search": Retrieve instrument data for a specific symbol or cusip.
                - "symbol-regex": Retrieve instrument data for all symbols matching regex.
                - "desc-search": Retrieve instrument data for instruments whose description contains the word supplied.
                - "desc-regex": Retrieve instrument data for instruments whose description matches the supplied regex.
                - "fundamental": Retrieve fundamental data for a specific symbol.

        Returns:
            requests.Response: The API response containing the instrument data based on the search criteria.

        Raises:
            ValueError: If an invalid projection type is provided.

        Note:
            The behavior and returned data will vary based on the chosen projection type.
        """
        valid_projections = ["symbol-search", "symbol-regex", "desc-search", "desc-regex", "fundamental"]
        if projection not in valid_projections:
            raise ValueError(f"Invalid projection type. Must be one of {valid_projections}")

        return requests.get(f'{self.MARKET_ENDPOINT}/instruments',
                            headers={'Authorization': f'Bearer {self.accessToken}'},
                            params={'symbol': symbol, 'projection': projection})


    def instrument_cusip(self, cusip_id):
        """
        Retrieve instrument data for a specific CUSIP (Committee on Uniform Securities Identification Procedures) identifier.

        This method fetches detailed information about a financial instrument using its CUSIP number.

        Args:
            cusip_id (str): The CUSIP identifier of the instrument to retrieve.

        Returns:
            requests.Response: The API response containing detailed instrument data for the specified CUSIP.

        Note:
            CUSIP is a nine-character alphanumeric code that identifies a North American financial security for the purposes of 
            facilitating clearing and settlement of trades.
        """
        return requests.get(f'{self.MARKET_ENDPOINT}/instruments/{cusip_id}',
                            headers={'Authorization': f'Bearer {self.accessToken}'})