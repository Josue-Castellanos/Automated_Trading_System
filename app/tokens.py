import base64
import json
import threading
import time
from datetime import datetime, timedelta
import requests
import sys
sys.path.append("/home/ubuntu/Automated_Trading_System")
from app.config import Settings

class Tokens:
    def __init__(self):
        """
        Load environment variables and initialize token handling.
        """
        self.settings = Settings()
        self.refreshToken = None
        self.accessToken = None
        self.idToken = None
        self.refreshTokenDateTime = None
        self.accessTokenDateTime = None
        self.refreshTokenTimeout = 7  # in days
        self.accessTokenTimeout = 1800  # in seconds

        self._check_schwab_keys()
        self._schwab_token_manager("init")
        self._check_schwab_tokens()
        self.update_tokens_automatic()

    def reload_settings(self):
        """ Reload the settings dynamically. """
        self.settings = Settings.reload()

    # ***********************************************************************************************************
    # ********************************************** SCHWAB TOKENS **********************************************
    # ***********************************************************************************************************

    def _check_schwab_keys(self):
        """ Verify API keys. """
        if len(self.settings.APP_KEY) != 32 or len(self.settings.SECRET_KEY) != 16:
            quit()

    def _check_schwab_tokens(self):
        """ Check and update tokens if necessary. """
        now = datetime.now()
        if (now - self.refreshTokenDateTime).days >= (self.refreshTokenTimeout - 1):
            self._update_refresh_token()
        elif (now - self.accessTokenDateTime).seconds > (self.accessTokenTimeout - 60):
            self._access_token()

    def _post_access_token(self, grant_type, code):
        """
        Request a new access token.
        Args:
            grant_type (str): Type of request ('authorization_code' or 'refresh_token').
            code (str): The auth code or refresh token.
        Returns:
            dict: Token response.
        """
        headers = {
            'Authorization': f'Basic {base64.b64encode(f"{self.settings.APP_KEY}:{self.settings.SECRET_KEY}".encode()).decode()}',
            'Content-Type': 'application/x-www-form-urlencoded'
        }
        data = {
            'grant_type': grant_type,
            'refresh_token': code if grant_type == 'refresh_token' else None,
            'redirect_uri': self.settings.CALLBACK_URL if grant_type == 'authorization_code' else None
        }
        return requests.post(self.settings.POST_ENDPOINT, headers=headers, data={k: v for k, v in data.items() if v}).json()

    def _access_token(self):
        """ Refresh access token using refresh token. """
        _, refreshTokenFileTime, tokenDictionary = self._schwab_token_manager("getFile")
        new_token_dict = self._post_access_token('refresh_token', tokenDictionary.get('refresh_token'))
        self._schwab_token_manager("set", datetime.now(), refreshTokenFileTime, new_token_dict)

    def _update_refresh_token(self):
        """
        Automatically update the refresh token before expiration.
        """
        _, _, tokenDictionary = self._schwab_token_manager("getFile")
        new_token_dict = self._post_access_token('refresh_token', tokenDictionary.get('refresh_token'))
        self._schwab_token_manager("set", datetime.now(), datetime.now(), new_token_dict)

    def _schwab_token_manager(self, action=None, accessTokenTime=None, refreshTokenTime=None, tokenDict=None):
        """
        Manage Schwab tokens.
        Args:
            action (str): Operation type ("getFile", "set", "init").
            accessTokenTime (datetime): Access token timestamp.
            refreshTokenTime (datetime): Refresh token timestamp.
            tokenDict (dict): Token data.
        Returns:
            tuple: Token metadata (if action == "getFile").
        """
        envPath = self.settings.ENV_PATH
        timeFormat = "%Y-%m-%d %H:%M:%S"

        def write_tokens():
            """ Write tokens to file and memory. """
            with open(envPath, "r") as file:
                lines = file.readlines()
            for i, line in enumerate(lines):
                if line.startswith("ACCESS_TOKEN_DATETIME"):
                    lines[i] = f"ACCESS_TOKEN_DATETIME = {accessTokenTime.strftime(timeFormat)}\n"
                elif line.startswith("REFRESH_TOKEN_DATETIME"):
                    lines[i] = f"REFRESH_TOKEN_DATETIME = {refreshTokenTime.strftime(timeFormat)}\n"
                elif line.startswith("JSON_DICT"):
                    lines[i] = f"JSON_DICT = {json.dumps(tokenDict)}\n"
                elif line.startswith("ACCESS_TOKEN"):
                    lines[i] = f"ACCESS_TOKEN = {tokenDict.get('access_token')}\n"
                elif line.startswith("REFRESH_TOKEN"):
                    lines[i] = f"REFRESH_TOKEN = {tokenDict.get('refresh_token')}\n"
            with open(envPath, "w") as file:
                file.writelines(lines)

        def read_tokens():
            """ Read tokens from file. """
            with open(envPath, "r") as file:
                accessTokenTime = datetime.strptime(file.readline().split('=')[1].strip(), timeFormat)
                refreshTokenTime = datetime.strptime(file.readline().split('=')[1].strip(), timeFormat)
                tokenDict = json.loads(file.readline().split('=')[1].strip())
            return accessTokenTime, refreshTokenTime, tokenDict

        try:
            if action == "getFile":
                return read_tokens()
            elif action == "set":
                write_tokens()
                self.refreshToken = tokenDict.get("refresh_token")
                self.accessToken = tokenDict.get("access_token")
                self.accessTokenDateTime = accessTokenTime
                self.refreshTokenDateTime = refreshTokenTime
            elif action == "init":
                accessTokenTime, refreshTokenTime, tokenDict = read_tokens()
                self.accessToken = tokenDict.get("access_token")
                self.refreshToken = tokenDict.get("refresh_token")
                self.accessTokenDateTime = accessTokenTime
                self.refreshTokenDateTime = refreshTokenTime
        except Exception:
            self._update_refresh_token()

    def update_tokens_automatic(self):
        """ Run a background thread to refresh tokens automatically. """
        def checker():
            while True:
                self.reload_settings()
                self._check_schwab_tokens()
                time.sleep(60)
        threading.Thread(target=checker, daemon=True).start()
