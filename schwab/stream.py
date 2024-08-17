import json
import requests
import asyncio
import websockets

class Stream:
    
    
    def __init__(self, schwab_api):
        self.streamer_info = None
        self.request_id = 1
        self.schwab_api = schwab_api
        self.websocket = None
        self.symbols = ["SPY"]
        self.STREAM_ENDPOINT = "https://api.schwab.com/v1"
        self.WEBSOCKET_URL = "wss://streamer.api.schwab.com"

    def get_user_preferences(self):
        headers = {
            "Authorization": f"Bearer {self.schwab_api.accessToken}"
        }
        response = requests.get(f"{self.STREAM_ENDPOINT}/userpreferences", headers=headers)
        if response.status_code == 200:
            return response.json()
        else:
            print("Failed to get user preferences")
            return None

    async def on_message(self):
        async for message in self.websocket:
            data = json.loads(message)
            print("Received message:", data)

    async def subscribe_services(self):
        intervals = {
            "1MIN": "2",
            "5MIN": "3",
            "15MIN": "4",
            "30MIN": "5",
            "1HOUR": "6",
            "2HOUR": "7",
            "4HOUR": "8",
            "DAILY": "9"
        }

        for symbol in self.symbols:
            for interval, request_id in intervals.items():
                subscribe_request = {
                    "requests": [{
                        "requestid": self.request_id,
                        "service": "CHART_EQUITY",
                        "command": "SUBS",
                        "SchwabClientCustomerId": self.streamer_info.get("schwabClientCustomerId"),
                        "SchwabClientCorrelId": self.streamer_info.get("schwabClientCorrelId"),
                        "parameters": {
                            "keys": symbol,
                            "fields": "1,2,3,4,5,6,7,8,9,10",
                            "frequency": interval
                        }
                    }]
                }
                await self.websocket.send(json.dumps(subscribe_request))

    async def connect(self):
        async with websockets.connect(self.streamer_info.get('streamerSocketUrl')) as self.websocket:
            print("WebSocket connection opened")

            # Login to the streamer
            login_request = {
                "requests": [{
                    "requestid": self.request_id,
                    "service": "ADMIN",
                    "command": "LOGIN",
                    "SchwabClientCustomerId": self.streamer_info.get("schwabClientCustomerId"),
                    "SchwabClientCorrelId": self.streamer_info.get("schwabClientCorrelId"),
                    "parameters": {
                        "Authorization": self.schwab_api.accessToken,
                        "SchwabClientChannel": self.streamer_info.get("schwabClientChannel"),
                        "SchwabClientFunctionId": self.streamer_info.get("schwabClientFunctionId")
                    }
                }]
            }
            await self.websocket.send(json.dumps(login_request))

            # Subscribe to various interval chart data for the symbols
            await self.subscribe_services()

            # Handle incoming messages
            await self.on_message()

    async def start(self):
        response = self.schwab_api.preferences()
        if response.ok:
            self.streamer_info = response.json().get('streamerInfo', None)[0]
            await self.connect()

            # asyncio.run(streamer.start())



