import pandas as pd
from google.oauth2 import service_account
from googleapiclient.discovery import build

from backend.config import PERFORMANCE_PATH, Settings


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

    def column_letter_to_index(self, col_letter):
        """Convert Excel/Google Sheets column letters to a 1-based index."""
        num = 0
        for c in col_letter:
            num = num * 26 + (ord(c.upper()) - ord('A') + 1)
        return num

    def read_etf_sheet(self):
        """
        separators: list of column letters that mark the END of each table block.
                    Example: ["F", "O", "W", "AE"]
        """
        separators=["F", "O", "W", "AE", "AM"]
        # Convert separators to numeric indices (1-based)
        separators_idx = [self.column_letter_to_index(c) for c in separators]

        # We'll build column ranges from 1 → sep1, (sep1+1 → sep2), etc
        col_ranges = []
        start = 1
        for sep in separators_idx:
            col_ranges.append((start, sep))
            start = sep + 1

        # Load all values from the sheet
        service = build("sheets", "v4", credentials=self.creds, cache_discovery=False)
        RANGE = "ETFs!A3:AL"  # wide enough to capture all tables
        result = service.spreadsheets().values().get(
            spreadsheetId=self.settings.STOCK_LIST_SHEET_ID,
            range=RANGE
        ).execute()

        values = result.get("values", [])
        df_full = pd.DataFrame(values)

        output_tables = {}

        # Process each column block
        for i, (start_col, end_col) in enumerate(col_ranges):
            # Convert 1-based → 0-based indexing
            sc = start_col - 1
            ec = end_col

            block = df_full.iloc[:, sc:ec]

            # Drop fully empty rows
            block = block.dropna(how="all")

            # If block is empty → skip
            if block.empty:
                continue

            # Replace NaN with empty string for consistency
            block = block.fillna("")

            # Identify header as first non-empty row
            header_idx = block.apply(lambda row: row.astype(str).str.strip().any(), axis=1).idxmax()

            header = block.loc[header_idx].tolist()

            # Remaining rows = data
            data = block.loc[header_idx + 1 :]

            # Rebuild DataFrame with header
            cleaned = pd.DataFrame(data.values, columns=header)
            cleaned = cleaned.iloc[:, :-1]
            # Store in output dictionary
            table_name = f"table_{i+1}"

            if i == 0:
                # first table is made of up of two tables
                cleaned_1 = cleaned.iloc[:5, :].reset_index(drop=True)
                # Drop the last row of the first table which is not needed
                cleaned_1 = cleaned_1.iloc[:-1, :]


                cleaned_2 = cleaned.iloc[5:, :].reset_index(drop=True)
                # Lets make the cleaned 2 dataframe first row a header
                new_header = cleaned_2.iloc[0]
                cleaned_2 = cleaned_2[1:]  # take the data less the header
                cleaned_2.columns = new_header  # set the header row as the df header
                # remove emtpy rows with all '' str values
                cleaned_2 = cleaned_2[~(cleaned_2 == '').all(axis=1)]
                
                output_tables["table_1a"] = cleaned_1
                output_tables["table_1b"] = cleaned_2
            else:
                
                output_tables[table_name] = cleaned.reset_index(drop=True)


        return output_tables

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
