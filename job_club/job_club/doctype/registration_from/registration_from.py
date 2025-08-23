# Copyright (c) 2025, BluePhoenix and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.utils import now_datetime

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
            interview.location = self.location
            interview.gender = self.gender
            interview.age = self.age
            interview.height = self.height
            interview.qualification = self.qualification

            # Save Invitation Acceptance Date (auto-set)
            interview.invitation_acceptance_date = now_datetime()

            interview.save()


@frappe.whitelist(allow_guest=True)
def pre_validate_registration(data):
    import json, re
    if isinstance(data, str):
        data = json.loads(data)
    data = frappe._dict(data)

    errors = []  # collect all errors here

    # --- Mandatory Fields ---
    required_fields = {
        "full_name": "Full Name",
        "email_id": "Email",
        "mobile_number": "Mobile Number",
        "location": "Location",
        "gender": "Gender",
        "age": "Age",
        "height": "Height",
        "qualification": "Qualification"
    }
    for field, label in required_fields.items():
        if not data.get(field):
            errors.append({"field": field, "message": f"{label} is mandatory."})

    # --- Email format ---
    if data.get("email_id") and not re.fullmatch(r"[^@]+@[^@]+\.[^@]+", str(data.email_id)):
        errors.append({"field": "email_id", "message": "Enter a valid email address."})

    # --- Mobile number format (+91XXXXXXXXXX or 10 digits) ---
    if data.get("mobile_number") and not re.fullmatch(r"^(\+91\d{10}|\d{10})$", str(data.mobile_number)):
        errors.append({"field": "mobile_number", "message": "Enter a valid 10-digit mobile number or +91 followed by 10 digits."})

    # --- Age ---
    if data.get("age"):
        try:
            age_val = int(data.age)
            if not (18 <= age_val <= 27):
                errors.append({"field": "age", "message": "Age must be between 18 and 27 years."})
        except Exception:
            errors.append({"field": "age", "message": "Age must be a number between 18 and 27."})

    # --- Height ---
    if data.get("height"):
        try:
            height_val = int(data.height)
            if height_val < 155:
                errors.append({"field": "height", "message": "Minimum height is 155 cm."})
        except Exception:
            errors.append({"field": "height", "message": "Height must be a number in cm (e.g., 170)."})

    # If errors exist, return them
    if errors:
        return {"status": "error", "errors": errors}

    return {"status": "success", "message": "Validation passed."}

@frappe.whitelist(allow_guest=True)
def check_duplicate(fieldname, value):
    """Check if email or mobile already exists"""
    if not fieldname or not value:
        return {"status": "error", "message": "Invalid request"}

    if fieldname not in ["email_id", "mobile_number"]:
        return {"status": "error", "message": "Invalid field"}

    if frappe.db.exists("Registration From", {fieldname: value}):
        return {"status": "error", "message": f"This {fieldname.replace('_', ' ')} is already registered."}

    return {"status": "success", "message": "Available"}

