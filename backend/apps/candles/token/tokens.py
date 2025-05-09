import base64
import webbrowser
import json
import threading
import time
from datetime import datetime
import requests
from backend.settings.config import Settings
from dotenv import set_key

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
        Manage token operations such as reading, writing, and updating token information using dotenv.
        
        Args:
            todo (str): The operation to perform.
            accessTokenTime (datetime): The access token timestamp.
            refreshTokenTime (datetime): The refresh token timestamp.
            tokenDict (dict): The dictionary containing token information.
        
        Returns:
            tuple or None: Depending on the operation, may return token information.
        """
        access_token_time_format = "%Y-%m-%d %H:%M:%S"
        refresh_token_time_format = "%Y-%m-%d %H:%M:%S"

        def write_token_var(att, rtt, td):
            """Update instance variables with token information."""
            self.refreshToken = td.get("refresh_token")
            self.accessToken = td.get("access_token")
            self.accessTokenDateTime = att
            self.refreshTokenDateTime = rtt
            self.idToken = td.get("id_token")

        def write_token_file(new_access_token_time, new_refresh_token_time, new_token_dict):
            """Update the .env file with new token information using dotenv."""
            # Convert datetime objects to strings
            access_time_str = new_access_token_time.strftime(access_token_time_format)
            refresh_time_str = new_refresh_token_time.strftime(refresh_token_time_format)
            
            # Update the environment file
            set_key(self.settings.ENV_PATH, "ACCESS_TOKEN_DATETIME", access_time_str)
            set_key(self.settings.ENV_PATH, "REFRESH_TOKEN_DATETIME", refresh_time_str)
            set_key(self.settings.ENV_PATH, "ACCESS_TOKEN", new_token_dict.get("access_token"))
            set_key(self.settings.ENV_PATH, "REFRESH_TOKEN", new_token_dict.get("refresh_token"))
            set_key(self.settings.ENV_PATH, "ID_TOKEN", new_token_dict.get("id_token"))
            set_key(self.settings.ENV_PATH, "JSON_DICT", json.dumps(new_token_dict))
        
            # Then run the settings reload.

        def read_token_file():
            """Read token information from the .env file using dotenv."""
            # env_vars = dotenv_values(self.settings.ENV_PATH)
            
            access_time = datetime.strptime(
                self.settings.ACCESS_TOKEN_DATETIME, 
                access_token_time_format
            )
            refresh_time = datetime.strptime(
                self.settings.REFRESH_TOKEN_DATETIME, 
                refresh_token_time_format
            )
            token_dict = json.loads(self.settings.JSON_DICT)
            
            return access_time, refresh_time, token_dict

        try:
            if todo == "getFile":
                return read_token_file()
            elif todo == "set":
                if all([accessTokenTime, refreshTokenTime, tokenDict]):
                    write_token_file(accessTokenTime, refreshTokenTime, tokenDict)
                    write_token_var(accessTokenTime, refreshTokenTime, tokenDict)
            elif todo == "init":
                access_token_time, refresh_token_time, token_dict = read_token_file()
                write_token_var(access_token_time, refresh_token_time, token_dict)
        except Exception as e:
            self._update_refresh_token()


    def update_tokens_automatic(self):
        """ Run a background thread to refresh tokens automatically. """
        def checker():
            while True:
                self.reload_settings()
                self._check_schwab_tokens()
                time.sleep(60)
        threading.Thread(target=checker, daemon=True).start()
