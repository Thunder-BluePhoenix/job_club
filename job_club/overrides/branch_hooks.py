import frappe

def create_drive_series(doc, method):
    """
    Auto-generate branch_code (first 3 letters) and create Recruitment Drive series
    """
    if not doc.branch:
        frappe.throw("Branch Name is required")

    # Generate 3-letter branch code
    branch_code = doc.branch.strip().upper().replace(" ", "")[:3]

    # Save branch_code into the branch doc (if you added field)
    if hasattr(doc, "branch_code"):
        frappe.db.set_value("Branch", doc.name, "branch_code", branch_code)

    # Build series
    new_series = f"{branch_code}-DRIVE-.#####"

    # Fetch current options of naming_series in Recruitment Drive
    options = frappe.db.get_value(
        "DocField",
        {"parent": "Recruitment Drive", "fieldname": "naming_series"},
        "options"
    )

    if options:
        if new_series not in options.split("\n"):
            updated_options = options + "\n" + new_series
            frappe.db.sql("""
                UPDATE `tabDocField`
                SET options = %s
                WHERE parent = 'Recruitment Drive'
                AND fieldname = 'naming_series'
            """, (updated_options,))
            frappe.clear_cache(doctype="Recruitment Drive")
    else:
        frappe.db.sql("""
            UPDATE `tabDocField`
            SET options = %s
            WHERE parent = 'Recruitment Drive'
            AND fieldname = 'naming_series'
        """, (new_series,))
        frappe.clear_cache(doctype="Recruitment Drive")

    frappe.msgprint(f"Recruitment Drive series '{new_series}' added automatically for branch {branch_code}")
