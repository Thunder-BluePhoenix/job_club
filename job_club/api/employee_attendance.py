import frappe
import math
from frappe import _
from frappe.utils import nowdate, nowtime, get_datetime, get_time, now_datetime
from datetime import datetime


@frappe.whitelist()
def get_employee_branch():
    """
    Fetch the branch of the logged-in employee user.
    Returns employee name and branch for the current user.
    """
    user = frappe.session.user
    
    # Prevent guest access
    if user == "Guest":
        frappe.throw(_("Please login to mark attendance."))
    
    employee_data = frappe.db.get_value(
        "Employee",
        {"user_id": user},
        ["name", "branch", "employee_name"],
        as_dict=True,
    )

    if not employee_data:
        return {"error": _("No employee linked with this user.")}

    if not employee_data.branch:
        return {"error": _("Branch not set for this employee.")}

    radius = frappe.db.get_single_value("Job Club Settings", "attendance_radius") or 200
    return {
        "employee": employee_data.name, 
        "employee_name": employee_data.employee_name,
        "branch": employee_data.branch, 
        "attendance_radius": radius
    }


@frappe.whitelist()
def get_employee_department(employee):
    """
    Return the department the employee belongs to.
    """
    if not employee:
        return {"department": None, "error": _("Employee parameter missing")}
    
    department = frappe.db.get_value(
        "Employee",
        employee,
        "department"
    )
    
    return {"department": department if department else None}


@frappe.whitelist()
def get_branch_coordinates(branch_name):
    """
    Fetch branch latitude & longitude accurately.
    Branch doctype: branch_latitude, branch_longitude (Float fields, required)
    """
    if not branch_name:
        return {"error": _("Branch name missing.")}

    try:
        # Check if branch exists first
        if not frappe.db.exists("Branch", branch_name):
            return {"error": _("Branch '{0}' not found").format(branch_name)}
        
        # Fetch branch coordinates
        branch = frappe.db.get_value(
            "Branch",
            branch_name,
            ["branch_latitude", "branch_longitude"],
            as_dict=True
        )
        
        if not branch:
            return {"error": _("Branch '{0}' not found").format(branch_name)}
        
        # Validate coordinates exist
        if branch.branch_latitude is None or branch.branch_longitude is None:
            return {"error": _("Coordinates not set for branch '{0}'").format(branch_name)}
        
        # Validate coordinate ranges
        lat = float(branch.branch_latitude)
        lon = float(branch.branch_longitude)
        
        if not (-90 <= lat <= 90) or not (-180 <= lon <= 180):
            frappe.log_error(
                f"Invalid coordinates for branch {branch_name}: lat={lat}, lon={lon}",
                "Invalid Branch Coordinates"
            )
            return {"error": _("Invalid coordinates configured for this branch")}
        
        return {
            "latitude": lat,
            "longitude": lon
        }
    
    except Exception as e:
        frappe.log_error(
            f"Error fetching branch coordinates for {branch_name}: {str(e)}",
            "Branch Coordinates Error"
        )
        return {"error": _("Error fetching coordinates: {0}").format(str(e))}


def calculate_distance_haversine(lat1, lon1, lat2, lon2):
    """
    Calculate distance between two GPS coordinates using Haversine formula.
    More accurate than Equirectangular approximation.
    
    Args:
        lat1, lon1: First coordinate (user location)
        lat2, lon2: Second coordinate (branch location)
    
    Returns:
        Distance in meters
    """
    R = 6371000  # Earth radius in meters
    
    # Convert to radians
    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)
    
    # Haversine formula
    dLat = lat2_rad - lat1_rad
    dLon = lon2_rad - lon1_rad
    
    a = (math.sin(dLat / 2) ** 2 + 
         math.cos(lat1_rad) * math.cos(lat2_rad) * 
         math.sin(dLon / 2) ** 2)
    
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    distance = R * c
    
    return distance


@frappe.whitelist(allow_guest=False)
def mark_attendance(latitude, longitude, employee=None, branch=None, distance=None, check_only=False):
    """
    Create Employee Attendance record with GPS validation.
    Ensures within-zone logic, prevents duplicates.
    RESTRICTS attendance marking if user is outside office zone (>200 meters).
    
    Args:
        latitude: User's GPS latitude
        longitude: User's GPS longitude
        employee: Employee ID (optional, will fetch from session if not provided)
        branch: Branch name (optional, will fetch from employee if not provided)
        distance: Pre-calculated distance (optional, will calculate if not provided)
        check_only: If True, only check if attendance is already marked (don't validate coordinates)
    """
    # Get employee info if not provided
    user = frappe.session.user
    
    if not employee:
        employee_data = frappe.db.get_value(
            "Employee", 
            {"user_id": user}, 
            ["name", "branch"], 
            as_dict=True
        )
        if not employee_data:
            frappe.throw(_("No Employee linked with this user."))
        
        employee = employee_data.name
        branch = employee_data.branch
    
    # Check for duplicate attendance today (always check this first)
    today = nowdate()
    existing = frappe.db.get_value(
        "Employee Attendance", 
        {
            "employee": employee, 
            "date": today
        },
        ["name", "status", "time", "distance"],
        as_dict=True
    )
    
    if existing:
        # Format time for display (remove microseconds)
        display_time = existing.time
        if isinstance(display_time, str) and '.' in display_time:
            display_time = display_time.split('.')[0]
        
        return {
            "already_marked": True,
            "message": _("Attendance already marked for today"),
            "status": existing.status,
            "time": display_time,
            "distance": existing.distance,
            "attendance_id": existing.name
        }
    
    # If just checking, return here
    if check_only:
        return {"already_marked": False}
    
    # Validate GPS coordinates
    if not latitude or not longitude:
        frappe.throw(_("GPS coordinates missing."))

    try:
        latitude = float(latitude)
        longitude = float(longitude)
    except (ValueError, TypeError):
        frappe.throw(_("Invalid GPS coordinates provided."))
    
    # Validate coordinate ranges
    if not (-90 <= latitude <= 90) or not (-180 <= longitude <= 180):
        frappe.throw(_("GPS coordinates out of valid range."))
    
    if not branch:
        frappe.throw(_("Branch information missing."))

    # Fetch Branch coordinates
    branch_data = frappe.db.get_value(
        "Branch",
        branch,
        ["branch_latitude", "branch_longitude"],
        as_dict=True,
    )
    
    if not branch_data or branch_data.branch_latitude is None or branch_data.branch_longitude is None:
        frappe.throw(_("Branch coordinates not configured."))

    # Calculate distance using Haversine formula
    calculated_distance = calculate_distance_haversine(
        latitude, 
        longitude,
        float(branch_data.branch_latitude),
        float(branch_data.branch_longitude)
    )

    # CRITICAL: Zone restriction
    ZONE_RADIUS = frappe.db.get_single_value("Job Club Settings", "attendance_radius") or 200  # meters
    
    if calculated_distance > ZONE_RADIUS:
        # Log the attempt for security/audit purposes
        frappe.log_error(
            f"Attendance attempt outside zone by employee {employee}: Distance {calculated_distance:.2f}m from branch {branch}",
            "Attendance Outside Zone Attempt"
        )
        
        # Return error - DO NOT create attendance record
        return {
            "error": _("You must be within {0} meters of office to mark attendance. Your current distance is {1} meters.").format(
                ZONE_RADIUS,
                int(calculated_distance)
            ),
            "outside_zone": True,
            "distance": round(calculated_distance, 2),
            "required_distance": ZONE_RADIUS
        }
    
    # User is within zone - mark as Present
    status = "Present"

    # Create and submit attendance record
    try:
        # Format time without microseconds (HH:MM:SS)
        current_time_str = nowtime().split('.')[0]
        
        att = frappe.get_doc({
            "doctype": "Employee Attendance",
            "employee": employee,
            "branch": branch,
            "date": today,
            "date": today,
            "time": current_time_str,
            "in_time": current_time_str,
            "out_time": "",
            "latitude": latitude,
            "longitude": longitude,
            "distance": round(calculated_distance, 2),
            "status": status,
            "auto_marked": 0
        })
        att.insert(ignore_permissions=True)
        # att.submit()  # Submit deferred to check-out
        frappe.db.commit()
        
        return {
            "message": _("Attendance marked successfully as {0} ({1} meters from office)").format(
                status, 
                int(calculated_distance)
            ),
            "status": status,
            "distance": round(calculated_distance, 2),
            "attendance_id": att.name,
            "time": current_time_str,
            "already_marked": False
        }
    
    except Exception as e:
        frappe.log_error(
            f"Error creating attendance for employee {employee}: {str(e)}",
            "Attendance Creation Error"
        )
        frappe.throw(_("Failed to mark attendance. Please try again."))


@frappe.whitelist()
def check_today_attendance(employee=None):
    """
    Check if attendance is already marked for today.
    Returns attendance details if found, otherwise returns not found status.
    """
    user = frappe.session.user
    
    # Get employee if not provided
    if not employee:
        employee = frappe.db.get_value("Employee", {"user_id": user}, "name")
        if not employee:
            return {"error": _("No employee linked with this user.")}
    
    # Check for today's attendance
    today = nowdate()
    existing = frappe.db.get_value(
        "Employee Attendance",
        {
            "employee": employee,
            "date": today
        },
        ["name", "status", "time", "distance"],
        as_dict=True
    )
    
    if existing:
        # Format time for display (remove microseconds)
        display_time = existing.time
        if isinstance(display_time, str) and '.' in display_time:
            display_time = display_time.split('.')[0]
        
        return {
            "already_marked": True,
            "status": existing.status,
            "time": display_time,
            "distance": existing.distance,
            "attendance_id": existing.name
        }
    
    return {
        "already_marked": False
    }


@frappe.whitelist()
def get_attendance_summary(employee=None, from_date=None, to_date=None):
    """
    Get attendance summary for an employee.
    Useful for displaying attendance history.
    """
    user = frappe.session.user
    
    if not employee:
        employee = frappe.db.get_value("Employee", {"user_id": user}, "name")
        if not employee:
            return {"error": _("No employee linked with this user.")}
    
    filters = {"employee": employee}
    
    if from_date:
        filters["date"] = [">=", from_date]
    if to_date:
        if "date" in filters:
            filters["date"] = ["between", [from_date, to_date]]
        else:
            filters["date"] = ["<=", to_date]
    
    attendance_list = frappe.get_all(
        "Employee Attendance",
        filters=filters,
        fields=["date", "time", "status", "distance", "branch", "auto_marked"],
        order_by="date desc",
        limit=50
    )
    
    # Calculate statistics
    total = len(attendance_list)
    present = len([a for a in attendance_list if a.status == "Present"])
    absent = len([a for a in attendance_list if a.status == "Absent"])
    
    return {
        "attendance": attendance_list,
        "summary": {
            "total": total,
            "present": present,
            "absent": absent,
            "attendance_percentage": round((present / total * 100), 2) if total > 0 else 0
        }
    }


@frappe.whitelist()
def mark_absent_for_employees():
    """
    Scheduled function to mark employees absent if they didn't mark attendance by end of day.
    Should be run once at the end of working hours (e.g., 6 PM or 7 PM).
    """
    today = nowdate()
    
    frappe.logger().info(f"=== Running absent marking for employees on {today} ===")
    
    # Get all active employees
    employees = frappe.get_all(
        "Employee",
        filters={"status": "Active"},
        fields=["name", "branch"]
    )
    
    total_marked = 0
    
    for emp in employees:
        try:
            # Check if attendance already marked today
            existing = frappe.db.exists(
                "Employee Attendance",
                {
                    "employee": emp.name,
                    "date": today
                }
            )
            
            # If not marked, create absent record
            if not existing:
                try:
                    att = frappe.get_doc({
                        "doctype": "Employee Attendance",
                        "employee": emp.name,
                        "date": today,
                        "time": "23:59:59",
                        "status": "Absent",
                        "latitude": None,
                        "longitude": None,
                        "distance": None,
                        "branch": emp.branch,
                        "auto_marked": 1
                    })
                    att.insert(ignore_permissions=True)
                    att.submit()
                    
                    total_marked += 1
                    frappe.logger().info(f"✓ Auto-marked absent: {emp.name}")
                
                except Exception as e:
                    frappe.log_error(
                        f"Failed to auto-mark absent for {emp.name}: {str(e)}",
                        "Auto Mark Absent Error"
                    )
        
        except Exception as e:
            frappe.log_error(
                f"Error processing employee {emp.name}: {str(e)}",
                "Employee Processing Error"
            )
            continue
    
    frappe.db.commit()
    
    result_msg = f"Absent marking: {total_marked} employees marked absent on {today}"
    frappe.logger().info(f"=== {result_msg} ===")
    
    return {
        "message": result_msg, 
        "total_marked": total_marked
    }


@frappe.whitelist()
def trigger_absent_marking_now():
    """
    Manual trigger for immediate absent marking.
    Useful for testing or manual intervention.
    Only accessible by Administrator or System Manager.
    """
    if frappe.session.user not in ["Administrator"] and "System Manager" not in frappe.get_roles():
        frappe.throw(_("Only Administrator or System Manager can trigger this manually"))
    
    result = mark_absent_for_employees()
    frappe.msgprint(f"✓ {result.get('message')}", title="Absent Marking Completed", indicator="green")
    return result