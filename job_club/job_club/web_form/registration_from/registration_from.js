frappe.ready(() => {
    const styles = `
<link href="https://fonts.googleapis.com/css2?family=Lato:wght@400;600&display=swap" rel="stylesheet" />
<style>
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        font-family: "Lato", sans-serif;
    }
    nav.navbar,
    footer,
    #footer {
        display: none !important;
    }
    body {
        background: #f5f7fa;
    }

    .main-wrapper {
        width: 100%;
        max-width: 960px;
        margin: 40px auto;
        display: flex;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
        background: #fff;
    }

    /* Left branding (desktop only) */
    .left-section {
        flex: 1;
        background: linear-gradient(160deg, #d32f2f, #3041e4);
        color: white;
        padding: 30px 20px;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        justify-content: space-between;
        min-height: 100%;
    }
    .page-logo {
        width: 180px;
        margin-bottom: 10px;
        background: #fff;
        border-radius: 10px;
        padding: 8px;
    }
    .logo {
        width: 100%;
        height: auto;
    }
    .left-section h2 {
        font-size: 28px;
        font-weight: 600;
        margin: 12px 0;
        color: #fff;
    }
    .air-hostess {
        margin-top: auto;
        margin-bottom: -30px;
        width: 300px;
        max-width: 100%;
    }
    .girls-img {
        width: 100%;
        height: auto;
        display: block;
    }

    /* Right form */
    .form-wrapper {
        flex: 1.3;
        background: #fff;
        padding: 40px 40px;
    }
    .form-wrapper h2.desktop-title {
        display: none;
    }

    .form-wrapper h3.sub-title.desktop-title {
        font-size: 24px;
        font-weight: 700;
        margin: 5px 0 28px;
        color: #333;
        text-align: center;
        text-decoration: none;
    }
    .form-row-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        column-gap: 10px;
        row-gap: 1px;
    }
    .form-group {
        text-align: left;
        margin-bottom: 7px;
    }
    .form-group textarea {
        width: 100%;
        padding: 10px;
        border: 1px solid #ccc;
        border-radius: 5px;
        font-size: 14px;
        box-sizing: border-box;
        resize: vertical;
    }
    .form-group textarea:focus {
        border-color: #007bff;
        outline: none;
    }
    .form-group label {
        display: block;
        font-weight: 500;
        font-size: 12px;
        margin-bottom: 4px;
        color: #000000;
    }
    .form-group input,
    .form-group select {
        width: 100%;
        padding: 7px 10px;
        border: 1px solid #ddd;
        border-radius: 8px;
        font-size: 13px;
        background: #fff;
        color: #333;
        transition: all 0.25s ease;
    }
    .form-group input:focus,
    .form-group select:focus {
        border: 1px solid #3041e4;
        box-shadow: 0 0 6px rgba(48, 65, 228, 0.3);
        outline: none;
    }
    .form-group label::after {
        content: " *";
        color: red;
        font-weight: bold;
    }
    .submit-btn {
        margin-top: 9px;
        width: 100%;
        padding: 12px;
        border: none;
        border-radius: 10px;
        background: linear-gradient(to right, #151f6d, #3041e4);
        color: white;
        font-size: 15px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.25s ease;
    }
    .submit-btn:hover {
        background: linear-gradient(to right, #0f1b5d, #263ccf);
        box-shadow: 0 4px 12px rgba(48, 65, 228, 0.4);
    }

    /* Wave top bar (mobile only) */
    .wave-header {
        display: none;
        background: linear-gradient(160deg, #d32f2f, #3041e4);
        color: white;
        text-align: center;
        padding: 15px 10px;
        position: relative;
    }
    .wave-header .logo {
        width: 120px;
        margin-bottom: 5px;
        background: #fff;
        border-radius: 8px;
        padding: 5px;
    }
    .wave-header h2 {
        font-size: 26px;
        margin: 8px 0;
        color: #fff;
    }
    .wave-header .girls-img {
        width: 200px;
        display: block;
        margin: 8px auto -15px;
    }
    .wave-svg {
        position: absolute;
        bottom: -1px;
        left: 0;
        width: 100%;
        height: 40px;
    }

    /* OTP Modal */
    .otp-modal-overlay {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.45);
        z-index: 999;
        justify-content: center;
        align-items: center;
        backdrop-filter: blur(6px);
    }
    .otp-modal {
        background: white;
        padding: 20px;
        border-radius: 12px;
        text-align: center;
        box-shadow: 0 6px 15px rgba(0, 0, 0, 0.3);
        position: relative;
        animation: modalPop 0.25s ease-out;
        max-width: 320px;
        width: 90%;
    }
    .otp-modal h3 {
        font-size: 20px;
        margin-bottom: 15px;
        margin-top: 20px;
    }
    .otp-input {
        padding: 8px;
        width: 100%;
        margin-bottom: 10px;
        border-radius: 6px;
        border: 1px solid #ccc;
        font-size: 13px;
    }
    .otp-btn {
        padding: 6px 10px;
        margin: 4px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 12px;
    }
    .otp-btn-primary {
        background: linear-gradient(to right, #151f6d, #3041e4);
        color: white;
    }
    .otp-btn-secondary {
        background: #eee;
        color: #333;
    }
    .otp-close-btn {
        position: absolute;
        top: 6px;
        right: 8px;
        background: none;
        border: none;
        font-size: 22px;
        cursor: pointer;
    }
    .timer {
        margin-top: 6px;
        font-size: 12px;
    }
    .success-check {
        display: none;
        margin: 8px auto;
        width: 38px;
        height: 38px;
        border-radius: 50%;
        background: #4caf50;
        position: relative;
    }
    .success-check::after {
        content: "";
        position: absolute;
        left: 11px;
        top: 9px;
        width: 11px;
        height: 18px;
        border: solid white;
        border-width: 0 3px 3px 0;
        transform: rotate(45deg);
    }
    #otp-message {
        margin-top: 8px;
        font-size: 13px;
        text-align: center;
    }
    .error-msg {
        font-size: 10px !important;
    }

    /* Mobile adjustments */
    .register-title-mobile {
        display: none;
    }
    @media (max-width: 768px) {
        .form-row-grid {
            grid-template-columns: 1fr;
        }
        .form-wrapper {
            padding: 18px 25px;
        }
        .wave-svg {
            display: none;
        }
        .main-wrapper {
            flex-direction: column;
            margin: 0;
            border-radius: 0;
            box-shadow: none;
        }
        .left-section {
            display: none;
        }
        .wave-header {
            display: block;
        }

        .form-group {
            margin-bottom: 8px;
        }
        .form-group label {
            font-size: 12px;
            margin-bottom: 3px;
        }
        .form-group input,
        .form-group select {
            padding: 7px 9px;
            font-size: 13px;
            border-radius: 6px;
        }
        .submit-btn {
            padding: 9px;
            font-size: 14px;
            border-radius: 8px;
            margin-top: 8px;
        }
        .desktop-title {
            display: none;
        }
        .register-title-mobile {
            display: block;
            font-size: 24px;
            margin: 0px 0 20px;
            font-weight: 600;
            color: #333;
            text-align: center;
        }
    }
</style>
`
    const html = `
<!-- Mobile Header -->
<div class="wave-header">
    <img src="https://www.emporiumsolutions.com/wp-content/uploads/2025/07/logo-erp.png" class="logo" />
    <h2>Recruitment Drive</h2>
    <img src="https://www.emporiumsolutions.com/wp-content/uploads/2025/07/2girl.png" class="girls-img" />
    <svg class="wave-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
        <path fill="#fff" fill-opacity="1" d="M0,192L1440,96L1440,320L0,320Z"></path>
    </svg>
</div>

<!-- Main Wrapper -->
<div class="main-wrapper" id="page-content">
    <!-- Left Section -->
    <div class="left-section">
        <div class="page-logo">
            <img src="https://www.emporiumsolutions.com/wp-content/uploads/2025/07/logo-erp.png" class="logo" />
        </div>
        <h2>Recruitment Drive</h2>
        <div class="air-hostess">
            <img src="https://www.emporiumsolutions.com/wp-content/uploads/2025/07/2girl.png" class="girls-img" />
        </div>
    </div>

    <!-- Right Section -->
    <div class="form-wrapper">
        <h3 class="sub-title desktop-title">Register Now</h3>
        <form id="registration-form">
            <h3 class="register-title-mobile">Register Now</h3>
            <div class="form-row-grid">
                <div class="form-group">
                    <label>Recruitment Drive</label>
                    <select id="recruitment_drive" required>
                        <option value="">Select Drive</option>
                    </select>
                    <div class="error-msg" id="error-recruitment_drive"></div>
                </div>
                <div class="form-group">
                    <label>Full Name</label><input type="text" id="full_name" placeholder="Enter your full name" required />
                    <div class="error-msg" id="error-full_name"></div>
                </div>
                <div class="form-group">
                    <label>Email</label><input type="email" id="email_id" placeholder="Enter your email" required />
                    <div class="error-msg" id="error-email_id"></div>
                </div>
                <div class="form-group">
                    <label>Mobile Number</label><input type="text" id="mobile_number" placeholder="Enter your mobile/whatsapp number" required />
                    <div class="error-msg" id="error-mobile_number"></div>
                </div>
                <div class="form-group">
                    <label>Qualification</label>
                    <select id="qualification" required>
                        <option value="">Select</option>
                        <option value="Class 12">Class 12</option>
                        <option value="Graduate">Graduate</option>
                        <option value="Post Graduate">Post Graduate</option>
                    </select>
                    <div class="error-msg" id="error-qualification"></div>
                </div>

                <div class="form-group">
                    <label>Job Experience</label>
                    <select id="job_experience" required>
                        <option value="">Select</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                    </select>
                    <div class="error-msg" id="error-job_experience"></div>
                </div>

                <div class="form-group">
                    <label>Gender</label>
                    <select id="gender" required>
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>
                    <div class="error-msg" id="error-gender"></div>
                </div>
                <div class="form-group">
                    <label>Age</label><input type="number" id="age" placeholder="Between 18-27 Years" />
                    <div class="error-msg" id="error-age"></div>
                </div>
                <div class="form-group">
                    <label>Height (in cm)</label><input type="text" id="height" placeholder="Enter your height" />
                    <div class="error-msg" id="error-height"></div>
                </div>
                <div class="form-group">
                    <label>Weight</label><input type="text" id="weight" placeholder="Enter your weight" />
                    <div class="error-msg" id="error-weight"></div>
                </div>
            </div>
            <div id="form-error" style="color: red; font-size: 13px; margin-top: 5px; text-align: center;"></div>
            <button type="submit" class="submit-btn" id="register-btn">Register</button>
        </form>
    </div>
</div>

<!-- OTP Modal -->
<div class="otp-modal-overlay" id="otp-modal-overlay">
    <div class="otp-modal">
        <button class="otp-close-btn" id="otp-close-btn">&times;</button>
        <h3>Email OTP Verification</h3>
        <input type="text" id="otp-input" class="otp-input" placeholder="Enter 6-digit OTP" />
        <div>
            <button class="otp-btn otp-btn-primary" id="validate-otp-btn">Validate OTP</button>
            <button class="otp-btn otp-btn-secondary" id="resend-otp-btn">Resend OTP</button>
        </div>
        <div class="timer" id="otp-timer">Waiting for OTP...</div>
        <div class="success-check" id="otp-success-check"></div>
        <div id="otp-message"></div>
    </div>
</div>
`;

    document.head.insertAdjacentHTML('beforeend', styles);
    const container = document.querySelector('main') || document.body;
    container.innerHTML = html;

    // // ---------- Load Branch List Dynamically ----------
    // frappe.call({
    //     method: "job_club.job_club.doctype.registration_from.registration_from.get_branches",
    //     callback: function (r) {
    //         if (r.message) {
    //             const locationSelect = document.getElementById("location");

    //             // Get branch from URL
    //             const urlParams = new URLSearchParams(window.location.search);
    //             const branchFromUrl = urlParams.get("branch");

    //             r.message.forEach(branch => {
    //                 const opt = document.createElement("option");
    //                 opt.value = branch.branch;
    //                 opt.textContent = branch.branch;

    //                 // Auto-select if matches URL param
    //                 if (branchFromUrl && branchFromUrl.toLowerCase() === branch.branch.toLowerCase()) {
    //                     opt.selected = true;
    //                     // Trigger change event to load drives automatically
    //                     setTimeout(() => {
    //                         locationSelect.dispatchEvent(new Event("change"));
    //                     }, 0);
    //                 }

    //                 locationSelect.appendChild(opt);
    //             });
    //         }
    //     }
    // });


    // ---------- Branch & Drive Logic ----------
    const urlParams = new URLSearchParams(window.location.search);
    let location = urlParams.get("branch");  // fallback if not provided

    // Auto-load drives for that branch
    if (location) {
        const driveSelect = document.getElementById('recruitment_drive');
        driveSelect.innerHTML = '<option value="">Select Drive</option>'; // reset

        frappe.call({
            method: "job_club.job_club.doctype.registration_from.registration_from.get_open_drives",
            args: { branch: location },
            callback: function (r) {
                if (r.message && r.message.length > 0) {
                    if (r.message.length === 1) {
                        // Only 1 open drive → auto-select & lock
                        let drive = r.message[0];
                        const opt = document.createElement("option");
                        opt.value = drive.name;
                        opt.textContent = drive.drive_name;
                        opt.selected = true;
                        driveSelect.appendChild(opt);
                        driveSelect.disabled = true;
                    } else {
                        // Multiple open drives → show in dropdown
                        r.message.forEach(drive => {
                            const opt = document.createElement("option");
                            opt.value = drive.name;
                            opt.textContent = drive.drive_name;
                            driveSelect.appendChild(opt);
                        });
                        driveSelect.disabled = false;
                    }
                } else {
                    frappe.msgprint(`No open drives available for ${location}`);
                    driveSelect.disabled = true;
                }
            }
        });
    }


    // ---------- Common references ----------
    const otpModalOverlay = document.getElementById('otp-modal-overlay');
    const otpCloseBtn = document.getElementById('otp-close-btn');
    const pageContent = document.getElementById('page-content');
    const successCheck = document.getElementById('otp-success-check');
    const otpMessage = document.getElementById('otp-message');
    const otpTimer = document.getElementById('otp-timer');
    const formError = document.getElementById('form-error');

    // ---------- Helpers ----------
    function showFieldError(field, message) {
        const errorBox = document.getElementById(`error-${field}`);
        const fieldInput = document.getElementById(field);

        if (errorBox) {
            errorBox.textContent = message || "";
            errorBox.style.color = message ? "red" : "";
            errorBox.style.fontSize = "12px";
        }
        if (fieldInput) {
            fieldInput.style.border = message ? "1px solid red" : "1px solid #ccc";
        }
    }
    function showOtpMessage(text, color = "#d32f2f") {
        otpMessage.style.color = color;
        otpMessage.textContent = text;
    }

    let countdownInterval;
    function startCountdown(seconds) {
        clearInterval(countdownInterval);
        let remaining = seconds;
        updateTimerDisplay(remaining);
        countdownInterval = setInterval(() => {
            remaining--;
            updateTimerDisplay(remaining);
            if (remaining <= 0) {
                clearInterval(countdownInterval);
                otpTimer.style.color = "#d32f2f";
                otpTimer.textContent = "OTP expired. Please resend.";
            }
        }, 1000);
    }
    function updateTimerDisplay(seconds) {
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        otpTimer.style.color = seconds <= 60 ? "#d32f2f" : "#666";
        otpTimer.textContent = `OTP expires in ${min}:${sec.toString().padStart(2, '0')}`;
    }

    // ---------- Instant Field Validations ----------
    document.getElementById('full_name').addEventListener('blur', function () {
        if (!this.value.trim()) {
            showFieldError('full_name', "Full Name is required.");
        } else {
            showFieldError('full_name', "");
        }
    });

    document.getElementById('email_id').addEventListener('blur', function () {
        const email = this.value.trim();
        const drive = document.getElementById('recruitment_drive').value; // ID of your drive field

        if (email && !/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
            showFieldError('email_id', "Enter a valid email address.");
            return;
        } else if (!email) {
            showFieldError('email_id', "Email is required.");
            return;
        } else if (!drive) {
            showFieldError('email_id', "Select a recruitment drive first.");
            return;
        } else {
            frappe.call({
                method: 'job_club.job_club.doctype.registration_from.registration_from.check_duplicate',
                args: { fieldname: "email_id", value: email, drive: drive },
                callback: (r) => {
                    if (r.message.status === "error") {
                        showFieldError('email_id', r.message.message);
                    } else {
                        showFieldError('email_id', "");
                    }
                }
            });
        }
    });


    document.getElementById('mobile_number').addEventListener('blur', function () {
        const mobile = this.value.trim();

        if (!mobile) {
            // Empty mobile number
            showFieldError('mobile_number', "Mobile number is required.");
            return;
        }

        if (!/^(\+91\d{10}|\d{10})$/.test(mobile)) {
            // Invalid format
            showFieldError('mobile_number', "Enter a valid 10-digit number");
            return;
        }

        // If valid, clear any previous errors
        showFieldError('mobile_number', "");
    });

    document.getElementById('gender').addEventListener('blur', function () {
        if (!this.value.trim()) {
            showFieldError('gender', "Gender is required.");
        } else {
            showFieldError('gender', "");
        }
    });

    document.getElementById('age').addEventListener('blur', function () {
        const age = parseInt(this.value.trim());
        if (!age) {
            showFieldError('age', "Age is required.");
        } else if (age < 18 || age > 27) {
            showFieldError('age', "Age must be between 18–27.");
        } else {
            showFieldError('age', "");
        }
    });

    document.getElementById('height').addEventListener('blur', function () {
        const height = parseInt(this.value.trim());
        if (!height) {
            showFieldError('height', "Height is required.");
        } else if (isNaN(height) || height < 155) {
            showFieldError('height', "Minimum height is 155 cm.");
        } else {
            showFieldError('height', "");
        }
    });

    document.getElementById('qualification').addEventListener('blur', function () {
        if (!this.value.trim()) {
            showFieldError('qualification', "Qualification is required.");
        } else {
            showFieldError('qualification', "");
        }
    });

    document.getElementById('weight').addEventListener('blur', function () {
        if (!this.value.trim()) {
            showFieldError('weight', "Weight is required.");
        } else {
            showFieldError('weight', "");
        }
    });

    document.getElementById('job_experience').addEventListener('blur', function () {
        if (!this.value.trim()) {
            showFieldError('job_experience', "Job Experience is required.");
        } else {
            showFieldError('job_experience', "");
        }
    });

    // ---------- Form Submit (pre_validate + OTP send) ----------
    let full_name, email_id, mobile_number, gender, age, height, qualification, weight, job_experience, recruitment_drive;
    document.getElementById('registration-form').addEventListener('submit', (e) => {
        e.preventDefault();
        formError.textContent = '';

        full_name = document.getElementById('full_name').value.trim();
        email_id = document.getElementById('email_id').value.trim();
        mobile_number = document.getElementById('mobile_number').value.trim();
        location = location;  // from URL param
        gender = document.getElementById('gender').value;
        age = document.getElementById('age').value.trim();
        height = document.getElementById('height').value.trim();
        qualification = document.getElementById('qualification').value.trim();
        weight = document.getElementById('weight').value.trim();
        job_experience = document.getElementById('job_experience').value;
        recruitment_drive = document.getElementById('recruitment_drive').value.trim();


        frappe.call({
            method: 'job_club.job_club.doctype.registration_from.registration_from.pre_validate_registration',
            args: { data: { full_name, email_id, mobile_number, location, gender, age, height, qualification } },
            callback: (r) => {
                if (r.message && r.message.status === "error") {
                    document.querySelectorAll(".error-msg").forEach(el => el.textContent = "");
                    document.querySelectorAll("#registration-form input, #registration-form select")
                        .forEach(el => el.style.border = "1px solid #ccc");

                    r.message.errors.forEach(err => {
                        showFieldError(err.field, err.message);
                    });
                } else if (r.message && r.message.status === "success") {
                    otpModalOverlay.style.display = 'flex';
                    pageContent.style.filter = 'blur(6px)';
                    showOtpMessage('Sending OTP...', '#666');
                    frappe.call({
                        method: 'job_club.job_club.doctype.otp_verification.otp_api.send_otp',
                        args: { data: { email: email_id, full_name: full_name } },
                        callback: (otpRes) => {
                            if (otpRes.message && otpRes.message.status === "success") {
                                showOtpMessage(otpRes.message.message, '#4caf50');
                                startCountdown(600);
                            } else {
                                showOtpMessage(otpRes.message ? otpRes.message.message : 'Failed to send OTP.');
                            }
                        }
                    });
                } else {
                    formError.textContent = 'Something went wrong. Please try again.';
                }
            }
        });
    });

    // ---------- OTP Validation (then save) ----------
    document.getElementById('validate-otp-btn').addEventListener('click', () => {
        const otp_code = document.getElementById('otp-input').value.trim();
        if (!otp_code) {
            showOtpMessage('Please enter OTP.');
            return;
        }
        showOtpMessage('Verifying OTP...', '#666');

        frappe.call({
            method: 'job_club.job_club.doctype.otp_verification.otp_api.verify_otp_and_delete',
            args: { data: { email: email_id, otp: otp_code } },
            callback: (res) => {
                if (res.message && res.message.status === "success") {
                    showOtpMessage('OTP verified successfully.', '#4caf50');
                    successCheck.style.display = 'block';

                    // Save Registration
                    frappe.call({
                        method: 'frappe.website.doctype.web_form.web_form.accept',
                        args: {
                            web_form: 'registration-from',
                            data: JSON.stringify({
                                full_name, email_id, mobile_number, location, gender,
                                age, height, qualification, weight, job_experience,
                                recruitment_drive
                            })
                        },
                        callback: (saveRes) => {
                            if (saveRes.exc) {
                                showOtpMessage('Failed to save data. Please try again.');
                            } else {
                                const docname = saveRes.message.name;  // saved Registration docname

                                // Fetch generated token from backend
                                frappe.call({
                                    method: "job_club.job_club.doctype.registration_from.registration_from.get_registration_token",
                                    args: { docname },
                                    callback: function (tokenRes) {
                                        const token = tokenRes.message.token_number;

                                        setTimeout(() => {
                                            successCheck.style.display = 'none';
                                            otpModalOverlay.style.display = 'none';
                                            pageContent.style.filter = 'none';
                                            clearInterval(countdownInterval);

                                            // Redirect with token
                                            window.location.href = `/assets/job_club/thank_you.html?name=${encodeURIComponent(full_name)}&location=${encodeURIComponent(location)}&token=${encodeURIComponent(token)}`;
                                        }, 500);
                                    }
                                });
                            }
                        }
                    });
                } else {
                    showOtpMessage(res.message ? res.message.message : 'Invalid OTP.');
                }
            }
        });
    });

    // ---------- Resend OTP ----------
    document.getElementById('resend-otp-btn').addEventListener('click', () => {
        showOtpMessage('Resending OTP...', '#666');
        frappe.call({
            method: 'job_club.job_club.doctype.otp_verification.otp_api.send_otp',
            args: { data: { email: email_id, full_name: full_name } },
            callback: (r) => {
                if (r.message && r.message.status === "success") {
                    showOtpMessage(r.message.message, '#4caf50');
                    startCountdown(600);
                } else {
                    showOtpMessage(r.message ? r.message.message : 'Failed to resend OTP.');
                }
            }
        });
    });

    otpCloseBtn.addEventListener('click', () => {
        otpModalOverlay.style.display = 'none';
        pageContent.style.filter = 'none';
        clearInterval(countdownInterval);
    });
});