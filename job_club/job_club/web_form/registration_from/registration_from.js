// Complete Mobile Web Form Script for Emporium
// Save this as: your_app/public/js/registration_form.js

frappe.ready(function() {
    // Inject CSS styles
    const styles = `
        <style>
            /* Reset and hide default elements */
            .page-header,
            .page-header-actions-block,
            .form-footer,
            .page-content-wrapper,
            .sidebar-column,
            .form-layout,
            .section-body,
            .form-column,
            .frappe-control,
            .form-section,
            .page-container {
                display: none !important;
            }

            body {
                margin: 0;
                padding: 0;
                background-color: #f5f5f7;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
            }

            /* Mobile Form Container */
            .mobile-form-container {
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
                background: linear-gradient(to bottom, #f5f5f7 0%, #ffffff 100%);
            }

            /* Form Card */
            .mobile-form-card {
                background: white;
                border-radius: 20px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
                max-width: 400px;
                width: 100%;
                overflow: hidden;
            }

            /* Red Header Section */
            .form-header {
                background-color: #dc3545;
                padding: 30px 20px;
                text-align: center;
                position: relative;
            }

            .form-header::after {
                content: '';
                position: absolute;
                bottom: -20px;
                left: 0;
                right: 0;
                height: 40px;
                background: white;
                border-radius: 20px 20px 0 0;
            }

            /* Logo */
            .emporium-logo {
                height: 50px;
                margin-bottom: 15px;
                position: relative;
                z-index: 1;
            }

            /* Staff Image */
            .staff-image {
                width: 200px;
                height: auto;
                position: relative;
                z-index: 2;
                margin: 0 auto;
                display: block;
            }

            /* Form Title */
            .form-title-section {
                background-color: #dc3545;
                color: white;
                text-align: center;
                padding: 0 20px 25px;
                margin-top: -20px;
                position: relative;
                z-index: 1;
            }

            .form-title {
                font-size: 20px;
                font-weight: 400;
                margin: 0 0 5px 0;
            }

            .form-subtitle {
                font-size: 24px;
                font-weight: 600;
                margin: 0;
            }

            /* Form Content */
            .form-content {
                padding: 30px 25px;
                background: white;
            }

            /* Input Fields */
            .form-input {
                width: 100%;
                padding: 16px 20px;
                margin-bottom: 15px;
                border: none;
                border-radius: 12px;
                background-color: #f5f5f7;
                font-size: 16px;
                transition: all 0.3s ease;
                box-sizing: border-box;
            }

            .form-input:focus {
                outline: none;
                background-color: #e8e8ea;
                transform: translateY(-1px);
            }

            .form-input::placeholder {
                color: #8e8e93;
            }

            /* Register Button */
            .register-button {
                width: 100%;
                padding: 16px;
                background-color: #1e3a8a;
                color: white;
                border: none;
                border-radius: 12px;
                font-size: 18px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.3s ease;
                margin-top: 20px;
            }

            .register-button:hover {
                background-color: #1e40af;
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(30, 58, 138, 0.3);
            }

            .register-button:active {
                transform: translateY(0);
            }

            /* Success Message Styles */
            .success-mobile-container {
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
                background: linear-gradient(to bottom, #f5f5f7 0%, #ffffff 100%);
            }

            .success-mobile-card {
                background: white;
                border-radius: 20px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
                max-width: 400px;
                width: 100%;
                padding: 40px 30px;
                text-align: center;
            }

            .success-logo {
                height: 50px;
                margin-bottom: 30px;
            }

            .thanks-box {
                background-color: #f5f5f7;
                border-radius: 15px;
                padding: 25px;
                margin-bottom: 30px;
            }

            .thanks-title {
                font-size: 18px;
                color: #333;
                margin: 0 0 10px 0;
                font-weight: 400;
            }

            .thanks-emporium {
                font-size: 24px;
                color: #dc3545;
                margin: 0;
                font-weight: 600;
            }

            .thumbs-up-icon {
                width: 80px;
                height: 80px;
                margin: 30px auto;
                background-color: #fee2e2;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
            }

            .thumbs-up-icon::before {
                content: "👍";
                font-size: 40px;
            }

            /* Animation lines around thumbs up */
            .thumbs-up-icon::after {
                content: '';
                position: absolute;
                width: 120px;
                height: 120px;
                border: 2px dashed #dc3545;
                border-radius: 50%;
                animation: rotate 10s linear infinite;
            }

            @keyframes rotate {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }

            /* Responsive */
            @media (max-width: 480px) {
                .mobile-form-card {
                    margin: 10px;
                    border-radius: 15px;
                }
                
                .form-content {
                    padding: 20px;
                }
                
                .staff-image {
                    width: 160px;
                }
                
                .form-title {
                    font-size: 18px;
                }
                
                .form-subtitle {
                    font-size: 22px;
                }
            }

            /* Loading state */
            .register-button:disabled {
                background-color: #6b7280;
                cursor: not-allowed;
            }

            .loading-spinner {
                display: inline-block;
                width: 16px;
                height: 16px;
                border: 2px solid #ffffff;
                border-radius: 50%;
                border-top-color: transparent;
                animation: spin 0.8s linear infinite;
                margin-left: 8px;
                vertical-align: middle;
            }

            @keyframes spin {
                to { transform: rotate(360deg); }
            }
        </style>
    `;

    // Inject styles
    $('head').append(styles);

    // Create custom form
    createMobileForm();
});

function createMobileForm() {
    // Clear the page
    $('body').empty();
    
    // Create mobile form HTML
    const formHTML = `
        <div class="mobile-form-container">
            <div class="mobile-form-card">
                <!-- Red Header with Logo and Staff Image -->
                <div class="form-header">
                    <img src="/assets/job_club/images/logo-es.png" alt="Emporium" class="emporium-logo">
                </div>
                
                <!-- Title Section -->
                <div class="form-title-section">
                    <h2 class="form-title">Register now for</h2>
                    <h1 class="form-subtitle">Free Career Counselling</h1>
                </div>
                
                <!-- Form Content -->
                <div class="form-content">
                    <form id="emporium-registration-form">
                        <input type="text" 
                               class="form-input" 
                               id="full_name" 
                               name="full_name" 
                               placeholder="Name" 
                               required>
                        
                        <input type="tel" 
                               class="form-input" 
                               id="mobile_number" 
                               name="mobile_number" 
                               placeholder="Phone no" 
                               pattern="[0-9]{10}" 
                               required>
                        
                        <input type="email" 
                               class="form-input" 
                               id="email_id" 
                               name="email_id" 
                               placeholder="email id" 
                               required>
                        
                        <button type="submit" class="register-button">Register</button>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    $('body').html(formHTML);
    
    // Handle form submission
    $('#emporium-registration-form').on('submit', function(e) {
        e.preventDefault();
        submitRegistration();
    });
}

function submitRegistration() {
    // Get form values
    const formData = {
        full_name: $('#full_name').val(),
        mobile_number: $('#mobile_number').val(),
        email_id: $('#email_id').val()
    };
    
    // Show loading state
    const $button = $('.register-button');
    $button.prop('disabled', true).html('Registering<span class="loading-spinner"></span>');
    
    // Submit to Frappe Web Form
    frappe.call({
        method: 'frappe.website.doctype.web_form.web_form.accept',
        args: {
            web_form: 'registration-from', // Your web form name
            data: JSON.stringify(formData)
        },
        callback: function(response) {
            console.log('Response:', response); // Debug log
            
            // Check different response formats
            if (response && (response.message || response.exc === undefined)) {
                // Show success message regardless of response format
                showSuccessMessage();
            } else {
                // Handle error
                frappe.msgprint({
                    title: 'Error',
                    message: 'There was an error submitting your registration. Please try again.',
                    indicator: 'red'
                });
                $button.prop('disabled', false).html('Register');
            }
        },
        error: function(error) {
            console.error('Submission error:', error);
            
            // Still show success if it's a redirect error (which happens on successful submission)
            if (error && error.status === 200) {
                showSuccessMessage();
            } else {
                frappe.msgprint({
                    title: 'Error',
                    message: 'Unable to submit registration. Please check your connection and try again.',
                    indicator: 'red'
                });
                $button.prop('disabled', false).html('Register');
            }
        }
    });
}

function showSuccessMessage() {
    // Replace page content with success message
    const successHTML = `
        <div class="success-mobile-container">
            <div class="success-mobile-card">
                <!-- Logo -->
                <img src="/assets/job_club/images/logo-es.png" alt="Emporium" class="emporium-logo">
                
                <!-- Thanks Box -->
                <div class="thanks-box">
                    <h3 class="thanks-title">Thanks for registering with</h3>
                    <h2 class="thanks-emporium">Emporium</h2>
                </div>
                
                <!-- Thumbs Up Icon -->
                <div class="thumbs-up-icon"></div>
            </div>
        </div>
    `;
    
    $('body').html(successHTML);
    
    // Optional: Redirect after 3 seconds
    setTimeout(function() {
        window.location.href = '/';
    }, 3000);
}

// Alternative: If you want to use the existing Frappe web form fields
// Uncomment this section to modify the existing form instead of creating a new one
/*
frappe.ready(function() {
    // Wait for form to load
    setTimeout(function() {
        // Hide all default elements
        $('.page-header, .form-footer').hide();
        
        // Wrap the form
        $('.web-form').wrap('<div class="mobile-form-container"><div class="mobile-form-card"></div></div>');
        
        // Add header before form
        const header = `
            <div class="form-header">
                <img src="/files/emporium-logo-white.png" alt="Emporium" class="emporium-logo">
                <img src="/files/emporium-staff.png" alt="Staff" class="staff-image">
            </div>
            <div class="form-title-section">
                <h2 class="form-title">Register now for</h2>
                <h1 class="form-subtitle">Free Career Counselling</h1>
            </div>
        `;
        $('.mobile-form-card').prepend(header);
        
        // Style existing inputs
        $('.frappe-control input').addClass('form-input');
        $('.btn-primary').addClass('register-button').text('Register');
    }, 100);
});
*/






/*<img src="/assets/job_club/images/logo-es.png" alt="Emporium" class="emporium-logo">
<div class="success-mobile-container">
            <div class="success-mobile-card">
                <!-- Logo -->
                <img src="/files/emporium-logo.png" alt="Emporium" class="success-logo">
                
                <!-- Thanks Box -->
                <div class="thanks-box">
                    <h3 class="thanks-title">Thanks for registering with</h3>
                    <h2 class="thanks-emporium">Emporium</h2>
                </div>
                
                <!-- Thumbs Up Icon -->
                <div class="thumbs-up-icon"></div>
            </div>
        </div>
*/

// Alternative: If you want to use the existing Frappe web form fields
// Uncomment this section to modify the existing form instead of creating a new one
/*
frappe.ready(function() {
    // Wait for form to load
    setTimeout(function() {
        // Hide all default elements
        $('.page-header, .form-footer').hide();
        
        // Wrap the form
        $('.web-form').wrap('<div class="mobile-form-container"><div class="mobile-form-card"></div></div>');
        
        // Add header before form
        const header = `
            <div class="form-header">
                <img src="/files/emporium-logo-white.png" alt="Emporium" class="emporium-logo">
                <img src="/files/emporium-staff.png" alt="Staff" class="staff-image">
            </div>
            <div class="form-title-section">
                <h2 class="form-title">Register now for</h2>
                <h1 class="form-subtitle">Free Career Counselling</h1>
            </div>
        `;
        $('.mobile-form-card').prepend(header);
        
        // Style existing inputs
        $('.frappe-control input').addClass('form-input');
        $('.btn-primary').addClass('register-button').text('Register');
    }, 100);
});
*/

