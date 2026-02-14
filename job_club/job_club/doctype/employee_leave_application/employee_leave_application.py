import frappe
from frappe.model.document import Document
from frappe.utils import date_diff, getdate, add_days

class EmployeeLeaveApplication(Document):
    def validate(self):
        if self.from_date and self.to_date:
            if getdate(self.to_date) < getdate(self.from_date):
                frappe.throw("To Date cannot be before From Date")
            
            self.total_leave_days = date_diff(self.to_date, self.from_date) + 1

    def on_submit(self):
        # Create Attendance records for each day
        current_date = getdate(self.from_date)
        end_date = getdate(self.to_date)
        
        while current_date <= end_date:
            self.create_attendance_for_date(current_date)
            current_date = add_days(current_date, 1)

    def on_cancel(self):
        # Cancel linked Attendance records
        current_date = getdate(self.from_date)
        end_date = getdate(self.to_date)
        
        while current_date <= end_date:
            self.cancel_attendance_for_date(current_date)
            current_date = add_days(current_date, 1)

    def create_attendance_for_date(self, date):
        # Check if attendance exists
        existing_attendance = frappe.db.exists("Employee Attendance", {
            "employee": self.employee,
            "date": date
        })
        
        if existing_attendance:
            # If exists, we might want to update it status if it matches our type?
            # For now, let's warn if there is a conflict, or just log it.
            # If it's "Absent", we can override it. If "Present", depends on policy.
            # Let's try to update logic:
            doc = frappe.get_doc("Employee Attendance", existing_attendance)
            if doc.status == "Absent" or doc.status == "Outside Zone":
                doc.status = self.application_type # Leave or Work From Home
                doc.leave_application = self.name # Link this application
                doc.save(ignore_permissions=True)
                doc.submit()
            else:
                 frappe.msgprint(f"Attendance for {date} already marked as {doc.status}. Skipping auto-creation.")
        else:
            # Create new attendance
            att = frappe.get_doc({
                "doctype": "Employee Attendance",
                "employee": self.employee,
                "date": date,
                "time": "09:00:00",
                "status": self.application_type, # Leave or Work From Home
                "leave_application": self.name,
                "branch": frappe.db.get_value("Employee", self.employee, "branch")
            })
            att.insert(ignore_permissions=True)
            att.submit()

    def cancel_attendance_for_date(self, date):
        # Find attendance linked to this application
        attendance_name = frappe.db.get_value("Employee Attendance", {
            "employee": self.employee,
            "date": date,
            "leave_application": self.name
        })
        
        if attendance_name:
            doc = frappe.get_doc("Employee Attendance", attendance_name)
            if doc.docstatus == 1:
                doc.cancel()
