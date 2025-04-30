import httpx
from pydantic import BaseModel
import asyncio
from typing import Optional
import openai

class IPInfoResponse(BaseModel):
    ip: str
    ai_summary: Optional[str] = None

async def generate_ai_summary(launch_count: int, geo_data: dict, rdap_data: dict, threat_data: dict) -> str:
    """Generate a detailed network intelligence summary"""
    # Prepare the context for the AI
    context = (
        f"IP Location: {geo_data.get('city', 'Unknown city')}, {geo_data.get('region', 'Unknown region')}, "
        f"{geo_data.get('country', 'Unknown country')} (Coordinates: {geo_data.get('lat', '?')}, "
        f"{geo_data.get('lon', '?')}) | ISP: {geo_data.get('isp', 'Unknown ISP')} (AS{geo_data.get('as', '?')}) | "
        f"Network Owner: {rdap_data.get('name', 'Unknown')} | "
        # f"Threat Score: {threat_data.get('abuseConfidenceScore', 0) if threat_data else 0}/100 | "
        # f"Launches: {launch_count}"
        f"Last Reported: {threat_data.get('lastReportedAt', 'Never') if threat_data else 'Never'}"
    )
    
    try:
        response = await openai.ChatCompletion.acreate(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "Summarize this IP address to a Solana degen. Keep it simple, no hype, and under 200 characters. No hashtags, no emojis, last reports or dates."},
                {"role": "user", "content": f"Describe this IP's network characteristics: {context}. If is known like Vercel or any similar service, start the summary with that."}
                # {"role": "user", "content": f"Describe this IP's network characteristics, if launches are more than one report it as a threat: {context}. If is known like Vercel or any similar service, start the summary with that."}
            ],
            max_tokens=150,
            temperature=0.5
        )
        
        summary = response.choices[0].message.content.strip()
        return summary
        
    except Exception as e:
        print(f"AI summary failed: {e}")
        # Fallback to detailed manual summary
        manual_summary = (
            f"IP Location: {geo_data.get('city', 'Unknown')}, {geo_data.get('country', 'Unknown')} "
            f"(Lat/Lon: {geo_data.get('lat', '?')},{geo_data.get('lon', '?')}) | "
            f"ISP: {geo_data.get('isp', 'Unknown')} (AS{geo_data.get('as', '?')}) | "
            f"Network Block: {rdap_data.get('startAddress', '?')}-{rdap_data.get('endAddress', '?')} | "
            f"Threat Level: {threat_data.get('abuseConfidenceScore', 0) if threat_data else 0}/100"
        )
        return manual_summary

async def fetch_ip_info(ip_address: str, launch_count: int, openai_key: str) -> IPInfoResponse:
    """Fetch IP information with AI summary"""
    openai.api_key = openai_key
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            # Get geolocation data
            geo_response = await client.get(f"http://ip-api.com/json/{ip_address}")
            geo_data = geo_response.json()
            print(f"Geo data: {geo_data}")  # Debugging line to check geo data
            
            # Get RDAP data
            rdap_response = await client.get(f"https://rdap.arin.net/registry/ip/{ip_address}")
            rdap_data = rdap_response.json()
            print(f"RDAP data: {rdap_data}")  # Debugging line to check RDAP data
            
            # Get threat intelligence
            threat_data = None
            try:
                threat_response = await client.get(
                    f"https://api.abuseipdb.com/api/v2/check?ipAddress={ip_address}",
                    headers={"Key": "<YOUR_ABUSE_IP_API_KEY"}  # Replace with your actual AbuseIPDB API key
                )
                threat_data = threat_response.json().get("data", {})
                # print(f"Threat data: {threat_data}")  # Debugging line to check threat data
            except Exception:
                threat_data = None
            
            # Generate AI summary
            ai_summary = await generate_ai_summary(
                launch_count,
                geo_data,
                rdap_data,
                threat_data or {}
            )
            
            return IPInfoResponse(
                ip=ip_address,
                ai_summary=ai_summary
            )
            
    except Exception as e:
        raise RuntimeError(f"Failed to fetch IP information: {e}")

async def main():
    # Example usage
    OPENAI_KEY = ""  # Replace with your actual OpenAI API key
    try:
        result = await fetch_ip_info("76.76.21.21", OPENAI_KEY)
        # print("\nFinal Result:")
        # print(f"IP: {result.ip}")
        # print(f"Geo: {result.geo_data.get('city')}, {result.geo_data.get('country')}")
        # print(f"ISP: {result.geo_data.get('isp')}")
        # print(f"Threat Score: {result.threat_data.get('abuseConfidenceScore') if result.threat_data else 'N/A'}")
        print(f"AI Summary: {result.ai_summary} ({len(result.ai_summary)} chars)")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    asyncio.run(main())