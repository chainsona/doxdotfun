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

client = Client("<YOUR_SOLANA_RPC_URL>")  # Use the Solana mainnet endpoint


# Function to fetch balance using Solana client
def fetch_balance(pubkey: Pubkey) -> int:
    response = client.get_balance(pubkey)
    if response:
        return response.value  # Balance is returned in lamports
    else:
        raise Exception(f"Failed to fetch balance: {response['error']}")
    
# Function to fetch the first funder of a wallet
def fetch_first_funder(pubkey: Pubkey) -> str:
    response = client.get_signatures_for_address(pubkey)  # Fetch the first transaction
    if response and response.value:
        first_signature = response.value[-1].signature
        transaction = client.get_transaction(first_signature)
        
        # print(f"Transaction: {transaction}")
        # print(f"Transaction value: {transaction.value}")

        if transaction and transaction.value:
            message = transaction.value.transaction.transaction.message  # Extract transaction message
            account_keys = message.account_keys  # List of involved accounts
            # print(f"Account keys: {account_keys}")  # Debugging line to check account keys

            # The first account in account_keys is usually the funder
            funder_address = account_keys[0] if account_keys else None

            if funder_address:
                return str(funder_address)  # Convert to string for JSON response
    raise Exception("Failed to fetch the first funder")

# Function to fetch all funders of a wallet (filtering only transfer transactions)
def fetch_all_funders(pubkey: Pubkey) -> list:
    response = client.get_signatures_for_address(pubkey)  # Fetch all transactions
    funders = []
    if response and response.value:
        for signature_info in response.value:
            try:
                signature = signature_info.signature
                transaction = client.get_transaction(signature, encoding="jsonParsed")

                tx_detail = transaction.value
                # print(f"Details for transaction {signature}:")
                slot = tx_detail.slot
                # print(f"Slot: {slot}")
                for instruction in tx_detail.transaction.transaction.message.instructions:
                        # print(f"Instruction: {instruction}")  # Debugging line to check instruction details
                        program_id = instruction.program_id
                        if str(program_id) == "11111111111111111111111111111111":  # System Program
                            if instruction.parsed and instruction.parsed.get("type") == "transfer":
                                info = instruction.parsed.get("info", {})
                                source = info.get("source")
                                destination = info.get("destination")
                                lamports = info.get("lamports")
                                if source and destination:
                                    # print(f"Source: {source}, Destination: {destination}, Lamports: {lamports}")
                                    if source not in funders:
                                        # print(f"Adding funder: {source}")
                                        funders.append(source)
            except Exception as e:
                print(f"Error parsing instruction: {e}")
    # print(funders)
    return funders

def create_supabase_client(url: str, key: str) -> Client:
    return create_client(url, key)

def get_last_2_days_developers():
    # Calculate the date 2 days ago
    specific_date = datetime.datetime.utcnow() - datetime.timedelta(days=1)
    formatted_date = specific_date.isoformat()  # Convert to ISO format

    supabase = create_supabase_client(SUPABASE_URL, SUPABASE_KEY)

    # Query the PumpFunIPs table to get the developers who interacted in the last 2 days
    response = supabase.table('PumpFunIPs').select('*').gte('created_at', formatted_date).execute()

    if response:
        data = response.data
        if data:
            print(f"Found {len(data)} records from the last 2 days.")
            return data
        else:
            print("No data found from the last 2 days.")
            return []
    else:
        print(f"Error fetching data: {response.error_message}")
        return []
    
def fetch_developer_data(developers: list):
    # Function to fetch detailed data of each developer
    supabase = create_supabase_client(SUPABASE_URL, SUPABASE_KEY)

    for developer in tqdm(developers, desc="Processing Developers"):
        developer_address = developer.get("developer")  # Adjust field name if needed

        # Check if the developer already exists in the Addresses table
        existing_entry = supabase.table("Addresses").select("address").eq("address", developer_address).execute()

        if existing_entry and existing_entry.data:
            print(f"Developer {developer_address} already exists in the database. Skipping.")
            continue
        
        developer_pubkey = Pubkey.from_string(developer_address)
        print(f"\nFetching data for Developer: {developer_address}")
        
        # Fetch data as needed for each developer
        try:
            balance = fetch_balance(developer_pubkey)
            print(f"Developer {developer_address} - Balance: {balance} SOL")
        except Exception as e:
            print(f"Failed to fetch balance for Developer {developer_address}: {e}")
            balance = None

        try:
            first_funder = fetch_first_funder(developer_pubkey)
            print(f"First Funder: {first_funder}")
        except Exception as e:
            print(f"Failed to fetch first funder for Developer {developer_address}: {e}")
            first_funder = None

        try:
            all_funders = fetch_all_funders(developer_pubkey)
            print(f"All Funders: {all_funders}")
        except Exception as e:
            print(f"Failed to fetch all funders for Developer {developer_address}: {e}")
            all_funders = []

        # Insert or update the developer's data in the Addresses table
        try:
            response = supabase.table("Addresses").upsert({
                "address": developer_address,
                "balance": balance,
                "first_funder": first_funder,
                "all_funders": all_funders,
                "last_seen": datetime.datetime.utcnow().isoformat()
            }).execute()

            if response:
                print(f"Successfully updated data for Developer {developer_address}")
            else:
                print(f"Failed to update data for Developer {developer_address}: {response.error_message}")
        except Exception as e:
            print(f"Error updating database for Developer {developer_address}: {e}")

        # break
        # time.sleep(1)

def main():
    # Step 1: Fetch developers from the last 2 days
    developers = get_last_2_days_developers()
    
    # Step 2: Fetch more detailed data for each developer
    if developers:
        fetch_developer_data(developers)
    else:
        print("No developers to process.")

if __name__ == "__main__":
    main()