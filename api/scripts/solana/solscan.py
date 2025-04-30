import time
import requests

api_token = "<YOUR_SOLSCAN_API_TOKEN>"  # Replace with your actual Solscan API token

# Function to fetch the first funder of a wallet
def fetch_first_funder(address: str) -> str:
    url = f"https://pro-api.solscan.io/v2.0/account/transfer?address={address}&token=So11111111111111111111111111111111111111111&page=1&page_size=100&sort_by=block_time&sort_order=asc"
    headers = {"token": api_token}
    page = 1

    while True:
        response = requests.get(url.replace("page=1", f"page={page}"), headers=headers)
        if response.status_code == 200:
            data = response.json()
            if data.get("data"):
                transfers = data["data"]
                if transfers:
                    first_transfer = sorted(transfers, key=lambda x: x["time"])[0]
                    funder_address = first_transfer.get("from_address")
                    if funder_address:
                        return funder_address
            else:
                break  # No more data
        else:
            raise Exception(f"Failed to fetch data: {response.status_code}")
        page += 1

    raise Exception("Failed to fetch the first funder")

# Function to fetch all funders of a wallet
def fetch_all_funders(address: str) -> list:
    url = f"https://pro-api.solscan.io/v2.0/account/transfer?address={address}&token=So11111111111111111111111111111111111111111&page=1&page_size=100&sort_by=block_time&sort_order=desc"
    headers = {"token": api_token}
    page = 1
    funders = []

    while True:
        response = requests.get(url.replace("page=1", f"page={page}"), headers=headers)
        if response.status_code == 200:
            data = response.json()
            if data.get("data"):
                for transfer in data["data"]:
                    source = transfer.get("from_address")
                    if source and source not in funders:
                        funders.append(source)
            else:
                break  # No more data
        else:
            raise Exception(f"Failed to fetch data: {response.status_code}")
        time.sleep(0.25)  # Rate limit to avoid overwhelming the API
        page += 1

    return funders

def fetch_address_label(address: str) -> dict:
    url = f"https://pro-api.solscan.io/v2.0/account/metadata?address={address}"
    headers = {"token": api_token}
    response = requests.get(url, headers=headers)

    if response.status_code == 200:
        data = response.json()
        if data.get("success") and data.get("data"):
            account_data = data["data"]
            account_label = account_data.get("account_label", account_data.get("account_domain", "Unknown"))
            account_tags = account_data.get("account_tags", [])

            result = {"known": False, "label": None, "tag": None}

            if "exchange_wallet" in account_tags:
                result.update({"known": True, "label": account_label, "tag": "cex"})
            elif "dex_wallet" in account_tags:
                result.update({"known": True, "label": account_label, "tag": "dex"})
            else:
                if account_label == "Unknown":
                    result.update({"known": False, "label": None, "tag": None})
                else:
                    result.update({"known": True, "label": account_label, "tag": "known"})

            return result
        else:
            return {"known": False, "label": None, "tag": None}
    else:
        raise Exception(f"Failed to fetch metadata: {response.status_code}")