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
@frappe.whitelist(allow_guest=True)
def verify_otp_and_delete(data):
    if isinstance(data, str):
        try:
            data = json.loads(data)
        except Exception:
            frappe.throw("Invalid data format")
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
    if isinstance(data, str):
        try:
            data = json.loads(data)
        except Exception:
            frappe.throw("Invalid data format")

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

        full_name = data.get("full_name") or "User"

        subject = "Your One Time Password (OTP) for Registration"

        message = f"""
<html>
  <body style="font-family: Arial, sans-serif; background-color: #f8f9fa; padding: 20px;">
    <div style="max-width: 500px; margin: auto; background: white; padding: 20px; border-radius: 8px; border: 1px solid #ddd;">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="https://www.emporiumsolutions.com/wp-content/uploads/2025/07/logo-erp.png" alt="Emporium Logo" style="max-width: 180px;" />
      </div>

      <p style="font-size: 16px;">Dear <strong>{full_name}</strong>,</p>

      <p style="font-size: 15px; color: #333;">
        Thank you for registering with <strong>Emporium</strong>.  
        Your One-Time Password (OTP) for completing your registration is:
      </p>

      <div style="text-align: center; margin: 20px 0;">
        <span style="display: inline-block; font-size: 24px; font-weight: bold; background: #3041e4; color: white; padding: 10px 20px; border-radius: 6px;">
          {otp}
        </span>
      </div>

      <p style="font-size: 15px; color: #555;">
        Please enter this OTP in the registration page.  
        <br><strong>Note:</strong> This OTP will expire in <strong>10 minutes</strong> for your security.
      </p>

      <p style="margin-top: 20px; font-size: 14px; color: #777;">
        Regards,  
        <br><strong> Emporium Team </strong>
      </p>
    </div>
  </body>
</html>
"""


        frappe.sendmail(
            recipients=[reciever_email],
            subject=subject,
            message=message,
            now = True
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

