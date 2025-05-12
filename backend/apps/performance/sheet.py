import pandas as pd
from google.oauth2 import service_account
from googleapiclient.discovery import build

from backend.settings.config import PERFORMANCE_PATH, Settings


class Sheet:
    """
    A class to handle Gmail operations, including authentication,
    email checking, and Google Sheets interactions.
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
        self.SERVICES = [
            "https://www.googleapis.com/auth/drive",
            "https://www.googleapis.com/auth/spreadsheets",
        ]
        self.creds = service_account.Credentials.from_service_account_file(
            PERFORMANCE_PATH, scopes=self.SERVICES
        )

    def read_sheet(self):
        """
        Read data from a Google Sheet and return it as a pandas DataFrame.

        This method retrieves data from a specified range in a Google Sheet
        and converts it into a pandas DataFrame.

        Returns:
            pandas.DataFrame or None:
                A DataFrame containing the sheet data
                if successful, None otherwise.
        """
        service = build(
            "sheets", "v4", credentials=self.creds, cache_discovery=False
        )
        RANGE = "perf!A10:P"

        sheet = service.spreadsheets()
        result = (
            sheet.values()
            .get(spreadsheetId=self.settings.SHEET_ID, range=RANGE)
            .execute()
        )
        values = result.get("values", [])

        if values:
            # Ensure all rows have the same number of columns as the header
            num_columns = len(values[0])  # Number of columns in the header
            for i in range(1, len(values)):  # Skip the header row
                values[i].extend(
                    [""] * (num_columns - len(values[i]))
                )  # Pad with empty strings

            # Now create the DataFrame
            df = pd.DataFrame(
                values[1:], columns=values[0]
            )  # First row is assumed to be headers

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
        service = build("sheets", "v4", credentials=self.creds)
        body = {"values": [[value]]}
        result = (
            service.spreadsheets()
            .values()
            .update(
                spreadsheetId=self.settings.SHEET_ID,
                range=range_name,
                valueInputOption="RAW",
                body=body,
            )
            .execute()
        )
        return result
