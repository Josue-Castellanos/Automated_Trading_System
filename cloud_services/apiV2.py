import time
import os.path
import threading
import pandas as pd
from pathlib import Path
from dotenv import load_dotenv
from googleapiclient.discovery import build
from google.oauth2 import service_account
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import InstalledAppFlow


class Gmail:
    """
    A class to handle Gmail operations, including authentication, email checking,
    and Google Sheets interactions.
    """

    def __init__(self):
        """
        Initialize the Gmail class, setting up environment variables,
        credentials, and other necessary attributes.
        """
        self._load_env()
        self.creds = None
        self.creds_performance = None
        self.current_position = None
        self.CALLEVENT = threading.Event()
        self.PUTEVENT = threading.Event()
        self.check = None
        self._initialize()

    def _load_env(self):
        """
        Load environment variables from a .env file.

        This method sets up the necessary credentials and scope for Gmail and Google Sheets APIs.
        """
        load_dotenv(dotenv_path=Path('./cloud_services/app_info/.env'))
        self.CLIENT_ID = os.getenv("clientId")
        self.CLIENT_SECRET = os.getenv("clientSecret")
        self.SHEET_ID = os.getenv("sheetId")
        self.SCOPES = ['https://www.googleapis.com/auth/gmail.modify']
        self.SERVICES = ['https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/spreadsheets']

    def _initialize(self):
        """
        Initialize the Gmail instance by checking keys and managing tokens.

        This method sets up the initial state of the Gmail instance, including
        checking the validity of API keys and setting up authentication tokens.
        """
        self._check_keys()
        self._token_manager("init")

        performance_path = './cloud_services/app_info/performance.json'
        self.creds_performance = service_account.Credentials.from_service_account_file(performance_path, scopes=self.SERVICES)

    def _check_keys(self):
        """
        Check if the CLIENT_ID and CLIENT_SECRET have the correct length.

        This method verifies that the API keys loaded from the environment
        have the expected length. It currently doesn't raise an exception
        if the keys are invalid.

        Returns:
            None
        """
        if len(self.CLIENT_ID) != 72 or len(self.CLIENT_SECRET) != 35:
            return  # Consider raising an exception or logging a warning here

    def _refresh_token(self, creds_path):
        """
        Refresh the OAuth token if expired, or authorize a new token if refresh fails.

        Args:
            creds_path (str): The path to the credentials file.

        Returns:
            None
        """
        if self.creds and self.creds.expired and self.creds.refresh_token:
            try:
                self.creds.refresh(Request())
            except Exception as e:
                # Attempt to reauthorize if refresh fails
                self._authorize_new_token(creds_path)
        else:
            self._authorize_new_token(creds_path)
        self._token_manager("set", self.creds)

    def _authorize_new_token(self, creds_path):
        """
        Authorize a new OAuth token using the client secrets file.

        Args:
            creds_path (str): The path to the credentials file.

        Returns:
            None
        """
        flow = InstalledAppFlow.from_client_secrets_file(creds_path, self.SCOPES)
        self.creds = flow.run_local_server(port=0)

    def _token_manager(self, todo=None, credentials=None):
        """
        Manage OAuth tokens: initialize, set, or refresh as needed.

        Args:
            todo (str, optional): The operation to perform. Can be "set" or "init".
            credentials (Credentials, optional): The credentials object to set.

        Returns:
            None
        """
        credentials_path = './cloud_services/app_info/credentials.json'
        token_path = './cloud_services/app_info/token.json'
        performance_path = './cloud_services/app_info/performance.json'

        self.creds_performance = service_account.Credentials.from_service_account_file(performance_path, scopes=self.SERVICES)
        
        if todo == "set":
            if credentials is not None:
                with open(token_path, "w") as token:
                    token.write(credentials.to_json())
                self.creds = credentials
        elif todo == "init":
            try:
                self.creds = Credentials.from_authorized_user_file(token_path, self.SCOPES)
                if not self.creds or not self.creds.valid:
                    pass  # Consider handling this case explicitly
            except Exception:
                self._refresh_token(credentials_path)

    def _check_inbox(self):
        """
        Check the inbox for unread messages and process them based on their content.

        This method retrieves unread messages from the Gmail inbox, processes them
        based on specific signal types in the email content, and sets appropriate events.

        Returns:
            None
        """
        service = build("gmail", "v1", credentials=self.creds)
        results = service.users().messages().list(userId="me", labelIds=["INBOX"], q="is:unread").execute()
        signals = results.get("messages", [])

        if not signals:
            return

        for signal in signals[:1]:
            message = service.users().messages().get(userId="me", id=signal["id"]).execute()
            service.users().messages().modify(userId="me", id=signal["id"], body={"removeLabelIds": ["UNREAD"]}).execute()
            
            signal_type = message['snippet'][36:42].upper()
            
            if signal_type in ('CALL5-', 'CALL15', 'CALL30', 'CALL1H', 'CALL2H', 'CALL4H', 'C5----', 'C15---', 'C30---', 'C1H---', 'C2H---', 'C4H---'):
                if self.current_position != 'CALL' and not self.CALLEVENT.is_set():
                    self.CALLEVENT.set()
                    self.PUTEVENT.clear()

            elif signal_type in ('PUT5--', 'PUT15-', 'PUT30-', 'PUT1H-', 'PUT2H-', 'PUT4H-', 'P5----', 'P15---', 'P30---', 'P1H---', 'P2H---', 'P4H---'):
                if self.current_position != 'PUT' and not self.PUTEVENT.is_set():
                    self.PUTEVENT.set()
                    self.CALLEVENT.clear()

    def check_email_automatic(self):
        """
        Start a background thread to continuously check for new emails.

        This method initiates a daemon thread that periodically checks the inbox
        for new emails using the _check_inbox method.

        Returns:
            None
        """
        def checker():
            while self.check:
                try:
                    self._check_inbox()
                except Exception as e:
                    pass  # Consider logging the exception
                time.sleep(1)
        threading.Thread(target=checker, daemon=True).start()

    def read_sheet(self):
        """
        Read data from a Google Sheet and return it as a pandas DataFrame.

        This method retrieves data from a specified range in a Google Sheet
        and converts it into a pandas DataFrame.

        Returns:
            pandas.DataFrame or None: A DataFrame containing the sheet data if successful, None otherwise.
        """
        service = build('sheets', 'v4', credentials=self.creds_performance)
        RANGE = 'perf!A10:P'

        sheet = service.spreadsheets()
        result = sheet.values().get(spreadsheetId=self.SHEET_ID, range=RANGE).execute()
        values = result.get('values', [])

        if values:
            df = pd.DataFrame(values[1:], columns=values[0])  # First row is assumed to be headers
            return df
        else:
            return None

    def update_sheet(self, range_name, value):
        """
        Update a specific cell or range in a Google Sheet.

        Args:
            range_name (str): The A1 notation of the cell or range to update.
            value (Any): The value to be written to the specified range.

        Returns:
            dict: The response from the Google Sheets API update request.
        """
        service = build('sheets', 'v4', credentials=self.creds_performance)
        body = {
            'values': [[value]]
        }
        result = service.spreadsheets().values().update(
            spreadsheetId=self.SHEET_ID,
            range=range_name,
            valueInputOption='RAW',
            body=body
        ).execute()
        return result

    def reset_position(self):
        """
        Reset the current position and clear all events.

        This method resets the current position to None and clears both
        CALLEVENT and PUTEVENT.

        Returns:
            None
        """
        self.set_current_position(None)
        self.CALLEVENT.clear()
        self.PUTEVENT.clear()

    def wait(self):
        """
        Wait for either CALLEVENT or PUTEVENT to be set.

        This method blocks until either CALLEVENT or PUTEVENT is set.

        Returns:
            None
        """
        self.CALLEVENT.wait()
        self.PUTEVENT.wait()

    def set_current_position(self, pos):
        """
        Set the current position.

        Args:
            pos (str): The position to set. Typically 'CALL', 'PUT', or None.

        Returns:
            None
        """
        self.current_position = pos

    def set_checker(self, check):
        """
        Set the checker flag to control the automatic email checking loop.

        Args:
            check (bool): If True, enables automatic email checking; if False, disables it.

        Returns:
            None
        """
        self.check = check

    def get_call_event(self):
        """
        Get the CALLEVENT threading.Event object.

        Returns:
            threading.Event: The CALLEVENT object.
        """
        return self.CALLEVENT

    def get_put_event(self):
        """
        Get the PUTEVENT threading.Event object.

        Returns:
            threading.Event: The PUTEVENT object.
        """
        return self.PUTEVENT

    def get_current_position(self):
        """
        Get the current position.

        Returns:
            str or None: The current position, typically 'CALL', 'PUT', or None.
        """
        return self.current_position

  