import requests

def analyze_address_api(address: str):
    # Fetch data from SolanaFM
    url = f"https://api.solana.fm/v0/accounts/{address}"
    response = requests.get(url)
    
    if response.status_code != 200:
        print("Failed to fetch data.")
        return

    data = response.json()
    
    # Extract SNS domain (if registered)
    sns_domain = data.get("account", {}).get("snsName")
    if sns_domain:
        print(f"SNS Domain: {sns_domain}")

# analyze_address_api("DvzpUX93Q6jM9GCCXaBsHWhqeKRKMMmy9KGnqEeLbzo2")

def get_pumpfun_history(address: str, limit: int = 10, offset: int = 0):
    # Fetch data from Pump.fun API with pagination
    url = f"https://frontend-api-v3.pump.fun/coins/user-created-coins/{address}?limit={limit}&offset={offset}"
    response = requests.get(url)
    print(f"Fetching data from {url}")  # Debugging line to check URL
    print(f"Response status code: {response.status_code}")  # Debugging line to check response status
    print(f"Response: {response.content}")  # Debugging line to check response content

    if response.status_code != 200:
        print("Failed to fetch data.")
        return

    data = response.json()

    print(f"Data: {data}")  # Debugging line to check fetched data
    
# get_pumpfun_history("825pHSkfzSn6pQPUypdjBHHTCn3KSTLHNtfe2vsfpump")
# get_pumpfun_history("H6narNxFyVgdZRGzYLh7ejcUGpmTLJDKJPPcVJiEcAGK")

def get_pumpfun_user(address: str):
    url = f"https://frontend-api-v3.pump.fun/users/{address}"
    response = requests.get(url)
    # print(f"Fetching data from {url}")  # Debugging line to check URL
    # print(f"Response status code: {response.status_code}")  # Debugging line to check response status
    # print(f"Response: {response.content}")  # Debugging line to check response content

    if response.status_code != 200:
        print("Failed to fetch data.")
        return

    data = response.json()

    print(f"Data: {data}")  # Debugging line to check fetched data

# get_pumpfun_user("H6narNxFyVgdZRGzYLh7ejcUGpmTLJDKJPPcVJiEcAGK")

def get_tokens_by_website(search_term: str, limit: int = 10, offset: int = 0, sort: str = "asc", order: str = "asc", include_nsfw: bool = False, creator: str = "", complete: bool = False, meta: str = "", token_type: str = ""):
    url = "https://frontend-api-v3.pump.fun/coins/search"
    params = {
        "limit": limit,
        "offset": offset,
        "sort": sort,
        "searchTerm": search_term,
        "order": order,
        "includeNsfw": include_nsfw,
        "creator": creator,
        "complete": complete,
        "meta": meta,
    }
    response = requests.get(url, params=params)
    if response.status_code != 200:
        print("Failed to fetch data.")
        return

    data = response.json()
    # print(f"Data: {data}")  # Debugging line to check fetched data

    for d in data:
        mint = d.get("mint")
        symbol = d.get("symbol")
        name = d.get("name")
        website = d.get("website")
        mcap = d.get("usd_market_cap")
        print(f"Name: {name}, Mint: {mint}, Symbol: {symbol}, Website: {website}, Market Cap: {mcap}")  # Debugging line to check fetched data
        
    return data

get_tokens_by_website(search_term="", limit=10, offset=0, sort="market_cap", order="asc", include_nsfw=False, creator="", complete=True, meta="tiktok", token_type="")
