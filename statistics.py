import yfinance as yf


intervals = {"1d": "15m",
             "7d": "60m",
             "1mo": "4h",
             "3mo": "5d",
             "1y": "1wk",
             "max": "1mo"}

def percentage_changes(stocks):
    tickers = []
    for i in stocks:
        if i[0] not in tickers:
            tickers.append(i[0])
    highest = {}
    for index, i in enumerate(tickers):
        ticker = yf.Ticker(i)
        current_data = ticker.history(period="1d")
        open_price = current_data.Open.iloc[-1]
        close_price = current_data.Close.iloc[-1]
        percentage_change = ((close_price - open_price)/open_price)* 100
        print(close_price, open_price, percentage_change)
        highest[i] = round(float(percentage_change),2)
    return highest

def high_or_low(percentages):
    highest = []
    lowest = []
    positive = "Worst"
    for index, i in enumerate(percentages.values()):
        if i > 0:
            positive = "Best"
        if len(highest) == 0:
            highest.append(i)
            lowest.append(i)
        if i > highest[0]:
            highest.pop()
            highest.append(i)
        if i < lowest[0]:
            lowest.pop()
            lowest.append(i)
    word = [positive, highest] if positive == "Best" else [positive, lowest]
    ind = list(percentages.values()).index(word[1][0])
    stock = list(percentages.keys())[ind]
    sign = "" if word[1][0] < 0 else "+"
    word[1][0] = f"{sign}{word[1][0]}%"
    return [word, stock]

def stock_graph(statistics, stock_tickers):
    stock_of_day = statistics[1]
    ticker = yf.Ticker(stock_of_day)
    stock_currency = ticker.info.get("currency", "£")
    stock_name = ticker.info.get("shortname")
    if not stock_name:
        stock_name = ticker.info.get("displayName")
    return [statistics[0], [stock_name, stock_currency], ticker]

def stock_percent(stock, time_period): # stock name to ticker symbol
    search = yf.Search(stock, max_results = 1)
    tkr = search.quotes[0]["symbol"]
    ticker = yf.Ticker(tkr)
    period_history = ticker.history(period = time_period)
    close_price = period_history.Close.iloc[-1]
    open_price = period_history.Open.iloc[0]
    percentage = ((close_price - open_price)/open_price)*100
    symbol = "" if percentage < 0 else "+"
    percentage = f"{symbol}{percentage:.2f}%"
    return [percentage, ticker]

def change_graph(stock):
    ticker = yf.Ticker(stock)
    stock_name = ticker.info.get("shortname")
    if not stock_name:
        stock_name = ticker.info.get("displayName")

def graph_data(ticker, time_period):
    interval = intervals[time_period]
    ticker_history = ticker.history(period = time_period, interval = interval)
    price_info = ticker_history.Close
    price_data = {}
    for time_stamp in price_info.index:
        date = time_stamp.strftime("%d/%m at %H:%M") if time_period != "max" and time_period != "3mo" and time_period != "1y" else time_stamp.strftime("%d/%m/%y")
        price = f"{round(float(price_info[time_stamp]), 2): .2f}"
        price_data[date] = price
    return price_data
