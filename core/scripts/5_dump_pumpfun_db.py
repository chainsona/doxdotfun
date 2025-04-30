import datetime
import time
# import os (removed as it is not used)
import requests
import sqlite3
from tqdm import tqdm

from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

# SQLite database path
DB_PATH = "db/db.sqlite"

def create_sqlite_connection(db_path: str):
    conn = sqlite3.connect(db_path)
    return conn

def get_tokens_by_website(search_term: str, limit: int = 10, offset: int = 0, sort: str = "", order: str = "asc", include_nsfw: bool = False, creator: str = "", complete: bool = False, meta: str = "", token_type: str = ""):
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
        print(f"Status code: {response.status_code}")
        print(f"Response: {response.text}")
        return

    data = response.json()
    return data

def create_tokens_table(conn):
    query = """
    CREATE TABLE IF NOT EXISTS tokens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        mint TEXT,
        name TEXT,
        symbol TEXT,
        description TEXT,
        image_uri TEXT,
        metadata_uri TEXT,
        twitter TEXT,
        telegram TEXT,
        bonding_curve TEXT,
        associated_bonding_curve TEXT,
        creator TEXT,
        raydium_pool TEXT,
        complete BOOLEAN,
        virtual_sol_reserves REAL,
        virtual_token_reserves REAL,
        hidden BOOLEAN,
        total_supply INTEGER,
        website TEXT,
        show_name BOOLEAN,
        last_trade_timestamp TEXT,
        king_of_the_hill_timestamp TEXT,
        market_cap REAL,
        reply_count INTEGER,
        last_reply TEXT,
        nsfw BOOLEAN,
        market_id TEXT,
        inverted BOOLEAN,
        is_currently_live BOOLEAN,
        username TEXT,
        profile_image TEXT,
        usd_market_cap REAL,
        ath REAL,
        ath_usd REAL,
        ip TEXT,
        category TEXT,
        created_at TEXT
    )
    """
    # category TEXT, 'others', 'x', 'social', 'site'
    conn.execute(query)
    conn.commit()

def insert_token(conn, token):
    query = """
    INSERT INTO tokens (
        mint, name, symbol, description, image_uri, metadata_uri, twitter, telegram, bonding_curve,
        associated_bonding_curve, creator, raydium_pool, complete, virtual_sol_reserves,
        virtual_token_reserves, hidden, total_supply, website, show_name, last_trade_timestamp,
        king_of_the_hill_timestamp, market_cap, reply_count, last_reply, nsfw, market_id, inverted,
        is_currently_live, username, profile_image, usd_market_cap, created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """
    conn.execute(query, (
        token.get("mint"),
        token.get("name"),
        token.get("symbol"),
        token.get("description"),
        token.get("image_uri"),
        token.get("metadata_uri"),
        token.get("twitter"),
        token.get("telegram"),
        token.get("bonding_curve"),
        token.get("associated_bonding_curve"),
        token.get("creator"),
        token.get("raydium_pool"),
        token.get("complete"),
        token.get("virtual_sol_reserves"),
        token.get("virtual_token_reserves"),
        token.get("hidden"),
        token.get("total_supply"),
        token.get("website"),
        token.get("show_name"),
        token.get("last_trade_timestamp"),
        token.get("king_of_the_hill_timestamp"),
        token.get("market_cap"),
        token.get("reply_count"),
        token.get("last_reply"),
        token.get("nsfw"),
        token.get("market_id"),
        token.get("inverted"),
        token.get("is_currently_live"),
        token.get("username"),
        token.get("profile_image"),
        token.get("usd_market_cap"),
        token.get("created_at"),
    ))
    conn.commit()

def main():
    conn = create_sqlite_connection(DB_PATH)
    create_tokens_table(conn)

    # end_date = datetime.datetime(2024, 1, 26)
    end_date = datetime.datetime.now()

    search_terms = [
        # General Crypto Terms
        "coin", "token", "crypto", "pump", "moon", "bull", "bear", 
        "ape", "diamond", "hodl", "fomo", "yolo", "lambo", "whale",
        
        # Meme & Pop Culture
        "pepe", "doge", "shiba", "floki", "wojak", "bonk", "sats", 
        "elon", "musk", "tate", "tucker", "x", "twitter", "based",
        
        # Trends & Narratives
        "ai", "agent", "bot", "gpt", "llm", "layer", "l2", "l3", "defi", 
        "nft", "gamefi", "rwa", "memecoin", "stablecoin", "btc", 
        "ethereum", "solana", "bitcoin", "ordinals", "brc20",
        
        # Numbers & Symbols
        "420", "69", "100x", "1000x", "1mil", "billion", 
        "zero", "one", "two", "three", "money", "cash", "rich",
        
        # Emotional & Hype Words
        "send", "rocket", "to the moon", "wen", "when", "alpha", 
        "beta", "gem", "hidden gem", "next", "big", "soon", "laser",
        
        # Animals & Nature
        "frog", "cat", "dog", "wolf", "fox", "snake", "dragon", 
        "phoenix", "moon", "sun", "earth", "fire", "water", "air",
        
        # Miscellaneous
        "king", "queen", "god", "jesus", "bible", "kek", "chad", 
        "sigma", "omega", "alpha", "based", "degen", "maxi", "viral",

        # Socials
        "tiktok", "x", "facebook", "reddit", "mascotte", "snapchat", "onlyfans", "instagram", "youtube", "twitch", "discord", "whatsapp", "telegram",
    ]

    orders = [
        "asc", 
        "desc"
    ]

    completes = [
        True, 
        False
    ]
    
    count = 0

    for term in search_terms:   
        for order in orders:
            for complete in completes:
                offset = -2
                while True:
                    print(f"Fetching term: {term}, order: {order}, complete: {complete}")

                    try:
                        tokens = get_tokens_by_website(search_term=term, limit=50, offset=offset + 2, sort="market_cap", order=order, include_nsfw=False, creator="", complete=complete, meta="", token_type="")
                        # print(f"Fetched {len(tokens)} tokens from offset {offset + 2}.")
                    except Exception as e:
                        print(f"Error fetching tokens: {e}")
                        break

                    if not tokens:
                        break

                    # for token in tqdm(tokens, desc="Processing tokens"):
                    for token in tokens:
                        if conn.execute("SELECT 1 FROM tokens WHERE mint = ?", (token.get("mint"),)).fetchone():
                            # print(f"Token {token.get('name')} with mint {token.get('mint')} already exists. Skipping.")
                            continue
                        
                        created_at = token.get("created_timestamp")
                        if created_at:
                            created_at = datetime.datetime.fromtimestamp(created_at / 1000).strftime('%Y-%m-%d %H:%M:%S')
                            token["created_at"] = created_at

                        print(f"(Offset={offset + 2}, Count={count}) Created at: {created_at}, Name: {token.get('name')}, Mint: {token.get('mint')}, Symbol: {token.get('symbol')}")

                        insert_token(conn, token)
                        count += 1

                        # if created_at and datetime.datetime.strptime(created_at, '%Y-%m-%d %H:%M:%S').timestamp() * 1000 >= end_date.timestamp() * 1000:
                        #     print(f"Token search completed at offset: {offset + 2}")
                        #     conn.close()
                        #     return
                        
                        time.sleep(0.05)

                    offset += 50

if __name__ == "__main__":
    main()