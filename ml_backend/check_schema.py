import sqlite3

def get_schema(db_name):
    out = f"--- Schema for {db_name} ---\n"
    try:
        conn = sqlite3.connect(db_name)
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        for table in tables:
            table_name = table[0]
            out += f"Table: {table_name}\n"
            cursor.execute(f"PRAGMA table_info({table_name});")
            columns = cursor.fetchall()
            for col in columns:
                out += f"  {col[1]} ({col[2]})\n"
        conn.close()
    except Exception as e:
        out += f"Error: {e}\n"
    out += "\n"
    return out

with open('schema_out.txt', 'w', encoding='utf-8') as f:
    f.write(get_schema("webcam_attendance.db"))
    f.write(get_schema("platform_data.db"))
