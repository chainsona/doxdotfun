import httpx
from pydantic import BaseModel
import asyncio
from typing import Optional
import openai

class AddressInfoResponse(BaseModel):
    address: str
    ai_summary: Optional[str] = None

async def generate_ai_summary(launch_count: int, solana_data: dict) -> str:
    """Generate a concise AI summary for a Solana address."""
    context = (
        f"Address: {solana_data.get('address', 'Unknown address')} | "
        f"Balance: {solana_data.get('balance', 'Unknown balance')} | "
        f"Funders: {solana_data.get('funders', 'Unknown funders')} | "
        f"Launches: {launch_count}"
    )
    
    try:
        response = await openai.ChatCompletion.acreate(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "Summarize the Solana address characteristics simply and concisely. Respond in this exact format:\n\nThe developer {address} is involved in {number of} launches, has {amount of} SOL balance."},
                {"role": "user", "content": f"Describe this Solana address: {context}."}
            ],
            max_tokens=150,
            temperature=0.5
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"AI summary failed: {e}")
        return "Failed to generate AI summary."

async def fetch_address_info(address: str, launch_count: int, address_data: list, known_addresses: list, openai_key: str) -> AddressInfoResponse:
    """Fetch Solana address information and generate an AI summary."""
    openai.api_key = openai_key
    funders = address_data.data[0]['all_funders']
    
    known_addresses_set = {entry['address'] for entry in known_addresses.data}
    funders = [funder for funder in funders if funder not in known_addresses_set]

    async with httpx.AsyncClient(timeout=10.0) as client:
        # solana_data = (await client.get(f"https://api.solana.com/address/{address}")).json()
        solana_data = {
            "address": address,
            "balance": address_data.data[0]['balance'] / 10 ** 9,  # Convert lamports to SOL
            "funders": funders
        }
        ai_summary = await generate_ai_summary(launch_count, solana_data)
        return AddressInfoResponse(address=address, ai_summary=ai_summary)

async def main():
    OPENAI_KEY = "YOUR_OPENAI_API_KEY"
    try:
        result = await fetch_address_info("YourSolanaAddressHere", 1, OPENAI_KEY)
        print(f"AI Summary: {result.ai_summary}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    asyncio.run(main())
