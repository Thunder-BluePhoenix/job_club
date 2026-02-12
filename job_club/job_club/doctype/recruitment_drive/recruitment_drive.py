import frappe, re, requests
from frappe.model.document import Document

class RecruitmentDrive(Document):
    pass


@frappe.whitelist()
def get_embed_map_url(location_link):
    """Convert short/long Google Maps link into an embeddable pinned map URL and extract lat/lng"""
    if not location_link:
        return None

    link = location_link.strip()
    lat, lng = None, None

    # 1️⃣ Handle raw "lat, lng" input
    raw_match = re.match(r"^(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)$", link)
    if raw_match:
        lat, lng = raw_match.groups()
    else:
        # 2️⃣ Expand short URL if needed
        if "maps.app.goo.gl" in link:
            try:
                resp = requests.get(link, allow_redirects=True, timeout=10)
                link = resp.url
            except Exception as e:
                frappe.log_error(title="Map expand failed", message=str(e))
                return None

        # 3️⃣ Extract lat,lng from long URL
        # Patterns: @lat,lng | q=lat,lng | !3dlat!4dlong | /maps/search/lat,+lng
        match = (
            re.search(r"@(-?\d+\.\d+),(-?\d+\.\d+)", link) or 
            re.search(r"q=(-?\d+\.\d+),(-?\d+\.\d+)", link) or
            re.search(r"!3d(-?\d+\.\d+).*!4d(-?\d+\.\d+)", link) or
            re.search(r"search/(-?\d+\.\d+),\s*\+?(-?\d+\.\d+)", link)
        )
        if match:
            lat, lng = match.groups()

    if lat and lng:
        api_key = frappe.db.get_single_value("Job Club Settings", "google_api_key")
        
        if not api_key:
            return None

        embed_url = f"https://www.google.com/maps/embed/v1/place?key={api_key}&q={lat},{lng}"
        return {
            "embed_url": embed_url,
            "lat": lat,
            "lng": lng
        }

    # 4️⃣ Fallback for links without obvious lat/lng
    if "google.com/maps" in link:
        embed_url = link + ("&output=embed" if "?" in link else "?output=embed") if "output=embed" not in link else link
        return {
            "embed_url": embed_url,
            "lat": None,
            "lng": None
        }

    return None
