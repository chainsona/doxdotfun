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