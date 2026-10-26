import yfinance as yf
import logging
import time
from database import Database
from stock import currency_symbols
from portfolio import Portfolio
from search import get_details, search_stock, search_index
from flask import Flask, jsonify, request
from flask_cors import CORS
from statistics import percentage_changes, high_or_low, stock_graph, stock_percent, change_graph, graph_data

logging.getLogger("yfinance").setLevel(logging.CRITICAL)  # blocks non-critical errors like 404 when user inputs invalid ticker

app = Flask(__name__)
CORS(app)
currency = "GBP"
stock_search = ""

@app.route("/portfolio", methods = ["POST"]) # load portfolio on web refresh
def portfolio():
    start = time.perf_counter()
    data = request.get_json()
    global currency
    currency, stock_tickers = data.values()
    db = Database()
    my_portfolio = Portfolio(db)
    grouped_stocks = my_portfolio.get_grouped_stocks()
    if not grouped_stocks:
        return jsonify({"status": 404, "data": []})
    if stock_tickers == "":
        stock_tickers = my_portfolio.stock_tickers() 
        percentages = percentage_changes(stock_tickers) # finding highest or lowest stock of the day
        statistics = high_or_low(percentages)
        graph_list = stock_graph(statistics, stock_tickers)
        ticker = graph_list[2]
        price_data = graph_data(ticker, "1d")
        graph_list.insert(0, price_data)
        graph_list.pop()
    else:
        search = yf.Search(stock_tickers, max_results = 1)
        tkr = search.quotes[0]["symbol"]
        ticker = yf.Ticker(tkr)
        graph_list = ""
    average_price = my_portfolio.price_average(grouped_stocks)
    db_data = my_portfolio.display_portfolio(average_price, currency, currency_symbols)
    end = time.perf_counter()
    print("fetching portfolio took ",(end-start),"s")
    print(graph_list)
    return jsonify({"data": db_data, "status": 200, "stock_graph": graph_list})

@app.route("/stocks", methods = ["POST"]) # retreive stock searches that is chosen through the search
def stocks():
    data = request.get_json()
    stock_choice = data.get("search")
    print(stock_choice)
    if not stock_choice:
        return jsonify({"status": 404})
    stock_searches = search_stock(stock_choice)
    global stock_search
    stock_search = stock_searches[1]
    if stock_searches[0] == False:
        return jsonify({"status": 404})
    else:
        return jsonify({"data": stock_searches[0], "status": 200})

@app.route("/tradeDetails", methods = ["POST"]) # fetch stock details from users choice
def trade_details(): 
    data = request.get_json()
    index = data.get("index")
    currency = data.get("currency")
    stock_info = search_index(stock_search, index, currency)
    return jsonify({"status": 200, "info": stock_info})
 
@app.route("/trade", methods = ["POST"]) # user trade request
def trade(): 
    data = request.get_json()
    trade_type, trade_value, stock_info, user_currency, trade_price = data.values()
    db = Database()
    my_portfolio = Portfolio(db)
    current_portfolio = my_portfolio.get_grouped_stocks()
    response = get_details(stock_info, trade_value, trade_price, trade_type, user_currency, current_portfolio) # stocks details
    if response["status"] == 200:
        purchases = response.get("purchases")
        symbol = stock_info[3]
        if trade_type == "sell": # if the user chose sell
            negative_sales = [(-amount, price) for amount, price in purchases]
            db.db_assign(symbol, negative_sales)
            my_portfolio = Portfolio(db)
        elif trade_type == "buy":   # buy trade
            db.db_assign(symbol, purchases)
            my_portfolio = Portfolio(db)
        elif trade_type == "overide": # full stock overide / removing old trades for the stock
            symbol = stock_info[3]
            trade_value = float(trade_value)
            trade_price = float(trade_price)
            stock_ticker = yf.Ticker(symbol)
            max_price = stock_ticker.info.get("allTimeHigh", 0)
            if trade_value > 0 and (trade_price > 0 and (max_price == 0 or trade_price <= max_price)):
                db.db_clear_symbol(symbol)
                direct_purchase = [(trade_value, trade_price)]
                db.db_assign(symbol, direct_purchase)
            else:
                direct_purchase = [(trade_value, trade_price)]
                db.db_assign(symbol, direct_purchase)
    return response

@app.route("/reset", methods = ["POST"])
def reset_portfolio():
    db = Database()
    db.df_reset()
    return jsonify({"status": 200})

@app.route("/timePeriod", methods = ["POST"])
def time_period():
    data = request.get_json()
    percentage, price_data = get_graph(data, time_period)
    return jsonify({"status": 200, "price_data": price_data, "percentage": percentage})

def get_graph(data, time_period):
    stock = data["stock"]
    time_period = data["period"]
    percentage, ticker = stock_percent(stock, time_period)
    price_data = graph_data(ticker, time_period)
    return percentage, price_data

if __name__ == "__main__":
    app.run(port = 5000, debug=True)