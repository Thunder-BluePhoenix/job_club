# Copyright (c) 2026, BluePhoenix and contributors
# For license information, please see license.txt

import frappe
import calendar
from frappe.model.document import Document
from datetime import date

class EmployeeAttendanceTool(Document):
    pass


@frappe.whitelist()
def get_employee_attendance_records(month=None, year=None, department=None, branch=None):
    """
    Fetch employees and their attendance records for the selected month/year/department/branch.
    Returns a structured response similar to the student attendance tool.
    """
    employee_list = []

    if month and year and (department or branch):
        # Monthly mode
        month_num = list(calendar.month_name).index(month)
        year = int(year)
        num_days = calendar.monthrange(year, month_num)[1]
        first_day = date(year, month_num, 1)
        last_day = date(year, month_num, num_days)

        # Fetch holidays from Company's Holiday List
        holidays = []
        try:
            # Get company from department or use default
            company = None
            if department:
                company = frappe.db.get_value("Department", department, "company")
            
            if not company:
                company = frappe.defaults.get_user_default("Company") or frappe.db.get_single_value('Global Defaults', 'default_company')
            
            # Get holiday list from company
            if company:
                holiday_list = frappe.db.get_value("Company", company, "default_holiday_list")
                
                if holiday_list:
                    holidays = frappe.get_all(
                        "Holiday",
                        filters={
                            "parent": holiday_list, 
                            "holiday_date": ["between", (first_day, last_day)]
                        },
                        fields=["holiday_date"]
                    )
        except Exception as e:
            frappe.log_error(f"Error fetching holidays: {str(e)}", "Holiday Fetch Error")
        
        holiday_days = [h.holiday_date.day for h in holidays]

        # Build filters for employees
        filters = {
            "status": "Active"
        }
        
        if department:
            filters["department"] = department
        
        if branch:
            filters["branch"] = branch

        # Fetch employees in department/branch
        employee_list = frappe.get_all(
            "Employee",
            fields=["name as employee", "employee_name", "department"],
            filters=filters,
            order_by="employee_name"
        )

        # Fetch submitted attendance for employees in this month
        employee_names = [e['employee'] for e in employee_list]
        
        if employee_names:
            attendance_list = frappe.db.sql("""
                SELECT employee, date, status
                FROM `tabEmployee Attendance`
                WHERE employee IN ({})
                  AND DATE(date) BETWEEN %s AND %s
                  AND docstatus = 1
                ORDER BY modified DESC
            """.format(','.join(['%s'] * len(employee_names))), 
            tuple(employee_names) + (first_day, last_day), as_dict=True)
        else:
            attendance_list = []

        # Build attendance map: employee -> day -> {status, remarks}
        att_map = {}
        for a in attendance_list:
            day = a.date.day
            att_map.setdefault(a.employee, {})
            if day not in att_map[a.employee]:
                # Take latest modified (first in DESC)
                att_map[a.employee][day] = {"status": a.status, "remarks": ""}

        # Attach attendance data to employees
        for e in employee_list:
            e['attendance'] = att_map.get(e['employee'], {})

        return {
            "employees": employee_list,
            "num_days": num_days,
            "holidays": holiday_days,
            "month_num": month_num,
            "year": year
        }
    
    return {
        "employees": [],
        "num_days": 0,
        "holidays": [],
        "month_num": 0,
        "year": year
    }