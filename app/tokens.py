import http
import os
import re
import threading
import requests
import base64
import webbrowser
import time
import json
from datetime import datetime, timedelta, timezone
import ssl
import http.server
from config import Settings
from cryptography import x509
from cryptography.x509.oid import NameOID
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from googleapiclient.discovery import build
from google.oauth2 import service_account
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import InstalledAppFlow



class Tokens():
    def __init__(self):
        """
        Load environment variables from a .env file.
        
        Sets up API keys, account numbers, and endpoint URLs.
        """
        self.settings = Settings()
        self.refreshToken = None
        self.accessToken = None
        self.idToken = None
        self.refreshTokenDateTime = None
        self.accessTokenDateTime = None
        self.refreshTokenTimeout = 7  # in days
        self.accessTokenTimeout = 1800  # in seconds

        self.creds = None
        self.SCOPES = ['https://www.googleapis.com/auth/gmail.modify']

        self._check_google_keys()
        self._check_schwab_keys()

        self._google_token_manager("init")
        self._schwab_token_manager("init")

        self._check_schwab_tokens()
        self.update_tokens_automatic()


    def reload_settings(self):
        """
        Reload the .env settings dynamically.
        """
        self.settings = Settings.reload()  # Reload settings from .env


# ***********************************************************************************************************
# ********************************************** SCHWAB TOKENS **********************************************
# ***********************************************************************************************************
    def _check_schwab_keys(self):
        """
        Verify the length of APP_KEY and SECRET_KEY.
        
        Exits the program if the keys are not the correct length.

        Returns:
            None
        """
        if len(self.settings.APP_KEY) != 32 or len(self.settings.SECRET_KEY) != 16:
            quit()
        

    def _check_schwab_tokens(self):
        """
        Check if the refresh token or access token needs to be updated.
        
        Calls the appropriate token refresh method if necessary.
        """
        if (datetime.now() - self.refreshTokenDateTime).days >= (self.refreshTokenTimeout - 1):
            self._update_refresh_token()
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
            'Authorization': f'Basic {base64.b64encode(bytes(f"{self.settings.APP_KEY}:{self.settings.SECRET_KEY}", "utf-8")).decode("utf-8")}',
            'Content-Type': 'application/x-www-form-urlencoded'
        }
        if grant_type == 'authorization_code':
            data = {'grant_type': 'authorization_code', 'code': code, 'redirect_uri': self.settings.CALLBACK_URL}
        elif grant_type == 'refresh_token':
            data = {'grant_type': 'refresh_token', 'refresh_token': code}
        else:
            return None
        return requests.post(self.settings.POST_ENDPOINT, headers=headers, data=data).json()


    def _access_token(self):
        """
        Refresh the access token using the current refresh token.
        """
        accessTokenFileTime, refreshTokenFileTime, tokenDictionary = self._schwab_token_manager("getFile")
        self._schwab_token_manager("set", datetime.now(), refreshTokenFileTime, self._post_access_token('refresh_token', tokenDictionary.get('refresh_token')))


    def _update_refresh_token(self):
        """
        Obtain a new refresh token by opening the authorization URL in a web browser.
        """
        authUrl = f'https://api.schwabapi.com/v1/oauth/authorize?response_type=code&client_id={self.settings.APP_KEY}&redirect_uri={self.settings.CALLBACK_URL}'
        webbrowser.open(authUrl)

        callbackURL = input("Please enter the redirect URL:")

        code = f"{callbackURL.split('code=')[1].split('%40')[0]}@"
        tokenDictionary = self._post_access_token('authorization_code', code)
        self._schwab_token_manager("set", datetime.now(), datetime.now(), tokenDictionary)


    def _schwab_token_manager(self, todo=None, accessTokenTime=None, refreshTokenTime=None, tokenDict=None):
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
        envPath = self.settings.ENV_PATH
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
                if line.startswith("ACCESS_TOKEN_DATETIME"):
                    lines[i] = f"ACCESS_TOKEN_DATETIME = {newAccessTokenTime.strftime(accessTokenTimeFormat)}\n"
                elif line.startswith("REFRESH_TOKEN_DATETIME"):
                    lines[i] = f"REFRESH_TOKEN_DATETIME = {newRefreshTokenTime.strftime(refreshTokenTimeFormat)}\n"
                elif line.startswith("JSON_DICT"):
                    lines[i] = f"JSON_DICT = {json.dumps(newTokenDict)}\n"
                elif line.startswith("ACCESS_TOKEN"):
                    lines[i] = f"ACCESS_TOKEN = {newTokenDict.get('access_token')}\n"
                elif line.startswith("REFRESH_TOKEN"):
                    lines[i] = f"REFRESH_TOKEN = {newTokenDict.get('refresh_token')}\n"
                elif line.startswith("ID_TOKEN"):
                    lines[i] = f"ID_TOKEN = {newTokenDict.get('id_token')}\n"
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
            self._update_refresh_token()


    def update_tokens_automatic(self):
        """
        Spawn a background thread to automatically update tokens when they expire.
        """
        def checker():
            while True:
                self.reload_settings()
                self._check_schwab_tokens()
                self._check_google_tokens()
                time.sleep(60)
        threading.Thread(target=checker, daemon=True).start()


# ***********************************************************************************************************
# ********************************************** GOOGLE TOKENS **********************************************
# ***********************************************************************************************************

    def _check_google_tokens(self):
        if not self.creds.valid:
            self._update_google_refresh_token()


    def _check_google_keys(self):
        """
        Verify the length of CLIENT_ID and CLIENT_SECRET.

        Exits the program if the keys are not the correct length.

        Returns:
            None
        """
        if len(self.settings.CLIENT_ID) != 72 or len(self.settings.CLIENT_SECRET) != 35:
            quit()


    def _google_token_manager(self, todo=None, credentials=None):
        """
        Manage OAuth tokens: initialize, set, or refresh as needed.

        Args:
            todo (str, optional): The operation to perform. Can be "set" or "init".
            credentials (Credentials, optional): The credentials object to set.

        Returns:
            None
        """        
        if todo == "set":
            if credentials is not None:
                with open(self.settings.TOKEN_PATH, "w") as token:
                    token.write(credentials.to_json())
                self.creds = credentials
        elif todo == "init":
            try:
                self.creds = Credentials.from_authorized_user_file(self.settings.TOKEN_PATH, self.SCOPES)
                if not self.creds or not self.creds.valid:
                    raise RuntimeError("ERROR: No valid credentials available.")
            except Exception:
                self._update_google_refresh_token()


    def _update_google_refresh_token(self):
        """
        Refresh the OAuth token if expired, or authorize a new token if refresh fails.

        Returns:
            None
        """
        if self.creds and self.creds.expired and self.creds.refresh_token:
            try:
                self.creds.refresh(Request())
            except Exception as e:
                # Attempt to reauthorize if refresh fails
                self._authorize_new_google_token()
        else:
            self._authorize_new_google_token()
        self._google_token_manager("set", self.creds)


    def _authorize_new_google_token(self):
        """
        Authorize a new OAuth token using the client secrets file.

        Returns:
            None
        """
        flow = InstalledAppFlow.from_client_secrets_file(self.settings.CREDENTIALS_PATH, self.SCOPES)
        self.creds = flow.run_local_server(port=0)

