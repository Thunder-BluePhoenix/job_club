frappe.ui.form.on('Lead', {
    refresh(frm) {
        frm.add_custom_button('Create Student', () => {
            if (!frm.doc.first_name || !frm.doc.email_id) {
                frappe.msgprint(__('First Name and Email ID are required to create a Student.'));
                return;
            }

            // Create new Student with prefilled data
            frappe.new_doc('Student', {
                first_name: frm.doc.first_name,
                last_name: frm.doc.last_name,
                student_email_id: frm.doc.email_id,
                student_mobile_number: frm.doc.mobile_no
            });
        }, 'Create');
    }
});