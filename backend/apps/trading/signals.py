import ssl
import email
import threading
from datetime import datetime, time
from email.header import decode_header
from imapclient import IMAPClient
from backend.settings.config import Settings


CALL_SIGNAL_TYPES = ('CALL5-', 'CALL15', 'CALL30', 'CALL1H', 'CALL2H', 'CALL4H', 'C5----', 'C15---', 'C30---', 'C1H---', 'C2H---', 'C4H---')
PUT_SIGNAL_TYPES = ('PUT5--', 'PUT15-', 'PUT30-', 'PUT1H-', 'PUT2H-', 'PUT4H-', 'P5----', 'P15---', 'P30---', 'P1H---', 'P2H---', 'P4H---')


class Signals():
    def __init__(self):
        self.settings = Settings()
        self.current_position = None
        self.CALLEVENT = threading.Event()
        self.PUTEVENT = threading.Event()
        
        self.IMAP_SERVER = self.settings.IMAP_SERVER
        self.EMAIL_ACCOUNT = self.settings.EMAIL_ACCOUNT
        self.EMAIL_PASSWORD = self.settings.EMAIL_PASSWORD


    def process_email(self, msg):
        """
        Extracts and processes the email content.
        """
        # Decode email subject
        subject, encoding = decode_header(msg["Subject"])[0]
        if isinstance(subject, bytes):
            subject = subject.decode(encoding or "utf-8")

        signal_type = subject[33:39].upper()
        
        if signal_type in CALL_SIGNAL_TYPES:
            print(f"RECEIVED CALL AlERT: {signal_type}\n")
            if self.current_position != 'CALL' and not self.CALLEVENT.is_set():
                self.set_current_position('CALL')
                self.CALLEVENT.set()
                self.PUTEVENT.clear()
            else:
                print("ALREADY IN CALL EVENT, PASS ALERT!\n")

        elif signal_type in PUT_SIGNAL_TYPES:
            print(f"RECEIVED PUT ALERT: {signal_type}\n")
            if self.current_position != 'PUT' and not self.PUTEVENT.is_set():
                self.set_current_position('PUT')
                self.PUTEVENT.set()
                self.CALLEVENT.clear()
            else:
                print("ALREADY IN PUT EVENT, PASS ALERT!\n")


    def idle_monitor(self):
        """
        Listens for new emails in real-time using IMAP IDLE.
        """
        ssl_context = ssl.create_default_context()
        ssl_context.check_hostname = False  # Disable hostname verification
        ssl_context.verify_mode = ssl.CERT_NONE  # Disable certificate verification

        with IMAPClient(self.IMAP_SERVER, ssl_context=ssl_context) as client:
            client.login(self.EMAIL_ACCOUNT, self.EMAIL_PASSWORD)
            client.select_folder("INBOX")

            try:
                # ADD is_Market_Open() here instead of True
                while self.is_market_open():
                    client.idle()  # Start IDLE mode
                    client.idle_done()  # Stops IDLE mode when the client receives an email
                    self.check_new_emails(client)
            except KeyboardInterrupt:
                print("\nKeyboardInterrupt detected! Logging out...")
            except Exception as e:
                print(f"\nAn error occurred: {e}")
            finally:
                client.logout()
                print("\nClient successfully logged out. Exiting...")


    def check_new_emails(self, client):
        """
        Fetches unread emails and processes them.
        """
        messages = client.search(["UNSEEN"])  # Get unread messages
        for msg_id in messages:
            raw_msg = client.fetch([msg_id], ["RFC822"])[msg_id][b"RFC822"]
            email_msg = email.message_from_bytes(raw_msg)
            self.process_email(email_msg)
    

    def is_market_open(self):
        """
        Check if the current time is within market hours
        """
        now = datetime.now()
        market_open = time(6, 30)  # e.g., 6:30 AM
        market_close = time(12, 58)  # e.g., 12:58 PM
        return market_open <= now.time() <= market_close
    

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
    
