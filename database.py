import sqlite3


class Database:
    def __init__(self, db_name="Portfolio.db"):
        self.db_name = db_name
        self.connection, self.cursor = self.db_sync()
    
    def db_sync(self):
        connection = sqlite3.connect(self.db_name, check_same_thread = False)  # create the database and table
        cursor = connection.cursor()
        command1 = ("""CREATE TABLE IF NOT EXISTS portfolio(
                           buy_id INTEGER PRIMARY KEY,
                           symbol TEXT,
                           amount_invested FLOAT,
                           share_price FLOAT)""")
        cursor.execute(command1)
        connection.commit()
        return connection, cursor
    
    def db_assign(self, symbol, purchases):  # assign variables inputed into the database table
        for amount_invested, share_price in purchases:
            amount_invested = f"{amount_invested:.2f}"
            share_price = f"{share_price:.2f}"
            self.cursor.execute("INSERT INTO portfolio(symbol, amount_invested, share_price) VALUES(?,?,?)",
                                (symbol, float(amount_invested), float(share_price)))
            self.connection.commit()
    
    def db_clear_symbol(self, symbol):  # removes the row if we call to replace it
        self.cursor.execute("DELETE FROM portfolio WHERE symbol = ?", (symbol,))
        self.connection.commit()
    
    def df_reset(self):
        self.cursor.execute("DELETE FROM portfolio")
        self.connection.commit()
        return 200