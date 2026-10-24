import yfinance as yf


intervals = {"1d": "15m",
             "7d": "90m",
             "1m": "4h",
             "6m": "1d",
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
        total_change = close_price - open_price
        percentage_change = (total_change / open_price)*100
        highest[i] = round(float(percentage_change),2)
    return highest

def high_or_low(percentages):
    print(percentages)
    highest = []
    lowest = []
    positive = False
    for index, i in enumerate(percentages.values()):
        if i > 0:
            positive = True
        if len(highest) == 0:
            highest.append(i)
            lowest.append(i)
        if i > highest[0]:
            highest.pop()
            highest.append(i)
        if i < lowest[0]:
            lowest.pop()
            lowest.append(i)
    word = [positive, highest] if positive else [positive, lowest]
    ind = list(percentages.values()).index(word[1][0])
    return [word, ind]

def stock_graph(statistics, stock_tickers, scale):
    ind = statistics[1]
    stock_of_day = stock_tickers[ind][0]
    ticker = yf.Ticker(stock_of_day)
    interval = intervals[scale]
    ticker_history = ticker.history(period = scale, interval = interval)
    price_info = ticker_history.Close
    time_stamps = price_info.index.strftime("%H:%M").tolist()
    prices = price_info.values.tolist()
    price_data = {}
    for time_stamp in price_info.index:
        time = time_stamp.strftime("%H:%M")
        price = f"{round(float(price_info.loc[time_stamp]), 2): .2f}"
        price_data[time] = float(price)
    return [price_data, statistics[0]]