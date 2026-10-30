# This is to connect the backend to the frontend. Flask is making the door of the backend so that it can make the connection properly. Cors is what allows the different door sizes to actually work and walk through those doors.
from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import os
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# The sqlite is the database that is holding the data so that it can be stored there from the frontend and backend. It can also be used within the app.

# These makes the app get fired up and used across different ports.
app = Flask(__name__)
CORS(app)

# This is to show the home page of the tracker.
@app.route('/')
def home_page():
    return "Finance Tracker Home Page"

# This route is grabbing data from the account table in the SQL file from here (the backend). It can also be used wherever on the HTML and it is used through both the backend and frontend of the app. The Post methods are used for getting data from the frontend going through the backend (here in this file), and sends it back to the databse. In this particular route it is for the account table.
@app.route('/add_account', methods=['POST'])
def add_account():
    # These are the data points used from the database, through here (the backend), and sent to the frontend. In this case it is for the account table data points.
    data = request.get_json()
    user_id = data.get('user_id')
    account_name = data.get('account_name')
    account_type = data.get('account_type')
    balance = data.get('balance')

    # These are to build that connection from here (the backend) and send to the frontend. The cursor is used just as its name suggests, which is that it is aligning on both the frontend and backend of the data points from the connection that is made to the database. It will then grab the data needed for the cursor to execute the connection needed. It will then be committed and closed so that it is left open. Then after to confirm it has been successful it will send a message to confim this.
    connection = sqlite3.connect(os.path.join(BASE_DIR, 'finance_db', 'finance_tracker.db'))
    cursor = connection.cursor()
    cursor.execute("INSERT INTO account (user_id, account_name, account_type, balance) VALUES (?, ?, ?, ?)", (user_id, account_name, account_type, balance))
    connection.commit()
    connection.close()

    return jsonify({"message": "Account has successfully added!"})

# This route is grabbing data from the frontend and then sent through here (the backend) back to the database. The GET methods are different then the POST methods as this is doing the opposite of the POST methods by grabbing the data from the database and sending it back to the frontend. In this particular route it is for the account table.
@app.route('/get_account', methods=['GET'])
def get_account():
    connection = sqlite3.connect(os.path.join(BASE_DIR, 'finance_db', 'finance_tracker.db'))
    connection.row_factory = sqlite3.Row
    cursor = connection.cursor()
    cursor.execute("SELECT * FROM account")
    rows = cursor.fetchall()
    accounts = [dict(row) for row in rows]
    connection.close()

    return jsonify(accounts)

# This is doing what the account route is doing for the POST but for the account_goal table.
@app.route('/add_account_goal', methods=['POST'])
def add_account_goal():
    data = request.get_json()
    user_id = data.get('user_id')
    account_id = data.get('account_id')
    goal_name = data.get('goal_name')
    goal_target = data.get('goal_target')
    current_amount = data.get('current_amount')
    notes = data.get('notes')

    connection = sqlite3.connect(os.path.join(BASE_DIR, 'finance_db', 'finance_tracker.db'))
    cursor = connection.cursor()
    cursor.execute("INSERT INTO account_goal (user_id, account_id, goal_name, goal_target, current_amount, notes) VALUES (?, ?, ?, ?, ?, ?)", (user_id, account_id, goal_name, goal_target, current_amount, notes))
    connection.commit()
    connection.close()

    return jsonify({"message": "Goals for your account has been successfully added!"})

# This is doing what the account GET route is doing but for the account_goal table.
@app.route('/get_account_goal', methods=['GET'])
def get_account_goal():
    connection = sqlite3.connect(os.path.join(BASE_DIR, 'finance_db', 'finance_tracker.db'))
    connection.row_factory = sqlite3.Row
    cursor = connection.cursor()
    cursor.execute("SELECT * FROM account_goal")
    rows = cursor.fetchall()
    account_goals = [dict(row) for row in rows]
    connection.close()

    return jsonify(account_goals)

# This is the same concept as before but for the transaction table, for the POST route.
@app.route('/add_transactions', methods=['POST'])
def add_transactions():
    data = request.get_json()
    date = data.get('date')
    name = data.get('name')
    amount = data.get('amount')
    is_recurring = data.get('is_recurring')
    transaction_type = data.get('transaction_type')
    account_id = data.get('account_id')
    categories_id = data.get('categories_id')

    connection = sqlite3.connect(os.path.join(BASE_DIR, 'finance_db', 'finance_tracker.db'))
    cursor = connection.cursor()
    cursor.execute("INSERT INTO transactions (date, name, amount, is_recurring, transaction_type, account_id, categories_id) VALUES (?, ?, ?, ?, ?, ?, ?)", (date, name, amount, is_recurring, transaction_type, account_id, categories_id))
    connection.commit()
    connection.close()

    return jsonify({"message": "Transaction has been made!"})

# This is the same concept as before but for the transaction table, for the GET route.
@app.route('/get_transactions', methods=['GET'])
def get_transactions():
    connection = sqlite3.connect(os.path.join(BASE_DIR, 'finance_db', 'finance_tracker.db'))
    connection.row_factory = sqlite3.Row
    cursor = connection.cursor()
    cursor.execute("SELECT * FROM transactions")
    rows = cursor.fetchall()
    transactions = [dict(row) for row in rows]
    connection.close()

    return jsonify(transactions)

# This function is to delete transactions from the account.
@app.route('/delete_transactions/<int:transaction_id>', methods=['DELETE'])
def delete_transactions(transaction_id):
    connection = sqlite3.connect(os.path.join(BASE_DIR, 'finance_db', 'finance_tracker.db'))
    cursor = connection.cursor()
    cursor.execute("""DELETE FROM transactions WHERE id = ?""", (transaction_id,))
    connection.commit()
    connection.close()

    return jsonify({"message": "Transaction deleted successfully."})

# This funciton is to update the balance of the account that the user is accessing.
@app.route('/update_balance', methods=['PUT'])
def update_balance():
    data = request.get_json()
    account_id = data.get('account_id')
    transaction_type = data.get('transaction_type')
    amount = data.get('amount')

    connection = sqlite3.connect(os.path.join(BASE_DIR, 'finance_db', 'finance_tracker.db'))
    cursor = connection.cursor()
    # This if statement is to clarify of what will happen if you are depositing money or withdrawling money as well. It will be updating the balance as each transaction is done.
    if transaction_type == "deposit":
        cursor.execute("UPDATE account SET balance = balance + ? WHERE id = ?", (amount, account_id))
    elif transaction_type == "withdrawal":
        cursor.execute("UPDATE account SET balance = balance - ? WHERE id = ?", (amount, account_id))
    connection.commit()
    connection.close()

    return jsonify({"message": "The balance has been updated."})

# This is the same concept as before but for the categories table, for the POST route.
@app.route('/add_categories', methods=['POST'])
def add_categories():
    data = request.get_json()
    category_name = data.get('category_name')

    connection = sqlite3.connect(os.path.join(BASE_DIR, 'finance_db', 'finance_tracker.db'))
    cursor = connection.cursor()
    cursor.execute("INSERT INTO categories (category_name) VALUES (?)", (category_name,))
    connection.commit()
    connection.close()

    return jsonify({"message": "Category has been added."})

# This is the same concept as before but for the categories table, for the GET route.
@app.route('/get_categories', methods=['GET'])
def get_categories():
    connection = sqlite3.connect(os.path.join(BASE_DIR, 'finance_db', 'finance_tracker.db'))
    connection.row_factory = sqlite3.Row
    cursor = connection.cursor()
    cursor.execute("SELECT * FROM categories")
    rows = cursor.fetchall()
    categories = [dict(row) for row in rows]
    connection.close()

    return jsonify(categories)

# This route is for the pie chart in showing the spending of each category across all accounts
@app.route('/spending_by_category', methods=['GET'])
def spending_by_category():
    connection = sqlite3.connect(os.path.join(BASE_DIR, 'finance_db', 'finance_tracker.db'))
    connection.row_factory = sqlite3.Row
    cursor = connection.cursor()
    # In the cursor.execute we are grabbing from the selected table of transactions and joining it together with the categories table. Then it is only adding to the spending chart with withdrawals from the accounts.
    cursor.execute("""
        SELECT categories.id, categories.category_name, 
            COUNT(transactions.id) AS num_transactions,
            SUM(transactions.amount) AS total_spent,
            AVG(transactions.amount) AS avg_spend
        FROM transactions
        JOIN categories ON transactions.categories_id = categories.id
        WHERE LOWER(transactions.transaction_type) = 'withdrawal'
        GROUP BY categories.id, categories.category_name
        ORDER BY total_spent DESC
        """)
    rows = [dict(row) for row in cursor.fetchall()]
    connection.close()

    return jsonify(rows)

# This creates the database tables from the schema file if they don't already exist in the file. The routes are defined by @app.route decorators above each of the functions.
def initialize_db():
    connection = sqlite3.connect(os.path.join(BASE_DIR, 'finance_db', 'finance_tracker.db'))
    cursor = connection.cursor()
    # This 'with' is opening the path for the BASE_DIR to be used with the database and schema as well. It does this to be read and executed for all of the routes. It closes so that the routes can be used.
    with open (os.path.join(BASE_DIR, 'finance_db', 'finance_schema.sql'), 'r') as f:
        schema = f.read()
        cursor.executescript(schema)
    connection.close()

# This is actually the entry point that starts everything. It does this by running initialize_db to first set up the tables and then starts the Flask server with app.run(debug=True).
if __name__ == '__main__':
    initialize_db()
    app.run(debug=True)