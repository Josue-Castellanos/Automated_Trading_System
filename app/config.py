from pydantic_settings import BaseSettings, SettingsConfigDict
from dotenv import load_dotenv
import os

load_dotenv()


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env")
    
    ACCESS_TOKEN_DATETIME: str
    REFRESH_TOKEN_DATETIME: str
    JSON_DICT: dict
    ACCESS_TOKEN: str
    REFRESH_TOKEN: str
    ID_TOKEN: str 
    ACCOUNT_NUMBER: int
    APP_KEY: str
    SECRET_KEY: str
    ENV_PATH: str   
    CALLBACK_URL: str 
    ACCOUNT_ENDPOINT: str
    MARKET_ENDPOINT: str
    POST_ENDPOINT: str
    STREAM_ENDPOINT: str   

    CLIENT_ID: str
    CLIENT_SECRET: str
    SHEET_ID: str
    PERFORMANCE_PATH: str

    IMAP_SERVER: str
    IMAP_PORT: int
    EMAIL_ACCOUNT: str
    EMAIL_PASSWORD: str


    @classmethod
    def reload(cls):
        """
        Reload the .env file and refresh settings.
        """
        load_dotenv(override=True)  # Reload .env variables into the environment
        return cls()



