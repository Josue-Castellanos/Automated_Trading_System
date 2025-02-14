from client import Client
from datetime import datetime, time
from apscheduler.schedulers.background import BackgroundScheduler
import pytz
from tokens import Tokens


class Scheduler:
    def __init__(self):
        self.scheduler = BackgroundScheduler()
        self.client = None

        tz = pytz.timezone('America/Los_Angeles')

        # Schedule the start and stop of the client with the specified timezone
        self.scheduler.add_job(self.start, 'cron', hour=13, minute=54, timezone=tz)
        self.scheduler.add_job(self.stop, 'cron', hour=13, minute=59, timezone=tz)

        # # Check if market is already open when script starts
        # if self.is_market_open():
        #     self.start()

        # Start the scheduler
        self.scheduler.start()


    # def is_market_open(self):
    #     """
    #     Check if the current time is within market hours
    #     """
    #     now = datetime.now()
    #     market_open = time(6, 30)  # e.g., 9:30 AM
    #     market_close = time(13, 58)  # e.g., 3:58 PM
    #     return market_open <= now.time() <= market_close
    

    def start(self):
        if not self.client:
            self.client = Client()
            print("Client started")


    def stop(self):
        if self.client:
            self.client.sell_position()
            self.client.save_settings()
            self.client = None
            print("Client stopped")


if __name__ == "__main__":
    tokens = Tokens()
    scheduler = Scheduler()

    # try:
    #     while True:
    #         pass  # Keeps the script alive
    # except KeyboardInterrupt:
    #     print("Scheduler stopped manually.")