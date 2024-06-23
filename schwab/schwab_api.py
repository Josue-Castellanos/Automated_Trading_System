# Imports
from pathlib import Path
from datetime import datetime
from dotenv import load_dotenv
import os
import json
import time
import base64
import requests
import threading
import webbrowser

# Load sensitive Information
load_dotenv(dotenv_path=Path('./schwab/app_info/.env'))
APP_KEY = os.getenv("appKey")
SECRET_KEY = os.getenv("secretKey")
ACCOUNT_NUMBER = os.getenv("accountNumber")

# URIs
CALLBACK_URL= "https://127.0.0.1"
ACCOUNT_ENDPOINT = "https://api.schwabapi.com/trader/v1"
MARKET_ENDPOINT = "https://api.schwabapi.com/marketdata/v1"
POST = "https://api.schwabapi.com/v1/oauth/token"
    
class tokens:
    refreshToken = None
    accessToken = None
    idToken = None
    refreshTokenDateTime = None
    accessTokenDateTime = None
    refreshTokenTimeout = 7 # in days
    accessTokenTimeout = 1800 # in seconds
      
def initialize():
    # Check the client and application keys
    _CheckKeys()

    # Set tokens and token timeouts
    _TokenManager("init")

    # Check if tokens need to be updated and update if needed
    _CheckTokens()
  

def updateTokensAutomatic():
    def checker():
        while True:
            _CheckTokens()
            time.sleep(60)
    threading.Thread(target=checker, daemon=True).start()


def _CheckKeys():
    if len(APP_KEY) != 32 or len(SECRET_KEY) != 16:
        print("Incorrect keys or no keys found, add keys in modules/.env")
        quit()
    
    
def _CheckTokens():
    # Check if we need to update refresh (and access) token
    if (datetime.now() - tokens.refreshTokenDateTime).days >= (tokens.refreshTokenTimeout - 1):
        print("The refresh token has expired, updating automatically.")
        _RefreshToken()
    # Check if we need to update access token
    elif ((datetime.now() - tokens.accessTokenDateTime).days >= 1) or ((datetime.now() - tokens.accessTokenDateTime).seconds > (tokens.accessTokenTimeout - 60)):
        print("The access token has expired, updating automatically.")
        _AccessToken()    
    
 
def _PostAccessToken(grant_type, code):
    # Authoraization code for both refresh and access tokens
    headers = {'Authorization': f'Basic {base64.b64encode(bytes(f"{APP_KEY}:{SECRET_KEY}", "utf-8")).decode("utf-8")}', 'Content-Type': 'application/x-www-form-urlencoded'}
    if grant_type == 'authorization_code':
        # Create Access Token Request
        data = {'grant_type': 'authorization_code', 'code': code, 'redirect_uri': CALLBACK_URL}
    elif grant_type =='refresh_token':
        # Create refresh token request
        data = {'grant_type': 'refresh_token', 'refresh_token': code}
    else:
        print("Invalid grant type")
        return None
    return _RequestHandler(requests.post(POST, headers=headers, data=data))
    
      
def _AccessToken():
    # Get the token dictionary
    accessTokenFileTime, refreshTokenFileTime, tokenDictionary = _TokenManager("getFile")
    # get and update to the new access token
    _TokenManager("set", datetime.now(), refreshTokenFileTime, _PostAccessToken('refresh_token', tokenDictionary.get('refresh_token')))
    # show user that we have updated the access token
    print(f"Access token updated: {accessTokenFileTime}")
    

def _RefreshToken():
    authUrl = f'https://api.schwabapi.com/v1/oauth/authorize?response_type=code&client_id={APP_KEY}&redirect_uri={CALLBACK_URL}'
    print("Opening browser...")
    webbrowser.open(authUrl)
    callbackURL = input("Pass the redirect URL here: ")
    code = f"{callbackURL.split('code=')[1].split('%40')[0]}@"
    tokenDictionary = _PostAccessToken('authorization_code', code)
    _TokenManager("set", datetime.now(), datetime.now(), tokenDictionary)
    print("Refresh and Access tokens updated")
    
    
def _TokenManager(todo = None, accessTokenTime = None, refreshTokenTime = None, tokenDict = None):
    envPath = "schwab/app_info/.env"
    accessTokenTimeFormat = "%Y-%m-%d %H:%M:%S"
    refreshTokenTimeFormat = "%Y-%m-%d %H:%M:%S"
    
    def writeTokenVar(att, rtt, td):
        tokens.refreshToken = td.get("refresh_token")
        tokens.accessToken = td.get("access_token")
        tokens.accessTokenDateTime = att
        tokens.refreshTokenDateTime = rtt
        tokens.idToken = td.get("id_token")
        
    def writeTokenFile(newAccessTokenTime, newRefreshTokenTime, newTokenDict):
        # Read the contents of the .env file
        with open(envPath, "r") as file:
            # Read content from file
            lines = file.readlines()   
        # Update the token fields
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
        # Write the updated content back to the .env file
        with open(envPath, "w") as file:
            # Write content to the file
            file.writelines(lines)
            file.flush()
        
    def readTokenFile():
    # Open the file in read mode
        with open(envPath, "r") as file:
            # Read the contents of the file
            formattedAccessTokenTime = datetime.strptime(file.readline().split('=')[1].strip(), accessTokenTimeFormat)
            formattedRefreshTokenTime = datetime.strptime(file.readline().split('=')[1].strip(), refreshTokenTimeFormat)
            formattedTokenDict = json.loads(file.readline().split('=')[1].strip())
            return formattedAccessTokenTime, formattedRefreshTokenTime, formattedTokenDict
    
    try:
        if todo == "getFile":
            return readTokenFile()
        elif todo == "set":
            if accessTokenTime is not None and refreshTokenTime is not None and tokenDict is not None:
                writeTokenFile(accessTokenTime, refreshTokenTime, tokenDict)
                writeTokenVar(accessTokenTime, refreshTokenTime, tokenDict)
            else:
                print("Error in setting token file, null values given") 
        elif todo == "init":
            accessTokenTime, refreshTokenTime, tokenDict = readTokenFile()
            writeTokenVar(accessTokenTime, refreshTokenTime, tokenDict)        
    except Exception as e:
        print("ERROR: Writing new tokens to .env file")
        _RefreshToken()
        
    
def _RequestHandler(response):
    try:
        if response.ok:
            return response.json()
        
    # Grandfathered from TDAmeritrade API
    except json.decoder.JSONDecodeError:
    # Handle the JSONDecodeError exception
        print(f"{response.status_code}: Order placed")
        return None
    
    except AttributeError:
    # Handle the AttributeError exception
        print(f"Error {response.status_code}: Object has no such attribute")
        return None


def _ParamsParser(params):
    for key in list(params.keys()):
        if params[key] is None:
            del params[key]
    return params


def _TimeConverter(dt, format=None):
    if format == "epoch" and dt is not None:
        return int(dt.timestamp() * 1000)
    elif format == "iso" and dt is not None:
        return dt+'T00:00:00.000Z'
    elif dt == None:
        return None
    
        
class Schwab:

    # ----- ACCOUNTS ------
    @staticmethod
    def accountNumbers():
        return _RequestHandler(requests.get(f'{ACCOUNT_ENDPOINT}/accounts/accountNumbers', headers={'Authorization': f'Bearer {tokens.accessToken}'}))

    @staticmethod
    def accounts(fields=None):
        return _RequestHandler(requests.get(f'{ACCOUNT_ENDPOINT}/accounts/', headers={'Authorization': f'Bearer {tokens.accessToken}'}, params=_ParamsParser({'fields': fields})))

    @staticmethod
    def accountNumber(accountNumber=None, fields=None):
        return _RequestHandler(requests.get(f'{ACCOUNT_ENDPOINT}/accounts/{accountNumber}', headers={'accept': 'application/json', 'Authorization': f'Bearer {tokens.accessToken}'}, params=_ParamsParser({'fields': fields})))
    

    # ---- ORDERS -----
    @staticmethod
    def getOrders(maxResults, fromEnteredTime, toEnteredTime, accountNumber=None, status= None):
        return _RequestHandler(requests.get(f'{ACCOUNT_ENDPOINT}/accounts/{accountNumber}/orders', headers={"Accept": "application/json", 'Authorization': f'Bearer {tokens.accessToken}'}, params=_ParamsParser({'maxResults': maxResults, 'fromEnteredTime': _TimeConverter(fromEnteredTime, format="iso"), 'toEnteredTime': _TimeConverter(toEnteredTime, format="iso"), 'status': status})))
    
    @staticmethod
    def postOrders(order, accountNumber=None):
        return _RequestHandler(requests.post(f'{ACCOUNT_ENDPOINT}/accounts/{accountNumber}/orders', headers={'Authorization': f'Bearer {tokens.accessToken}', 'Content-Type': 'application/json'}, json=order))
        
    @staticmethod
    def deleteOrderId(orderId, accountNumber=None):
        return _RequestHandler(requests.get(f'{ACCOUNT_ENDPOINT}/accounts/{accountNumber}/orders/{orderId}', headers={'Authorization': f'Bearer {tokens.accessToken}'}, params=_ParamsParser({'orderId': orderId})))
    
    @staticmethod
    def getOrderId(orderId, accountNumber=None):
        return _RequestHandler(requests.get(f'{ACCOUNT_ENDPOINT}/accounts/{accountNumber}/orders/{orderId}', headers={"Accept": "application/json", 'Authorization': f'Bearer {tokens.accessToken}'}))
    # putOrderId
    # postPreviewOrder

    # ----- OPTIONS ------
    @staticmethod 
    def getChains(symbol, contractType=None, strikeCount=None, includeUnderlyingQuotes=None, strategy=None, interval=None, strike=None, range=None, fromDate=None, toDate=None, volatility=None, underlyingPrice=None, interestRate=None, daysToExpiration=None, expMonth=None, optionType=None, entitlement=None):
        return _RequestHandler(requests.get(f'{MARKET_ENDPOINT}/chains', headers={"Accept": "application/json", 'Authorization': f'Bearer {tokens.accessToken}'}, params=_ParamsParser({'symbol': symbol, 'contractType': contractType, 'strikeCount': strikeCount, 'includeUnderlyingQuotes': includeUnderlyingQuotes, 'strategy': strategy, 'interval': interval, 'strike': strike, 'range': range, 'fromDate': fromDate, 'toDate': toDate, 'volatility': volatility, 'underlyingPrice': underlyingPrice, 'interestRate': interestRate, 'daysToExpiration': daysToExpiration, 'expMonth': expMonth, 'optionType': optionType, 'entitlement': entitlement})))

    @staticmethod 
    def getExpirationChain(symbol):
        return _RequestHandler(requests.get(f'{MARKET_ENDPOINT}/expirationchain', headers={'Authorization': f'Bearer {tokens.accessToken}'}, params=_ParamsParser({'symbol': symbol})))

    # ----- PRICE HISTORY -----
    @staticmethod 
    def getPriceHistory(symbol, periodType=None, period=None, frequencyType=None, frequency=None, startDate=None, endDate=None, needExtendedHoursData=None, needPreviousClose=None):
        return _RequestHandler(requests.get(f'{MARKET_ENDPOINT}/pricehistory', headers={"Accept": "application/json", 'Authorization': f'Bearer {tokens.accessToken}'}, params=_ParamsParser({'symbol': symbol, 'periodType': periodType, 'period': period, 'frequencyType': frequencyType, 'frequency': frequency, 'startDate': _TimeConverter(startDate, format="epoch"), 'endDate': _TimeConverter(endDate, format="epoch"), 'needExtendedHoursData': needExtendedHoursData, 'needPreviousClose': needPreviousClose})))
