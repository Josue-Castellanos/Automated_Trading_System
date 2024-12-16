# Automated Trading System

[![License](https://img.shields.io/github/license/Josue-Castellanos/Automated_Trading_System)](LICENSE)  


## Table of Contents

- [About the Project](#about-the-project)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)


---

## About the Project

The **Automated Trading System** is an unofficial way to access the **Charles Schwabs API**. In addition, its a scalable system designed to execute trades autonomously based on alert triggers from Thinkorswim Trading Platform. It aims to provide transaction processing for various financial instruments, including stocks and options. 


### Key Objectives:

- Authenticate and access the Google and Charles Schwab API.
- Auto "access token" updates and "refresh token" updates.
- Functions for almost all API functions (in src/app/schwab.py).
- Stream real-time data (Work in progress).
- Continuosly scrapes Gmail account for buy/sell alerts sent from Thinkorswim.
- Automates fast and secure trade execution based on alerts.
- Follows a performance tracker on Google Sheet.
- Requests real-time data such as price history, option chain, portfolio details, etc.

## Features

- **Real-time Market Data:** Fetch live market prices and option chains.
- **Portfolio Management:** Track user portfolios.
- **Transaction Processing:** Handle buy/sell option orders.
- **Analytics Dashboard:** Visualize trading performance (Work in progress).
- **Secure User Authentication:** User login and secure session handling.

## Tech Stack

- **Backend:** [Django Ninja](https://django-ninja.dev/)
- **Database:** [MySQL](https://www.mysql.com/)
- **Frontend:** [Django](https://www.djangoproject.com/)
- **API Integration:** [Charles Schwab API](https://developer.schwab.com/), [Google Sheet](https://cloud.google.com/), [Google Gmail](https://cloud.google.com/)
- **Testing:** [Postman](https://www.postman.com/)
- **Deployment:** [AWS](https://aws.amazon.com/), [Heroku](https://www.heroku.com/)

## Installation

### Prerequisites
- **Thinkorswim Account** (Charles Schwabs Trading Platform)
- **Charles Schwabs Developer Account** (Charles Schwabs Developer Portal)
- **Google Cloud Platform Account** (Google Cloud Computing Services)
- **Gmail Account** (Solely for trading)
- **MySQL** (local or cloud-based instance)


### Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/Josue-Castellanos/Automated_Trading_System.git
   cd Automated_Trading_System
2. Setup .env file in app directory
   ```
   ACCESS_TOKEN_DATETIME = None
   REFRESH_TOKEN_DATETIME = None
   JSON_DICT = None
   ACCESS_TOKEN = None
   REFRESH_TOKEN = None
   ID_TOKEN = None
   ACCOUNT_NUMBER = Your Charles Schwab Account Number here
   APP_KEY = Your Charles Schwab App Key here
   SECRET_KEY = Your Charles Schwab App Secret Key here
   ENV_PATH = Your Enviroment Variables Path here
   CALLBACK_URL = Your App Callback URL here (if local then https://127.0.0.1
   ACCOUNT_ENDPOINT = https://api.schwabapi.com/trader/v1
   MARKET_ENDPOINT = https://api.schwabapi.com/marketdata/v1
   POST_ENDPOINT = https://api.schwabapi.com/v1/oauth/token
   STREAM_ENDPOINT = https://api.schwab.com/v1
   
   CLIENT_ID = Your Google Service Client ID here
   CLIENT_SECRET = Your Google Service Client Secret here
   SHEET_ID = [Optional] Your Google Sheet ID here
   PERFORMANCE_PATH = Your Google Service Performance JSON Path here
   CREDENTIALS_PATH = Your Google Service Credentials JSON Path here
   TOKEN_PATH = Your Google Service Token JSON Path here

