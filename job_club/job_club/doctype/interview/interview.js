frappe.ui.form.on('Interview', {
    refresh(frm) {
        // Add custom styles for buttons
        add_custom_button_styles_interview();

        // Add 'Create Student' button if not yet created
        if (!frm.doc.__islocal && !frm.doc.student_created) {
            frm.add_custom_button(__('Create Student'), function () {
                create_student_from_interview(frm);
            }).addClass('btn-create-student');

            // Icon support
            setTimeout(() => {
                $('.btn-create-student').html('<i class="fa fa-user-plus"></i> Create Student');
            }, 100);
        }

        // Show 'View Student' if exists
        if (frm.doc.student_id) {
            frm.add_custom_button(__('View Student'), function () {
                frappe.set_route('Form', 'Student', frm.doc.student_id);
            }).addClass('btn-view-student');

            setTimeout(() => {
                $('.btn-view-student').html('<i class="fa fa-eye"></i> View Student');
            }, 100);
        }

        // Attach Blur Listeners for Validations (Only triggers when leaving the field)

        frm.fields_dict.email_id.$input.on('blur', () => {
            let val = frm.fields_dict.email_id.get_value();
            if (val && !/^[^@]+@[^@]+\.[^@]+$/.test(val)) {
                frappe.show_alert({ message: __('Please enter a valid email address.'), indicator: 'orange' });
            } else if (val && frm.doc.recruitment_drive) {
                frappe.call({
                    method: 'job_club.job_club.doctype.registration_from.registration_from.check_duplicate',
                    args: { fieldname: "email_id", value: val, drive: frm.doc.recruitment_drive },
                    callback: (r) => {
                        if (r.message && r.message.status === "error") {
                            frappe.msgprint({ title: __('Duplicate Found'), message: r.message.message, indicator: 'orange' });
                        }
                    }
                });
            }
        });

        frm.fields_dict.mobile_number.$input.on('blur', () => {
            let val = frm.fields_dict.mobile_number.get_value();
            if (val && !/^(\+91\d{10}|\d{10})$/.test(val)) {
                frappe.show_alert({ message: __('Enter a valid mobile number (10 digits or +91...).'), indicator: 'orange' });
            }
        });

        frm.fields_dict.age.$input.on('blur', () => {
            let val = parseInt(frm.fields_dict.age.get_value());
            if (val && (isNaN(val) || val < 18 || val > 27)) {
                frappe.show_alert({ message: __('Age must be between 18 and 27 years.'), indicator: 'orange' });
            }
        });

        frm.fields_dict.height.$input.on('blur', () => {
            let val = parseInt(frm.fields_dict.height.get_value());
            if (val && (isNaN(val) || val < 155)) {
                frappe.show_alert({ message: __('Minimum height must be 155 cm.'), indicator: 'orange' });
            }
        });
    },

    validate: function (frm) {
        // Enforce validations strictly before saving
        if (frm.doc.email_id && !/^[^@]+@[^@]+\.[^@]+$/.test(frm.doc.email_id)) {
            frappe.msgprint(__('Please enter a valid email address.'));
            frappe.validated = false;
        }

        if (frm.doc.mobile_number && !/^(\+91\d{10}|\d{10})$/.test(frm.doc.mobile_number)) {
            frappe.msgprint(__('Enter a valid mobile number (10 digits or +91...).'));
            frappe.validated = false;
        }

        if (frm.doc.age) {
            let age = parseInt(frm.doc.age);
            if (isNaN(age) || age < 18 || age > 27) {
                frappe.msgprint(__('Age must be between 18 and 27 years.'));
                frappe.validated = false;
            }
        }

        if (frm.doc.height) {
            let height = parseInt(frm.doc.height);
            if (isNaN(height) || height < 155) {
                frappe.msgprint(__('Minimum height must be 155 cm.'));
                frappe.validated = false;
            }
        }
    }
});

function create_student_from_interview(frm) {
    frappe.call({
        method: 'job_club.job_club.doctype.interview.interview.create_student_from_interview',
        args: {
            interview_name: frm.doc.name
        },
        freeze: true,
        freeze_message: __('Creating Student Record...'),
        callback: function (r) {
            if (r.message) {
                frappe.msgprint({
                    title: __('Success'),
                    indicator: 'green',
                    message: __('Student {0} has been created successfully', [r.message])
                });
                frm.reload_doc();
            }
        }
    });
}

function add_custom_button_styles_interview() {
    if ($('#custom-interview-button-styles').length > 0) return;

    $('head').append(`
        <style id="custom-interview-button-styles">
            .btn-create-student {
                background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%) !important;
                color: white !important;
                border: none !important;
                padding: 6px 12px !important;
                font-weight: 600 !important;
                border-radius: 6px !important;
                box-shadow: 0 4px 12px rgba(56, 239, 125, 0.3) !important;
                transition: all 0.3s ease !important;
            }
            .btn-create-student:hover {
                transform: translateY(-1px) !important;
                box-shadow: 0 6px 15px rgba(56, 239, 125, 0.4) !important;
            }
            .btn-view-student {
                background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%) !important;
                color: white !important;
                border: none !important;
                padding: 6px 12px !important;
                font-weight: 600 !important;
                border-radius: 6px !important;
                box-shadow: 0 4px 12px rgba(79, 172, 254, 0.3) !important;
                transition: all 0.3s ease !important;
            }
            .btn-view-student:hover {
                transform: translateY(-1px) !important;
                box-shadow: 0 6px 15px rgba(79, 172, 254, 0.4) !important;
            }
        </style>
    `);
}