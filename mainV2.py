from bot.clientV2 import Client
from datetime import datetime, time
import time as t
import threading

class MarketWatcher:
    def __init__(self):
        self.client = None


    def is_market_open(self):
        """
        Check if the current time is within market hours
        """
        now = datetime.now()
        market_open = time(9, 30)  # e.g., 9:30 AM
        market_close = time(13, 00)  # e.g., 4:00 PM
        return market_open <= now.time() <= market_close


    def manage_client(self):
        """
        Manage the client instantiation based on market hours
        """
        if self.is_market_open():
            if self.client is None:
                self.client = Client()  # Instantiate the Gmail client here
                print("Client is on!")
            else:
                self.client.gmail.set_checker(True)
                pass
        else:
            # TODO:// We can either stop the scrapping process which
            # prevents purchases of contracts
            if self.client is not None:
                self.client.gmail.set_checker(False)    # Stop Scrapping
                print("Scrapping is off")
                # del self.client  # Delete the client
                # self.client = None
            else:
                pass


    def start_watching(self):
        """
        Start checking the market status at regular intervals
        """
        while True:
            self.manage_client()
            t.sleep(1)  # Check every 10 seconds


def main():
    # Instantiate MarketWatcher
    market_watcher = MarketWatcher()

    # Start watching the market and managing the client based on market hours
    market_watcher.start_watching()


if __name__ == "__main__":
    main()



    