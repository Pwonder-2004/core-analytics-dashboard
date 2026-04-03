from flask import Flask, jsonify
from flask_cors import CORS
import sqlite3

app = Flask(__name__)
# Enable CORS for all routes so React can talk to Flask
CORS(app, resources={r"/*": {"origins": "*"}})

def get_db_connection():
    conn = sqlite3.connect('ecommerce.db')
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/api/data')
def get_data():
    conn = get_db_connection()
    
    # Data for the main dashboard view (Overview)
    users = [dict(row) for row in conn.execute('SELECT * FROM users LIMIT 10').fetchall()]
    products = [dict(row) for row in conn.execute('SELECT * FROM products LIMIT 10').fetchall()]
    orders_query = '''
        SELECT orders.order_id, users.name, products.product_name, orders.quantity 
        FROM orders
        JOIN users ON orders.user_id = users.user_id
        JOIN products ON orders.product_id = products.product_id
        LIMIT 500
    '''
    orders = [dict(row) for row in conn.execute(orders_query).fetchall()]
    
    # Data for the "Databases" view (Table names and counts)
    counts_query = '''
        SELECT 'users' as table_name, count(*) as count FROM users
        UNION ALL
        SELECT 'products' as table_name, count(*) as count FROM products
        UNION ALL
        SELECT 'orders' as table_name, count(*) as count FROM orders
    '''
    db_counts = [dict(row) for row in conn.execute(counts_query).fetchall()]
    
    conn.close()
    
    # Return all data, including the new table counts
    return jsonify({
        'users': users, 
        'products': products, 
        'orders': orders, 
        'db_counts': db_counts
    })

# THIS is the part that keeps the server running!
if __name__ == '__main__':
    app.run(debug=True, port=5000)