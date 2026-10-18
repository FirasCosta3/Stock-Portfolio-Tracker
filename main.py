import yfinance as yf
import logging
from database import Database
from stock import currency_symbols
from portfolio import Portfolio
from search import get_details, search_stock, search_index
from flask import Flask, jsonify, request
from flask_cors import CORS, cross_origin

logging.getLogger("yfinance").setLevel(logging.CRITICAL)  # blocks non-critical errors like 404 when user inputs invalid ticker

app = Flask(__name__)
CORS(app)
currency = "GBP"
stock_search = ""

@app.route("/portfolio", methods = ["POST"]) # load portfolio on web refresh
def portfolio():
    data = request.get_json()
    global currency
    currency = data.get("currency", "GBP")
    db = Database()
    my_portfolio = Portfolio(db)
    grouped_stocks = my_portfolio.get_grouped_stocks()
    if not grouped_stocks:
        return jsonify({"status": 404, "data": []})
    average_price = my_portfolio.price_average(grouped_stocks)
    db_data = my_portfolio.display_portfolio(average_price, currency, currency_symbols)
    return jsonify({"data": db_data, "status": 200})

@app.route("/stocks", methods = ["POST"]) # retreive stock searches that is picked through the search
def stocks():
    data = request.get_json()
    stock_choice = data.get("search")
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
    trade_type = data.get("type")
    trade_value = data.get("trade")
    stock_info = data.get("info")
    user_currency = data.get("currency")
    trade_price = data.get("price")
    db = Database()
    my_portfolio = Portfolio(db)
    current_portfolio = my_portfolio.get_grouped_stocks()
    response = get_details(stock_info, trade_value, trade_price, trade_type, user_currency, current_portfolio) # stocks details
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

def display_currency(currency_symbols):
    display_cur = input("Enter the currency you would like to view your portfolio in e.g 'GBP' or 'USD'\n").upper()
    while display_cur not in currency_symbols.keys():
        print("Enter a valid currency or type [Q] to quit")
        display_cur = input("Enter the currency you would like to view your portfolio in e.g 'GBP' or 'USD'\n").upper()
        if display_cur == "Q":
            return display_cur
    return display_cur

choices_options = {"Declare a stock purchase to track on your portfolio": "1",
                   "Declare a stock sell to track on your portfolio": "2",
                   "Check my portfolio progress": "3",
                   "Declare the total amount you invested and the average price of your stock if available": "4",
                   "Reset your portfolio": "5"}

if __name__ == "__main__":
    app.run(port = 5000, debug=True)
    
    