import frappe
import json
from frappe import _
from frappe.utils import nowdate, getdate


@frappe.whitelist()
def mark_employee_attendance_tool(
    employees_present=None, 
    employees_absent=None, 
    employees_leave=None,
    department=None,
    branch=None,
    date=None
):
    """
    Mark attendance for multiple employees from the Employee Attendance Tool.
    Creates or updates Employee Attendance records.
    
    Args:
        employees_present: JSON string of present employees
        employees_absent: JSON string of absent employees
        employees_leave: JSON string of employees on leave
        department: Department name
        branch: Branch name (optional)
        date: Attendance date
    
    Returns:
        dict with count of records created/updated
    """
    if not date:
        date = nowdate()
    
    date = getdate(date)
    
    # Parse JSON strings
    present = json.loads(employees_present) if employees_present else []
    absent = json.loads(employees_absent) if employees_absent else []
    leave = json.loads(employees_leave) if employees_leave else []
    
    count = 0
    
    # Process Present employees
    for emp in present:
        try:
            count += create_or_update_attendance(
                employee=emp.get('employee'),
                employee_name=emp.get('employee_name'),
                date=date,
                status='Present',
                remarks=emp.get('remarks', ''),
                branch=branch
            )
        except Exception as e:
            frappe.log_error(
                f"Error marking present for {emp.get('employee')}: {str(e)}",
                "Employee Attendance Tool Error"
            )
    
    # Process Absent employees
    for emp in absent:
        try:
            count += create_or_update_attendance(
                employee=emp.get('employee'),
                employee_name=emp.get('employee_name'),
                date=date,
                status='Absent',
                remarks=emp.get('remarks', ''),
                branch=branch
            )
        except Exception as e:
            frappe.log_error(
                f"Error marking absent for {emp.get('employee')}: {str(e)}",
                "Employee Attendance Tool Error"
            )
    
    # Process Leave employees
    for emp in leave:
        try:
            count += create_or_update_attendance(
                employee=emp.get('employee'),
                employee_name=emp.get('employee_name'),
                date=date,
                status='Leave',
                remarks=emp.get('remarks', ''),
                branch=branch
            )
        except Exception as e:
            frappe.log_error(
                f"Error marking leave for {emp.get('employee')}: {str(e)}",
                "Employee Attendance Tool Error"
            )
    
    frappe.db.commit()
    
    return {"count": count, "message": _("Attendance marked successfully")}


def create_or_update_attendance(employee, employee_name, date, status, remarks='', branch=None):
    """
    Create or update an Employee Attendance record.
    If record exists for the date, cancel and recreate it.
    
    Returns:
        1 if record created/updated, 0 otherwise
    """
    if not employee or not date or not status:
        return 0
    
    # Get employee branch if not provided
    if not branch:
        branch = frappe.db.get_value("Employee", employee, "branch")
    
    # Check for existing attendance record
    existing = frappe.db.get_value(
        "Employee Attendance",
        {
            "employee": employee,
            "date": date
        },
        ["name", "docstatus"],
        as_dict=True
    )
    
    if existing:
        # If submitted, cancel it first
        if existing.docstatus == 1:
            doc = frappe.get_doc("Employee Attendance", existing.name)
            doc.cancel()
            frappe.db.commit()
        
        # Delete the cancelled/draft record
        frappe.delete_doc("Employee Attendance", existing.name, force=1)
        frappe.db.commit()
    
    # Create new attendance record
    try:
        att = frappe.get_doc({
            "doctype": "Employee Attendance",
            "employee": employee,
            "date": date,
            "time": "09:00:00",  # Default time for tool-based marking
            "status": status,
            "branch": branch,
            "remarks": remarks,
            "auto_marked": 0  # Manual marking via tool
        })
        
        att.insert(ignore_permissions=True)
        att.submit()
        
        return 1
    
    except Exception as e:
        frappe.log_error(
            f"Failed to create attendance for {employee} on {date}: {str(e)}",
            "Employee Attendance Creation Error"
        )
        return 0


@frappe.whitelist()
def get_employee_attendance_summary(department=None, branch=None, from_date=None, to_date=None):
    """
    Get attendance summary statistics for a department/branch.
    Useful for reports and dashboards.
    
    Args:
        department: Department name
        branch: Branch name (optional)
        from_date: Start date
        to_date: End date
    
    Returns:
        dict with summary statistics
    """
    filters = {}
    
    if department:
        filters["department"] = department
    
    if branch:
        filters["branch"] = branch
    
    if from_date:
        filters["date"] = [">=", from_date]
    
    if to_date:
        if "date" in filters:
            filters["date"] = ["between", [from_date, to_date]]
        else:
            filters["date"] = ["<=", to_date]
    
    # Get all attendance records
    attendance_records = frappe.get_all(
        "Employee Attendance",
        filters=filters,
        fields=["employee", "date", "status"],
        order_by="date desc"
    )
    
    # Calculate statistics
    total_records = len(attendance_records)
    present_count = len([a for a in attendance_records if a.status == "Present"])
    absent_count = len([a for a in attendance_records if a.status == "Absent"])
    leave_count = len([a for a in attendance_records if a.status == "Leave"])
    
    # Calculate unique employees
    unique_employees = len(set([a.employee for a in attendance_records]))
    
    return {
        "total_records": total_records,
        "present_count": present_count,
        "absent_count": absent_count,
        "leave_count": leave_count,
        "unique_employees": unique_employees,
        "attendance_percentage": round((present_count / total_records * 100), 2) if total_records > 0 else 0
    }


@frappe.whitelist()
def delete_employee_attendance_bulk(employee_list=None, date=None):
    """
    Delete attendance records for multiple employees on a specific date.
    Useful for corrections.
    Only accessible by HR Manager or System Manager.
    
    Args:
        employee_list: JSON string of employee IDs
        date: Date to delete attendance for
    """
    # Check permissions
    if "HR Manager" not in frappe.get_roles() and "System Manager" not in frappe.get_roles():
        frappe.throw(_("Only HR Manager or System Manager can delete bulk attendance"))
    
    if not employee_list or not date:
        frappe.throw(_("Employee list and date are required"))
    
    employees = json.loads(employee_list) if isinstance(employee_list, str) else employee_list
    date = getdate(date)
    
    deleted_count = 0
    
    for employee in employees:
        try:
            # Find and delete attendance record
            existing = frappe.db.get_value(
                "Employee Attendance",
                {
                    "employee": employee,
                    "date": date
                },
                ["name", "docstatus"],
                as_dict=True
            )
            
            if existing:
                # Cancel if submitted
                if existing.docstatus == 1:
                    doc = frappe.get_doc("Employee Attendance", existing.name)
                    doc.cancel()
                
                # Delete the record
                frappe.delete_doc("Employee Attendance", existing.name, force=1)
                deleted_count += 1
        
        except Exception as e:
            frappe.log_error(
                f"Error deleting attendance for {employee} on {date}: {str(e)}",
                "Bulk Delete Error"
            )
    
    frappe.db.commit()
    
    frappe.msgprint(
        _("Deleted {0} attendance records for {1}").format(deleted_count, date),
        title=_("Bulk Delete Completed"),
        indicator="green"
    )
    
    return {"deleted_count": deleted_count}