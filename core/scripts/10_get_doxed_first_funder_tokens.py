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

# List of first funders with their associated links
all_funders = [
    # {"address": "J2L495ZPcJ6Btuyd4YqXz5uw7hpKiQXGcLvALwumabED", "link": "https://x.com/chestermeme2"},
    {"address": "F5va8S8D9vZ2XWSDkVxUuGY4ZVy4mC4ocbWsPUGcg8jT", "link": "https://x.com/vnusheniee"},
    # {"address": "J2L495ZPcJ6Btuyd4YqXz5uw7hpKiQXGcLvALwumabED", "link": "https://x.com/chestermeme2"},
]

# Extract only the addresses for filtering
all_funder_addresses = [funder["address"] for funder in all_funders]

# Create Supabase client
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Filter known addresses from the "Tags" table
response = supabase.table("Tags").select("address").execute()
known_addresses = {record["address"] for record in response.data}

# Filter out known addresses
first_funders = [address for address in all_funder_addresses if address not in known_addresses]

def get_related_addresses_and_tokens():
    
    # Query the Supabase database
    results = supabase.rpc("get_related_addresses_and_tokens", {
        "funder_ids": first_funders
    }).execute()
    
    # Print the results
    print("Related Addresses and Pump Fun Tokens:")
    for record in results.data:
        print(f"X User: {all_funders[all_funder_addresses.index(record['first_funder_address'])]['link']}, First funder: {record['first_funder_address']}, Developer: {record['developer_address']}, Token: {record['token']}, Mint: {record['mint']}")

# Call the function
get_related_addresses_and_tokens()