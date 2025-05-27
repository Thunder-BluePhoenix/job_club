# Copyright (c) 2025, BluePhoenix and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document


class RegistrationQR(Document):
	pass






# import frappe
# import qrcode
# import base64
# from io import BytesIO
# from frappe.model.document import Document

# class RegistrationQR(Document):
#     def on_update(self):
#         if self.qr_link:
#             # Generate QR Code
#             qr = qrcode.make(self.qr_link)
#             buffered = BytesIO()
#             qr.save(buffered, format="PNG")
#             img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
            
#             # Set HTML to embed the image
#             self.qr_code = f'<img src="data:image/png;base64,{img_str}" />'


# import frappe
# from frappe.model.document import Document
# import urllib.parse

# class RegistrationQR(Document):
#     def on_update(self):
#         if self.qr_link:
#             # URL encode the link
#             encoded_link = urllib.parse.quote(self.qr_link)

#             # Generate the QR code image URL via Google Chart API
#             qr_url = f"https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl={encoded_link}&choe=UTF-8"

#             # Set the HTML field with the image
#             self.qr_code = f'<img src="{qr_url}" alt="QR Code" />'
