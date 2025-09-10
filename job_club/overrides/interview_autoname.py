import frappe
from frappe.utils import now_datetime

def set_interview_name(doc, method):
    if not doc.location:
        frappe.throw("Branch (Location) is required.")

    branch_name = frappe.db.get_value("Branch", doc.location, "branch") or doc.location
    branch_code = branch_name.strip().upper()[:3]
    year = str(now_datetime().year)

    prefix = f"RCM-{branch_code}-{year}-"
    doc.naming_series = prefix

    # 🔑 Ensure prefix exists in Series table
    if not frappe.db.exists("Series", prefix):
        frappe.db.sql("INSERT INTO tabSeries (name, current) VALUES (%s, %s)", (prefix, 0))
