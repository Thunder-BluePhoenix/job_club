// Copyright (c) 2025, BluePhoenix and contributors
// For license information, please see license.txt

// frappe.ui.form.on("Registration From", {
// 	refresh(frm) {

// 	},
// });

frappe.ui.form.on('Interview', {
    email_id: function(frm) {
        if (frm.doc.email_id && !validate_email(frm.doc.email_id)) {
            frappe.msgprint(__('Invalid Email Address Format'));
            frm.set_value('email_id', '');
        }
    }
});

function validate_email(email) {
    // Basic email pattern (you can make it stricter if needed)
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(email);
}

