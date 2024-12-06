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
    def __init__(self, settings):
        """
        Load environment variables from a .env file.
        
        Sets up API keys, account numbers, and endpoint URLs.
        """
        self.settings = settings
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


# # """
# #     This is Tyler Bowers Implementation
# # """
#     def _generate_certificate(self, common_name="common_name", key_filepath="localhost.key", cert_filepath="localhost.crt"):
#         # make folders for cert files
#         os.makedirs(os.path.dirname(key_filepath), exist_ok=True)
#         os.makedirs(os.path.dirname(cert_filepath), exist_ok=True)

#         # create a key pair
#         key = rsa.generate_private_key(public_exponent=65537,key_size=2048)

#         # create a self-signed cert
#         builder = x509.CertificateBuilder()
#         builder = builder.subject_name(x509.Name([
#             x509.NameAttribute(NameOID.COMMON_NAME, common_name),
#             x509.NameAttribute(NameOID.ORGANIZATION_NAME, "Schwabdev"),
#             x509.NameAttribute(NameOID.ORGANIZATIONAL_UNIT_NAME, "Authentication"),
#         ]))
#         builder = builder.issuer_name(x509.Name([
#             x509.NameAttribute(NameOID.COMMON_NAME, common_name),
#         ]))
#         builder = builder.not_valid_before(datetime.now(timezone.utc))
#         builder = builder.not_valid_after(datetime.now(timezone.utc) + timedelta(days=3650))
#         builder = builder.serial_number(x509.random_serial_number())
#         builder = builder.public_key(key.public_key())
#         builder = builder.add_extension(
#             x509.SubjectAlternativeName([x509.DNSName(common_name)]),
#             critical=False,
#         )
#         builder = builder.sign(key, hashes.SHA256())
#         with open(key_filepath, "wb") as f:
#             f.write(key.private_bytes(encoding=serialization.Encoding.PEM,
#                                       format=serialization.PrivateFormat.TraditionalOpenSSL,
#                                       encryption_algorithm=serialization.NoEncryption()))
#         with open(cert_filepath, "wb") as f:
#             f.write(builder.public_bytes(serialization.Encoding.PEM))
#         print(f"Certificate generated and saved to {key_filepath} and {cert_filepath}")



#     def _update_refresh_token_from_code(self, url_or_code):
#         """
#         Get new access and refresh tokens using callback url or authorization code.
#         :param url_or_code: callback url (full url) or authorization code (the code=... in url)
#         :type url_or_code: str
#         """
#         if url_or_code.startswith("https://"):
#             code = f"{url_or_code[url_or_code.index('code=') + 5:url_or_code.index('%40')]}@"
#             # session = responseURL[responseURL.index("session=")+8:]
#         else:
#             code = url_or_code
#         # get new access and refresh tokens
#         response = self._post_access_token('authorization_code', code)
#         if response:
#             # update token file and variables
#             self._schwab_token_manager("set", datetime.now(timezone.utc), datetime.now(timezone.utc), response)
#             print("Refresh and Access tokens updated")
#         else:
#             print(response.text)
#             print("Could not get new refresh and access tokens, check these:\n"
#                                "1. App status is \"Ready For Use\".\n"
#                                "2. App key and app secret are valid.\n"
#                                "3. You pasted the whole url within 30 seconds. (it has a quick expiration)")

#     def _update_refresh_token(self):
#         """
#         Get new access and refresh tokens using authorization code.
#         """

#         # get and open the link that the user will authorize with.
#         auth_url = f'https://api.schwabapi.com/v1/oauth/authorize?client_id={self.settings.APP_KEY}&redirect_uri={self.settings.CALLBACK_URL}'
#         print(f"[Schwabdev] Open to authenticate: {auth_url}")
#         try:
#             webbrowser.open(auth_url)
#         except Exception as e:
#             print(e)
#             print("Could not open browser for authorization")

#         #parse the callback url
#         url_split = self.settings.CALLBACK_URL.split("://")[-1].split(":")
#         url_parsed = url_split[0]
#         port_parsed = url_split[-1] # this may or may not have the port

#         if port_parsed.isdigit(): # if there is a port then capture the callback url

#             # class used to share code outside the http server
#             class SharedCode:
#                 def __init__(self):
#                     self.code = ""

#             # custom HTTP handler to silence logger and get code
#             class HTTPHandler(http.server.BaseHTTPRequestHandler):
#                 shared = None

#                 def log_message(self, format, *args):
#                     pass  # silence logger

#                 def do_GET(self):
#                     if self.path.find("code=") != -1:
#                         self.shared.code = f"{self.path[self.path.index('code=') + 5:self.path.index('%40')]}@"
#                     self.send_response(200, "OK")
#                     self.end_headers()
#                     self.wfile.write(b"You may now close this page.")

#             shared = SharedCode()

#             HTTPHandler.shared = shared
#             httpd = http.server.HTTPServer((url_parsed, int(port_parsed)), HTTPHandler)

#             cert_filepath = os.path.expanduser("~/.Automated_Trading_System/localhost.crt")
#             key_filepath = os.path.expanduser("~/.Automated_Trading_System/localhost.key")
#             if not (os.path.isfile(cert_filepath) and os.path.isfile(key_filepath)): #this does not check if the cert and key are valid
#                 self._generate_certificate(common_name=url_parsed, cert_filepath=cert_filepath, key_filepath=key_filepath)

#             ctx = ssl.create_default_context(ssl.Purpose.CLIENT_AUTH)
#             ctx.load_cert_chain(certfile=cert_filepath, keyfile=key_filepath)
#             #ctx.load_default_certs()

#             httpd.socket = ctx.wrap_socket(httpd.socket, server_side=True)
#             while len(shared.code) < 1: # wait for code
#                 httpd.handle_request()

#             httpd.server_close()
#             code = shared.code
#         else: # if there is no port then the user must copy/paste the url
#             response_url = input("[Schwabdev] After authorizing, paste the address bar url here: ")
#             code = f"{response_url[response_url.index('code=') + 5:response_url.index('%40')]}@"

#         if code is not None:
#             self._update_refresh_token_from_code(code)
#         else:
#             print("Could not get new refresh token without code.")

# """
#     This is my implementation

#     Created By: Josue Castellanos
#     Date: November 20, 2024
# """
    # Certificate generation
    # def _generate_self_signed_certificate(self, cert_dir, common_name="127.0.0.1"):
    #     cert_file = os.path.join(cert_dir, "localhost.crt")
    #     key_file = os.path.join(cert_dir, "localhost.key")

    #     os.makedirs(cert_dir, exist_ok=True)
    #     os.makedirs(cert_dir, exist_ok=True)

    #     # Create private key
    #     key = rsa.generate_private_key(public_exponent=65537, key_size=2048)

    #     # Create self-signed certificate
    #     subject = issuer = x509.Name([
    #         x509.NameAttribute(NameOID.COMMON_NAME, common_name),
    #     ])
    #     cert = (
    #         x509.CertificateBuilder()
    #         .subject_name(subject)
    #         .issuer_name(issuer)
    #         .public_key(key.public_key())
    #         .serial_number(x509.random_serial_number())
    #         .not_valid_before(datetime.now())
    #         .not_valid_after(datetime.now() + timedelta(days=365))
    #         .add_extension(
    #             x509.SubjectAlternativeName([x509.DNSName(common_name)]),
    #             critical=False,
    #         )
    #         .sign(key, hashes.SHA256())
    #     )

    #     # Write the private key and certificate to files
    #     with open(key_file, "wb") as key_out:
    #         key_out.write(key.private_bytes(
    #             encoding=serialization.Encoding.PEM,
    #             format=serialization.PrivateFormat.TraditionalOpenSSL,
    #             encryption_algorithm=serialization.NoEncryption()
    #         ))

    #     with open(cert_file, "wb") as cert_out:
    #         cert_out.write(cert.public_bytes(serialization.Encoding.PEM))

    #     return cert_file, key_file


    # # Certificate validation function
    # def _is_certificate_valid(self, cert_path):
    #     """
    #     Check if the certificate is valid and not expired.
    #     """
    #     try:
    #         with open(cert_path, "rb") as cert_file:
    #             cert = x509.load_pem_x509_certificate(cert_file.read())
    #             return cert.not_valid_after > datetime.now()
    #     except Exception as e:
    #         print(f"Certificate validation failed: {e}")
    #         return False


    # # HTTPS Server for OAuth callback
    # class OAuthCallbackHandler(http.server.BaseHTTPRequestHandler):
    #     code = None

    #     def do_GET(self):
    #         if "code=" in self.path:
    #             self.code = re.search(r'code=([^&]+)', self.path).group(1)
    #             self.send_response(200)
    #             self.end_headers()
    #             self.wfile.write(b"Authorization successful! You can close this page.")
    #         else:
    #             self.send_response(400)
    #             self.end_headers()
    #             self.wfile.write(b"Invalid request.")

    #     def log_message(self, format, *args):
    #         pass  # Silence the server logs


    # def _start_https_server(self, cert_file, key_file, port=7777):
    #     server_address = ("127.0.0.1", port)
    #     httpd = http.server.HTTPServer(server_address, self.OAuthCallbackHandler)

    #     context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    #     context.load_cert_chain(certfile=cert_file, keyfile=key_file)
    #     httpd.socket = context.wrap_socket(httpd.socket, server_side=True)

    #     print(f"Server started at https://127.0.0.1:{port}")
    #     httpd.handle_request()  # Handles one request and exits

    #     return self.OAuthCallbackHandler.code


    # # Main OAuth flow
    # def _update_refresh_token(self):
    #     # Directory to store certificates
    #     cert_dir = os.path.expanduser("~/.schwab_certs")
    #     cert_file, key_file = self._generate_self_signed_certificate(cert_dir)

    #     # Check if the certificate is valid, else regenerate it
    #     if not os.path.exists(cert_file) or not self._is_certificate_valid(cert_file):
    #         print("Certificate is invalid or missing. Regenerating...")
    #         cert_file, key_file = self._generate_self_signed_certificate(cert_dir)
    #     else:
    #         print("Using existing valid certificate.")

    #     # Start server to handle callback
    #     auth_url = f"https://api.schwabapi.com/v1/oauth/authorize?client_id={self.settings.APP_KEY}&redirect_uri={self.settings.CALLBACK_URL}"

    #     webbrowser.open(auth_url)

    #     # Handle OAuth callback and retrieve code
    #     auth_code = self._start_https_server(cert_file, key_file)
    #     if auth_code:
    #         tokenDictionary = self._post_access_token('authorization_code', auth_code)
    #         self._schwab_token_manager("set", datetime.now(), datetime.now(), tokenDictionary)
    #     else:
    #         print("Failed to receive authorization code.")