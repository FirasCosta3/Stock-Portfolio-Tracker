from stock import Stock
import requests
import yfinance as yf

class Portfolio:
    def __init__(self, db_obj):
        self.db_obj = db_obj
    
    def get_grouped_stocks(self):
        query = self.db_obj.cursor.execute("""SELECT symbol, amount_invested, share_price FROM portfolio""")
        result = query.fetchall()
        return result
    
    def stock_tickers(self):
        query = self.db_obj.cursor.execute("SELECT symbol FROM portfolio")
        result = query.fetchall()
        return result

    def price_average(self, grouped_stocks):
        names = []
        average_price = []
        for name, amount_invested, stock_price in grouped_stocks:
            if stock_price == 0:
                continue
            if name not in names:
                names.append(name)
                shares = amount_invested / stock_price
                average_p = amount_invested / shares
                average_price.append((average_p, name, shares, amount_invested))
            else:
                shares = amount_invested / stock_price
                for i, single_stock in enumerate(average_price):
                    if name in single_stock:
                        total_shares = single_stock[2] + shares
                        if amount_invested > 0:
                            total_amount = single_stock[3] + amount_invested
                            average_p = total_amount / total_shares if total_shares != 0 else 0
                        else:
                            average_p = single_stock[0]
                            total_amount = total_shares * average_p
                        average_price.pop(i)
                        average_price.append((average_p, name, total_shares, total_amount))
                        break
        return average_price
    
    def display_portfolio(self, average_price, user_currency, currency_symbols):  # calculates percentage change based on live data
        stock_dict = {}
        total_invested = []
        for stock in average_price:
            stock_ticker = Stock(stock[1])
            display_name = stock_ticker.ticker_obj.info.get("displayName", stock[1])
            if stock[1] in currency_symbols:
                currency = currency_symbols[stock[1]]
            else:
                cur = stock_ticker.ticker_obj.info.get("currency", "USD")
                currency = currency_symbols.get(cur, cur)  # cur, cur falls back on the currency if the symbol isnt found
            if stock[0] == 0 or stock[2] <= 0:
                return {"status": 404, "error": "sold-all"}
            else:
                current_price = stock_ticker.get_current_price()
                if current_price is None:
                    return {"status": 404, "error": "not-found"}

                current_price = round(current_price, 2)
                percentage_change = float(round(((current_price - stock[0]) / stock[0]) * 100, 2))
                live_price = (current_price * stock[2])
                cur_symbol = currency_symbols.get(user_currency)
                if cur == user_currency:
                    amount_invested = live_price
                    total_invested.append(round(float(amount_invested),2))
                else:
                    try:
                        url = f"https://api.frankfurter.dev/v1/latest?base={cur}&symbols={user_currency}"
                        response = requests.get(url)
                        data = response.json()
                        rate = data["rates"][user_currency]
                        amount_invested = round((live_price * rate),2)
                        total_invested.append(float(amount_invested))
                    except:
                        continue
                stock_dict[display_name] = [percentage_change, cur_symbol, float(amount_invested)]
        return [stock_dict, f"{sum(total_invested):,.2f}", sum(total_invested)]

    def portfolio_value(self, user_currency):
        result = self.db_obj.cursor.execute("SELECT symbol, amount_invested FROM portfolio")
        data = result.fetchall()
        total_amount = []
        for trades in data: 
            ticker_name = trades[0]
            amount_invested = trades[1]
            ticker = yf.Ticker(ticker_name)
            currency = ticker.info.get("currency")
            if currency == user_currency:
                total_amount.append(round(float(amount_invested),2))
            else:
                try:
                    url = f"https://api.frankfurter.dev/v1/latest?base={currency}&symbols={user_currency}"
                    response = requests.get(url)
                    data = response.json()
                    rate = data["rates"][user_currency]
                    amount_invested = round((amount_invested * rate),2 )
                    total_amount.append(float(amount_invested))
                except:
                    continue
        return f"{sum(total_amount):,.2f}", sum(total_amount)