import frappe

def execute():
    try:
        # 1. Clean up invalid Custom DocPerms where import is set to 1 for doctypes that are not importable
        bad_perms = frappe.get_all("Custom DocPerm", filters={"import": 1}, fields=["name", "parent", "role"])
        for p in bad_perms:
            if frappe.get_value("DocType", p.parent, "allow_import") == 0:
                print(f"Fixing invalid import permission for {p.parent} - {p.role}")
                frappe.db.set_value("Custom DocPerm", p.name, "import", 0)
                
        # Also clean up standard DocPerms if any
        bad_perms_doc = frappe.get_all("DocPerm", filters={"import": 1}, fields=["name", "parent", "role"])
        for p in bad_perms_doc:
            if frappe.get_value("DocType", p.parent, "allow_import") == 0:
                print(f"Fixing invalid standard import permission for {p.parent} - {p.role}")
                frappe.db.set_value("DocPerm", p.name, "import", 0)
                
        frappe.db.commit()
    except Exception as e:
        frappe.log_error(f"Failed to fix docperms in patch: {str(e)}", "DocPerm Patch Error")
