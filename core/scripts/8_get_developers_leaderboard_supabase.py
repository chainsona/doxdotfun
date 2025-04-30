import datetime
import os
import requests
import time
from supabase import create_client, Client
from tqdm import tqdm

from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

# Fetch variables
SUPABASE_URL = os.getenv("supabase_url")
SUPABASE_KEY = os.getenv("supabase_service_role_key")

from solders.pubkey import Pubkey
from solana.rpc.api import Client
from collections import Counter

def create_supabase_client(url: str, key: str) -> Client:
    return create_client(url, key)

supabase = create_supabase_client(SUPABASE_URL, SUPABASE_KEY)

def get_top_developers():
    # Initialize variables for pagination
    all_developers = []
    page_size = 1000  # Adjust page size as needed
    offset = 0

    while True:
        # Query the PumpFunIPs table with pagination
        response = supabase.table('PumpFunIPs').select('developer').neq('developer', None).range(offset, offset + page_size - 1).execute()

        if response:
            data = response.data
            if data:
                all_developers.extend([dev['developer'] for dev in data if 'developer' in dev])
                print(f"Fetched {len(data)} developers. Total so far: {len(all_developers)}")
                if len(data) < page_size:
                    # If the number of records fetched is less than the page size, we are done
                    break
                offset += page_size
            else:
                print("No more developers found.")
                break
        else:
            print(f"Error fetching data: {response.error_message}")
            break

    # Count occurrences of each developer
    developer_counts = Counter(all_developers)

    # Filter developers with more than one launch and get the top 5
    top_developers = [dev for dev, count in developer_counts.items() if count > 1]
    top_5_developers = sorted(top_developers, key=lambda dev: developer_counts[dev], reverse=True)[:10]

    for developer in top_5_developers:
        print(f"Developer: {developer}, Launches: {developer_counts[developer]}")
    return top_5_developers

def get_developer_data(address):
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
        # print(f"First Funder for {address}: {first_funder}")
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

def recursive_find_first_funders(starting_address, iterations):
    current_address = starting_address
    chain = [current_address]
    
    for i in range(iterations):
        # print(f"\nIteration {i + 1}: Fetching first funder for {current_address}")
        first_funder = get_developer_data(current_address)
        
        if not first_funder:
            print(f"No further first funder found for {current_address}. Stopping recursion.")
            break
            
        current_address = first_funder
        chain.append(current_address)
        
        # Early exit if we hit a loop
        if chain.count(current_address) > 1:
            print(f"Detected a loop at {current_address}. Stopping recursion.")
            break
    
    # print(f"\nFirst funder chain for {starting_address}:")
    # for idx, address in enumerate(chain):
    #     print(f"Level {idx}: {address}")

    return chain

def main():
  # Step 1: Fetch developers from the last 2 days
  developers = get_top_developers()
  
  # Step 2: Fetch more detailed data for each developer and collect all first funders
  all_first_funders = []
  if developers:
    for developer in developers:
      # print(f"\nProcessing Developer: {developer}")
      try:
        chain = recursive_find_first_funders(developer, 10)
        all_first_funders.extend(chain)
      except Exception as e:
        print(f"Failed to fetch data for Developer {developer}: {e}")
    
    # Remove duplicates from the list of first funders
    all_first_funders = list(set(all_first_funders))
    # print("\nAll First Funders:")
    for funder in all_first_funders:
      print(funder)
    for funder in all_first_funders:
      print(f"https://x.com/search?q={funder}&src=typed_query&f=live")
  else:
    print("No developers to process.")

if __name__ == "__main__":
    main()