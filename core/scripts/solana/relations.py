import requests
import networkx as nx
import time

API_URL = "http://localhost:8000"

known_addresses = {
    "fLiPgg2yTvmgfhiPkKriAHkDmmXGP6CdeFX9UF5o7Zc", # play🍀flip.gg
    "FLiPgGTXtBtEJoytikaywvWgbz5a56DdHKZU72HSYMFF", # play🍀flip.gg
    "FLiPGqowc82LLR173hKiFYBq2fCxLZEST5iHbHwj8xKb", # play🍀flip.gg
    "Habp5bncMSsBC3vkChyebepym5dcTNRYeg2LVG464E96", # play👉flip.gg
    "4wWTK5tkUr3WpKV9cZJ8NpJAo8uzQx6Z9VRCjawbDDjG", # 🤖pump-bot👉dogtools-dot-meme👈.sol
    "5Hr7wZg7oBpVhH5nngRqzr5W7ZFUfCsfEhbziZJak7fr", # odinbot-io⚡fastest-copy-trading.sol
    "9KxQy6StbkJhubAbfvfriUK6LYYJ5cSkBoS3ZhcbdUx2", # 👉walletx-gg👈alpha-wallets-scraper.sol
}

cex_addresses = {
    "5tzFkiKscXHK5ZXCGbXZxdw7gTjjD1mBwuoFbhUvuAi9": "Binance 2",
    "AC5RDfQFmDS1deWZos921JfqscXdByf8BKHs5ACWjtW2": "Bybit Hot Wallet",
    "u6PJ8DtQuPFnfmwHbGFULQ4u4EgjDiyYKjVEsynXq2w": "Gate.io",
}

def fetch_first_funder(address):
    try:
        response = requests.get(f"{API_URL}/doxdotfun/api/developer/firstFunder/{address}")
        response.raise_for_status()
        data = response.json()
        return data.get("first_funder", [])
    except requests.RequestException as e:
        print(f"Error fetching first funder for {address}: {e}")
        return []
    
def fetch_all_funders(address):
    try:
        response = requests.get(f"{API_URL}/doxdotfun/api/developer/allFunders/{address}")
        response.raise_for_status()
        data = response.json()
        return data.get("all_funders", [])
    except requests.RequestException as e:
        print(f"Error fetching funders for {address}: {e}")
        return []

def build_graph(G, addresses, depth=0, max_depth=3, visited=None):
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
            print(f"CEX source found: {cex_addresses[address]} ({address})")  # Debugging
            break

        print(f"Fetching funders for: {address}")  # Debugging
        visited.add(address)
        # funders = fetch_all_funders(address)
        funders = [fetch_first_funder(address)]
        print(f"Funders of {address}: {funders}")  # Debugging
        
        for funder in funders:
            if funder not in visited:
                G.add_node(funder, label=f"Depth {depth+1}")
                G.add_edge(funder, address)
                next_addresses.append(funder)
                time.sleep(.25)  # Rate limit to avoid overwhelming the API
    
    if next_addresses:
        build_graph(G, next_addresses, depth + 1, max_depth, visited)

def analyze_relationships(address):
    # Create a directed graph
    G = nx.DiGraph()
    
    # Input data
    data = {
        "developer": address,
    }

    # Start recursive graph building from developer
    build_graph(G, [data["developer"]])
    
    # Prepare graph data for the frontend
    graph_data = {
        "nodes": [{"id": node, "type": "known" if node in known_addresses else "cex" if node in cex_addresses else "regular"} for node in G.nodes],
        "edges": [{"source": edge[0], "target": edge[1]} for edge in G.edges]
    }
    
    return graph_data