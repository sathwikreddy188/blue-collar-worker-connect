import sqlite3

conn = sqlite3.connect("app.db")
tables = conn.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()

print("Tables in app.db:")
for (name,) in tables:
    count = conn.execute(f"SELECT COUNT(*) FROM {name}").fetchone()[0]
    print(f"  {name}: {count} rows")