<img width="1719" height="974" alt="Screenshot 2026-10-31 075942" src="https://github.com/user-attachments/assets/cae2c655-adef-404c-9cc7-64ed470dd919" />
<img width="1719" height="976" alt="Screenshot 2026-10-31 075531" src="https://github.com/user-attachments/assets/d0d1a494-3474-4c8b-b890-65482564db1e" />
﻿# Stock Portfolio Tracker

## Fully functional Portfolio Tracker with live stock market data to view and track portfolio progress.

- Log all of your trades / buying or selling
- View short and long term data of individual stocks
- Change currency depending on your preference

## What it does
- **User Interface:** Responsive single-page application built with React.js, featuring dynamic state management for real-time market updates.
- **Data Visualisation:** Interactive real-time line graphs and portfolio pie chart implemented using Chart.js, for real-time trade analysis.
- **Live Market Data:** Real-time stock market data from the `yfinance` library.
- **Trading System:** Stores trades in a local SQLite database (`Portfolio.db`), logging buys as positive values and sells as negative, replacing the current stock value if you choose to override old trades.
- **Smart Profit Tracking:** Keeps your original trades intact when you trade, meaning your ROI and percentage updates stay mathematically accurate.

## Tech Stack
* **Backend:** Python, Flask
* **Database:** SQLite3
* **Frontend:** React.js, Chart.js

## Local Installation
1. Clone Repository:
  ```bash
  git clone https://github.com/FirasCosta3/Stock-Portfolio-Tracker
  ```

2. Install dependencies:
  ```bash
  pip install -r requirements.txt
  npm install
  ```

3. Run Backend:
  ```bash
  python3 main.py
  ```

4. Run Frontend:
  ```bash
  cd frontend
  npm run dev
  ```
