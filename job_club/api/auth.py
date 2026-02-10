import frappe

@frappe.whitelist(allow_guest=True)
def get_redirect_url():
    """Get redirect URL based on user role after login"""
    if frappe.session.user == "Guest":
        return "/login"
    
    # Get user roles
    roles = frappe.get_roles(frappe.session.user)
    
    # Debug logging
    frappe.log_error(f"User: {frappe.session.user}, Roles: {roles}", "Login Redirect Debug")
    
    # Check if user is a Student
    # Only exclude if they have System Manager or Administrator role
    has_student_role = "Student" in roles
    has_admin_roles = any(role in roles for role in ["System Manager", "Administrator"])
    
    # Redirect to student dashboard if user has Student role and is not an admin
    if has_student_role and not has_admin_roles:
        return "/app/student-dashboard"
    else:
        return "/app/admin-dashboard"
