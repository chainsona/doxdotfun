# import os
# from dotenv import load_dotenv
# load_dotenv()
import requests
import networkx as nx
import time

from http.client import HTTPException
from fastapi import FastAPI, Query
from fastapi.routing import APIRouter

from supabase import create_client, Client

from solders.pubkey import Pubkey
# from solana.rpc.api import Client

# Create FastAPI instance with custom docs and openapi url
app = FastAPI(docs_url="/doxdotfun/api/docs", openapi_url="/doxdotfun/api/openapi.json")

# from fastapi.middleware.cors import CORSMiddleware
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["https://www.kibu.solutions"],  # Replace with your Vercel domain
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# SUPABASE_URL = os.getenv("supabase_url")
# SUPABASE_KEY = os.getenv("supabase_service_role_key")
SUPABASE_URL = "<YOUR_SUPABASE_URL>"  # Replace with your actual Supabase URL
SUPABASE_KEY = "<YOUR_SUPABASE_KEY>"  # Replace with your actual Supabase key
OPENAI_KEY = "<YOUR_OPENAI_API_KEY>"  # Replace with your actual OpenAI key

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

from api.scripts.solana.balance import fetch_balance
from api.scripts.solana.relations import *
# from api.scripts.solana.funders import fetch_first_funder, fetch_all_funders
from api.scripts.solana.solscan import fetch_first_funder, fetch_all_funders, fetch_address_label
from api.scripts.solana.arkham import *
from api.scripts.ip import fetch_ip_info, IPInfoResponse
from api.scripts.address import fetch_address_info, AddressInfoResponse

from difflib import SequenceMatcher
from pydantic import BaseModel

def build_graph(G, addresses, known_addresses, cex_addresses, depth=0, max_depth=3, visited=None):
    if visited is None:
        visited = set()

    print(f"Building graph at depth {depth} with addresses: {addresses}")  # Debugging
    
    if depth > max_depth:
        return
    
    next_addresses = []
    
    for address in addresses:
        if address in visited or address in known_addresses:
            continue
        
        if address in cex_addresses:
            # print(f"CEX source found: ({address})")  # Debugging
            break

        # print(f"Fetching funders for: {address}")  # Debugging
        visited.add(address)
        # funders = fetch_all_funders(address)
        funders = [fetch_first_funder(Pubkey.from_string(address))]
        # print(f"Funders of {address}: {funders}")  # Debugging
        
        for funder in funders:
            if funder not in visited:
                G.add_node(funder, label=f"Depth {depth+1}")
                G.add_edge(funder, address)
                next_addresses.append(funder)
                # time.sleep(.25)  # Rate limit to avoid overwhelming the API
    
    if next_addresses:
        build_graph(G, next_addresses, known_addresses, cex_addresses, depth + 1, max_depth, visited)

def analyze_relationships(address, known_addresses, cex_addresses):
    # Create a directed graph
    G = nx.DiGraph()
    
    # Input data
    data = {
        "developer": address,
    }

    # Start recursive graph building from developer
    build_graph(G, [data["developer"]], known_addresses, cex_addresses)
    
    # Prepare graph data for the frontend
    graph_data = {
        "nodes": [{"id": node, "type": "known" if node in known_addresses else "cex" if node in cex_addresses else "regular"} for node in G.nodes],
        "edges": [{"source": edge[0], "target": edge[1]} for edge in G.edges]
    }
    
    return graph_data

frontend_router = APIRouter(prefix="/doxdotfun/api/frontend", tags=["Frontend"])
@frontend_router.get("/leaderboard")
def get_leaderboard():
    try:
        response = supabase.rpc("get_ips_leaderboard").execute()
        data = response.data

        if not data:
            raise Exception("RPC returned no data.")

        return data
    except Exception as e:
        print(f"Error fetching leaderboard: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
    
@frontend_router.get("/graph")
def get_graph(address: str = Query(..., description="The developer's address to analyze")):
    try:
        # Fetch tagged addresses from Supabase
        response = supabase.table("Tags").select("address, tag").execute()
        
        if not response.data:
            print("No tagged addresses found in database")
            return {"error": "No tagged addresses found in database"}
        
        # print(f"Found {len(response.data)} tagged addresses")  # Debugging line
        
        # Separate addresses into CEX and non-CEX
        other_addresses = []
        cex_addresses = []
        
        for row in response.data:
            if not row.get("address"):
                continue  # Skip if address is missing
                
            if row.get("tag") == "cex":
                cex_addresses.append(row["address"])
            else:
                other_addresses.append(row["address"])
        
        # print(f"Found {len(other_addresses)} non-CEX addresses and {len(cex_addresses)} CEX addresses")  # Debugging line
        
        # Pass the address and tagged addresses to the analyze_relationships function
        graph_data = analyze_relationships(
            address,
            other_addresses,
            cex_addresses
        )
        
        return graph_data
        
    except Exception as e:
        print(f"Error in get_graph: {str(e)}")  # More detailed error logging
        return {"error": f"Failed to generate graph data: {str(e)}"}
        
@frontend_router.get("/address/label")
def get_address_label(address: str = Query(..., description="The address to fetch the label for")):
    try:
        # Check if the label is already cached in the Supabase "Tags" table
        existing_entry = supabase.table("Tags").select("name, tag").eq("address", address).execute()

        if existing_entry.data:
            # If the label is cached, return it
            cached_label = {"known": True, **existing_entry.data[0]}
            print(f"Returning cached label for {address}: {cached_label}")  # Debugging line
            return cached_label

        # return {"known": False, "label": None, "tag": None}
    
        # Fetch the label data using the helper function
        label_data = fetch_address_label(address)

        # Save the label data to the Supabase "Tags" table
        supabase.table("Tags").upsert({
            "address": address,
            "name": label_data.get("label"),
            "tag": label_data.get("tag"),
            "created_at": "NOW()"
        }).execute()

        time.sleep(0.5)  # Rate limit to avoid overwhelming the API

        return label_data
    except Exception as e:
        print(f"Error fetching address label for {address}: {e}")
        return {"error": str(e)}
    
token_router = APIRouter(prefix="/doxdotfun/api/token", tags=["Token"])
@token_router.get("/{address}")
def get_token_audit(address: str):
    try:
        # API endpoint
        url = f"https://frontend-api-v3.pump.fun/coins/{address}"

        try:
            response = requests.get(url)
            response.raise_for_status()  # Raise an error for bad status codes
            data = response.json()       # Parse the JSON response
            # print(f"PumpFun data for {address}: {data}")  # Debugging line to check data

            # mint = data.get("mint")
            # name = data.get("name")
            # symbol = data.get("symbol")
            # description = data.get("description")
            website = data.get("website")
            developer = data.get("creator")
            raydium_pool = data.get("raydium_pool")
            market_cap = data.get("usd_market_cap")

            # Check if developer exists in Supabase table
            developer_exists = False
            if developer:
                response = supabase.table("PumpFunIPs").select("developer").gte("created_at", "2025-03-30T22:00:00").eq("developer", developer).execute()
                developer_exists = len(response.data) > 0

            data = {
                # "mint": mint,
                # "name": name,
                # "symbol": symbol,
                # "description": description,
                "website": website,
                "known_ip": False,
                "developer": developer,
                "developer_exists": developer_exists,
                "raydium_pool": raydium_pool,
                "market_cap": market_cap,
            }

            # print(f"Token audit details: {data}")  # Debugging line to check details

            return data
        
        except requests.RequestException as e:
            print(f"An error occurred: {e}")
            return {"error": str(e)}
    except Exception as e:
        return {"error": str(e)}
    
developer_router = APIRouter(prefix="/doxdotfun/api/developer", tags=["Developer"])
@developer_router.get("/{address}")
def get_developer_audit(address: str):
    try:
        # Query Supabase for all coins associated with the developer's address
        response = supabase.table("PumpFunIPs").select("mint, name, symbol, created_at, ip").gte("created_at", "2025-03-30T22:00:00").eq("developer", address).execute()
        data = response.data  # List of coins and IPs associated with the developer
        # print(f"Developer audit data for {address}: {data}")  # Debugging line to check data

        # Fetch the balance for the developer's address
        pubkey = Pubkey.from_string(address)
        balance = fetch_balance(pubkey)

        # print(f"Balance for {address}: {balance}")  # Debugging line to check balance
        if not data:
            return {"developer": address, "coins": [], "ips": [], "balance": balance, "message": "No coins or IPs found for this developer"}

        # Format the response
        coins = [
            {
                "mint": row.get("mint"),
                "name": row.get("name"),
                "symbol": row.get("symbol"),
                "created_at": row.get("created_at"),
            }
            for row in data
        ]

        ips = list({row.get("ip") for row in data if row.get("ip")})  # Collect unique IPs

        return {"developer": address, "coins": coins, "ips": ips, "balance": balance}
    except Exception as e:
        return {"error": str(e)}
    
@developer_router.get("/balance/{address}")
def get_balance(address: str):
    try:
        # Check if the address already exists in the Addresses table
        existing_entry = supabase.table("Addresses").select("balance").eq("address", address).execute()

        if existing_entry.data:
            # If the address exists and balance is not null, return it
            balance = existing_entry.data[0].get("balance")
            if balance is not None and balance > 0:
                print(f"Returning cached balance for {address}: {balance}")  # Debugging line
                return {"address": address, "balance": balance}

        # If balance is not cached, fetch it
        pubkey = Pubkey.from_string(address)
        balance = fetch_balance(pubkey)
        print(f"Fetched balance for {address}: {balance}")  # Debugging line

        if existing_entry.data:
            # If the address exists, update the balance and last_seen
            supabase.table("Addresses").update({
                "balance": balance,
                "last_seen": "NOW()"
            }).eq("address", address).execute()
        else:
            # If the address does not exist, insert a new entry
            supabase.table("Addresses").insert({
                "address": address,
                "balance": balance,
                "last_seen": "NOW()"
            }).execute()

        return {"address": address, "balance": balance}
    except Exception as e:
        print(f"Error fetching balance for {address}: {e}")  # Debugging line to check errors
        return {"error": str(e)}

@developer_router.get("/firstFunder/{address}")
def get_first_funder(address: str):
    try:
        # Check if the address already exists in the Addresses table
        existing_entry = supabase.table("Addresses").select("first_funder").eq("address", address).execute()

        if existing_entry.data:
            # If the address exists and balance is not null, return it
            first_funder = existing_entry.data[0].get("first_funder")
            if first_funder is not None:
                print(f"Returning cached first_funder for {address}: {first_funder}")  # Debugging line
                return {"address": address, "first_funder": first_funder}
            
        pubkey = Pubkey.from_string(address)
        first_funder = fetch_first_funder(pubkey)

        if existing_entry.data:
            # If the address exists, update the first_funder and last_seen
            supabase.table("Addresses").update({
                "first_funder": first_funder,
                "last_seen": "NOW()"
            }).eq("address", address).execute()
        else:
            # If the address does not exist, insert a new entry
            supabase.table("Addresses").insert({
                "address": address,
                "first_funder": first_funder,
                "last_seen": "NOW()"
            }).execute()

        return {"address": address, "first_funder": first_funder}
    except Exception as e:
        print(f"Error fetching first funder for {address}: {e}")  # Debugging line to check errors
        return {"error": str(e)}
    
@developer_router.get("/allFunders/{address}")
def get_all_funders(address: str):
    try:
        # Check if the address already exists in the Addresses table
        existing_entry = supabase.table("Addresses").select("all_funders").eq("address", address).execute()

        if existing_entry.data:
            # If the address exists and all_funders is not null, return it
            all_funders = existing_entry.data[0].get("all_funders")
            if all_funders is not None and len(all_funders) > 1:
                print(f"Returning cached all_funders for {address}: {all_funders}")  # Debugging line
                return {"address": address, "all_funders": all_funders}
            
        pubkey = Pubkey.from_string(address)
        all_funders = fetch_all_funders(pubkey)
        print(f"All funders for {address}: {all_funders}")  # Debugging line to check funders

        # If no funders are found, retry the scan
        if len(all_funders) < 1:
            print(f"No funders found for {address}, retrying scan...")  # Debugging line
            all_funders = fetch_all_funders(pubkey)

        if existing_entry.data:
            # If the address exists, update the all_funders and last_seen
            supabase.table("Addresses").update({
                "all_funders": all_funders,
                "last_seen": "NOW()"
            }).eq("address", address).execute()
        else:
            # If the address does not exist, insert a new entry
            supabase.table("Addresses").insert({
                "address": address,
                "all_funders": all_funders,
                "last_seen": "NOW()"
            }).execute()

        return {"address": address, "all_funders": all_funders}
    except Exception as e:
        print(f"Error fetching all funders for {address}: {e}")  # Debugging line to check errors
        return {"error": str(e)}

class AddressList(BaseModel):
    addresses: list[str]

@developer_router.post("/cluster")
def get_funders_cluster(data: AddressList):
    try:
        addresses = data.addresses
        # Initialize a cluster dictionary to store funders for each address
        cluster = {}

        # Helper function to calculate similarity based on prefix or suffix
        def similarity(a, b):
            prefix_similarity = SequenceMatcher(None, a[:4], b[:4]).ratio()
            suffix_similarity = SequenceMatcher(None, a[-4:], b[-4:]).ratio()
            if prefix_similarity > suffix_similarity:
                return prefix_similarity, "prefix"
            else:
                return suffix_similarity, "suffix"

        # Sort addresses into clusters based on similarity
        for address in addresses:
            added = False
            for key, group in cluster.items():
                similarity_score, similarity_kind = similarity(address, key)
                if similarity_score > 0.8:  # Threshold for similarity
                    cluster[key].append(address)
                    added = True
                    break
            if not added:
                # Create a new group for the address based on its prefix or suffix
                prefix_key = f"prefix:{address[:4]}"
                suffix_key = f"suffix:{address[-4:]}"
                if prefix_key not in cluster:
                    cluster[prefix_key] = []
                if suffix_key not in cluster:
                    cluster[suffix_key] = []
                cluster[prefix_key].append(address)
                cluster[suffix_key].append(address)

        # Remove clusters with only a single address
        cluster = {key: group for key, group in cluster.items() if len(group) > 1}

        return {"cluster": cluster}
    except Exception as e:
        print(f"Error fetching funders cluster: {e}")
        return {"error": str(e)}
    
@developer_router.get("/ips/{address}")
def get_all_ips(address: str):
    try:
        # Query Supabase for all coins associated with the developer's address
        response = supabase.table("PumpFunIPs").select("ip").gte("created_at", "2025-03-30T22:00:00").eq("developer", address).execute()
        data = response.data  # List of coins and IPs associated with the developer

        if not data:
            return {"developer": address, "ips": [], "message": "No IPs found for this developer"}

        # Collect unique IPs
        ips = list({row.get("ip") for row in data if row.get("ip")})

        return {"developer": address, "ips": ips}
    except Exception as e:
        print(f"Error fetching IPs for {address}: {e}")
        return {"error": str(e)}
    
@developer_router.get("/tokens/{address}")
def get_tokens(address: str):
    try:
        # Query Supabase for all coins associated with the developer's address
        response = supabase.table("PumpFunIPs").select("mint, name, symbol, created_at").gte("created_at", "2025-03-30T22:00:00").eq("developer", address).execute()
        data = response.data  # List of coins associated with the developer

        if not data:
            return {"developer": address, "tokens": [], "message": "No tokens found for this developer"}

        # Format the response
        tokens = [
            {
                "mint": row.get("mint"),
                "name": row.get("name"),
                "symbol": row.get("symbol"),
                "created_at": row.get("created_at"),
            }
            for row in data
        ]

        return {"developer": address, "tokens": tokens}
    except Exception as e:
        print(f"Error fetching tokens for {address}: {e}")
        return {"error": str(e)}
    
ip_router = APIRouter(prefix="/doxdotfun/api/ip", tags=["IP"])
@ip_router.get("/tokens/{ip}")
def get_tokens_by_ip(ip: str):
    try:
        # Query Supabase for all tokens associated with the IP
        response = supabase.table("PumpFunIPs").select("mint, name, symbol, created_at").gte("created_at", "2025-03-30T22:00:00").eq("ip", ip).execute()
        data = response.data  # List of tokens associated with the IP

        if not data:
            return {"ip": ip, "tokens": [], "message": "No tokens found for this IP"}

        # Format the response
        tokens = [
            {
                "mint": row.get("mint"),
                "name": row.get("name"),
                "symbol": row.get("symbol"),
                "created_at": row.get("created_at"),
            }
            for row in data
        ]

        return {"ip": ip, "tokens": tokens}
    except Exception as e:
        print(f"Error fetching tokens for {ip}: {e}")
        return {"error": str(e)}

@ip_router.get("/developers/{ip}")
def get_developers_by_ip(ip: str):
    try:
        # Query Supabase for all developers associated with the IP
        response = supabase.table("PumpFunIPs").select("developer").gte("created_at", "2025-03-30T22:00:00").eq("ip", ip).execute()
        data = response.data  # List of developers associated with the IP

        if not data:
            return {"ip": ip, "developers": [], "message": "No developers found for this IP"}

        # Collect unique developers
        developers = list({row.get("developer") for row in data if row.get("developer")})

        return {"ip": ip, "developers": developers}
    except Exception as e:
        print(f"Error fetching developers for {ip}: {e}")
        return {"error": str(e)}
    
whois_router = APIRouter(prefix="/doxdotfun/api/whois", tags=["Who Is"])
@whois_router.get("/ip-info/{ip_address}", response_model=IPInfoResponse)
async def get_ip_info(ip_address: str):
    try:
        # Check if the IP has multiple launches in Supabase
        response = supabase.table("PumpFunIPs").select("ip").eq("ip", ip_address).execute()
        launch_count = len(response.data) if response.data else 0

        # Check if the IP already exists in the Audits table
        audit_entry = supabase.table("IPAudits").select("description").eq("ip", ip_address).execute()
        if audit_entry.data:
            # If the IP exists, return the cached description
            cached_description = audit_entry.data[0].get("description")
            return {"ip": ip_address, "ai_summary": cached_description}

        # Fetch IP information using the helper function
        ip_info = await fetch_ip_info(ip_address, launch_count, OPENAI_KEY)

        # Save the IP information to the Audits table
        supabase.table("IPAudits").upsert({
            "ip": ip_info.ip,
            "description": ip_info.ai_summary,
        }).execute()

        return ip_info
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch IP information: {str(e)}")
    
@whois_router.get("/address-info/{address}", response_model=AddressInfoResponse)
async def get_address_info(address: str):
    try:
        # Check if the IP already exists in the Audits table
        audit_entry = supabase.table("AddressAudits").select("description").eq("address", address).execute()
        if audit_entry.data:
            # If the IP exists, return the cached description
            cached_description = audit_entry.data[0].get("description")
            return {"address": address, "ai_summary": cached_description}
        
        # Check if the IP has multiple launches in Supabase
        mint_data = supabase.table("PumpFunIPs").select("mint").eq("developer", address).execute()
        launch_count = len(mint_data.data) if mint_data.data else 0

        address_data = supabase.table("Addresses").select("balance, all_funders").eq("address", address).execute()
        known_addresses = supabase.table("Tags").select("address").neq("tag", None).execute()

        # Fetch IP information using the helper function
        address_info = await fetch_address_info(address, launch_count, address_data, known_addresses, OPENAI_KEY)

        # Save the IP information to the Audits table
        supabase.table("AddressAudits").upsert({
            "address": address_info.address,
            "description": address_info.ai_summary,
        }).execute()

        return address_info
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch address information: {str(e)}")
    
@whois_router.get("/address-labels/{address}")
async def get_arkham_tags(address: str):
    """
    Fetch Arkham Intelligence tags for a given address.
    """
    try:
        data = await fetch_arkham_tags(address)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Include the router in the main FastAPI app
app.include_router(frontend_router)
app.include_router(token_router)
app.include_router(developer_router)
app.include_router(ip_router)
app.include_router(whois_router)