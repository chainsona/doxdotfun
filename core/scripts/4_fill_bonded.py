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

def create_supabase_client(url: str, key: str) -> Client:
    return create_client(url, key)

def get_tokens():
    supabase = create_supabase_client(SUPABASE_URL, SUPABASE_KEY)

    # Initialize variables for pagination
    all_tokens = []
    page_size = 1000  # Adjust page size as needed
    offset = 0

    while True:
        # Query the PumpFunIPs table with pagination
        # response = supabase.table('PumpFunIPs').select('mint, bonded').neq('mint', None).range(offset, offset + page_size - 1).execute()
        response = supabase.table('PumpFunIPs').select('mint, bonded').neq('mint', None).range(offset, offset + page_size - 1).execute()

        if response:
            data = response.data
            if data:
                all_tokens.extend(data)
                print(f"Fetched {len(data)} tokens. Total so far: {len(all_tokens)}")
                if len(data) < page_size:
                    # If the number of records fetched is less than the page size, we are done
                    break
                offset += page_size
            else:
                print("No more tokens found.")
                break
        else:
            print(f"Error fetching data: {response.error_message}")
            break

    print(f"Total tokens fetched: {len(all_tokens)}")
    return all_tokens
    
def fetch_bonded_data(tokens: list):
    # Function to fetch detailed data of each developer
    supabase = create_supabase_client(SUPABASE_URL, SUPABASE_KEY)

    for token in tqdm(tokens, desc="Processing tokens"):
        mint = token['mint']
        # print(mint)

        bonded = token['bonded']

        # if bonded == None:
        url = f"https://frontend-api-v3.pump.fun/coins/{mint}"
        token_response = requests.get(url)

        if token_response.status_code != 200:
            print("Failed to fetch data.")
            return

        token_data = token_response.json()
        # print(f"Token data: {token_data}")  # Debugging line to check fetched data

        if token_data['complete'] is True:
            print(f"Token {mint} is bonded.")
            # Update the bonded status to true in the Supabase database
            response = supabase.table('PumpFunIPs').update({'bonded': True}).eq('mint', mint).execute()
            # print(f"Update response for {mint}: {response}")
            # break
        else:
            # print(f"Token {mint} is not bonded.")
            response = supabase.table('PumpFunIPs').update({'bonded': False}).eq('mint', mint).execute()
        
        time.sleep(.05)

def main():
    # Step 1: Fetch developers from the last 2 days
    tokens = get_tokens()
    
    # Step 2: Fetch more detailed data for each developer
    if tokens:
        fetch_bonded_data(tokens)
    else:
        print("No tokens to process.")

if __name__ == "__main__":
    main()