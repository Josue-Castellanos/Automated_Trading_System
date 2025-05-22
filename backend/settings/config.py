import os
from pathlib import Path
from typing import ClassVar

from dotenv import load_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent
ENV_PATH = BASE_DIR / ".env"
load_dotenv(ENV_PATH)

PERFORMANCE_PATH = BASE_DIR / os.environ.get("PERFORMANCE_PATH")


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=ENV_PATH)

    ENV_PATH: ClassVar[Path] = ENV_PATH

    ACCESS_TOKEN_DATETIME: str
    REFRESH_TOKEN_DATETIME: str
    JSON_DICT: dict
    ACCESS_TOKEN: str
    REFRESH_TOKEN: str
    ID_TOKEN: str
    ACCOUNT_NUMBER: int
    APP_KEY: str
    SECRET_KEY: str
    CALLBACK_URL: str
    ACCOUNT_ENDPOINT: str
    MARKET_ENDPOINT: str
    POST_ENDPOINT: str
    STREAM_ENDPOINT: str
    PERFORMANCE_PATH: str

    CLIENT_ID: str
    CLIENT_SECRET: str
    SHEET_ID: str

    IMAP_SERVER: str
    IMAP_PORT: int
    EMAIL_ACCOUNT: str
    EMAIL_PASSWORD: str

    DJANGO_SECRET_KEY: str
    DEBUG: bool
    ALLOWED_HOSTS: str
    POSTGRES_ENGINE: str
    POSTGRES_DB: str
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    PG_HOST: str
    PG_PORT: int

    SIGNING_KEY: str
    LOCALHOST: str

    DOMAIN: str
    EMAIL_HOST: str
    EMAIL_HOST_USER: str
    EMAIL_HOST_PASSWORD: str
    EMAIL_PORT: int

    CELERY_BROKER: str
    CELERY_BACKEND: str
    CELERY_EMAIL_BACKEND: str

    @classmethod
    def reload(cls):
        """
        Reload the .env file and refresh settings.
        """
        load_dotenv(
            cls.ENV_PATH, override=True
        )  # Reload .env variables into the environment
        return cls()
