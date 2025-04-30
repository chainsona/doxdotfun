import requests
import networkx as nx
import time

API_URL = "http://localhost:8000"
API_URL = "http://3.66.235.111:8000"

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

# def build_graph(G, addresses, known_addresses, cex_addresses, depth=0, max_depth=3, visited=None):
#     if visited is None:
#         visited = set()

#     print(f"Building graph at depth {depth} with addresses: {addresses}")  # Debugging
    
#     if depth > max_depth:
#         return
    
#     next_addresses = []
    
#     for address in addresses:
#         if address in visited or address in known_addresses:
#             continue
        
#         if address in cex_addresses:
#             print(f"CEX source found: {cex_addresses[address]} ({address})")  # Debugging
#             break

#         print(f"Fetching funders for: {address}")  # Debugging
#         visited.add(address)
#         # funders = fetch_all_funders(address)
#         funders = [fetch_first_funder(address)]
#         print(f"Funders of {address}: {funders}")  # Debugging
        
#         for funder in funders:
#             if funder not in visited:
#                 G.add_node(funder, label=f"Depth {depth+1}")
#                 G.add_edge(funder, address)
#                 next_addresses.append(funder)
#                 time.sleep(.25)  # Rate limit to avoid overwhelming the API
    
#     if next_addresses:
#         build_graph(G, next_addresses, known_addresses, cex_addresses, depth + 1, max_depth, visited)

# def analyze_relationships(address, tagged_addresses, cex_addresses):
#     # Create a directed graph
#     G = nx.DiGraph()
    
#     # Start recursive graph building from developer
#     build_graph(G, [address], tagged_addresses, cex_addresses)
    
#     # Prepare graph data for the frontend
#     graph_data = {
#         "nodes": [{"id": node, "type": "known" if node in tagged_addresses else "cex" if node in cex_addresses else "regular"} for node in G.nodes],
#         "edges": [{"source": edge[0], "target": edge[1]} for edge in G.edges]
#     }
    
#     return graph_data
