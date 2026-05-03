from flask import Flask, render_template, request, jsonify
import psycopg2
from psycopg2.extras import RealDictCursor
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
DATABASE_URL = os.getenv('DATABASE_URL')

def get_db_connection():
    if not DATABASE_URL:
        raise ValueError("No DATABASE_URL set for Supabase connection.")
    # Supabase uses IPv4 pooler, so SSL mode require is recommended.
    conn = psycopg2.connect(DATABASE_URL, sslmode='require')
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS expenses (
            id SERIAL PRIMARY KEY,
            title TEXT NOT NULL,
            amount REAL NOT NULL,
            category TEXT NOT NULL,
            date TEXT NOT NULL
        )
    ''')
    conn.commit()
    cursor.close()
    conn.close()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/expenses', methods=['GET'])
def get_expenses():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute('SELECT * FROM expenses ORDER BY date DESC')
        expenses = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(expenses)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/expenses', methods=['POST'])
def add_expense():
    new_expense = request.get_json()
    title = new_expense.get('title')
    amount = new_expense.get('amount')
    category = new_expense.get('category')
    date = new_expense.get('date')

    if not title or amount is None or not category or not date:
        return jsonify({'error': 'Missing data'}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute('''
            INSERT INTO expenses (title, amount, category, date)
            VALUES (%s, %s, %s, %s) RETURNING id
        ''', (title, amount, category, date))
        conn.commit()
        expense_id = cursor.fetchone()['id']
        cursor.close()
        conn.close()
        return jsonify({'id': expense_id, 'title': title, 'amount': amount, 'category': category, 'date': date}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/expenses/<int:id>', methods=['DELETE'])
def delete_expense(id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('DELETE FROM expenses WHERE id = %s', (id,))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'message': 'Expense deleted successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    if DATABASE_URL:
        init_db()
    else:
        print("WARNING: DATABASE_URL is not set. Please create a .env file and set DATABASE_URL.")
    app.run(debug=True, port=8000)
