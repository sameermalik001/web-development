# Expense Tracker App

A simple and elegant web application for tracking your expenses, powered by Flask (Python) and Supabase (PostgreSQL).

## 🚀 How to Run Locally

Since sensitive database credentials and large virtual environment files are not included in this repository, you'll need to set up your environment after cloning.

### 1. Clone the repository
```bash
git clone https://github.com/sameermalik001/web-development.git
cd web-development
git checkout backened
```

### 2. Set up the Python Virtual Environment
It's best practice to use a virtual environment so you don't conflict with your system Python packages.
```bash
# Create the virtual environment
python3 -m venv .venv

# Activate the virtual environment
# On Mac/Linux:
source .venv/bin/activate
# On Windows:
# .venv\Scripts\activate
```

### 3. Install Dependencies
```bash
cd expense_tracker
pip install -r requirements.txt
```

### 4. Set up your Database Credentials
The application requires a PostgreSQL database (like Supabase) to store expenses.
1. Make a copy of the example environment file:
   ```bash
   cp .env.example .env
   ```
2. Open the new `.env` file and replace the `DATABASE_URL` placeholder with your actual Supabase PostgreSQL connection string. Ensure special characters in your password are URL-encoded.

### 5. Run the App
```bash
python app.py
```
The application will automatically create the required database tables upon startup. You can now access the app in your browser at `http://127.0.0.1:8000`.
