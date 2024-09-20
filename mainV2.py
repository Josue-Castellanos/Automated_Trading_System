from system.clientV2 import Client
from datetime import datetime, time
import time as t


class MarketWatcher:
    def __init__(self):
        self.client = None


    def is_market_open(self):
        """
        Check if the current time is within market hours
        """
        now = datetime.now()
        market_open = time(9, 30)  # e.g., 9:30 AM
        market_close = time(12, 59)  # e.g., 4:00 PM
        return market_open <= now.time() <= market_close


    def manage_client(self):
        """
        Manage the client instantiation based on market hours
        """
        if self.is_market_open():
            if self.client is None:
                self.client = Client()  # Instantiate the Gmail client here
                print("Market is open, Client is on!")
            else:
                print("Market is open, Client is running!")
                self.client.gmail.set_checker(True)
                pass
        else:
            if self.client is not None:
                print("Market is closed, Client is down!")
                self.client.gmail.set_checker(None)    # Stop Scrapping
                self.client.sell_position()
                self.client.save_settings()
                # del self.client  # Delete the client
                self.client = None
            else:
                print("Market is closed, and client is down!")
                pass
           

    def start_watching(self):
        """
        Start checking the market status at regular intervals
        """
        while True:
            self.manage_client()
            t.sleep(10)  # Check every 10 seconds


def main():
    # Instantiate MarketWatcher
    market_watcher = MarketWatcher()

    # Start watching the market and managing the client based on market hours
    market_watcher.start_watching()


if __name__ == "__main__":
    main()



    