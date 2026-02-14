import frappe
from frappe.utils import now_datetime, today

def get_employee():
    employee = frappe.db.get_value("Employee", {"user_id": frappe.session.user}, "name")
    return employee

@frappe.whitelist()
def get_attendance_status():
    employee = get_employee()
    if not employee:
        return {"status": "No Employee Found"}

    # Check if there is an attendance record for today
    attendance = frappe.db.get_value("Employee Attendance",
        {"employee": employee, "date": today(), "docstatus": ["!=", 2]},
        ["name", "in_time", "out_time"], as_dict=True)

    if not attendance:
        return {"status": "Not Checked In"}
    
    if attendance.in_time and not attendance.out_time:
        return {
            "status": "Checked In", 
            "name": attendance.name, 
            "in_time": str(attendance.in_time)
        }
    
    if attendance.in_time and attendance.out_time and str(attendance.out_time) != "00:00:00":
        return {
            "status": "Checked Out", 
            "name": attendance.name, 
            "in_time": str(attendance.in_time), 
            "out_time": str(attendance.out_time)
        }
    
    # Fallback if in_time is not set but record exists (e.g. from legacy system or manual entry)
    # We treat it as Checked In if out_time is missing
    if not attendance.out_time:
         return {
            "status": "Checked In", 
            "name": attendance.name, 
            "in_time": "Unknown" 
        }

    return {"status": "Unknown", "attendance": attendance}

@frappe.whitelist()
def mark_attendance():
    employee = get_employee()
    if not employee:
        frappe.throw("You are not linked to an Employee record.")
        
    status_data = get_attendance_status()
    status = status_data.get("status")
    
    current_time = now_datetime().strftime("%H:%M:%S")

    # Fetch branch logic if needed, but for now we assume simple check-in/out
    # If we need branch/GPS, we might need to replicate some logic from employee_attendance.py
    # For now, let's keep it simple as per request.
    
    if status == "Not Checked In":
        # Create new attendance
        # We need to satisfy 'branch' field which is required in DocType
        branch = frappe.db.get_value("Employee", employee, "branch")
        if not branch:
             frappe.throw("Employee Branch is not set. Cannot mark attendance.")

        doc = frappe.get_doc({
            "doctype": "Employee Attendance",
            "employee": employee,
            "branch": branch,
            "date": today(),
            "in_time": current_time,
            "time": current_time, # Legacy field
            "in_time": current_time,
            "out_time": "",
            "status": "Present"
        })
        doc.insert(ignore_permissions=True)
        return {"message": "Checked In", "in_time": current_time, "status": "Checked In"}

    elif status == "Checked In":
        # Update existing attendance
        doc = frappe.get_doc("Employee Attendance", status_data["name"])
        doc.out_time = current_time
        doc.save(ignore_permissions=True)
        doc.submit() # Submit on check-out
        return {"message": "Checked Out", "out_time": current_time, "status": "Checked Out"}
    
    elif status == "Checked Out":
         return {"message": "Already Checked Out", "status": "Checked Out"}
    
    return {"message": "Error", "status": "Error"}
