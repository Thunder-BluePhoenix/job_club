import frappe
import time
from frappe.model.document import Document
from frappe.utils.background_jobs import enqueue
import json
from datetime import datetime
import random
import string
import frappe
from frappe.exceptions import DoesNotExistError
from frappe import _



#api/method/job_club.job_club.doctype.otp_verification.otp_api.verify_otp_and_delete
@frappe.whitelist(allow_guest = True)
def verify_otp_and_delete(data):
    input_otp= data.get("otp")
    user = data.get("email")
    doc = frappe.get_doc("OTP Verification", {"otp":input_otp}) or None

    if doc != None or doc.expired != 1 or doc.is_not_verified != 1:
        if doc.email == user :
            doc.is_verified = 1
            doc.save()
            frappe.delete_doc("OTP Verification", doc.name, force=1)
            frappe.db.commit()
            return {"status": "success", "message": "OTP verified"}

        else:
            doc.is_not_verified = 1
            doc.save()
            frappe.delete_doc("OTP Verification", doc.name, force=1)
            frappe.db.commit()
            return {"status": "Failed", "message": "Wrong OTP"}
        
    else:
        return {"status": "Failed", "message": "Invalid OTP"}











#api/method/job_club.job_club.doctype.otp_verification.otp_api.send_otp
@frappe.whitelist(allow_guest=True)
def send_otp(data):
    reciever_email = data.get('email')

    try:
        # user = frappe.get_doc("User", reciever_email) or None
        # api_credentials = generate_api_keys(user)

        # api_key = api_credentials.get("api_key")
        # api_secret = api_credentials.get("api_secret")
        # auth = f"token {api_key}:{api_secret}"
        # if user == None:
        #     return {
        #         "status": "error",
        #         "message": "No User found for the Mail ID"
        #     }
        
        otp = ''.join(random.choices(string.digits, k=6))

        otp_var = frappe.get_doc({
                                    "doctype":"OTP Verification",
                                    "email":reciever_email,
                                    "otp": otp
                                })
        
        otp_var.insert(ignore_permissions=True)
        
        
        # vendor_name = frappe.db.get_value(
        #     "User",
        #     filters={'email': reciever_email},
        #     fieldname='full_name'
        # )

        subject = "One Time Password for Password Reset"
        message = f"""
        Dear,

        Your One-Time Password for the Vendor Management System (VMS) Portal is {otp}.

        Regards,
        VMS Team
        """

        frappe.sendmail(
            recipients=[reciever_email],
            subject=subject,
            message=message,
        )

        # print(message)
        frappe.db.commit()


        return {
            "status": "success",
            "message": f"OTP sent to {reciever_email}"
            # "Authorization": f"token {api_key}:{api_secret}"
        }

    except DoesNotExistError:
        user_message = f"User {reciever_email} does not exist."
        frappe.log_error(user_message, _("User not found"))
        return {
            "status": "fail",
            "message": user_message
        }

