# Copyright (c) 2025, BluePhoenix and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class RegistrationFrom(Document):
	def on_update(self):
		lead = frappe.new_doc("Lead")
		lead.first_name = self.full_name
		lead.email_id = self.email_id
		lead.mobile_no = self.mobile_number

		lead.save()
		frappe.db.commit()
