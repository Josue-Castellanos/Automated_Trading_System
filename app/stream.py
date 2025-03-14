import pandas as pd
import json
import numpy as np
import asyncio
import websockets
import sys
sys.path.append("/home/ubuntu/Automated_Trading_System")
from schwab import Schwab
from app.config import Settings
from utils import datetime, convert_epoch_to_datetime, stream_price_data


class Stream:
    def __init__(self, streamer_info):
        self.settings = Settings()
        self.streamer_info = streamer_info
        self._request_id = 0
        self._websocket = None
        self.active = False
        self.df = None
        self.one_minute_data = []  # Stores 1-minute candles before forming a 5-minute candle

    def set_dataframe(self, df):
        """
        Set the initial DataFrame to be updated.
        """
        self.df = df

    async def _start_stream(self, receiver_func=print, ping_timeout=30):
        """
        Start the WebSocket stream and subscribe to SPY data.
        """
        while True:
            try:
                async with websockets.connect(self.streamer_info.get('streamerSocketUrl'), ping_timeout=ping_timeout) as self._websocket:
                    print("Connected to streaming server.")

                    self._request_id += 1
                    login_payload = {
                        "service": "ADMIN",
                        "command": "LOGIN",
                        "requestid": self._request_id,
                        "SchwabClientCustomerId": self.streamer_info.get("schwabClientCustomerId"),
                        "SchwabClientCorrelId": self.streamer_info.get("schwabClientCorrelId"),
                        "parameters": {
                            "Authorization": self.settings.ACCESS_TOKEN,
                            "SchwabClientChannel": self.streamer_info.get("schwabClientChannel"),
                            "SchwabClientFunctionId": self.streamer_info.get("schwabClientFunctionId")
                        }
                    }
                    await self._websocket.send(json.dumps(login_payload))

                    while True:
                        response = await self._websocket.recv()
                        data = json.loads(response)

                        if "response" in data:
                            for res in data["response"]:
                                if res.get("command") == "LOGIN" and res.get("content", {}).get("code") == 0:
                                    print("Login successful.")
                                    break
                            else:
                                continue  
                        break

                    subscribe_payload = {
                        "service": "CHART_EQUITY",
                        "command": "SUBS",
                        "requestid": self._request_id,
                        "SchwabClientCustomerId": self.streamer_info.get("schwabClientCustomerId"),
                        "SchwabClientCorrelId": self.streamer_info.get("schwabClientCorrelId"),
                        "parameters": {
                            "keys": "SPY",
                            "fields": "0, 1, 2, 3, 4, 5, 6, 7, 8"
                        }
                    }
                    await self._websocket.send(json.dumps(subscribe_payload))
                    print("Subscribed to SPY 1-minute data.")

                    self.active = True
                    while True:
                        response = await self._websocket.recv()
                        await receiver_func(response, self)
            except Exception as e:
                print(f"Error: {e}")
            finally:
                self.stop()
                self.active = False
                print("WebSocket stream stopped.")

    def start(self, receiver):
        """
        Start the WebSocket stream.
        """
        if not self.active:
            asyncio.run(self._start_stream(receiver))
        else:
            print("Stream is already active.")

    def stop(self):
        """
        Stop the stream.
        """
        if self.active:
            self.active = False
            print("Stream stopping...")


async def process_data(data, stream):
    """
    Processes incoming 1-minute data, aggregates into 5-minute candles, and saves to CSV.
    """
    parsed_data = json.loads(data)
    
    if "data" in parsed_data:
        for item in parsed_data["data"]:
            for content in item["content"]:
                new_candle = {
                    "Datetime": convert_epoch_to_datetime(content["7"]),
                    "Open": content["2"],
                    "High": content["3"],
                    "Low": content["4"],
                    "Close": content["5"],
                    "Volume": content["6"],
                }

                print("")
                print(f"Timestamp: {new_candle['Datetime']}, Open Price: {new_candle['Open']}, High Price: {new_candle['High']}, Low Price: {new_candle['Low']}, Close Price: {new_candle['Close']}, Volume: {new_candle['Volume']}")

                # Store 1-minute data
                stream.one_minute_data.append(new_candle)

                # Check if it's time to aggregate a 5-minute candle
                if len(stream.one_minute_data) == 5:
                    _aggregate_five_minute_candle(stream)


def _aggregate_five_minute_candle(stream):
    """
    Aggregates stored 1-minute candles into a single 5-minute candle and appends to CSV.
    """
    if len(stream.one_minute_data) < 5:
        return

    five_minute_candle = {
        "Datetime": stream.one_minute_data[0]["Datetime"],                      # First timestamp of the group
        "Open": stream.one_minute_data[0]["Open"],                              # First 1-minute candle 
        "High": max(candle["High"] for candle in stream.one_minute_data),
        "Low": min(candle["Low"] for candle in stream.one_minute_data),
        "Close": stream.one_minute_data[-1]["Close"],                           # Last 1-minute candle
        "Volume": sum(candle["Volume"] for candle in stream.one_minute_data),
    }

    # Convert to DataFrame and append
    new_df = pd.DataFrame([five_minute_candle])
    new_df.set_index("Datetime", inplace=True)

    # Append to main dataframe
    stream.df = pd.concat([stream.df, new_df])
    stream.df.sort_index(inplace=True)                    
    print(stream.df.tail())

    # Save to CSV
    csv_filename = sys.path.append("/home/ubuntu/Automated_Trading_System/5min_candles.csv")

    # This needs to also replace a row with the same datetime, since this is the grouped up 5 minute candle.
    # TODO:// Needs to be fixed before production
    new_df.to_csv(csv_filename, mode='a',header=False, index=True)

    # Clear stored 1-minute candles
    stream.one_minute_data.clear()


# def _aggregate_fifteen_minute_candle(stream):
#     return
# def _aggregate_thirty_minute_candle(stream):
#     return
# def _aggregate_60_minute_candle(stream):
#     return


# Initialize trading stream
schwab = Schwab()
streamer_info = schwab.preferences().get('streamerInfo', None)[0]
df = stream_price_data(schwab, 'SPY', datetime.now(), datetime.now())

stream = Stream(streamer_info)
stream.set_dataframe(df)

# Start stream with new data processing function
async def data_in_df(data, *args):
    await process_data(data, stream)

stream.start(data_in_df)
