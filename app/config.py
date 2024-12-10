from pydantic_settings import BaseSettings, SettingsConfigDict
from dotenv import load_dotenv
import os


class Settings(BaseSettings):
    load_dotenv()
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
    CREDENTIALS_PATH: str
    TOKEN_PATH: str


settings = Settings()



