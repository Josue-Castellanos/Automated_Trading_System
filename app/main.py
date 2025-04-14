from client_stream import Client, market_is_open
from apscheduler.schedulers.background import BackgroundScheduler
import pytz
from tokens import Tokens


class Scheduler:
    def __init__(self):
        self.scheduler = BackgroundScheduler()
        self.client = None

        tz = pytz.timezone('America/Los_Angeles')

        # Schedule the start and stop of the client with the specified timezone
        self.scheduler.add_job(self.start, 'cron', hour=6, minute=30, timezone=tz)
        self.scheduler.add_job(self.stop, 'cron', hour=12, minute=50, timezone=tz)

        # Check if market is already open when script starts
        if market_is_open():
            self.start()

        # Start the scheduler
        self.scheduler.start()
    

    def start(self):
        if self.client is None:
            print("Client started\n")
            frequency = 6                         ## <--------- SUPER IMPORTNAT!! FREQUENCY OF THE SYSTEM IN MINUTES --------->
            self.client = Client(frequency)


    def stop(self):
        if self.client:
            self.client.sell_position()
            self.client.save_settings()
            if self.client.thread:
                self.client.thread.join()
                print("Client thread stopped")
            self.client = None
            print("Client stopped")


if __name__ == "__main__":
    tokens = Tokens()
    scheduler = Scheduler()

    try:
        while True:
            pass  # Keeps the script alive
    except KeyboardInterrupt:
        print("Scheduler stopped manually.")