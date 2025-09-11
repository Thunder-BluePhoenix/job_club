import frappe, re, requests
from frappe.model.document import Document

class RecruitmentDrive(Document):
    pass


@frappe.whitelist()
def get_embed_map_url(location_link):
    """Convert short/long Google Maps link into an embeddable pinned map URL"""
    if not location_link:
        return None

    link = location_link.strip()

    # 1️⃣ Expand short URL
    if "maps.app.goo.gl" in link:
        try:
            resp = requests.get(link, allow_redirects=True, timeout=10)
            link = resp.url
        except Exception as e:
            frappe.log_error(title="Map expand failed", message=str(e))
            return None

    # 2️⃣ Extract lat,lng
    match = re.search(r"@(-?\d+\.\d+),(-?\d+\.\d+)", link) or re.search(r"(-?\d+\.\d+),(-?\d+\.\d+)", link)

    if match:
        lat, lng = match.groups()
        # ✅ Use Maps Embed API for exact pinned marker
        return f"https://www.google.com/maps/embed/v1/place?key=AIzaSyAROSZNTxgAeR_GoPnt_7weSnuuph8e2-c&q={lat},{lng}"

    # 3️⃣ Fallback
    if "google.com/maps" in link:
        if "output=embed" not in link:
            return link + ("&output=embed" if "?" in link else "?output=embed")
        return link

    return None
