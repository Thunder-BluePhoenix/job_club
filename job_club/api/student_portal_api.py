import frappe
from frappe import _
from frappe.utils import today, getdate, add_days, get_first_day, get_last_day, flt, cint
from datetime import datetime, timedelta


@frappe.whitelist()
def get_student_dashboard_data():
    """
    Get comprehensive dashboard data for the logged-in student
    Returns: dict with all dashboard statistics and data
    """
    student = get_current_student()
    if not student:
        frappe.throw(_("No student record found for current user"))
    
    return {
        "student_info": get_student_profile(student),
        "quick_stats": get_quick_stats(student),
        "attendance_summary": get_attendance_summary(student),
        "fee_status": get_fee_status(student),
        "courses": get_course_progress(student),
        "upcoming_events": get_upcoming_events(student),
        "recent_announcements": get_recent_announcements()
    }


@frappe.whitelist()
def get_student_profile(student=None):
    """Get student profile information"""
    if not student:
        student = get_current_student()
    
    if not student:
        return {}
    
    student_doc = frappe.get_doc("Student", student)
    
    # Get program enrollment
    enrollments = frappe.get_all(
        "Program Enrollment",
        filters={"student": student, "docstatus": 1},
        fields=["name", "program", "academic_year", "enrollment_date", "branch"],
        order_by="creation desc",
        limit=1
    )
    
    enrollment_info = {}
    if enrollments:
        enrollment = enrollments[0]
        program = frappe.get_doc("Program", enrollment.program)
        
        # Try to get student batch
        batch_name = ""
        # 1. Try Program Enrollment field
        enrollment_doc = frappe.get_doc("Program Enrollment", enrollment.name)
        batch_name = enrollment_doc.get("student_batch") or enrollment_doc.get("student_batch_name")
        
        # 2. If not found, look in Student Batch Student child table
        if not batch_name:
            batch_record = frappe.db.get_value(
                "Student Batch Student", 
                {"student": student, "active": 1}, 
                "parent", 
                order_by="creation desc"
            )
            if batch_record:
                batch_name = batch_record
        
        enrollment_info = {
            "program_name": program.program_name,
            "program": enrollment.program,
            "academic_year": enrollment.academic_year,
            "branch": enrollment.branch,
            "batch": batch_name or "",
            "enrollment_date": enrollment.enrollment_date
        }
    
    return {
        "name": student,
        "student_name": student_doc.student_name,
        "first_name": student_doc.first_name,
        "middle_name": student_doc.middle_name or "",
        "last_name": student_doc.last_name or "",
        "email": student_doc.student_email_id,
        "mobile": student_doc.student_mobile_number,
        "image": student_doc.image,
        "date_of_birth": student_doc.date_of_birth,
        "gender": student_doc.gender,
        "enrollment": enrollment_info
    }


@frappe.whitelist()
def get_quick_stats(student=None):
    """Get quick statistics for dashboard cards"""
    if not student:
        student = get_current_student()
    
    if not student:
        return {}
    
    # Get attendance percentage
    attendance_data = get_attendance_summary(student)
    attendance_percentage = attendance_data.get("percentage", 0)
    
    # Get enrolled courses count from Program Enrollment Course
    courses_count = 0
    enrollments = frappe.get_all(
        "Program Enrollment",
        filters={"student": student, "docstatus": 1},
        fields=["name"]
    )
    
    for enrollment in enrollments:
        courses_count += frappe.db.count("Program Enrollment Course", {"parent": enrollment.name})
    
    # Get pending fees
    pending_fees = frappe.db.sql("""
        SELECT SUM(outstanding_amount) as pending
        FROM `tabFees`
        WHERE student = %s AND docstatus = 1
    """, student)[0][0] or 0
    
    return {
        "attendance_percentage": round(attendance_percentage, 1),
        "courses_enrolled": courses_count,
        "pending_fees": flt(pending_fees, 2)
    }


@frappe.whitelist()
def get_attendance_summary(student=None):
    """Get attendance summary and calendar data"""
    if not student:
        student = get_current_student()
    
    if not student:
        return {}
    
    # Get attendance records for current academic year
    attendance_records = frappe.get_all(
        "Student Attendance",
        filters={"student": student, "docstatus": 1},
        fields=["date", "status"],
        order_by="date desc"
    )
    
    total_days = len(attendance_records)
    present_days = len([r for r in attendance_records if r.status == "Present"])
    absent_days = len([r for r in attendance_records if r.status == "Absent"])
    leave_days = len([r for r in attendance_records if r.status == "Leave"])
    
    percentage = (present_days / total_days * 100) if total_days > 0 else 0
    
    # Format calendar data
    calendar_data = []
    for record in attendance_records:
        calendar_data.append({
            "date": str(record.date),
            "status": record.status,
            "color": get_attendance_color(record.status)
        })
    
    # Get monthly breakdown for last 6 months
    monthly_stats = get_monthly_attendance_stats(student)
    
    return {
        "total_days": total_days,
        "present_days": present_days,
        "absent_days": absent_days,
        "leave_days": leave_days,
        "percentage": percentage,
        "calendar_data": calendar_data,
        "monthly_stats": monthly_stats
    }


@frappe.whitelist()
def get_fee_status(student=None):
    """Get fee structure and payment status"""
    if not student:
        student = get_current_student()
    
    if not student:
        return {}
    
    # Get all fees records
    fees_records = frappe.get_all(
        "Fees",
        filters={"student": student},
        fields=[
            "name", "posting_date", "due_date", "program", "academic_year",
            "grand_total", "outstanding_amount", "docstatus"
        ],
        order_by="posting_date desc"
    )
    
    total_fees = sum([f.grand_total for f in fees_records if f.docstatus == 1])
    total_outstanding = sum([f.outstanding_amount for f in fees_records if f.docstatus == 1])
    total_paid = total_fees - total_outstanding
    
    # Get payment history
    payment_history = []
    for fee in fees_records:
        if fee.docstatus == 1:
            paid_amount = fee.grand_total - fee.outstanding_amount
            payment_history.append({
                "name": fee.name,
                "date": fee.posting_date,
                "due_date": fee.due_date,
                "program": fee.program,
                "academic_year": fee.academic_year,
                "total": fee.grand_total,
                "paid": paid_amount,
                "outstanding": fee.outstanding_amount,
                "status": "Paid" if fee.outstanding_amount == 0 else "Pending"
            })
    
    return {
        "total_fees": flt(total_fees, 2),
        "total_paid": flt(total_paid, 2),
        "total_outstanding": flt(total_outstanding, 2),
        "payment_history": payment_history
    }


@frappe.whitelist()
def get_course_progress(student=None):
    """Get enrolled courses and progress"""
    if not student:
        student = get_current_student()
    
    if not student:
        return []
    
    # Get program enrollments
    enrollments = frappe.get_all(
        "Program Enrollment",
        filters={"student": student, "docstatus": 1},
        fields=["name", "program", "academic_year"]
    )
    
    courses = []
    for enrollment in enrollments:
        # Get courses from Program Enrollment Course child table
        enrolled_courses = frappe.get_all(
            "Program Enrollment Course",
            filters={"parent": enrollment.name},
            fields=["course", "course_name"]
        )
        
        for ec in enrolled_courses:
            # Get attendance for this course
            # Note: Education module doesn't link attendance to specific course enrollments directly in some versions
            # but we can try to filter by student and some course identifier if it exists in Student Attendance
            
            course_attendance = frappe.get_all(
                "Student Attendance",
                filters={
                    "student": student,
                    "docstatus": 1
                },
                fields=["status"]
            )
            
            # This is a general attendance summary as Student Attendance often doesn't link to Course
            # unless through Course Schedule which might not be used here.
            # For now, we'll keep the logic but refine if possible.
            total = len(course_attendance)
            present = len([a for a in course_attendance if a.status == "Present"])
            attendance_pct = (present / total * 100) if total > 0 else 0
            
            # Try to find the specific batch for this course
            batch_for_course = frappe.db.sql("""
                SELECT parent 
                FROM `tabStudent Batch Student` sbs
                JOIN `tabStudent Batch` sb ON sb.name = sbs.parent
                WHERE sbs.student = %s AND sb.course = %s AND sbs.active = 1
                LIMIT 1
            """, (student, ec.course))
            
            batch_name = batch_for_course[0][0] if batch_for_course else ""
            
            courses.append({
                "course": ec.course,
                "course_name": ec.course_name or ec.course,
                "batch": batch_name,
                "program": enrollment.program,
                "academic_year": enrollment.academic_year,
                "attendance_percentage": round(attendance_pct, 1),
                "total_classes": total
            })
    
    return courses


@frappe.whitelist()
def get_upcoming_events(student=None):
    """Get upcoming events, deadlines, and important dates"""
    if not student:
        student = get_current_student()
    
    events = []
    
    # Get fee due dates
    upcoming_fees = frappe.get_all(
        "Fees",
        filters={
            "student": student,
            "docstatus": 1,
            "outstanding_amount": [">", 0],
            "due_date": [">=", today()]
        },
        fields=["name", "due_date", "outstanding_amount", "program"],
        order_by="due_date asc",
        limit=5
    )
    
    for fee in upcoming_fees:
        events.append({
            "type": "fee",
            "title": f"Fee Payment Due - {fee.program}",
            "date": fee.due_date,
            "description": f"Outstanding: ₹{fee.outstanding_amount}",
            "link": f"/app/fees/{fee.name}"
        })
    
    # Sort by date
    events.sort(key=lambda x: getdate(x["date"]))
    
    return events[:10]  # Return top 10 upcoming events


@frappe.whitelist()
def get_recent_announcements():
    """Get recent announcements (can be customized based on your needs)"""
    # This is a placeholder - you can customize based on your announcement system
    # For now, returning empty list
    return []


# Helper functions

def get_current_student():
    """Get student record for current logged-in user"""
    user = frappe.session.user
    
    # Check if user has a student record
    students = frappe.get_all(
        "Student",
        filters={"student_email_id": user},
        fields=["name"],
        limit=1
    )
    
    if students:
        return students[0].name
    
    return None


def get_attendance_color(status):
    """Get color code for attendance status"""
    colors = {
        "Present": "#10B981",  # Green
        "Absent": "#EF4444",   # Red
        "Leave": "#3182ce"     # Blue
    }
    return colors.get(status, "#6B7280")


def get_monthly_attendance_stats(student):
    """Get attendance statistics for last 6 months"""
    stats = []
    
    for i in range(5, -1, -1):
        month_start = add_days(get_first_day(today()), -30 * i)
        month_end = get_last_day(month_start)
        
        records = frappe.get_all(
            "Student Attendance",
            filters={
                "student": student,
                "docstatus": 1,
                "date": ["between", [month_start, month_end]]
            },
            fields=["status"]
        )
        
        total = len(records)
        present = len([r for r in records if r.status == "Present"])
        percentage = (present / total * 100) if total > 0 else 0
        
        stats.append({
            "month": month_start.strftime("%b %Y"),
            "percentage": round(percentage, 1),
            "total": total,
            "present": present
        })
    
    return stats