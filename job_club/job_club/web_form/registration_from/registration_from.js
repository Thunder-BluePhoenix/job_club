frappe.ready(() => { const styles = `
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
        justify-content: center;
    }
    .page-logo {
        width: 180px;
        margin-bottom: 15px;
        background: #fff;
        border-radius: 10px;
        padding: 8px;
    } /* ✅ white bg for logo */
    .logo {
        width: 100%;
        height: auto;
    }
    .air-hostess {
        width: 240px;
        margin-top: 10px;
    }
    .girls-img {
        width: 100%;
        height: auto;
    }
    .left-section h2 {
        font-size: 22px;
        font-weight: 600;
        margin-top: 15px;
    }
    .left-section p {
        font-size: 14px;
        max-width: 300px;
        margin-top: 10px;
        opacity: 0.9;
        text-align: center;
    }

    /* Right form */
    .form-wrapper {
        flex: 1.3;
        background: #fff;
        padding: 20px 30px;
    }
    .form-wrapper h2 {
        font-size: 30px;
        margin-top: 20px;
        font-weight: 700;
        color: #fff;
        text-align: center;
        background: linear-gradient(160deg, #d32f2f, #3041e4);
        padding: 12px;
        border-radius: 8px;
    }
    .form-wrapper h3.sub-title {
        font-size: 24px; /* ✅ smaller subheading */
        margin-top: 30px;
        margin-bottom: 30px;
        font-weight: 600;
        color: #333;
        text-align: center;
        text-decoration: underline;
    }
    .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 18px;
    }
    .form-group {
        text-align: left;
        margin-bottom: 14px;
    }
    .form-group label {
        display: block;
        font-weight: 600;
        font-size: 13px;
        margin-bottom: 4px;
        color: #333;
    }
    .form-group input,
    .form-group select {
        width: 100%;
        padding: 10px 12px;
        border: 1px solid #ddd;
        border-radius: 8px;
        font-size: 14px;
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
    .submit-btn {
        width: 100%;
        padding: 12px;
        border: none;
        border-radius: 10px;
        background: linear-gradient(to right, #151f6d, #3041e4);
        color: white;
        font-size: 15px;
        font-weight: 600;
        cursor: pointer;
        margin-top: 10px;
        transition: all 0.25s ease;
    }
    .submit-btn:hover {
        background: linear-gradient(to right, #0f1b5d, #263ccf);
        box-shadow: 0 4px 12px rgba(48, 65, 228, 0.4);
    }

    /* Wave top bar (mobile) */
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
    } /* ✅ white bg logo mobile */
    .wave-header h2 {
        font-size: 26px;
        margin: 8px 0;
        color: #fff;
    }
    .wave-header .girls-img {
        width: 150px;
        display: block;
        margin: 8px auto 0;
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
        padding: 16px;
        border-radius: 12px;
        width: 320px;
        text-align: center;
        box-shadow: 0 6px 15px rgba(0, 0, 0, 0.3);
        position: relative;
        animation: modalPop 0.25s ease-out;
    }
    @keyframes modalPop {
        from {
            transform: scale(0.9);
            opacity: 0;
        }
        to {
            transform: scale(1);
            opacity: 1;
        }
    }
    .otp-input {
        padding: 9px;
        width: 100%;
        margin-bottom: 10px;
        border-radius: 6px;
        border: 1px solid #ccc;
        font-size: 14px;
    }
    .otp-btn {
        padding: 7px 12px;
        margin: 4px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 13px;
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

    /* Mobile adjustments */
    .register-title-mobile {
        display: none;
    }
    @media (max-width: 768px) {
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

        /* ✅ Make fields appear consecutively */
        .form-row {
            grid-template-columns: 1fr;
            gap: 6px;
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

        /* Compact button */
        .submit-btn {
            padding: 9px;
            font-size: 14px;
            border-radius: 8px;
            margin-top: 8px;
        }

        /* Titles */
        .desktop-title {
            display: none;
        }
        .register-title-mobile {
            display: block;
            font-size: 20px;
            margin: 0px 0 20px;
            font-weight: 600;
            color: #333;
            text-align: center;
            text-decoration: underline;
        }
    }
</style>
`; const html = `
<!-- Mobile Header -->
<div class="wave-header">
    <img src="https://www.emporiumsolutions.com/wp-content/uploads/2025/07/logo-erp.png" class="logo" />
    <h2>Free Career Counselling</h2>
    <img src="https://www.emporiumsolutions.com/wp-content/uploads/2025/07/2girl.png" class="girls-img" />
    <svg class="wave-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
        <path fill="#fff" fill-opacity="1" d="M0,192L1440,96L1440,320L0,320Z"></path>
    </svg>
</div>

<div class="main-wrapper" id="page-content">
    <!-- Left Section (desktop only) -->
    <div class="left-section">
        <div class="page-logo"><img src="https://www.emporiumsolutions.com/wp-content/uploads/2025/07/logo-erp.png" class="logo" /></div>
        <div class="air-hostess"><img src="https://www.emporiumsolutions.com/wp-content/uploads/2025/07/2girl.png" class="girls-img" /></div>
    </div>

    <!-- Right Form -->
    <div class="form-wrapper">
        <h2 class="desktop-title">Free Career Counselling</h2>
        <h3 class="sub-title desktop-title">Register Now</h3>
        <form id="registration-form">
            <h3 class="register-title-mobile">Register Now</h3>
            <div class="form-row">
                <div>
                    <div class="form-group"><label>Full Name</label><input type="text" id="full_name" placeholder="Enter your full name" required /></div>
                    <div class="form-group"><label>Email</label><input type="email" id="email_id" placeholder="Enter your email" required /></div>
                    <div class="form-group"><label>Mobile Number</label><input type="text" id="mobile_number" placeholder="Enter your mobile number" required /></div>
                    <div class="form-group"><label>City</label><input type="text" id="city" placeholder="Enter your city" /></div>
                </div>
                <div>
                    <div class="form-group">
                        <label>Gender</label>
                        <select id="gender">
                            <option value="">Select</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div class="form-group"><label>Age</label><input type="number" id="age" placeholder="Enter your age" /></div>
                    <div class="form-group"><label>Height</label><input type="text" id="height" placeholder="Enter your height" /></div>
                    <div class="form-group"><label>Qualification</label><input type="text" id="qualification" placeholder="Enter your qualification" /></div>
                </div>
            </div>
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

  const otpModalOverlay = document.getElementById('otp-modal-overlay');
  const otpCloseBtn = document.getElementById('otp-close-btn');
  const pageContent = document.getElementById('page-content');
  const successCheck = document.getElementById('otp-success-check');
  const otpMessage = document.getElementById('otp-message');
  const otpTimer = document.getElementById('otp-timer');

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

  function showOtpMessage(text, color = "#d32f2f") {
    otpMessage.style.color = color;
    otpMessage.textContent = text;
  }

  let full_name, email_id, mobile_number, city, gender, age, height, qualification;

  // Send OTP on Register
  document.getElementById('registration-form').addEventListener('submit', (e) => {
    e.preventDefault();

    full_name = document.getElementById('full_name').value.trim();
    email_id = document.getElementById('email_id').value.trim();
    mobile_number = document.getElementById('mobile_number').value.trim();
    city = document.getElementById('city').value.trim();
    gender = document.getElementById('gender').value;
    age = document.getElementById('age').value.trim();
    height = document.getElementById('height').value.trim();
    qualification = document.getElementById('qualification').value.trim();

    if (!full_name || !email_id || !mobile_number) {
      showOtpMessage('Please fill in all required fields.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email_id)) {
      showOtpMessage('Please enter a valid email address.');
      return;
    }

    otpModalOverlay.style.display = 'flex';
    pageContent.style.filter = 'blur(6px)';
    showOtpMessage('Sending OTP...', '#666');

    frappe.call({
      method: 'job_club.job_club.doctype.otp_verification.otp_api.send_otp',
      args: { data: { email: email_id, full_name: full_name } },
      callback: (r) => {
        if (r.message && r.message.status === "success") {
          showOtpMessage(r.message.message, '#4caf50');
          startCountdown(600); // 10 minutes
        } else {
          showOtpMessage(r.message ? r.message.message : 'Failed to send OTP.');
        }
      }
    });
  });

  // Validate OTP
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

          frappe.call({
            method: 'frappe.website.doctype.web_form.web_form.accept',
            args: {
              web_form: 'registration-from',
              data: JSON.stringify({
                full_name: full_name,
                email_id: email_id,
                mobile_number: mobile_number,
                city: city,
                gender: gender,
                age: age,
                height: height,
                qualification: qualification
              }),
            },
            callback: (r) => {
              if (r.message) {
                successCheck.style.display = 'block';
                setTimeout(() => {
                  successCheck.style.display = 'none';
                  otpModalOverlay.style.display = 'none';
                  pageContent.style.filter = 'none';
                  clearInterval(countdownInterval);
                  window.location.href = `/assets/job_club/thank_you.html?name=${encodeURIComponent(full_name)}`;
                }, 1000);
              } else {
                showOtpMessage('Failed to save registration.');
              }
            }
          });
        } else {
          showOtpMessage(res.message ? res.message.message : 'Invalid OTP.');
        }
      }
    });
  });

  // Resend OTP
  document.getElementById('resend-otp-btn').addEventListener('click', () => {
    showOtpMessage('Resending OTP...', '#666');
    frappe.call({
      method: 'job_club.job_club.doctype.otp_verification.otp_api.send_otp',
      args: { data: { email: email_id, full_name: full_name } },
      callback: (r) => {
        if (r.message && r.message.status === "success") {
          showOtpMessage(r.message.message, '#4caf50');
          startCountdown(600); // Reset timer
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
