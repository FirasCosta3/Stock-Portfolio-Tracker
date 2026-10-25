import requests
import yfinance as yf

def search_stock(query):
    search_results = yf.Search(query, max_results=5).quotes
    results =[]
    if search_results == []:
        return False
    else:
        for result in (search_results):
            shortname = result.get("shortname", "N/A")  # takes 'unknown' if the key doesn't have a pair
            symbol = result.get("symbol", "N/A")
            exchange = result.get("exchange", "N/A")
            results.append(f"{symbol}: {shortname}: {exchange}")
    return [results, search_results]

def search_index(search_results, index, currency):
    stock_info = []
    for i in search_results[0]:
        stock_tic = search_results[index].get("symbol", "unknown")
        stock_ticker = yf.Ticker(stock_tic)
        stock_info.append(stock_ticker.info.get("allTimeHigh",0))  # not brackets as it will crash if not find so use .get so if not found it can assign 0
        symbol_choice = search_results[index].get("symbol", "N/A")
        stock_info.append(stock_ticker.info.get("displayName", symbol_choice))
        stock_info.append(stock_ticker.info.get("shortname", "N/A"))
        stock_info.append(symbol_choice)
        stock_currency = stock_ticker.info.get("currency","N/A")  # gets currency symbol according to the market e.g. US market 
        stock_info.append(currency)
        stock_info.append(stock_currency)
        current_price = stock_ticker.history(period="1d")
        stock_info.append(float(f"{current_price["Close"].iloc[-1]:.2f}"))
        return stock_info
    
def get_details(stock_info, user_amount, share_p, trade_type, user_currency, current_portfolio):  # get the amount invested and the price of the stock at the price invested into a list as a tuple
    max_price, display_name, shortname, symbol, currency, real_currency, current_price = stock_info
    purchases = []
    user_amount = int(user_amount)
    if user_amount > 0:
        if real_currency == user_currency:
            amount_invested = user_amount
        else:
            url = f"https://api.frankfurter.dev/v1/latest?base={user_currency}&symbols={real_currency}"
            response = requests.get(url)
            data = response.json()
            rate = data["rates"][real_currency]
            amount_invested = float(user_amount) * rate
        while True:
            share_price = float(share_p)
            purchases.append((amount_invested, share_price))  # two brackets to store as a tuple
            if share_price > max_price:
                return {"status": 404, "error": "high", "max_price": max_price}
            if trade_type == "sell":
                total_shares = sum((row[1] / row[2]) for row in current_portfolio if symbol in row)
                shares_2sell = amount_invested / share_price  # calculate the current value stock holdings not the amount deposited
                total_value = total_shares * share_price
                if shares_2sell > total_shares:
                    return {"status": 404, "error": "sold", "total": float(f"{total_value:.2f}"), "value": float(f"{amount_invested:.2f}")} # not enough shares
                if shares_2sell < total_shares:
                    return {"status": 200, "total": total_value, "price": share_price, "purchases": purchases}
            if trade_type == "buy" or trade_type == "overide":
                if share_price > 0 and (max_price == 0 or share_price <= max_price):
                    return {"status": 200, "purchases": purchases} # successful purchase

                
