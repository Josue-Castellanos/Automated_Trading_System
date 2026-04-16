import pytz
from apscheduler.schedulers.background import BackgroundScheduler
from backend.client import Client
from backend.utils import market_is_open
import backend.log
import logging
logger = logging.getLogger("trading")

class Scheduler:
    def __init__(self):
        self.scheduler = BackgroundScheduler()
        self.client = None

        tz = pytz.timezone("America/Los_Angeles")

        # Schedule the start and stop of the client with the specified timezone
        # This will me migrated to a more dynamic system later
        self.scheduler.add_job(self.start, "cron", hour=6, minute=30, timezone=tz)
        self.scheduler.add_job(self.stop, "cron", hour=13, minute=00, timezone=tz)

        # Start the scheduler
        self.scheduler.start()
        
        # Check if market is already open when script starts
        # if market_is_open():
        self.start()


    def start(self):
        if self.client is None:
            logger.info("Client started")
            frequency = 5  # <--------- SUPER IMPORTNAT!! FREQUENCY OF THE SYSTEM IN MINUTES --------->
            self.client = Client(frequency)

    def stop(self):
        if self.client:
            # self.client.sell_position()
            self.client.save_settings()
            if self.client.thread:
                self.client.thread.join()
                logger.info("Client thread stopped")
            self.client = None
            logger.info("Client stopped")


if __name__ == "__main__":
    logger.info("Scheduler script started")
    scheduler = Scheduler()

    # try:
    #     while True:
    #         pass  # Keeps the script alive
    # except KeyboardInterrupt:
    #     logger.error("Scheduler stopped manually.")
        
