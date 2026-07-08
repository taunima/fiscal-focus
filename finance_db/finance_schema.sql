-- Finance Tracker
-- These are tables to help store values and be used throughout the database

-- This table is for the accounts so that it can be organized
CREATE TABLE IF NOT EXISTS account (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    account_name TEXT,
    account_type TEXT, 
    balance REAL
);

-- This table is for the account_goal so that the goals of the accounts can be tracked
CREATE TABLE IF NOT EXISTS account_goal (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER, 
    account_id INTEGER,
    goal_name TEXT,
    goal_target REAL,
    current_amount REAL,
    notes TEXT
);

-- This table is for the transactions within the accounts so that it can be used properly
CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT, 
    name TEXT,
    amount REAL,
    is_recurring INTEGER,
    transaction_type TEXT,
    account_id INTEGER, 
    categories_id INTEGER
);

-- This table is for the spending budget and that it can know what is being spent and what category it falls into
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_name TEXT
);