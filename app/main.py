from client import Client
from datetime import datetime, time
import time as t

from tokens import Tokens

# Main.py will later be changed to MarketWatcher.py so services.py in Django can stop create and instance and start the 
# System from the fronend once the user has been authorized through a login procedure using JWT. 

class MarketWatcher:
    def __init__(self):
        self.client = None


    def is_market_open(self):
        """
        Check if the current time is within market hours
        """
        now = datetime.now()
        market_open = time(9, 30)  # e.g., 9:30 AM
        market_close = time(15, 58)  # e.g., 3:58 PM
        return market_open <= now.time() <= market_close

    def manage_client(self):
        """
        Manage the client instantiation based on market hours
        """
        if self.is_market_open():
            if self.client is None:
                print("Market is open, start Client!")
                self.start_client()
            elif self.client is not None and not self.client.is_enough_funds():
                self.stop_client()
            else:
                print("Market is open, Client is running, and enough funds to trade!")
                pass
        else:
            if self.client is not None:
                print("Market is closed, Client shuting down!")
                self.stop_client()
            else:
                print("Market is closed, Client is down!")
                pass


    def stop_client(self):
        self.client.gmail.set_checker(None)  
        self.client.sell_position()
        self.client.save_settings()
        del self.client


    def start_client(self):
        self.client = Client()
    
    
    def start_watching(self):
        """
        Start checking the market status at regular intervals
        """
        while True:
            self.manage_client()
            t.sleep(10)  # Check every 10 seconds


def main():
    tokens = Tokens()

    # Instantiate MarketWatcher
    market_watcher = MarketWatcher()

    # Start watching the market and managing the client based on market hours
    market_watcher.start_watching()



if __name__ == "__main__":
    main()



    