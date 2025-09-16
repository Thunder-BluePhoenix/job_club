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
        interview.registration_from = self.name


        # Save Invitation Acceptance Date (auto-set)
        interview.invitation_acceptance_date = now_datetime()

        # 🔹 Fetch drive_date from Recruitment Drive → set as interview_date
        try:
            drive_date = frappe.db.get_value(
                "Recruitment Drive", self.recruitment_drive, "drive_date"
            )
            if drive_date:
                interview.interview_date = drive_date
                # 🔹 Also save interview_date in Registration From
                self.db_set("interview_date", drive_date)
        except Exception as e:
            frappe.log_error(
                f"Could not fetch drive_date for {self.recruitment_drive}: {e}",
                "Interview Creation Error",
            )

        interview.save()

    def before_insert(self):
        """Generate branch-wise, drive-wise token before saving"""
        if not self.location or not self.recruitment_drive:
            frappe.throw(
                "Location (Branch) and Recruitment Drive are required to generate token"
            )

        # Branch code → take first 3 letters (or make a mapping if needed)
        branch_code = self.location[:3].upper()

        # Find last token for this location + drive
        last_token = frappe.db.sql(
            """
            SELECT token_number
            FROM `tabInterview`
            WHERE location=%s AND recruitment_drive=%s
            ORDER BY creation DESC LIMIT 1
        """,
            (self.location, self.recruitment_drive),
        )

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
        """Send confirmation email with QR as attachment + referral link"""
        reciever_email = self.email_id
        full_name = self.full_name or "Candidate"

        if not reciever_email:
            frappe.log_error(
                "No email found for Registration From", f"Doc: {self.name}"
            )
            return

        # 🔹 Fetch interview details from Recruitment Drive
        try:
            drive = frappe.get_doc("Recruitment Drive", self.recruitment_drive)
            interview_date = drive.drive_date if drive.drive_date else "Not Scheduled"
            branch_details = drive.address or "Venue not available"
            branch_link = getattr(drive, "location_link", None)
        except Exception as e:
            interview_date = "Not Scheduled"
            branch_details = "Venue details not available"
            branch_link = None
            frappe.log_error(
                f"Drive fetch failed: {e}", "Registration From Email Error"
            )

        # 🔹 Generate QR (for attachment only)
        try:
            from frappe.utils import get_url
            import qrcode, io

            qr_url = f"{get_url()}/assets/job_club/candidate_verification.html?token={self.token_number}"
            qr = qrcode.make(qr_url)
            buf = io.BytesIO()
            qr.save(buf, format="PNG")
            qr_bytes = buf.getvalue()
        except Exception as e:
            frappe.log_error(f"QR generation failed: {e}", "Registration From QR Error")
            qr_bytes = None
            qr_url = None

        # 🔹 Build share URL (Always fetch from Recruitment Drive Doc) + ensure branch fallback
        from urllib.parse import urlencode, quote
        from frappe.utils import get_url

        base_url = f"{get_url()}/registration-from/new"
        params = {}

        if self.recruitment_drive:
            try:
                drive_doc = frappe.get_doc("Recruitment Drive", self.recruitment_drive)

                # drive name
                if getattr(drive_doc, "drive_name", None):
                    params["drive"] = drive_doc.drive_name

                # Try recruitment_drive.branch first, fallback to self.location
                branch_name = None
                if getattr(drive_doc, "branch", None):
                    branch_name = (
                        frappe.db.get_value("Branch", drive_doc.branch, "branch")
                        or drive_doc.branch
                    )

                if not branch_name and getattr(self, "location", None):
                    branch_name = self.location

                if branch_name:
                    params["branch"] = branch_name
                else:
                    # helpful debug if it ever fails
                    frappe.log_error(
                        f"Share URL: no branch resolved. drive_doc.branch={getattr(drive_doc,'branch',None)}, self.location={self.location}",
                        "Share URL Debug",
                    )

            except Exception as e:
                frappe.log_error(
                    f"Recruitment Drive fetch failed for {self.name}: {e}",
                    "Share URL Build",
                )

        share_url = f"{base_url}?{urlencode(params)}" if params else base_url

        # 🔹 Build encoded WhatsApp text so & in share_url doesn't break the outer querystring
        whatsapp_text = (
            "📢 Hi! Emporium Recruitment Drive at\n"
            f"📍 Location: {branch_details}\n"
            "🔗 Hurry Secure Your Seat Online\n"
            f"{share_url}"
        )
        # quote() encodes &, ?, spaces, parentheses, etc.
        whatsapp_link = "https://api.whatsapp.com/send?text=" + quote(
            whatsapp_text, safe=""
        )

        # optional debug log
        frappe.log_error(
            f"Share URL built: {share_url}\nWhatsApp link: {whatsapp_link}",
            "Share URL Debug",
        )

        # 🔹 Build email
        subject = f"🎉 Registration Successful - {drive_doc.drive_name}"

        message = f"""
        <html>
        <body style="font-family: Arial, sans-serif; background-color: #f8f9fa; padding: 20px;">
            <div style="max-width: 600px; margin: auto; background: white; padding: 25px; border-radius: 12px; border: 1px solid #ddd; text-align: center; box-shadow: 0 6px 20px rgba(0,0,0,0.1);">
                
                <!-- Logo -->
                <div style="margin-bottom: 20px;">
                    <img src="https://www.emporiumsolutions.com/wp-content/uploads/2025/07/logo-erp.png" 
                        alt="Emporium Logo" style="max-width: 200px;" />
                </div>
                
                <!-- Greeting -->
                <p style="font-size:16px; color:#333;">Dear <strong>{full_name}</strong>,</p>
                
                <p style="font-size:14px; color:#555; margin: 8px 0;">
                    Thank you for registering with <strong>Emporium</strong>.
                </p>
                <p style="font-size:14px; color:#555; margin: 8px 0;">
                    Your email <strong>{reciever_email}</strong> has been verified successfully.
                </p>
                
                <!-- Token -->
                <div style="text-align: center; margin: 25px 0;">                    
                    <span style="display: inline-block; font-size: 22px; font-weight: bold; background: linear-gradient(to right, #151f6d, #3041e4); color: white; padding: 14px 28px; border-radius: 10px; box-shadow: 0 4px 15px rgba(21, 31, 109, 0.3);">
                        Token: {self.token_number}
                    </span>
                </div>

                <!-- Verification Button -->
                <div style="margin: 20px 0;">
                    <a href="{qr_url}" 
                    style="display:inline-block; padding: 12px 22px; background: linear-gradient(to right, #43cea2, #185a9d); color:white; font-size:15px; border-radius:8px; text-decoration:none; font-weight:600; box-shadow:0 4px 12px rgba(0,0,0,0.2);">
                    🔍 Verify Candidate Details
                    </a>
                </div>

                <!-- Interview Details -->
                <p style="font-size:15px; margin:15px 0;"><b>Interview Date:</b> {interview_date}</p>
                <p style="font-size:15px; margin:15px 0;"><b>Interview Venue:</b> {branch_details}</p>

                <!-- QR Info -->
                <div style="margin:20px 0;">
                    <p style="font-size:14px; color:#555;">Scan QR (attached) for paperless entry</p>
                    <p style="font-size:12px; color:green; font-weight:bold;">🌲 SAVE PAPER - SAVE TREE</p>
                </div>

                <!-- Google Maps Button -->
                {"<div style='margin:20px 0;'><a href='" + branch_link + "' style='display:inline-block; padding:12px 22px; background: linear-gradient(to right, #8e2de2, #ff6a00); color:white; font-size:15px; border-radius:8px; text-decoration:none; font-weight:600; box-shadow:0 4px 12px rgba(0,0,0,0.2);'>📍 Navigate with Google Maps</a></div>" if branch_link else ""}
                    
                <!-- WhatsApp -->
                <a href="{whatsapp_link}" 
                style="display:inline-block; padding: 10px 15px; background: #267b46; color:white; font-size:14px; border-radius:8px; text-decoration:none; font-weight:600;"
                target="_blank" rel="noopener">
                <img src="https://img.icons8.com/color/24/000000/whatsapp--v1.png" 
                    alt="WhatsApp" style="vertical-align: middle; margin-right: 6px;" />
                Refer on WhatsApp
                </a>

                <!-- Footer -->
                <p style="margin-top:30px; font-size:14px; color:#777;">
                    Best of luck for your interview!<br/>
                    <strong>Emporium Team</strong>
                </p>

                <!-- Disclaimer -->
                <div style="margin-top:30px; padding:15px; font-size:12px; line-height:1.6; color:#666; background:#f1f1f1; border-radius:6px; text-align:justify;">
                    <b>Disclaimer</b><br/><br/>
                    This email and any attachments are intended only for the individual or entity to whom it is addressed and may contain confidential and/or privileged information of <strong>Emporium Training & Consultancy Pvt. Ltd.</strong> If you are not the intended recipient, please inform us immediately and delete this email from your system.<br/><br/>
                    The information provided in this email is for the purpose of admission or recruitment and does not constitute an offer or guarantee of admission, employment, or any contractual relationship. All applications are subject to eligibility criteria, verification of documents, and the company’s policies.<br/><br/>
                    Emporium Training & Consultancy Pvt. Ltd. is committed to protecting your personal data. By submitting your application or responding to this email, you consent to the collection and processing of your information as per applicable data protection laws and our privacy policy.<br/><br/>
                    Please be cautious of fraudulent communications impersonating our organization. We recommend sharing sensitive or personal information only through official channels.
                </div>

            </div>
        </body>
        </html>
        """

        # 🔹 Send Email
        try:
            email_args = {
                "recipients": [reciever_email],
                "subject": subject,
                "message": message,
                "now": True,
                "with_container": False,
            }

            if qr_bytes:
                email_args["attachments"] = [
                    {"fname": f"{self.token_number}.png", "fcontent": qr_bytes}
                ]

            frappe.sendmail(**email_args)

        except Exception as e:
            frappe.log_error(
                f"Failed to send Token email: {e}", "Registration From Email Error"
            )


@frappe.whitelist(allow_guest=True)
def get_registration_token(docname):
    """Fetch token for a submitted registration (for webform redirect)"""
    token = frappe.db.get_value(
        "Interview",
        {"registration_from": docname},  # link field in Interview
        "token_number",
    )
    return {"token_number": token}


@frappe.whitelist(allow_guest=True)
def get_candidate_info(token):
    """Fetch candidate info by token number"""
    doc = frappe.get_doc("Interview", {"token_number": token})
    if not doc:
        return {"error": "Candidate not found"}

    return {
        "candidate_name": doc.full_name,
        "candidate_email": doc.email_id,
        "candidate_phone": doc.mobile_number,
        "token_number": doc.token_number,
    }


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
        "qualification": "Qualification",
        "recruitment_drive": "Recruitment Drive",
    }
    for field, label in required_fields.items():
        if not data.get(field):
            errors.append({"field": field, "message": f"{label} is mandatory."})

    # --- Email format ---
    if data.get("email_id") and not re.fullmatch(
        r"[^@]+@[^@]+\.[^@]+", str(data.email_id)
    ):
        errors.append({"field": "email_id", "message": "Enter a valid email address."})

    # --- Mobile number format (+91XXXXXXXXXX or 10 digits) ---
    if data.get("mobile_number") and not re.fullmatch(
        r"^(\+91\d{10}|\d{10})$", str(data.mobile_number)
    ):
        errors.append(
            {
                "field": "mobile_number",
                "message": "Enter a valid 10-digit mobile number or +91 followed by 10 digits.",
            }
        )

    # --- Age ---
    if data.get("age"):
        try:
            age_val = int(data.age)
            if not (18 <= age_val <= 27):
                errors.append(
                    {"field": "age", "message": "Age must be between 18 and 27 years."}
                )
        except Exception:
            errors.append(
                {"field": "age", "message": "Age must be a number between 18 and 27."}
            )

    # --- Height ---
    if data.get("height"):
        try:
            height_val = int(data.height)
            if height_val < 155:
                errors.append(
                    {"field": "height", "message": "Minimum height is 155 cm."}
                )
        except Exception:
            errors.append(
                {
                    "field": "height",
                    "message": "Height must be a number in cm (e.g., 170).",
                }
            )

    # --- Check Recruitment Drive Availability ---
    if data.get("location") and data.get("recruitment_drive"):
        drive = frappe.db.get_value(
            "Recruitment Drive",
            {"name": data.recruitment_drive, "branch": data.location, "status": "Open"},
            ["name"],
        )
        if not drive:
            errors.append(
                {
                    "field": "recruitment_drive",
                    "message": f"No open recruitment drive available for branch {data.location}.",
                }
            )

    # --- Duplicate Email for same drive ---
    if data.get("email_id") and data.get("recruitment_drive"):
        exists = frappe.db.exists(
            "Interview",
            {"email_id": data.email_id, "recruitment_drive": data.recruitment_drive},
        )
        if exists:
            errors.append({
                "field": "email_id",
                "message": "This email is already registered for this recruitment drive."
            })

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
    if frappe.db.exists("Interview", {fieldname: value, "recruitment_drive": drive}):
        return {
            "status": "error",
            "message": f"This {fieldname.replace('_', ' ')} is already registered for this drive.",
        }

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
        fields=["name", "drive_name"],
    )
    return drives


@frappe.whitelist(allow_guest=True)
def get_drive_poster(drive):
    """Return poster image for a recruitment drive"""
    if not drive:
        return None
    poster = frappe.db.get_value("Recruitment Drive", drive, "poster")
    return {"poster": poster} if poster else None


@frappe.whitelist(allow_guest=True)
def get_drive_and_branch_details(drive_name):
    """Return address from Recruitment Drive and contact/socials from Branch"""
    try:
        drive = frappe.get_doc("Recruitment Drive", drive_name)
        branch = frappe.get_doc("Branch", drive.branch) if drive.branch else None

        return {
            "address": drive.address or "Venue address not available",
            "drive_date": drive.drive_date,
            "contact_number": branch.contact_number if branch else None,
            "email": branch.email if branch else None,
            "instagram": branch.instagram if branch else None,
        }
    except Exception as e:
        frappe.log_error(f"Error fetching details: {e}", "Drive+Branch Fetch API")
        return None
