// Copyright (c) 2025, BluePhoenix and contributors
// For license information, please see license.txt

frappe.ui.form.on('Admission', {
    refresh: function(frm) {
        // Add custom styles for buttons
        add_custom_button_styles();
        
        // Add custom button only if document is saved and not yet converted
        if (!frm.doc.__islocal && !frm.doc.student_created) {
            frm.add_custom_button(__('Create Student'), function() {
                create_student_from_admission(frm);
            }).addClass('btn-create-student');
            
            // Apply custom styling to the button
            setTimeout(() => {
                $('.btn-create-student').html('<i class="fa fa-user-plus"></i> Create Student');
            }, 100);
        }
        
        // Show link to created student if exists
        if (frm.doc.student_id) {
            frm.add_custom_button(__('View Student'), function() {
                frappe.set_route('Form', 'Student', frm.doc.student_id);
            }).addClass('btn-view-student');
            
            // Apply custom styling to the view button
            setTimeout(() => {
                $('.btn-view-student').html('<i class="fa fa-eye"></i> View Student');
            }, 100);
        }
    }
});

function add_custom_button_styles() {
    // Check if styles already added
    if ($('#custom-admission-button-styles').length > 0) return;
    
    // Add custom CSS for the buttons
    $('head').append(`
        <style id="custom-admission-button-styles">
            .btn-create-student {
                background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%) !important;
                color: white !important;
                border: none !important;
                padding: 8px 8px !important;
                font-weight: 600 !important;
                border-radius: 8px !important;
                box-shadow: 0 4px 15px rgba(56, 239, 125, 0.4) !important;
                transition: all 0.3s ease !important;
                font-size: 14px !important;
            }
            
            .btn-create-student:hover {
                background: linear-gradient(135deg, #38ef7d 0%, #11998e 100%) !important;
                transform: translateY(-2px) !important;
                box-shadow: 0 6px 20px rgba(56, 239, 125, 0.6) !important;
            }
            
            .btn-create-student:active {
                transform: translateY(0px) !important;
            }
            
            .btn-create-student i {
                font-size: 14px;
            }
            
            .btn-view-student {
                background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%) !important;
                color: white !important;
                border: none !important;
                padding: 8px 8px !important;
                font-weight: 600 !important;
                border-radius: 8px !important;
                box-shadow: 0 4px 15px rgba(79, 172, 254, 0.4) !important;
                transition: all 0.3s ease !important;
                font-size: 14px !important;
            }
            
            .btn-view-student:hover {
                background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%) !important;
                transform: translateY(-2px) !important;
                box-shadow: 0 6px 20px rgba(79, 172, 254, 0.6) !important;
            }
            
            .btn-view-student:active {
                transform: translateY(0px) !important;
            }
            
            .btn-view-student i {
                font-size: 14px;
            }
        </style>
    `);
}

function create_student_from_admission(frm) {
    frappe.call({
        method: 'job_club.job_club.doctype.admission.admission.create_student_from_admission',
        args: {
            admission_name: frm.doc.name
        },
        freeze: true,
        freeze_message: __('Creating Student Record...'),
        callback: function(r) {
            if (r.message) {
                frappe.msgprint({
                    title: __('Success'),
                    indicator: 'green',
                    message: __('Student {0} has been created successfully', [r.message])
                });
                frm.reload_doc();
            }
        },
        error: function(r) {
            frappe.msgprint({
                title: __('Error'),
                indicator: 'red',
                message: __('Failed to create Student record')
            });
        }
    });
}