from solders.pubkey import Pubkey
from solana.rpc.api import Client

client = Client("<YOUR_SOLANA_RPC_URL>")  # Use the Solana mainnet endpoint


# Function to fetch the first funder of a wallet
def fetch_first_funder(pubkey: Pubkey) -> str:
    response = client.get_signatures_for_address(pubkey)  # Fetch the first transaction
    if response and response.value:
        first_signature = response.value[-1].signature
        transaction = client.get_transaction(first_signature)
        
        # print(f"Transaction: {transaction}")
        # print(f"Transaction value: {transaction.value}")

        if transaction and transaction.value:
            message = transaction.value.transaction.transaction.message  # Extract transaction message
            account_keys = message.account_keys  # List of involved accounts
            # print(f"Account keys: {account_keys}")  # Debugging line to check account keys

            # The first account in account_keys is usually the funder
            funder_address = account_keys[0] if account_keys else None

            if funder_address:
                return str(funder_address)  # Convert to string for JSON response
    raise Exception("Failed to fetch the first funder")

# Function to fetch all funders of a wallet (filtering only transfer transactions)
def fetch_all_funders(pubkey: Pubkey) -> list:
    response = client.get_signatures_for_address(pubkey)  # Fetch all transactions
    funders = []
    if response and response.value:
        for signature_info in response.value:
            try:
                signature = signature_info.signature
                transaction = client.get_transaction(signature, encoding="jsonParsed")

                tx_detail = transaction.value
                # print(f"Details for transaction {signature}:")
                slot = tx_detail.slot
                # print(f"Slot: {slot}")
                for instruction in tx_detail.transaction.transaction.message.instructions:
                        # print(f"Instruction: {instruction}")  # Debugging line to check instruction details
                        program_id = instruction.program_id
                        if str(program_id) == "11111111111111111111111111111111":  # System Program
                            if instruction.parsed and instruction.parsed.get("type") == "transfer":
                                info = instruction.parsed.get("info", {})
                                source = info.get("source")
                                destination = info.get("destination")
                                lamports = info.get("lamports")
                                if source and destination:
                                    # print(f"Source: {source}, Destination: {destination}, Lamports: {lamports}")
                                    if source not in funders:
                                        # print(f"Adding funder: {source}")
                                        funders.append(source)
            except Exception as e:
                print(f"Error parsing instruction: {e}")
    # print(funders)
    return funders