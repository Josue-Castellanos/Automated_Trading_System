import json
import time
import threading
from datetime import datetime
from .config import Settings
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
        checking keys and managing tokens.

        This method sets up the initial state of the Gmail instance, including
        checking the validity of API keys and setting up authentication tokens.
        credentials, and other necessary attributes.
        """
        self.settings = Settings()
        self.current_position = None
        self.creds = None
        self.CALLEVENT = threading.Event()
        self.PUTEVENT = threading.Event()
        self.check = None
        self.SCOPES = ['https://www.googleapis.com/auth/gmail.modify']
        self.SERVICES = ['https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/spreadsheets']
        self.creds_performance = service_account.Credentials.from_service_account_file(self.settings.PERFORMANCE_PATH, scopes=self.SERVICES)
        

    def get_credentials(self):
        self.creds = Credentials.from_authorized_user_file(self.settings.TOKEN_PATH, self.SCOPES)


    def _check_inbox(self):
        """
        Check the inbox for unread messages and process them based on their content.

        This method retrieves unread messages from the Gmail inbox, processes them
        based on specific signal types in the email content, and sets appropriate events.

        Returns:
            None
        """
        try:
            service = build("gmail", "v1", credentials=self.creds)
            raise RuntimeError()
        except Exception:
            self.get_credentials()

        results = service.users().messages().list(userId="me", labelIds=["INBOX"], q="is:unread").execute()
        signals = results.get("messages", [])
        if not signals:
            return

        for signal in signals[:1]:
            message = service.users().messages().get(userId="me", id=signal["id"]).execute()
            service.users().messages().modify(userId="me", id=signal["id"], body={"removeLabelIds": ["UNREAD"]}).execute()
            
            signal_type = message['snippet'][36:42].upper()
            
            if self.is_smart_money():
                pass

            elif signal_type in ('CALL5-', 'CALL15', 'CALL30', 'CALL1H', 'CALL2H', 'CALL4H', 'C5----', 'C15---', 'C30---', 'C1H---', 'C2H---', 'C4H---'):
                if self.current_position != 'CALL' and not self.CALLEVENT.is_set():
                    self.CALLEVENT.set()
                    self.PUTEVENT.clear()

            elif signal_type in ('PUT5--', 'PUT15-', 'PUT30-', 'PUT1H-', 'PUT2H-', 'PUT4H-', 'P5----', 'P15---', 'P30---', 'P1H---', 'P2H---', 'P4H---'):
                if self.current_position != 'PUT' and not self.PUTEVENT.is_set():
                    self.PUTEVENT.set()
                    self.CALLEVENT.clear()


    def is_smart_money(self):
        """
        Check if the current time is within smart money hours
            - first 30 minutes from market open
        """
        now = datetime.now()
        market_smart_money = time(7, 00)  # e.g., 10:00 AM
        return now.time() < market_smart_money  


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
                    pass
                time.sleep(5)
        threading.Thread(target=checker, daemon=True).start()


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