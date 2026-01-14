import frappe, re
from frappe.model.document import Document
from frappe import _


class Interview(Document):
    def validate(self):
        # 1. Email Format
        if self.email_id and not re.fullmatch(r"[^@]+@[^@]+\.[^@]+", str(self.email_id)):
            frappe.throw(_("Please enter a valid email address."), title=_("Invalid Email"))

        # 2. Email Uniqueness for same Recruitment Drive
        if self.email_id and self.recruitment_drive:
            filters = {
                "email_id": self.email_id,
                "recruitment_drive": self.recruitment_drive,
                "name": ["!=", self.name]
            }
            if frappe.db.exists("Interview", filters):
                frappe.throw(
                    _("This email ({0}) is already registered for the drive '{1}'.").format(self.email_id, self.recruitment_drive),
                    title=_("Duplicate Registration")
                )

        # 3. Mobile Number Format
        if self.mobile_number and not re.fullmatch(r"^(\+91\d{10}|\d{10})$", str(self.mobile_number)):
            frappe.throw(
                _("Enter a valid 10-digit mobile number or +91 followed by 10 digits."),
                title=_("Invalid Mobile Number")
            )

        # 4. Age Range (18-27)
        if self.age:
            try:
                age_val = int(self.age)
                if not (18 <= age_val <= 27):
                    frappe.throw(_("Age must be between 18 and 27 years."), title=_("Invalid Age"))
            except ValueError:
                frappe.throw(_("Age must be a valid number."), title=_("Invalid Age"))

        # 5. Height Requirement (min 155 cm)
        if self.height:
            try:
                height_val = int(self.height)
                if height_val < 155:
                    frappe.throw(_("Minimum height requirement is 155 cm."), title=_("Invalid Height"))
            except ValueError:
                frappe.throw(_("Height must be a valid number in cm."), title=_("Invalid Height"))

    def before_insert(self):
        # 1. Fetch interview_date from Recruitment Drive if missing
        if not self.interview_date and self.recruitment_drive:
            drive_date = frappe.db.get_value("Recruitment Drive", self.recruitment_drive, "drive_date")
            if drive_date:
                self.interview_date = drive_date

        # 2. Generate Token Number if manual entry
        if not self.token_number and self.location and self.recruitment_drive:
            # Branch code → first 3 letters
            branch_code = self.location[:3].upper()

            # Find last token for this location + drive
            last_token = frappe.db.sql("""
                SELECT token_number
                FROM `tabInterview`
                WHERE location=%s AND recruitment_drive=%s
                ORDER BY creation DESC LIMIT 1
            """, (self.location, self.recruitment_drive))

            if last_token and last_token[0][0]:
                try:
                    last_num = int(last_token[0][0].split('-')[1])
                except (IndexError, ValueError):
                    last_num = 0
                next_num = last_num + 1
            else:
                next_num = 1

            self.token_number = f"{branch_code}-{next_num:04d}"


@frappe.whitelist()
def create_student_from_interview(interview_name):
    """Create a Student record from an Interview record"""

    # Get the Interview document
    interview = frappe.get_doc('Interview', interview_name)

    # Check if student already created
    if interview.student_created or interview.student_id:
        frappe.throw(_('Student record already exists for this interview'))

    # Parse first, middle, last names
    name_parts = interview.full_name.strip().split()
    first_name = name_parts[0] if len(name_parts) > 0 else ''
    last_name = name_parts[-1] if len(name_parts) > 1 else ''
    middle_name = ' '.join(name_parts[1:-1]) if len(name_parts) > 2 else ''

    # Create new Student document
    student = frappe.new_doc('Student')

    # Basic Info
    student.first_name = first_name
    student.middle_name = middle_name
    student.last_name = last_name
    student.student_name = interview.full_name
    student.student_email_id = interview.email_id
    student.student_mobile_number = interview.mobile_number
    student.branch = interview.location
    student.gender = interview.gender
    student.height = interview.height
    student.weight = interview.weight

    # Handle dropdown fields (Qualification/Experience)
    if interview.qualification and interview.qualification != "Select":
        student.current_qualification = interview.qualification
    if interview.job_experience and interview.job_experience != "Select":
        student.professional_experience = interview.job_experience

    # Additional metadata
    student.joining_date = frappe.utils.today()
    student.enabled = 1

    try:
        student.insert(ignore_permissions=False)

        # Update interview doc
        interview.db_set('student_id', student.name)
        interview.db_set('student_created', 1)

        frappe.db.commit()
        return student.name

    except Exception as e:
        frappe.log_error(frappe.get_traceback(), 'Student Creation Error from Interview')
        frappe.throw(_('Error creating student: {0}').format(str(e)))
