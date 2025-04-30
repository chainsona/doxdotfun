import sqlite3
from collections import Counter
import requests

from collections import Counter
import os
from supabase import create_client, Client

from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

# Fetch variables
SUPABASE_URL = os.getenv("supabase_url")
SUPABASE_KEY = os.getenv("supabase_service_role_key")

def create_supabase_client(url: str, key: str) -> Client:
    return create_client(url, key)

supabase = create_supabase_client(SUPABASE_URL, SUPABASE_KEY)

# SQLite database path
DB_PATH = "db/db.sqlite"

def create_sqlite_connection(db_path: str):
    """Create a connection to the SQLite database."""
    return sqlite3.connect(db_path)

def get_top_developers(conn):
    """Fetch the top 5 developers based on the number of launches."""
    query = """
    SELECT creator, COUNT(*) as launch_count
    FROM tokens
    WHERE creator IS NOT NULL
    GROUP BY creator
    HAVING launch_count > 1
    ORDER BY launch_count DESC
    LIMIT 10
    """
    cursor = conn.execute(query)
    developers = cursor.fetchall()
    for developer, count in developers:
        print(f"Developer: {developer}, Launches: {count}")
    return [developer for developer, _ in developers]

def get_developer_data(conn, address):
    """Fetch the first funder for a given address."""

    try:
        # Check if the address already exists in the Addresses table with cached data
        address_data = supabase.table("Addresses").select("*").eq("address", address).execute()

        if address_data.data and address_data.data[0].get("first_funder") is not None:
            # Use cached data
            # print(f"Using cached data for Address {address}: First Funder: {address_data.data[0]['first_funder']}")
            return address_data.data[0]['first_funder']
    except Exception as e:
        print(f"Error fetching cached data for {address}: {e}")
    
    # Fetch first funder data if not cached
    first_funder_url = f"http://localhost:3000/doxdotfun/api/developer/firstFunder/{address}"
    try:
        first_funder_response = requests.get(first_funder_url)
        first_funder_response.raise_for_status()
        first_funder = first_funder_response.json().get("first_funder", None)
    except requests.RequestException as e:
        print(f"Error fetching first funder for {address}: {e}")
        first_funder = None

    try:
        # Update the existing record
        supabase.table("Addresses").upsert({
            "first_funder": first_funder,
        }).eq("address", address).execute()
        # print(f"Updated address {address} in Addresses table.")
    except Exception as e:
        pass
    
    return first_funder

def recursive_find_first_funders(conn, starting_address, iterations):
    """Recursively find the chain of first funders."""
    current_address = starting_address
    chain = [current_address]

    for _ in range(iterations):
        first_funder = get_developer_data(conn, current_address)

        if not first_funder:
            print(f"No further first funder found for {current_address}. Stopping recursion.")
            break

        current_address = first_funder
        chain.append(current_address)

        # Early exit if we hit a loop
        if chain.count(current_address) > 1:
            print(f"Detected a loop at {current_address}. Stopping recursion.")
            break

    return chain

def main():
    """Main function to fetch and process developers."""
    conn = create_sqlite_connection(DB_PATH)

    # Step 1: Fetch developers from the database
    developers = get_top_developers(conn)

    # Step 2: Fetch more detailed data for each developer and collect all first funders
    all_first_funders = []
    if developers:
        for developer in developers:
            try:
                chain = recursive_find_first_funders(conn, developer, 10)
                all_first_funders.extend(chain)
            except Exception as e:
                print(f"Failed to fetch data for Developer {developer}: {e}")

        # Remove duplicates from the list of first funders
        all_first_funders = list(set(all_first_funders))
        for funder in all_first_funders:
            print(funder)
        for funder in all_first_funders:
            print(f"https://x.com/search?q={funder}&src=typed_query&f=live")
    else:
        print("No developers to process.")

    conn.close()

if __name__ == "__main__":
    main()