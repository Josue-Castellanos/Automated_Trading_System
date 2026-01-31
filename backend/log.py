import logging
import logging.config
from pathlib import Path

LOG_LEVEL = "INFO"
BASE_DIR = Path(__file__).resolve().parent

# Go UP one level, then into logs/
LOG_DIR = BASE_DIR.parent / "logs"
LOG_DIR.mkdir(parents=True, exist_ok=True)

logging.config.dictConfig(
    {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "console": {
                "format": "%(asctime)s %(name)-20s %(levelname)-8s %(message)s",
            },
            "file": {
                "format": "%(asctime)s %(name)-12s %(levelname)-8s %(message)s"
            },
        },
        "handlers": {
            "console": {
                "class": "logging.StreamHandler",
                "formatter": "console",
            },
            "file": {
                "level": LOG_LEVEL,
                "class": "logging.FileHandler",
                "formatter": "file",
                "filename": LOG_DIR / "home.log",
            },
            "trading_file": {
                "level": LOG_LEVEL,
                "class": "logging.FileHandler",
                "formatter": "file",
                "filename": LOG_DIR / "trading.log",
            },
        },
        "loggers": {
            "": { 
                "handlers": ["console", "file"],
                "level": LOG_LEVEL,
                "propagate": False,
            },
            "apps": {
                "level": LOG_LEVEL,
                "handlers": ["console", "file"],
                "propagate": False
            },
            "trading": {
                "level": LOG_LEVEL,
                "handlers": ["console", "trading_file"],
                "propagate": False
            },
        },
    }
)