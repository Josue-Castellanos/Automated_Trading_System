import os
import json
import time
import base64
import requests
import threading
import webbrowser
from pathlib import Path
from datetime import datetime
from dotenv import load_dotenv

class Schwab:
    def __init__(self, log_signal =None):
        self._load_env()
        self.refreshToken = None
        self.accessToken = None
        self.idToken = None
        self.refreshTokenDateTime = None
        self.accessTokenDateTime = None
        self.refreshTokenTimeout = 7 # in days
        self.accessTokenTimeout = 1800 # in seconds
        self.log_signal = log_signal


    def _load_env(self):
        load_dotenv(dotenv_path=Path('./schwab/app_info/.env'))
        self.APP_KEY = os.getenv("appKey")
        self.SECRET_KEY = os.getenv("secretKey")
        self.ACCOUNT_NUMBER = os.getenv("accountNumber")
        self.CALLBACK_URL = "https://127.0.0.1"
        self.ACCOUNT_ENDPOINT = "https://api.schwabapi.com/trader/v1"
        self.MARKET_ENDPOINT = "https://api.schwabapi.com/marketdata/v1"
        self.POST = "https://api.schwabapi.com/v1/oauth/token"

    def initialize(self):
        self._check_keys()
        self._token_manager("init")
        self._check_tokens()

    def _check_keys(self):
        if self.log_signal is None:
            pass
        else:
            self.log_signal.emit("Checking keys...")

            if len(self.APP_KEY) != 32 or len(self.SECRET_KEY) != 16:
                self.log_signal.emit("Incorrect keys or no keys found, add keys in modules/.env")
                quit()
            else:
                self.log_signal.emit("Keys are valid")

    def _check_tokens(self):
        if (datetime.now() - self.refreshTokenDateTime).days >= (self.refreshTokenTimeout - 1):
            self.log_signal.emit("The refresh token has expired, updating automatically")
            self._refresh_token()
        elif ((datetime.now() - self.accessTokenDateTime).days >= 1) or \
             ((datetime.now() - self.accessTokenDateTime).seconds > (self.accessTokenTimeout - 60)):
            self.log_signal.emit("The access token has expired, updating automatically")
            self._access_token()
        else:
            if self.log_signal is not None:
                self.log_signal.emit("Access and Refresh tokens are still valid")


    def _post_access_token(self, grant_type, code):
        headers = {
            'Authorization': f'Basic {base64.b64encode(bytes(f"{self.APP_KEY}:{self.SECRET_KEY}", "utf-8")).decode("utf-8")}',
            'Content-Type': 'application/x-www-form-urlencoded'
        }
        if grant_type == 'authorization_code':
            data = {'grant_type': 'authorization_code', 'code': code, 'redirect_uri': self.CALLBACK_URL}
        elif grant_type == 'refresh_token':
            data = {'grant_type': 'refresh_token', 'refresh_token': code}
        else:
            self.log_signal.emit("Invalid grant type")
            return None
        return requests.post(self.POST, headers=headers, data=data).json()

    def _access_token(self):
        accessTokenFileTime, refreshTokenFileTime, tokenDictionary = self._token_manager("getFile")
        self._token_manager("set", datetime.now(), refreshTokenFileTime, 
                            self._post_access_token('refresh_token', tokenDictionary.get('refresh_token')))
        self.log_signal.emit(f"Access token updated: {accessTokenFileTime}")

    def _refresh_token(self):
        authUrl = f'https://api.schwabapi.com/v1/oauth/authorize?response_type=code&client_id={self.APP_KEY}&redirect_uri={self.CALLBACK_URL}'
        if self.log_signal is not None:
            self.log_signal.emit("Opening browser...")
        else:
            print("Opening browser...")
        webbrowser.open(authUrl)
        callbackURL = input("Pass the redirect URL here: ")
        code = f"{callbackURL.split('code=')[1].split('%40')[0]}@"
        tokenDictionary = self._post_access_token('authorization_code', code)
        self._token_manager("set", datetime.now(), datetime.now(), tokenDictionary)
        if self.log_signal is not None:
            self.log_signal.emit("Refresh and Access tokens updated")

    def _token_manager(self, todo=None, accessTokenTime=None, refreshTokenTime=None, tokenDict=None):
        envPath = "schwab/app_info/.env"
        accessTokenTimeFormat = "%Y-%m-%d %H:%M:%S"
        refreshTokenTimeFormat = "%Y-%m-%d %H:%M:%S"

        def write_token_var(att, rtt, td):
            if self.log_signal is not None:
                self.log_signal.emit("Setting variales from Schwabs .env file")
            self.refreshToken = td.get("refresh_token")
            self.accessToken = td.get("access_token")
            self.accessTokenDateTime = att
            self.refreshTokenDateTime = rtt
            self.idToken = td.get("id_token")

        def write_token_file(newAccessTokenTime, newRefreshTokenTime, newTokenDict):
            if self.log_signal is not None:
                self.log_signal.emit("Writing new values to Schwabs .env file")
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
            self.log_signal.emit("Reading Schwabs .env file")
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
                    self.log_signal.emit("Error in setting token file, null values given")
            elif todo == "init":
                self.log_signal.emit("Initiate variables from Schwabs .env file")
                accessTokenTime, refreshTokenTime, tokenDict = read_token_file()
                write_token_var(accessTokenTime, refreshTokenTime, tokenDict)
        except Exception as e:
            if self.log_signal is not None:
                self.log_signal.emit("ERROR: Writing new tokens to .env file")
            self._refresh_token()

    # def _request_handler(self, response):
    #     try:
    #         if response.ok:
    #             return response.json()
    #     except json.decoder.JSONDecodeError:
    #         self.log_signal.emit(f"{response.status_code}: Order placed")
    #         return None
    #     except AttributeError:
    #         self.log_signal.emit(f"Error {response.status_code}: Object has no such attribute")
    #         return None

    def _params_parser(self, params):
        return {k: v for k, v in params.items() if v is not None}

    def _time_converter(self, dt, format=None):
        if format == "epoch" and dt is not None:
            return int(dt.timestamp() * 1000)
        elif format == "iso" and dt is not None:
            return dt + 'T00:00:00.000Z'
        elif dt is None:
            return None
        
    def update_tokens_automatic(self):
        def checker():
            while True:
                self._check_tokens()
                time.sleep(60)
        threading.Thread(target=checker, daemon=True).start()

    # Account methods
    def account_numbers(self):
        return requests.get(f'{self.ACCOUNT_ENDPOINT}/accounts/accountNumbers', 
                                                  headers={'Authorization': f'Bearer {self.accessToken}'})

    def accounts(self, fields=None):
        return requests.get(f'{self.ACCOUNT_ENDPOINT}/accounts/', 
                                                  headers={'Authorization': f'Bearer {self.accessToken}'}, 
                                                  params=self._params_parser({'fields': fields}))

    def account_number(self, accountNumber=None, fields=None):
        return requests.get(f'{self.ACCOUNT_ENDPOINT}/accounts/{accountNumber}', 
                                                  headers={'accept': 'application/json', 'Authorization': f'Bearer {self.accessToken}'}, 
                                                  params=self._params_parser({'fields': fields}))

    # Order methods
    def get_orders(self, maxResults, fromEnteredTime, toEnteredTime, accountNumber=None, status=None):
        return requests.get(f'{self.ACCOUNT_ENDPOINT}/accounts/{accountNumber}/orders', 
                                                  headers={"Accept": "application/json", 'Authorization': f'Bearer {self.accessToken}'}, 
                                                  params=self._params_parser({
                                                      'maxResults': maxResults, 
                                                      'fromEnteredTime': self._time_converter(fromEnteredTime, format="iso"), 
                                                      'toEnteredTime': self._time_converter(toEnteredTime, format="iso"), 
                                                      'status': status
                                                  }))

    def post_orders(self, order, accountNumber=None):
        return requests.post(f'{self.ACCOUNT_ENDPOINT}/accounts/{accountNumber}/orders', 
                                                   headers={'Authorization': f'Bearer {self.accessToken}', 'Content-Type': 'application/json'}, 
                                                   json=order)

    def delete_order_id(self, orderId, accountNumber=None):
        return requests.get(f'{self.ACCOUNT_ENDPOINT}/accounts/{accountNumber}/orders/{orderId}', 
                                                  headers={'Authorization': f'Bearer {self.accessToken}'}, 
                                                  params=self._params_parser({'orderId': orderId}))

    def get_order_id(self, orderId, accountNumber=None):
        return requests.get(f'{self.ACCOUNT_ENDPOINT}/accounts/{accountNumber}/orders/{orderId}', 
                                                  headers={"Accept": "application/json", 'Authorization': f'Bearer {self.accessToken}'})

    # Option methods
    def get_chains(self, symbol, contractType=None, strikeCount=None, includeUnderlyingQuotes=None, 
                   strategy=None, interval=None, strike=None, range=None, fromDate=None, toDate=None, 
                   volatility=None, underlyingPrice=None, interestRate=None, daysToExpiration=None, 
                   expMonth=None, optionType=None, entitlement=None):
        return requests.get(f'{self.MARKET_ENDPOINT}/chains', 
                                                  headers={"Accept": "application/json", 'Authorization': f'Bearer {self.accessToken}'}, 
                                                  params=self._params_parser({
                                                      'symbol': symbol, 'contractType': contractType, 'strikeCount': strikeCount, 
                                                      'includeUnderlyingQuotes': includeUnderlyingQuotes, 'strategy': strategy, 
                                                      'interval': interval, 'strike': strike, 'range': range, 'fromDate': fromDate, 
                                                      'toDate': toDate, 'volatility': volatility, 'underlyingPrice': underlyingPrice, 
                                                      'interestRate': interestRate, 'daysToExpiration': daysToExpiration, 
                                                      'expMonth': expMonth, 'optionType': optionType, 'entitlement': entitlement
                                                  }))

    def get_expiration_chain(self, symbol):
        return requests.get(f'{self.MARKET_ENDPOINT}/expirationchain', 
                                                  headers={'Authorization': f'Bearer {self.accessToken}'}, 
                                                  params=self._params_parser({'symbol': symbol}))

    # Price history method
    def get_price_history(self, symbol, periodType=None, period=None, frequencyType=None, frequency=None, 
                          startDate=None, endDate=None, needExtendedHoursData=None, needPreviousClose=None):
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