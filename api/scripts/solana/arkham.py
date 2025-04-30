import re
import httpx
from fastapi import HTTPException
from solana.rpc.async_api import AsyncClient
from solders.pubkey import Pubkey

from spl.token._layouts import MINT_LAYOUT

RPC_URL = "<YOUR_SOLANA_RPC_URL>"
ARKHAM_API_KEY = "<YOUR_ARKHAM_API_KEY>"  # Replace with your actual Arkham API key

async def fetch_arkham_tags(address: str) -> str:
    """Fetch the first Arkham Intelligence tag label for a given address and replace the address with the token name."""
    url = f"<YOUR_ARKHAM_API_ENDPOINT>/address_with_extra_enrichment/{address}?chain=solana&tags=true"
    headers = {
        "accept": "application/json",
        "API-Key": ARKHAM_API_KEY,
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=headers)
        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Failed to fetch Arkham tags: {response.text}",
            )
        data = response.json()
        if "populatedTags" in data and data["populatedTags"]:
            solana_address_match = re.search(r"[1-9A-HJ-NP-Za-km-z]{32,44}", data["populatedTags"][0]["label"])
            if solana_address_match:
                solana_address = solana_address_match.group(0)
                # Fetch token name using Solana RPC
                async with AsyncClient(RPC_URL) as solana_client:
                    token_info = await solana_client.get_account_info(Pubkey.from_string(solana_address))
                    # print(f"Token info: {token_info}")

                    # decimals = MINT_LAYOUT.parse(token_info.value.data).decimals
                    # # All token data
                    # token_data = MINT_LAYOUT.parse(token_info.value.data)

                    account_info = token_info.value
                    if account_info:
                        token_data = account_info.data
                        parsed_token_data = MINT_LAYOUT.parse(token_data)
                        token_name = parsed_token_data.name if hasattr(parsed_token_data, 'name') else solana_address
                        return data["populatedTags"][0]["label"]
                        return data["populatedTags"][0]["label"].replace(solana_address, token_name)
            return data["populatedTags"][0]["label"]  # Return the first label if no token name found
        raise HTTPException(
            status_code=404,
            detail="No populated tags found for the given address.",
        )