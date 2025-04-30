import datetime
import re
import subprocess
from dotenv import load_dotenv
import os
import requests
import time
from supabase import create_client, Client

load_dotenv()
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

# List of known popular domains to exclude
known_domains = [
    'google.com', 'blog.google', 
    'x.com', 'twitter.com',
    'youtube.com', 'youtu.be',
    'facebook.com', 'instagram.com', 'flickr.com',
    'tiktok.com', 'vt.tiktok.com', 
    't.me', 'telegram.org', 'telegram.com', 'pump.fun',
    'github.com', 
    'linktr.ee', 'mysql.com', 'publish0x.com', 
    'roblox.com', 
    'twitch.tv', 'm.twitch.tv',
    'defense.gov', 'dod.defense.gov', 
    'theguardian.com', 'theguardian.co.uk', 'theguardian.co', 'theguardian.com', 'theguardian.co.uk', 'theguardian.co', 'forbes.com',
    'discord.com', 'reddit.com', 'netflix.com', 'microsoft.com', 'apple.com', 'amazon.com', 'linkedin.com', 'yahoo.com', 'baidu.com', 'bing.com', 'ebay.com', 'ok.ru', 't.co', 'vk.com',
    'microsoftonline.com', 'microsoft.com', 'microsoftonline.com', 'microsoft.com', 'microsoftonline.com', 'microsoft.com', 'microsoftonline.com', 'microsoftonline.com', 'office.com',
    'live.com', 'wordpress.com', 'pinterest.com', 'adobe.com', 'whatsapp.com', 'aliexpress.com', 'stackoverflow.com', 'imdb.com', 'fandom.com', 'spotify.com', 'craigslist.org', 'zoom.us',
    'wikipedia.org', 'en.wikipedia.org', 'wikimedia.org', 
    'cointelegraph.com', 'coindesk.com', 'coinmarketcap.com', 
    'solscan.io', 'solana.com',
    'deviantart.com', 'kfc.com', "watcher.guru", "activision.com", "blizzard.com", "battle.net",
]

def extract_domain(url):
    domain = re.search(r'https?://(www\.)?([^/]+)', url)
    if domain:
        return domain.group(2).lower()
    return None

def dig_host(url):
    domain = url.split('//')[-1].split('/')[0]
    result = subprocess.run(['dig', '+short', domain], capture_output=True, text=True)
    return result.stdout.strip()

def main():
    # API endpoint
    url = "https://frontend-api-v3.pump.fun/coins/latest"

    # Initialize Supabase client
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

    # Function to fetch data from API
    def fetch_latest_coin():
        try:
            response = requests.get(url)
            response.raise_for_status()  # Raise an error for bad status codes
            return response.json()       # Parse the JSON response
        except requests.RequestException as e:
            print(f"An error occurred: {e}")
            return None

    # Function to save website to the Supabase database
    def save_token(data):
        try:
            supabase.table("PumpFunIPs").insert(data).execute()
        except Exception as e:
            print(f"An error occurred while saving the website: {e}")

    def save_developer(developer):
        # Check if the developer already exists in the Addresses table
        existing_entry = supabase.table("Addresses").select("address").eq("address", developer).execute()

        if existing_entry and existing_entry.data:
            print(f"Developer {developer} already exists in the database. Skipping.")
            return
        
        developer_pubkey = Pubkey.from_string(developer)
        print(f"\nFetching data for Developer: {developer}")
        
        # Fetch data as needed for each developer
        try:
            balance = fetch_balance(developer_pubkey)
            print(f"Developer {developer} - Balance: {balance} SOL")
        except Exception as e:
            print(f"Failed to fetch balance for Developer {developer}: {e}")
            balance = None

        try:
            first_funder = fetch_first_funder(developer_pubkey)
            print(f"First Funder: {first_funder}")
        except Exception as e:
            print(f"Failed to fetch first funder for Developer {developer}: {e}")
            first_funder = None

        try:
            all_funders = fetch_all_funders(developer_pubkey)
            print(f"All Funders: {all_funders}")
        except Exception as e:
            print(f"Failed to fetch all funders for Developer {developer}: {e}")
            all_funders = []

        # Insert or update the developer's data in the Addresses table
        try:
            response = supabase.table("Addresses").upsert({
                "address": developer,
                "balance": balance,
                "first_funder": first_funder,
                "all_funders": all_funders,
                "last_seen": datetime.datetime.utcnow().isoformat()
            }).execute()

            if response:
                print(f"Successfully updated data for Developer {developer}")
            else:
                print(f"Failed to update data for Developer {developer}: {response.error_message}")
        except Exception as e:
            print(f"Error updating database for Developer {developer}: {e}")

    while True:
        # Fetch data
        data = fetch_latest_coin()

        if data:
            # print(data)

            mint = data.get('mint')
            name = data.get('name')
            symbol = data.get('symbol')
            website = data.get('website')
            developer = data.get('creator')

            # print(f"Mint: {mint}")
            # print(f"Name: {name}")
            # print(f"Symbol: {symbol}")
            # print(f"Website: {website}")
            # print(f"Developer: {developer}")

            # Check if the website is not empty
            if website and website != 'null':
                # Check if the website is not already in the database
                existing_website = supabase.table("PumpFunIPs").select("website").eq("website", website).execute()

                if existing_website.data:
                    # print(f"Website {website} already exists in the database.")
                    pass
                else:
                    # print(f"Website {website} is new and will be saved.")
                    domain = extract_domain(website)

                    if domain is None:
                        continue

                    if domain in known_domains:
                        print(f"Skipping known domain {domain}.")
                        continue
                    
                    # Check if the URL is the main page (not containing a path like /page)
                    path = website.split('//')[-1].split('/', 1)[1:]  # Extract the path after the domain
                    if path:
                        print(f"Skipping URL {website} as it contains a path: /{path[0]}")
                        continue

                    domain_parts = domain.split('.')
                    if len(domain_parts) < 2:
                        continue

                    print(f"Domain: {domain}")

                    ip_address = dig_host(domain)
                    print(f"{domain}: {ip_address}")

                    ips = ip_address.split('\n')
                    ip_address_formatted = ','.join(ips)
                    
                    data = {
                        "mint": mint,
                        "name": name,
                        "symbol": symbol,
                        "website": website,
                        "ip": ip_address_formatted,
                        "developer": developer,
                    }

                    # Save website to the database if it's new
                    save_token(data)

                    # Save developer to the database if it's new
                    save_developer(developer)

        # Wait for 2 seconds before the next iteration
        time.sleep(1)

if __name__ == "__main__":
    main()
