import yfinance as yf
import logging
from database import Database
from stock import currency_symbols
from portfolio import Portfolio
import requests
# using this file to reverse engineer CLI to react website so very messy
logging.getLogger("yfinance").setLevel(
    logging.CRITICAL)  # blocks non-critical errors like 404 when user inputs invalid ticker
    
def get_details(max_price, choice2, rows, symbol,currency, user_currency,real_currency):  # get the amount invested and the price of the stock at the price invested into a list as a tuple
        x = 0
        purchases = []
        while x == 0:
            try:
                word1 = "sold" if choice2 == "2" else "bought"
                print("If you have made a mistake type [M] to return to the main menu")
                user_symbol = currency_symbols.get(user_currency)
                amount_inv = input(f"Enter the amount you have {word1} of the stock, in {user_symbol}\n").lower()
                if amount_inv.strip() == "m":
                    x += 1
                    return False
                user_amount = float(amount_inv)
                if user_amount > 0:
                    if real_currency == user_currency:  # only mixup is between GBP and GBp which is same currency but 100x more
                        amount_invested = user_amount
                    else:
                        url = f"https://api.frankfurter.dev/v1/latest?base={user_currency}&symbols={real_currency}"
                        response = requests.get(url)
                        data = response.json()
                        rate = data["rates"][real_currency]
                        amount_invested = float(user_amount) * rate
                    while True:
                        print("If you have made a mistake type [M] to return to the main menu")
                        share_p = input(f"Enter the price of the stock when you {word1} it, in {currency}\n").lower()
                        if share_p.strip() == "m":
                            return False
                        try:
                            share_price = float(share_p)
                            if choice2 == "2":
                                total_shares = sum((row[1] / row[2]) for row in rows if symbol in row)
                                shares_2sell = amount_invested / share_price  # calculate the current value stock holdings not the amount deposited
                                total_value = total_shares * share_price
                                if shares_2sell > total_shares:
                                    print(
                                        f"You couldn't have sold at {user_currency}{amount_invested:.2f} if you had {currency}{total_value:.2f} in {symbol} at {currency}{share_price}")
                                    continue
                            if share_price > 0 and (max_price == 0 or share_price <= max_price):
                                purchases.append((amount_invested, share_price))  # two brackets to store as a tuple
                                x += 1
                                return purchases
                            elif share_price < 0:
                                print("Enter a share price more than 0")
                            elif share_price > max_price:
                                print(
                                    f"The max price was {currency}{max_price} so you couldn't have bought it at {currency}{share_price:.2f}!")
                        except ValueError:
                            print("Make sure you enter a valid number")
                            continue
                else:
                    print(f"The amount invested much be greater than {currency}0.00")
            except ValueError:
                continue
        
def display_currency(currency_symbols):
    while display_cur not in currency_symbols.keys():
        print("Enter a valid currency or type [Q] to quit")
        display_cur = input(
            "Enter the currency you would like to view your portfolio in e.g 'GBP' or 'USD'\n").upper()
        if display_cur == "Q":
            return display_cur
    return display_cur

choices_options = {"Declare a stock purchase to track on your portfolio": "1",
                   "Declare a stock sell to track on your portfolio": "2",
                   "Check my portfolio progress": "3",
                   "Declare the total amount you invested and the average price of your stock if available": "4",
                   "Reset your portfolio": "5"}
db = Database()
while True:
    print("\nEnter [ANY OTHER KEY] other than [1-5] if you want to stop the program")
    for chce, x in choices_options.items():
        print(f"{x}. {chce}")
    choice2 = input("Enter the number of the choice you would like!\n")
    match choice2:
        case "1":
            my_portfolio = Portfolio(db)
            rows = my_portfolio.get_grouped_stocks()
            stock_info = get_stock(choice2, rows, currency_symbols)
            if stock_info == "M":
                continue
            else:
                max_price, display_name, shortname, symbol, currency, user_currency, real_currency = stock_info  # assigns variables to their list index that got returned in stock_info function
                purchases = get_details(max_price, choice2, rows, symbol, currency, user_currency,
                                        real_currency)
                if purchases == False:
                    pass
                else:
                    db.db_assign(symbol, purchases)
                    my_portfolio = Portfolio(db)
                    rows = my_portfolio.get_grouped_stocks()  # adds duplicate rows
        case "2":
            my_portfolio = Portfolio(db)
            rows = my_portfolio.get_grouped_stocks()
            stock_info = get_stock(choice2, rows, currency_symbols)
            if stock_info == "M" or stock_info == False:
                continue
            else:
                max_price, display_name, shortname, symbol, currency, user_currency, real_currency = stock_info
                purchases = get_details(max_price, choice2, rows, symbol, currency, user_currency,
                                        real_currency)
                if purchases == False:
                    pass
                else:
                    negative_sales = [(-amount, price) for amount, price in purchases]
                    db.db_assign(symbol, negative_sales)
                    my_portfolio = Portfolio(db)
                    rows = my_portfolio.get_grouped_stocks()
        
        case "3":
            my_portfolio = Portfolio(db)
            rows = my_portfolio.get_grouped_stocks()
            grouped_stocks = my_portfolio.get_grouped_stocks()
            if grouped_stocks == []:
                print("Sorry your portfolio is empty, nothing to show you!")
                continue
            else:
                average_price = my_portfolio.price_average(grouped_stocks)
                my_portfolio.display_portfolio(average_price, "GBP", currency_symbols)
        case "4":
            my_portfolio = Portfolio(db)
            rows = my_portfolio.get_grouped_stocks()
            stock_info = get_stock("1", rows)
            if stock_info == "M":
                continue
            else:
                try:
                            average_price = float(average_p)
                            symbol = stock_info[3]
                            stock_ticker = yf.Ticker(symbol)
                            max_price = stock_ticker.info.get("allTimeHigh", 0)
                            if total_amount > 0 and (average_price > 0 and (max_price == 0 or average_price <= max_price)):
                                delete = input(
                                    f"Enter [D] if you would like to delete your current {stock_info[1]} holdings and replace it with your inputs or [ANY OTHER KEY] to add your inputs to your current holdings\n").lower()
                                if delete.strip() == "d":
                                    db.db_clear_symbol(symbol)
                                    direct_purchase = [(total_amount, average_price)]
                                    db.db_assign(symbol, direct_purchase)
                                    print(
                                        f"You successfully replaced your {stock_info[1]} previous average holdings")
                                else:
                                    direct_purchase = [(total_amount, average_price)]
                                    db.db_assign(symbol, direct_purchase)
                                    print(f"You successfully added to your current {stock_info[1]} holdings")
                            else:
                                print(f"Make sure you enter a proper price of {stock_info[1]}")
                                continue
                except ValueError:
                    print("Make sure to enter a valid number!")
        case "5":
            my_portfolio = Portfolio(db)
            rows = my_portfolio.get_grouped_stocks()
            db.df_reset()
        
        case "6":
            pass
        
        case _:
            break
print("See you soon!")