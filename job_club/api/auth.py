import frappe

@frappe.whitelist(allow_guest=True)
def get_redirect_url():
    """Get redirect URL based on user role after login"""
    if frappe.session.user == "Guest":
        return "/login"
    
    # Get user roles
    roles = frappe.get_roles(frappe.session.user)
    
    # Check if user is a Student
    if "Student" in roles:
        return "/app/student-dashboard"
    else:
        return "/app/admin-dashboard"
