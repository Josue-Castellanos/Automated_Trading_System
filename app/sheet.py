
import pandas as pd
from datetime import datetime
import sys
sys.path.append("/home/ubuntu/Automated_Trading_System")
from app.config import Settings
from googleapiclient.discovery import build
from google.oauth2 import service_account
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import InstalledAppFlow


class Sheet:
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
        self.SERVICES = ['https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/spreadsheets']
        self.creds_performance = service_account.Credentials.from_service_account_file(self.settings.PERFORMANCE_PATH, scopes=self.SERVICES)


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
        result = sheet.values().get(spreadsheetId=self.settings.SHEET_ID, range=RANGE).execute()
        values = result.get('values', [])

        if values:
            # Ensure all rows have the same number of columns as the header
            num_columns = len(values[0])  # Number of columns in the header
            for i in range(1, len(values)):  # Skip the header row
                values[i].extend([''] * (num_columns - len(values[i])))  # Pad with empty strings

            # Now create the DataFrame
            df = pd.DataFrame(values[1:], columns=values[0])  # First row is assumed to be headers


            # row = df[df['Date'] == self.now]

            # # This is something I can check to see If I had  Green or red day
            # print("Day: ", int(row.iloc[0]['Day']))                                         # What day on the performance tracker its on
            # print("Daily Goal: ", int(row.iloc[0]['Adj$Gain'][1:]))            # The profit Goal for the account today
            # print("Account Goal: ", int(row.iloc[0]['Adj$Balance'][1:]))       # The total Account Balance Goal today
            # print("Number of Cons per trade/day: ", int(row.iloc[0]['Pos#Open']))           # The number of Contracts to buy per trade or day
            # print("Profit Goal % per Con: ", float(row.iloc[0]['Pos%Tgt'][:5]))             # The Profit Goal % of the Contracts
            # print("Account Risk %: ", float(row.iloc[0]['Tot%Risk'][:5]))                   # What % of the account balance I'm risking per trade.
            # print("Contract % Goal: ", float(row.iloc[0]['Pos$Size'][1:])/100)              # The Value of the contracts like 0.45 or 1.00

            # exit()

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
            spreadsheetId=self.settings.SHEET_ID,
            range=range_name,
            valueInputOption='RAW',
            body=body
        ).execute()
        return result
