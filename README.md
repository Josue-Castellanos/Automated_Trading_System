# Automated Trading System

[![License](https://img.shields.io/github/license/Josue-Castellanos/Automated_Trading_System)](LICENSE)  


## Table of Contents

- [About the Project](#about-the-project)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)


---

## About the Project

The **Automated Trading System** is an unofficial way to access the **Charles Schwabs API**. In addition, its a scalable system designed to execute trades autonomously based on alert triggers from Thinkorswim Trading Platform. It aims to provide transaction processing for various financial instruments, including stocks, bonds, and options (currently stocks and bonds are a work in progress). 

### Key Objectives:

- Authenticate and access the Google and Charles Schwab API.
- Auto "access token" updates and "refresh token" updates.
- Functions for almost all api functions (in schwab/apiV2.py).
- Stream real-time data (Work in progress).
- Automates fast and secure trade execution.
- Follows a performance tracker on Google Sheet.
- Requests real-time data such as price history, option chain, portfolio details, etc.
- Continuosly scrapes Gmail account for alerts sent from Thinkorswim.

## Features

- **Real-time Market Data:** Fetch live market prices and option chains.
- **Portfolio Management:** Track user portfolios.
- **Transaction Processing:** Efficiently handle buy/sell option orders.
- **Analytics Dashboard:** Visualize trading performance (Work in progress).
- **Secure User Authentication:** User login and secure session handling.

## Tech Stack

- **Backend:** [FastAPI](https://fastapi.tiangolo.com/)
- **Database:** [MySQL](https://www.mysql.com/)
- **Frontend:** [React.js](https://reactjs.org/)
- **API Integration:** [Charles Schwab API](https://developer.schwab.com/), [Google Sheet](https://cloud.google.com/), [Google Gmail](https://cloud.google.com/)
- **Authentication:** [OAuth 2.0](https://oauth.net/2/)
- **Testing:** [Postman](https://www.postman.com/)
- **Deployment:** [Heroku](https://www.heroku.com/)

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
