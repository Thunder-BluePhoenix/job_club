import requests
import re

url = "https://maps.app.goo.gl/3jASFg1uejkaz7Cx8"

try:
    resp = requests.get(url, allow_redirects=True, timeout=10)
    final_url = resp.url
    print(f"Final URL: {final_url}")
    
    # Test existing and new patterns
    patterns = [
        r"@(-?\d+\.\d+),(-?\d+\.\d+)",
        r"q=(-?\d+\.\d+),(-?\d+\.\d+)",
        r"!3d(-?\d+\.\d+).*!4d(-?\d+\.\d+)",
        r"search/(-?\d+\.\d+),\s*(-?\d+\.\d+)",
        r"ll=(-?\d+\.\d+),(-?\d+\.\d+)"
    ]
    
    found = False
    for p in patterns:
        match = re.search(p, final_url)
        if match:
            print(f"Match found for pattern '{p}': {match.groups()}")
            found = True
            
    if not found:
        print("No matches found with current patterns.")
        
except Exception as e:
    print(f"Error: {e}")
