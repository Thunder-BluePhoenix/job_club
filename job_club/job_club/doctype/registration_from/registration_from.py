# Copyright (c) 2025, BluePhoenix and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.utils import now_datetime

class RegistrationFrom(Document):

    def on_update(self):

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
            interview.job_experience = self.job_experience
            interview.weight = self.weight
            interview.recruitment_drive = self.recruitment_drive
            interview.token_number = self.token_number


            # Save Invitation Acceptance Date (auto-set)
            interview.invitation_acceptance_date = now_datetime()

            interview.save()

    def before_insert(self):
        """Generate branch-wise, drive-wise token before saving"""
        if not self.location or not self.recruitment_drive:
            frappe.throw("Location (Branch) and Recruitment Drive are required to generate token")

        # Branch code → take first 3 letters (or make a mapping if needed)
        branch_code = self.location[:3].upper()

        # Find last token for this location + drive
        last_token = frappe.db.sql("""
            SELECT token_number
            FROM `tabRegistration From`
            WHERE location=%s AND recruitment_drive=%s
            ORDER BY creation DESC LIMIT 1
        """, (self.location, self.recruitment_drive))

        if last_token and last_token[0][0]:
            try:
                last_num = int(last_token[0][0].split("-")[1])
            except:
                last_num = 0
            next_num = last_num + 1
        else:
            next_num = 1

        # Format token → e.g. KOL-0001
        self.token_number = f"{branch_code}-{next_num:04d}"

    
    def after_insert(self):
        """Send confirmation email with token + QR + branch details (inline + attachment)"""
        reciever_email = self.email_id
        full_name = self.full_name or "Candidate"

        if not reciever_email:
            frappe.log_error("No email found for Registration From", f"Doc: {self.name}")
            return

        # 🔹 Fetch branch details
        try:
            branch = frappe.get_doc("Branch", self.location)
            branch_details = f"<b>{branch.branch}</b><br/>{branch.address or ''}"
            if branch.contact_number:
                branch_details += f"<br/>Call: {branch.contact_number}"
            if branch.email:
                branch_details += f"<br/>Email: <a href='mailto:{branch.email}'>{branch.email}</a>"
            if getattr(branch, "instagram", None):
                branch_details += f"<br/>Instagram: <a href='{branch.instagram}' target='_blank'>{branch.instagram}</a>"
        except Exception as e:
            branch_details = f"<b>{self.location}</b> (details not found)"
            frappe.log_error(f"Branch fetch failed: {e}", "Registration From Email Error")

        # 🔹 Generate QR for token
        import qrcode, io, base64
        qr = qrcode.make(self.token_number)
        buf = io.BytesIO()
        qr.save(buf, format="PNG")
        qr_bytes = buf.getvalue()

        # 🔹 Build email
        subject = f"Your Registration Token - {self.token_number}"

        message = f"""
        <html>
        <body style="font-family: Arial, sans-serif; background-color: #f8f9fa; padding: 20px;">
            <div style="max-width: 500px; margin: auto; background: white; padding: 20px; border-radius: 8px; border: 1px solid #ddd;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <img src="https://www.emporiumsolutions.com/wp-content/uploads/2025/07/logo-erp.png" 
                        alt="Emporium Logo" style="max-width: 180px;" />
                </div>

                <p style="font-size: 16px;">Dear <strong>{full_name}</strong>,</p>

                <p style="font-size: 15px; color: #333;">
                    Thank you for registering with <strong>Emporium</strong>.  
                    Your Token Number for the Recruitment Drive at <b>{self.location}</b> is:
                </p>

                <div style="text-align: center; margin: 20px 0;">
                    <span style="display: inline-block; font-size: 24px; font-weight: bold; background: linear-gradient(to right, #151f6d, #3041e4); color: white; padding: 10px 20px; border-radius: 6px;">
                        {self.token_number}
                    </span>
                </div>

                <div style="margin-top: 20px; font-size: 14px; color: #555;">
                    <p><b>Location Details:</b></p>
                    {branch_details}
                </div>

                <p style="margin-top: 20px; font-size: 14px; color: #777;">
                    Regards,<br/>
                    <strong>Emporium Team</strong>
                </p>
            </div>
        </body>
        </html>
        """

        try:
            frappe.sendmail(
                recipients=[reciever_email],
                subject=subject,
                message=message,
                now=True,
                attachments=[{
                    "fname": f"{self.token_number}.png",
                    "fcontent": qr_bytes
                }]
            )
        except Exception as e:
            frappe.log_error(f"Failed to send Token email: {e}", "Registration From Email Error")



@frappe.whitelist(allow_guest=True)
def get_registration_token(docname):
    """Fetch token for a submitted registration (for webform redirect)"""
    token = frappe.db.get_value("Registration From", docname, "token_number")
    return {"token_number": token}

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
def check_duplicate(fieldname, value, drive):
    """Check if email already exists for the same drive"""
    if not fieldname or not value or not drive:
        return {"status": "error", "message": "Invalid request"}

    if fieldname not in ["email_id"]:
        return {"status": "error", "message": "Invalid field"}

    # Check if email exists for the same drive
    if frappe.db.exists("Registration From", {fieldname: value, "recruitment_drive": drive}):
        return {"status": "error", "message": f"This {fieldname.replace('_', ' ')} is already registered for this drive."}

    return {"status": "success", "message": "Available"}


@frappe.whitelist(allow_guest=True)
def get_branches():
    return frappe.get_all("Branch", fields=["name", "branch"], limit_page_length=100)

@frappe.whitelist(allow_guest=True)
def get_open_drives(branch):
    """Return list of open drives for a branch"""
    if not branch:
        return []

    drives = frappe.get_all(
        "Recruitment Drive",
        filters={"status": "Open", "branch": branch},
        fields=["name", "drive_name"]
    )
    return drives