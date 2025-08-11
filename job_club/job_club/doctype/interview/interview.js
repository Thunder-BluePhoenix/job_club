frappe.ui.form.on('Interview', {
    refresh(frm) {
        frm.add_custom_button('Create Lead', () => {
            if (!frm.doc.full_name || !frm.doc.email_id) {
                frappe.msgprint(__('Full Name and Email ID are required to create a Lead.'));
                return;
            }

            // Trim spaces and split the full name into words
            const fullName = frm.doc.full_name.trim();
            const nameParts = fullName.split(' ');

            // Extract first and last name
            const firstName = nameParts[0];
            const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

            // Create new Lead with prefilled data
            frappe.new_doc('Lead', {
                first_name: firstName,
                last_name: lastName,
                email_id: frm.doc.email_id,
                mobile_no: frm.doc.mobile_number,
                lead_name: frm.doc.full_name,
            });
        }, 'Create');
    }
});