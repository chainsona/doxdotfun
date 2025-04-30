import sqlite3
import subprocess
from tqdm import tqdm
import time

def fetch_hosts_from_db():
    conn = sqlite3.connect('./db/hosts.db', timeout=10)
    cursor = conn.cursor()
    cursor.execute("SELECT website FROM hosts WHERE status = 'filtered' AND ip IS NULL")
    hosts = cursor.fetchall()
    conn.close()
    return hosts

def dig_host(url):
    domain = url.split('//')[-1].split('/')[0]
    result = subprocess.run(['dig', '+short', domain], capture_output=True, text=True)
    return result.stdout.strip()

if __name__ == "__main__":
    conn = sqlite3.connect('./db/hosts.db')
    cursor = conn.cursor()

    hosts = fetch_hosts_from_db()
    print(f"Found {len(hosts)} filtered hosts.")
    for host in tqdm(hosts, desc="Finding IPs"):
        url = host[0]

        host_check = [host for host in host[0].split('/') if host]
        if len(host_check) > 2:
            cursor.execute('UPDATE hosts SET status = ? WHERE website = ?', ('invalid', url))
            conn.commit()
            print(f"URL '{url}' has been marked as invalid, host is too long.")
            continue
        
        ip_address = dig_host(url)
        # print(f"{url}: {ip_address}")

        ips = ip_address.split('\n')
        ip_address_formatted = ','.join(ips)

        if not ip_address_formatted or ip_address_formatted == '':
            cursor.execute('UPDATE hosts SET status = ? WHERE website = ?', ('invalid', url))
            conn.commit()
            print(f"URL '{url}' has been marked as invalid, no IPs found.")
            continue

        print(f"{url}: {ip_address_formatted}")

        while True:
            try:
                cursor.execute('UPDATE hosts SET ip = ? WHERE website = ?', (ip_address_formatted, url))
                conn.commit()
                print(f"IP address '{ip_address_formatted}' has been saved to the database.")
                break
            except sqlite3.OperationalError as e:
                print(f"An error occurred: {e}")
                time.sleep(.1)

    conn.close()