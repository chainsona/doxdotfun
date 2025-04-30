import sqlite3
from typing import List, Tuple

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

def get_domains_leaderboard_with_top3(db_path: str) -> List[Tuple[str, str, str, int, float, float]]:
  """
  Replicates the Supabase function for SQLite
  Returns a list of tuples (domain, website, amount, bonded_percent, ath_usd)
  """
  conn = sqlite3.connect(db_path)
  cursor = conn.cursor()
  
  query = """
  WITH RankedDomains AS (
    SELECT 
      symbol,
      mint,
      domain,
      website,
      COUNT(*) OVER (PARTITION BY domain) as amount,
      ROUND(100.0 * SUM(CASE WHEN complete THEN 1 ELSE 0 END) OVER (PARTITION BY domain) / COUNT(*) OVER (PARTITION BY domain), 2) as bonded_percent,
      ath_usd,
      ROW_NUMBER() OVER (PARTITION BY domain ORDER BY ath_usd DESC) as rank
    FROM (
      SELECT 
        CASE 
          WHEN website LIKE '%x.com%' THEN 'x'
          WHEN website LIKE '%tiktok.com%' 
            OR website LIKE '%facebook.com%' 
            OR website LIKE '%reddit.com%' 
            OR website LIKE '%instagram.com%' 
            OR website LIKE '%linkedin.com%' 
            OR website LIKE '%twitter.com%' 
            OR website LIKE '%snapchat.com%' 
            OR website LIKE '%pinterest.com%' 
            OR website LIKE '%youtube.com%' 
            OR website LIKE '%threads.net%' THEN 'social'
          WHEN website LIKE '%.%' THEN 'others'
          WHEN website = '' THEN 'no site'
          ELSE 'site'
        END AS domain,
        symbol,
        mint,
        website,
        complete,
        ath_usd
      FROM tokens
    ) AS sub
  )
  SELECT symbol, mint, domain, website, amount, bonded_percent, ath_usd
  FROM RankedDomains
  WHERE rank <= 10
  ORDER BY domain, rank;
  """
  
  cursor.execute(query)
  results = cursor.fetchall()
  conn.close()
  
  return results

def print_leaderboard_with_max_ath(db_path: str):
  leaderboard = get_domains_leaderboard_with_top3(db_path)
  
  # Group results by domain
  grouped_results = {}
  for symbol, mint, domain, website, amount, percent, ath_usd in leaderboard:
    if domain not in grouped_results:
      grouped_results[domain] = {}
    if symbol not in grouped_results[domain]:
      grouped_results[domain][symbol] = (symbol, mint, website, ath_usd, percent)
  
  # Print results
  for domain, entries in grouped_results.items():
    seen_symbols = set()
    unique_entries = []
    for entry in entries.values():
      if entry[0].lower() not in seen_symbols:
        unique_entries.append(entry)
        seen_symbols.add(entry[0].lower())

    entries_list = unique_entries[:5]  # Keep only the first 5 unique symbols
    print(f"Category: {domain} bonded %: {entries_list[0][4]:.2f}")
    max_ath_usd = max(entry[3] for entry in entries_list)
    for symbol, mint, website, ath_usd, percent in entries_list:
      print(f"  {symbol} | {mint} - {website}, ATH USD: {ath_usd:.2f}")
    print(f"  Max ATH USD in category: {max_ath_usd:.2f}")
    print()

  supabase = create_supabase_client(SUPABASE_URL, SUPABASE_KEY)
  # Insert the leaderboard into Supabase table "Categories"
  for domain, entries in grouped_results.items():
    seen_symbols = set()
    unique_entries = []
    for entry in entries.values():
      if entry[0].lower() not in seen_symbols:
        unique_entries.append(entry)
        seen_symbols.add(entry[0].lower())
        
    entries_list = unique_entries[:5]  # Keep only the first 5 unique symbols
    data = {
      "name": domain,
      "bonded_percent": entries_list[0][4] if entries_list else None,
      "ath_usd": max(entry[3] for entry in entries_list) if entries_list else None,
      "top_1_name": entries_list[0][0] if len(entries_list) > 0 else None,
      "top_1_mint": entries_list[0][1] if len(entries_list) > 0 else None,
      "top_2_name": entries_list[1][0] if len(entries_list) > 1 else None,
      "top_2_mint": entries_list[1][1] if len(entries_list) > 1 else None,
      "top_3_name": entries_list[2][0] if len(entries_list) > 2 else None,
      "top_3_mint": entries_list[2][1] if len(entries_list) > 2 else None,
      "top_4_name": entries_list[3][0] if len(entries_list) > 3 else None,
      "top_4_mint": entries_list[3][1] if len(entries_list) > 3 else None,
      "top_5_name": entries_list[4][0] if len(entries_list) > 4 else None,
      "top_5_mint": entries_list[4][1] if len(entries_list) > 4 else None,
    }
    supabase.table("Categories").insert(data).execute()

if __name__ == "__main__":
  db_path = "db/db.sqlite"  # Replace with your SQLite database path
  print_leaderboard_with_max_ath(db_path)
