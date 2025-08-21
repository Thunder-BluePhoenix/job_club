# Copyright (c) 2025, BluePhoenix and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class RegistrationFrom(Document):

    def on_update(self):
        # Check if an Interview already exists for this email
        existing_interview = frappe.db.exists("Interview", {
            "email_id": self.email_id
        })

        # Only create a new Interview if one doesn't already exist
        if not existing_interview:
            interview = frappe.new_doc("Interview")
            
            # Basic details
            interview.full_name = self.full_name
            interview.applicant_name = self.full_name
            interview.email_id = self.email_id
            interview.mobile_number = self.mobile_number

            # ✅ New fields mapping
            interview.city = self.city
            interview.gender = self.gender
            interview.age = self.age
            interview.height = self.height
            interview.qualification = self.qualification

            interview.save()



            
