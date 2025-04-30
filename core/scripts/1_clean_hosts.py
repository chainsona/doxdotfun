import sqlite3
import re
import time

from tqdm import tqdm

# Connect to the SQLite database

# Function to extract domain
def extract_domain(url):
    domain = re.search(r'https?://(www\.)?([^/]+)', url)
    if domain:
        return domain.group(2).lower()
    return None

# List of known popular domains to exclude
known_domains = [
    'google.com', 'blog.google', 
    'x.com', 'twitter.com',
    'youtube.com', 'youtu.be',
    'facebook.com', 'instagram.com', 'flickr.com',
    'tiktok.com', 'vt.tiktok.com', 
    't.me', 'telegram.org', 'telegram.com', 'pump.fun',
    'github.com', 
    'linktr.ee', 'mysql.com', 'publish0x.com', 
    'roblox.com', 
    'twitch.tv', 'm.twitch.tv',
    'defense.gov', 'dod.defense.gov', 
    'theguardian.com', 'theguardian.co.uk', 'theguardian.co', 'theguardian.com', 'theguardian.co.uk', 'theguardian.co', 'forbes.com',
    'discord.com', 'reddit.com', 'netflix.com', 'microsoft.com', 'apple.com', 'amazon.com', 'linkedin.com', 'yahoo.com', 'baidu.com', 'bing.com', 'ebay.com', 'ok.ru', 't.co', 'vk.com',
    'microsoftonline.com', 'microsoft.com', 'microsoftonline.com', 'microsoft.com', 'microsoftonline.com', 'microsoft.com', 'microsoftonline.com', 'microsoftonline.com', 'office.com',
    'live.com', 'wordpress.com', 'pinterest.com', 'adobe.com', 'whatsapp.com', 'aliexpress.com', 'stackoverflow.com', 'imdb.com', 'fandom.com', 'spotify.com', 'craigslist.org', 'zoom.us',
    'wikipedia.org', 'en.wikipedia.org', 'wikimedia.org', 
    'cointelegraph.com', 'coindesk.com', 'coinmarketcap.com', 
    'solscan.io', 'solana.com'
]

# List of known popular tlds to exclude
known_tlds = [
    'site', 'app', 'live', 'xyz', 'io', 'fun', 'ai', 'top', 'vip', 'fi', 
]

def clean():
    try:
        # Query to get all the URLs
        conn = sqlite3.connect('./db/hosts.db')
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM hosts WHERE status = 'found'")
        rows = cursor.fetchall()
        print(f"Found {len(rows)} hosts.")

        domain_counter = 0
        for row in tqdm(rows, desc="Processing hosts"):
            url = row[1]  # Assuming the URL is in the second column
            domain = extract_domain(url)

            if domain is None:
                continue
            
            try_counter = 0
            if domain not in known_domains:
                while try_counter < 3:
                    try:
                        cursor.execute('UPDATE hosts SET status = ? WHERE website = ?', ('valid', url))
                        conn.commit()
                        # print(f"Domain '{domain}' has been marked as valid. #{domain_counter}")
                        domain_counter += 1
                        break
                    except Exception as e:
                        print(f"An error occurred: {e}")
                        try_counter += 1
                        time.sleep(0.1)
                        continue
            else:
                while try_counter < 3:
                    try:
                        cursor.execute('UPDATE hosts SET status = ? WHERE website = ?', ('invalid', url))
                        conn.commit()
                        # print(f"Domain '{domain}' has been marked as invalid. #{domain_counter}")
                        domain_counter += 1
                        break
                    except Exception as e:
                        print(f"An error occurred: {e}")
                        try_counter += 1
                        time.sleep(0.1)
                        continue

        # Close the connection
        conn.close()
        print(f"Clean done.")
        return True
    except Exception as e:
        print(f"An error occurred: {e}")
        return None

def check():
    try:
        # Query to get all the URLs
        conn = sqlite3.connect('./db/hosts.db')
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM hosts WHERE status = 'valid'")
        rows = cursor.fetchall()
        print(f"Found {len(rows)} valid hosts before check.")

        domain_counter = 0
        for row in tqdm(rows, desc="Processing hosts"):
            url = row[1]  # Assuming the URL is in the second column
            domain = extract_domain(url)

            if domain is None:
                continue
            
            try_counter = 0
            if domain in known_domains:
                while try_counter < 3:
                    try:
                        cursor.execute('UPDATE hosts SET status = ? WHERE website = ?', ('invalid', url))
                        conn.commit()
                        # print(f"Domain '{domain}' has been marked as found. #{domain_counter}")
                        domain_counter += 1
                        break
                    except Exception as e:
                        print(f"An error occurred: {e}")
                        try_counter += 1
                        time.sleep(0.1)
                        continue

        # Close the connection
        conn.close()
        print(f"Check done.")
        return True
    except Exception as e:
        print(f"An error occurred: {e}")
        return None

def restore():
    try:
        # Query to get all the URLs
        conn = sqlite3.connect('./db/hosts.db')
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM hosts WHERE status = 'invalid'")
        rows = cursor.fetchall()

        tld_counter = 0
        for row in tqdm(rows, desc="Processing hosts"):
            url = row[1]  # Assuming the URL is in the second column
            domain = extract_domain(url)

            if domain is None:
                continue
            
            domain_parts = domain.split('.')
            if len(domain_parts) < 2:
                continue
            elif len(domain_parts) == 2:
                tld = domain_parts[1]
            else:
                tld = domain_parts[-1]
            
            try_counter = 0
            if tld in known_tlds:
                if domain not in known_domains:
                    while try_counter < 3:
                        try:
                            cursor.execute('UPDATE hosts SET status = ? WHERE website = ?', ('found', url))
                            conn.commit()
                            # print(f"TLD '{tld}' has been marked as found. #{tld_counter}")
                            tld_counter += 1
                            break
                        except Exception as e:
                            print(f"An error occurred: {e}")
                            try_counter += 1
                            time.sleep(0.1)
                            continue
                else:
                    print(f"Domain '{domain}' is already known.")
            else:
                print(f"TLD '{tld}' is not known.")

        # Close the connection
        conn.close()
        print(f"Restore done.")
        return True
    except Exception as e:
        print(f"An error occurred: {e}")
        return None
    
def filter():
    try:
        # Query to get all the URLs
        conn = sqlite3.connect('./db/hosts.db')
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM hosts WHERE status = 'valid'")
        rows = cursor.fetchall()
        print(f"Found {len(rows)} valid hosts before filter.")
        
        tld_counter = 0
        for row in tqdm(rows, desc="Processing hosts"):
            url = row[1]  # Assuming the URL is in the second column
            domain = extract_domain(url)
            # print(f"Domain '{domain}'.")

            domain_parts = domain.split('.')
            if len(domain_parts) < 2:
                continue
            elif len(domain_parts) == 2:
                tld = domain_parts[1]
            else:
                tld = domain_parts[-1]
            
            try_counter = 0
            if tld not in known_tlds:
                while try_counter < 3:
                    try:
                        cursor.execute('UPDATE hosts SET status = ? WHERE website = ?', ('invalid', url))
                        conn.commit()
                        # print(f"TLD '{tld}' has been marked as invalid. #{tld_counter}")
                        tld_counter += 1
                        break
                    except Exception as e:
                        print(f"An error occurred: {e}")
                        try_counter += 1
                        time.sleep(0.1)
                        continue
            else:
                while try_counter < 3:
                    try:
                        cursor.execute('UPDATE hosts SET status = ? WHERE website = ?', ('filtered', url))
                        conn.commit()
                        # print(f"TLD '{tld}' has been marked as filtered. #{tld_counter}")
                        tld_counter += 1
                        break
                    except Exception as e:
                        print(f"An error occurred: {e}")
                        try_counter += 1
                        time.sleep(0.1)
                        continue

        # Close the connection
        conn.close()
        print(f"Filter done.")
        return True
    except Exception as e:
        print(f"An error occurred: {e}")
        return None

def main():
    # clean()
    # check()
    filter()

    # restore()

if __name__ == '__main__':
    main()