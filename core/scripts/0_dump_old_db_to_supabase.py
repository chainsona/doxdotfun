from dotenv import load_dotenv
import os
import requests
import time
import sqlite3
from supabase import create_client, Client
from tqdm import tqdm

# Load environment variables from .env
load_dotenv()

# Fetch variables
SUPABASE_URL = os.getenv("supabase_url")
SUPABASE_KEY = os.getenv("supabase_service_role_key")

def connect_to_supabase() -> Client:
    return create_client(SUPABASE_URL, SUPABASE_KEY)

def fetch_data_from_sqlite(sqlite_db_path, table_name):
    conn = sqlite3.connect(sqlite_db_path)
    cursor = conn.cursor()
    cursor.execute(f"SELECT * FROM {table_name} WHERE status != 'invalid'")
    rows = cursor.fetchall()
    columns = [description[0] for description in cursor.description]
    conn.close()
    
    return rows, columns

def insert_data_to_supabase(table_name, rows, columns):
    rows = rows[2000:]
    for row in tqdm(rows):
        # Connect to Supabase
        supabase = connect_to_supabase()

        data = dict(zip(columns, row))
        # print(f"Inserting data: {data}")
        fixed_data = {
                        "mint": None,
                        "name": None,
                        "symbol": None,
                        "website": data['website'],
                        "ip": data['ip'],
                        "developer": None,
                    }
        # print(f"Fixed data: {fixed_data}")

        existing_website = supabase.table("PumpFunIPs").select("website").eq("website", data['website']).execute()

        if existing_website.data:
            # print(f"Website {data['website']} already exists in the database.")
            pass
        else:
            # print(f"Website {data['website']} is new and will be saved.")
            try:
                supabase.table(table_name).insert(fixed_data).execute()
            except Exception as e:
                print(f"An error occurred while saving the website: {e}")
        # break

def main():
    sqlite_db_path = "/home/swell/git/pumpfun/pumpfun-dumper/db/hosts.db"
    sqlite_table_name = "hosts"
    supabase_table_name = "PumpFunIPs"

    # Fetch data from SQLite
    rows, columns = fetch_data_from_sqlite(sqlite_db_path, sqlite_table_name)

    print(f"Found {len(rows)} rows in the SQLite database.")
    print(f"Columns: {columns}")
    # # Print first row for debugging
    # if rows:
    #     print(f"First row: {rows[0]}")
    # else:
    #     print("No rows found in the SQLite database.")

    # Insert data into Supabase
    insert_data_to_supabase(supabase_table_name, rows, columns)

if __name__ == "__main__":
    main()