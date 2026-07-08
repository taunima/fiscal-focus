# Fiscal Focus

A full stack financial tracking web app that is built with Python, SQLite, and JavaScript. The user is able to track their finances by seeing what is being spent, goals for accounts, transactions in accounts, and even what is being spent in different categories.

## Stack
- Backend: Python, Flask
- Frontend: HTML, CSS, JavaScript
- Database: SQLite

## Features
- Create multiple bank accounts to view and track the transactions within each account
- Add and delete transactions with automatic updates to the balance of the account.
- Show what is being spent in categories
- Add goals to each individual account

## Future Improvements
- Automatic transaction categorization
- User authentication
- Edit existing transaction
- Track transactions, with flagging transactions if they are recurring.
- Add and delete accounts

## How to run locally
1. Clone the repository
2. Install dependencies:
    ```
    pip install flask flask-cors
    ```
3. Run the backend:
    ```
    python3 finance_app.py
    ```
4. Open `finance_frontend/fiscal_home.html` with Live Server in VSCode
5. Navigate to `http://127.0.0.1:5500` in your browser

## Screenshots
![Home page](screenshots/dashboard.png)
![Account page](screenshots/account_page.png)
![Transaction page](screenshots/transaction_page_and_add_form.png)

## Author
Built by Simon Taunima as a portfolio project