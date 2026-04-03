import sqlite3
import random
from faker import Faker

def build_database():
    conn = sqlite3.connect('ecommerce.db')
    cursor = conn.cursor()

    # Create Tables
    cursor.execute('''CREATE TABLE IF NOT EXISTS users (user_id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT NOT NULL)''')
    cursor.execute('''CREATE TABLE IF NOT EXISTS products (product_id INTEGER PRIMARY KEY AUTOINCREMENT, product_name TEXT NOT NULL, price REAL NOT NULL)''')
    cursor.execute('''CREATE TABLE IF NOT EXISTS orders (order_id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, product_id INTEGER, quantity INTEGER NOT NULL, FOREIGN KEY (user_id) REFERENCES users (user_id), FOREIGN KEY (product_id) REFERENCES products (product_id))''')

    fake = Faker()

    # Generate Data
    print("Generating users, products, and orders...")
    users_data = [(fake.name(), fake.email()) for _ in range(3000)]
    cursor.executemany('INSERT INTO users (name, email) VALUES (?, ?)', users_data)

    product_types = ['Laptop', 'Mouse', 'Keyboard', 'Monitor', 'Headphones', 'Desk', 'Chair']
    products_data = [(f"{fake.company()} {random.choice(product_types)}", round(random.uniform(10.0, 1500.0), 2)) for _ in range(100)]
    cursor.executemany('INSERT INTO products (product_name, price) VALUES (?, ?)', products_data)

    orders_data = [(random.randint(1, 3000), random.randint(1, 100), random.randint(1, 5)) for _ in range(5000)]
    cursor.executemany('INSERT INTO orders (user_id, product_id, quantity) VALUES (?, ?, ?)', orders_data)

    conn.commit()
    conn.close()
    print("Database 'ecommerce.db' successfully created!")

if __name__ == "__main__":
    build_database()