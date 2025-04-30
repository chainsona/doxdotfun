import sqlite3
import http.client
import json
from tqdm import tqdm

# SQLite database path
DB_PATH = "db/db.sqlite"

def create_sqlite_connection(db_path: str):
    conn = sqlite3.connect(db_path)
    return conn

def update_ath_in_db(conn, mint_address, ath, ath_usd):
    query = """
    UPDATE tokens
    SET ath = ?, ath_usd = ?
    WHERE mint = ?
    """
    conn.execute(query, (ath, ath_usd, mint_address))
    conn.commit()

def fetch_ath_from_bitquery(mint_address):
    conn = http.client.HTTPSConnection("streaming.bitquery.io")
    payload = json.dumps({
        "query": f"""{{
          Solana(network: solana, dataset: combined) {{
            DEXTradeByTokens(
              where: {{
                Trade: {{
                  Currency: {{MintAddress: {{is: "{mint_address}"}}}},
                  Side: {{Currency: {{MintAddress: {{is: "So11111111111111111111111111111111111111112"}}}}}}
                }},
                Block: {{
                  Time: {{
                    after: "2024-01-01T00:00:00Z",
                    before: "2025-04-30T12:00:00Z"
                  }}
                }}
              }}
            ) {{
              Trade {{
                ATH: Price(maximum: Trade_Price)
                ATH_USD: PriceInUSD(maximum: Trade_PriceInUSD)
              }}
            }}
          }}
        }}""",
        "variables": "{}"
    })
    headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer <YOUR_BEARER_TOKEN>'
    }
    conn.request("POST", "/eap", payload, headers)
    res = conn.getresponse()
    data = res.read()
    response = json.loads(data.decode("utf-8"))
    try:
        ath = response["data"]["Solana"]["DEXTradeByTokens"][0]["Trade"]["ATH"]
        ath_usd = response["data"]["Solana"]["DEXTradeByTokens"][0]["Trade"]["ATH_USD"]
        print(f"ATH: {ath}, ATH_USD: {ath_usd}")
        return ath, ath_usd
    except (KeyError, IndexError):
        print("Failed to fetch ATH data.")
        return None, None

def main():
    conn = create_sqlite_connection(DB_PATH)
    cursor = conn.cursor()
    # cursor.execute("SELECT mint FROM tokens WHERE complete IS TRUE AND usd_market_cap >= 1000000")
    cursor.execute("SELECT mint FROM tokens WHERE complete IS TRUE AND ath IS NULL AND ath_usd IS NULL AND usd_market_cap >= 2500")
    mints = cursor.fetchall()
    conn.close()

    for mint in tqdm(mints, desc="Processing mints"):
        try:
            mint_address = mint[0]
            ath, ath_usd = fetch_ath_from_bitquery(mint_address)
            if ath is not None and ath_usd is not None:
                conn = create_sqlite_connection(DB_PATH)
                update_ath_in_db(conn, mint_address, ath, ath_usd)
                print(f"Updated ATH and ATH_USD for mint address {mint_address}, {ath}SOL | {ath_usd}USD.")
                conn.close()
            else:
                print("No data to update.")
        except Exception as e:
            print(f"Error updating ATH data for mint address {mint_address}: {e}")
        # break

if __name__ == "__main__":
    main()