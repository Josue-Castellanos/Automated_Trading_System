# Created by Google https://github.com/googleworkspace/python-samples/blob/main/gmail/quickstart/quickstart.py
# Edited by https://josuecastellanos.com

# Imports
import time
import os.path
import threading
import trading_bot
from pathlib import Path
from dotenv import load_dotenv
from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import InstalledAppFlow

# Load sensitive Information
load_dotenv(dotenv_path=Path('./gmail/app_info/.env'))
CLIENT_ID = os.getenv("clientId")
CLIENT_SECRET = os.getenv("clientSecret")

# URI & Paths
READ_SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"] # If modifying these scopes, delete the file token.json.
MOD_SCOPES = ["https://www.googleapis.com/auth/gmail.modify"]

# Event
CALLEVENT = threading.Event()
PUTEVENT = threading.Event()

class tokens:
    creds = None
    token = None
    refreshToken = None
    account = None
    expiry = None
    # clientId = None
    # clientSecret = None

    
def initialize():
    # Check the client id and client secret
    _CheckKeys()
    # Set credentials and tokens
    _TokenManager("init")
    # Check inbox (ADD Daemon for checking mail thread)
    #threading.Thread(target=trading_bot.eventHandler, args=(CALLEVENT, PUTEVENT)).start()

    # Check inbox (ADD Daemon for checking mail thread)
    threading.Thread(target=trading_bot.callEventHandler, args=(CALLEVENT,)).start()
    threading.Thread(target=trading_bot.putEventHandler, args=(PUTEVENT,)).start()
    

def _CheckKeys():
  if len(CLIENT_ID) != 72 or len(CLIENT_SECRET) != 35:
        print("Incorrect keys or no keys found, add keys in app_info/.env")
        quit()


def _RefreshToken(credsPath):
    if tokens.creds and tokens.creds.expired and tokens.creds.refresh_token:
        tokens.creds.refresh(Request())
    else:
        flow = InstalledAppFlow.from_client_secrets_file(credsPath, MOD_SCOPES)
        tokens.creds = flow.run_local_server(port=0)
    _TokenManager("set", tokens.creds)


def _TokenManager(todo=None, credentials=None):
    credentialsPath = './gmail/app_info/credentials.json'
    tokenPath = './gmail/app_info/token.json'

    def writeTokenVar(tokenCreds):
        tokens.creds = tokenCreds
        # tokens.token = tokenCreds.get("token")
        # tokens.refreshToken = tokenCreds.get("refresh_token")
        # tokens.account = tokenCreds.get("account")
        # tokens.expiry = tokenCreds.get("expiry")

    def writeTokenFile(newCredentials):
        with open(tokenPath, "w") as token:
            token.write(newCredentials.to_json()) 

    def readFromTokenFile():
        return Credentials.from_authorized_user_file(tokenPath, MOD_SCOPES)
    
    try:
        if todo == "set":
            if credentials is not None:
                writeTokenFile(credentials)
                writeTokenVar(credentials)
            else:
                print("Error in setting token file, null values given")
        elif todo == "init":
            creds = readFromTokenFile()
            writeTokenVar(creds)
            if not creds or not creds.valid:
                raise RuntimeError("ERROR: No valid credentials available.")
    except Exception as e:
        _RefreshToken(credentialsPath)
            

def _CheckInbox(CALLEVENT, PUTEVENT):
    # Call the Gmail API
    service = build("gmail", "v1", credentials=tokens.creds)
    # Retreive a list from 'me' gmail in my INBOX folder of all unread queries
    results = service.users().messages().list(userId="me", labelIds=["INBOX"], q="is:unread").execute()
    # Get 'message' item from the query objects in list
    signals = results.get("messages", [])

    if not signals:
        pass
    else:
        # Iterate through list
        for signal in signals[:1]:
            # Retrieve query from list of UNREAD queries
            message = service.users().messages().get(userId="me", id=signal["id"]).execute()
            # Mark query as READ
            service.users().messages().modify(userId="me", id=signal["id"], body={"removeLabelIds": ["UNREAD"]}).execute()
            # Display 'message' item
            print(message['snippet'][36:42] + "\n")

            if message.get('snippet')[36:42] in ('CALL5-', 'CALL15', 'CALL30', 'CALL1H', 'CALL2H', 'CALL4H', 'Call5-', 'Call15', 'Call30', 'Call1h', 'Call2h', 'Call4h', 'C5----', 'C15---', 'C30---', 'C1H---', 'C2H---', 'C4H---'):
                if not CALLEVENT.is_set():
                    CALLEVENT.set()
            elif message.get('snippet')[36:42] in ('PUT5--', 'PUT15-', 'PUT30-', 'PUT1H-', 'PUT2H-', 'PUT4H-', 'Put5--', 'Put15-', 'Put30-', 'Put1h-', 'Put2h-', 'Put4h-', 'P5----', 'P15---', 'P30---', 'P1H---', 'P2H---', 'P4H---'):
                if not PUTEVENT.is_set():
                    PUTEVENT.set()
            else:
                pass


def checkEmailAutomatic(CALLEVENT, PUTEVENT):
    def checker():
        while True:
            _CheckInbox(CALLEVENT, PUTEVENT)
            time.sleep(1)
    threading.Thread(target=checker, daemon=True).start()
