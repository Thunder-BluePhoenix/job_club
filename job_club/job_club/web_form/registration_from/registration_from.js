frappe.ready(() => {
  const styles = `
    <link href="https://fonts.googleapis.com/css2?family=Lato:wght@400&display=swap" rel="stylesheet" />
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      nav.navbar, nav.navbar-expand-lg, .navbar, .navbar-expand-lg, footer, #footer { display: none !important; }
      body { padding-top: 0 !important; margin-top: 0 !important; background: #fff; font-family: 'Lato', sans-serif; }
      .main-wrapper { width: 100%; max-width: 400px; margin: 0 auto; overflow: hidden; transition: filter 0.3s ease; }
      .top-section { background: #fff; text-align: center; padding-top: 20px; display: flex; align-items: center; flex-direction: column; }
      .page-logo { width: 250px; margin-bottom: 9px; }
      .logo { width: 100%; height: auto; }
      .air-hostess { width: 300px; }
      .girls-img { width: 100%; height: auto; }
      .form-wrapper { margin-top: -80px; background: #d32f2f; border-radius: 15px; padding: 40px 27px 50px; color: #fff; text-align: center; position: relative; }
      .form-wrapper h2 { font-size: 20px; margin-bottom: 20px; font-weight: 400; margin-top: 4px; line-height: 1.4; color: white; }
      .form-wrapper h2 span { font-weight: bold; font-size: 1.6rem; }
      .form-group { text-align: left; margin-bottom: 15px; }
      .form-group label { display: block; font-weight: 600; font-size: 14px; margin-bottom: 5px; color: white; }
      .form-group input { width: 100%; padding: 14px 15px; border: none; border-radius: 10px; font-size: 16px; background: #fff; color: #333; }
      .form-group input::placeholder { color: #808080ff; }
      .form-group input:focus { background: #f9f9f9; border: 1px solid #3041e4; }
      .submit-btn { width: 100%; padding: 14px; border: none; border-radius: 12px; background: linear-gradient(to right, #151f6d, #3041e4); color: white; font-size: 18px; font-weight: 500; cursor: pointer; }
      .submit-btn:hover { background: linear-gradient(to right, #0f1b5d, #263ccf); }

      /* OTP Modal */
      .otp-modal-overlay {
        display: none;
        position: fixed;
        top:0; left:0;
        width:100%; height:100%;
        background: rgba(0,0,0,0.4);
        z-index:999;
        justify-content:center;
        align-items:center;
        backdrop-filter: blur(6px);
      }
      .otp-modal {
        background: white;
        padding: 16px;
        border-radius: 15px;
        width: 350px;
        text-align: center;
        box-shadow: 0 8px 20px rgba(0,0,0,0.3);
        position: relative;
        animation: modalPop 0.25s ease-out;
      }
      @keyframes modalPop {
        from { transform: scale(0.9); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }
      .otp-input {
        padding: 12px;
        width: 100%;
        margin-bottom: 15px;
        border-radius: 8px;
        border: 1px solid #ccc;
        font-size: 16px;
      }
      .otp-btn {
        padding: 10px 16px;
        margin: 5px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
      }
      .otp-btn-primary { background: linear-gradient(to right, #151f6d, #3041e4); color: white; }
      .otp-btn-secondary { background: #eee; color: #333; }
      .otp-close-btn {
        position: absolute;
        top: 8px;
        right: 10px;
        background: none;
        border: none;
        font-size: 30px;
        cursor: pointer;
      }
      .timer { margin-top: 8px; font-size: 13px; }
      .success-check {
        display: none;
        margin: 10px auto;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: #4caf50;
        position: relative;
      }
      .success-check::after {
        content: '';
        position: absolute;
        left: 14px;
        top: 12px;
        width: 14px;
        height: 24px;
        border: solid white;
        border-width: 0 4px 4px 0;
        transform: rotate(45deg);
      }
      #otp-message {
        margin-top: 10px;
        font-size: 14px;
        text-align: center;
      }
    </style>`;

  const html = `
    <div class="main-wrapper" id="page-content">
      <div class="top-section">
        <div class="page-logo"><img src="https://www.emporiumsolutions.com/wp-content/uploads/2025/07/logo-erp.png" class="logo"/></div>
        <div class="air-hostess"><img src="https://www.emporiumsolutions.com/wp-content/uploads/2025/07/2girl.png" class="girls-img"/></div>
      </div>
      <div class="form-wrapper">
        <h2>Register now for<br /><span>Free Career Counselling</span></h2>
        <form id="registration-form">
          <div class="form-group"><label>Full Name</label><input type="text" id="full_name" placeholder="Enter your full name" required /></div>
          <div class="form-group"><label>Email</label><input type="email" id="email_id" placeholder="Enter your email" required /></div>
          <div class="form-group"><label>Mobile Number</label><input type="text" id="mobile_number" placeholder="Enter your mobile number" required /></div>
          <button type="submit" class="submit-btn" id="register-btn">Register</button>
        </form>
      </div>
    </div>

    <!-- OTP Modal -->
    <div class="otp-modal-overlay" id="otp-modal-overlay">
      <div class="otp-modal">
        <button class="otp-close-btn" id="otp-close-btn">&times;</button>
        <h3>Email OTP Verification</h3>
        <input type="text" id="otp-input" class="otp-input" placeholder="Enter 6-digit OTP"/>
        <div>
          <button class="otp-btn otp-btn-primary" id="validate-otp-btn">Validate OTP</button>
          <button class="otp-btn otp-btn-secondary" id="resend-otp-btn">Resend OTP</button>
        </div>
        <div class="timer" id="otp-timer">Waiting for OTP...</div>
        <div class="success-check" id="otp-success-check"></div>
        <div id="otp-message"></div>
      </div>
    </div>`;

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

  let full_name, email_id, mobile_number;

  // Send OTP on Register
  document.getElementById('registration-form').addEventListener('submit', (e) => {
    e.preventDefault();

    full_name = document.getElementById('full_name').value.trim();
    email_id = document.getElementById('email_id').value.trim();
    mobile_number = document.getElementById('mobile_number').value.trim();

    if (!full_name || !email_id || !mobile_number) {
      showOtpMessage('Please fill in all fields.');
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
                mobile_number: mobile_number
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
