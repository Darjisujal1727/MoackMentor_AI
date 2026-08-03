"""Utility to create the SQLite database and print a quick status."""
from app import app
from db import db

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        print('Database and tables created (if not present): app.db')
