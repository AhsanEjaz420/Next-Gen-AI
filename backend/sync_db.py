import sqlite3
import os

def patch_database():
    db_path = 'app.db'
    if not os.path.exists(db_path):
        print(f"Database file {db_path} not found.")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    print("Checking for missing columns and tables...")
    
    # 1. Add columns to user_sessions
    try:
        cursor.execute("ALTER TABLE user_sessions ADD COLUMN refresh_token TEXT")
        print("Added refresh_token to user_sessions")
    except sqlite3.OperationalError:
        print("refresh_token already exists")

    try:
        cursor.execute("ALTER TABLE user_sessions ADD COLUMN expires_at DATETIME")
        print("Added expires_at to user_sessions")
    except sqlite3.OperationalError:
        print("expires_at already exists")

    # 2. Add column to content_history
    try:
        cursor.execute("ALTER TABLE content_history ADD COLUMN is_favorite BOOLEAN DEFAULT 0")
        print("Added is_favorite to content_history")
    except sqlite3.OperationalError:
        print("is_favorite already exists")

    # 3. Create user_profiles table
    try:
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS user_profiles (
                user_id CHAR(32) PRIMARY KEY,
                business_niche VARCHAR(255),
                brand_tone VARCHAR(100),
                target_audience TEXT,
                brand_description TEXT,
                FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        """)
        print("Ensured user_profiles table exists")
    except sqlite3.OperationalError as e:
        print(f"Error creating user_profiles table: {e}")

    conn.commit()
    conn.close()
    print("Database sync complete!")

if __name__ == "__main__":
    patch_database()
