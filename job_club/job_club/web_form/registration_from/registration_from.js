frappe.ready(() => {
  const styles = `
        <link href="https://fonts.googleapis.com/css2?family=Lato:wght@400&display=swap" rel="stylesheet" />
    <style>
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      nav.navbar,
      nav.navbar-expand-lg,
      .navbar,
      .navbar-expand-lg,
      footer,
      #footer {
      display: none !important;
      }

      body {
        padding-top: 0 !important;
        margin-top: 0 !important;
      }

      body {
        background: #fff;
        font-family: 'Lato', sans-serif;
      }

      .main-wrapper {
        width: 100%;
        max-width: 400px;
        margin: 0 auto;
        overflow: hidden;
      }

      .top-section {
        background: #ffffff;
        text-align: center;
        padding-top: 20px;
        display: flex;
        align-items: center;
        flex-direction: column;
      }

      .page-logo {
        width: 250px;
        margin-bottom: 9px;
      }

      .logo {
        width: 100%;
        height: auto;
      }

      .air-hostess {
        width: 300px;
        z-index: 0;
      }

      .girls-img {
        width: 100%;
        height: auto;
      }

      .form-wrapper {
        margin-top: -80px;
        background: #d32f2f;
        border-radius: 15px;
        padding: 40px 27px 50px;
        color: #fff;
        text-align: center;
        z-index: 1;
        position: relative;
      }

      /* h2 text white */
      .form-wrapper h2,
      .form-wrapper h2 span {
        color: white;
      }

      .form-wrapper h2 {
        font-size: 20px;
        margin-bottom: 20px;
        line-height: 1.4;
        font-weight: 400;
        margin-top: 4px;
      }

      .form-wrapper h2 span {
        font-weight: bold;
        font-size: 1.6rem;
      }

      /* Form groups styling */
      .form-group {
        text-align: left;
        margin-bottom: 15px;
      }

      .form-group label {
        display: block;
        font-weight: 600;
        font-size: 14px;
        margin-bottom: 5px;
        color: white;
      }

      .form-group input {
        width: 100%;
        padding: 14px 15px;
        border: none;
        border-radius: 10px;
        font-size: 16px;
        outline: none;
        box-sizing: border-box;
      }

      /* Input background and text color */
      .form-group input {
        background: #fff;
        color: #333;
      }

      /* Placeholder color */
      .form-group input::placeholder {
        color: #808080ff;
      }

      /* Input focus */
      .form-group input:focus {
        background: #f9f9f9;
        border: 1px solid #3041e4;
      }

      .submit-btn {
        width: 100%;
        padding: 14px;
        border: none;
        border-radius: 12px;
        background: linear-gradient(to right, #151f6d, #3041e4);
        color: white;
        font-size: 18px;
        font-weight: 500;
        cursor: pointer;
        transition: background 0.3s ease;
      }

      .submit-btn:hover {
        background: linear-gradient(to right, #0f1b5d, #263ccf);
      }

      .success-msg {
        margin-top: 15px;
        font-size: 16px;
        font-weight: 600;
        color: #c8facc;
        display: none;
      }

      @media (max-width: 480px) {
        .main-wrapper {
          border-radius: 0;
        }

        .form-wrapper {
          padding: 30px 20px 60px;
          margin-top: -40px;
        }

        .form-wrapper h2 {
          font-size: 20x;
        }

        .form-wrapper h2 span {
          font-size: 1.6rem;
        }

        .page-logo {
          width: 180px;
        }

        .air-hostess {
          width: 265px;
        }
      }
    </style>`;

  const html = `
    <div class="main-wrapper">
      <div class="top-section">
        <div class="page-logo">
          <img
            src="https://www.emporiumsolutions.com/wp-content/uploads/2025/07/logo-erp.png"
            alt="Emporium Logo"
            class="logo"
          />
        </div>

        <div class="air-hostess">
          <img
            src="https://www.emporiumsolutions.com/wp-content/uploads/2025/07/2girl.png"
            alt="Air Hostess"
            class="girls-img"
          />
        </div>
      </div>
      <div class="form-wrapper">
        <h2>Register now for<br /><span>Free Career Counselling</span></h2>
        <form id="registration-form">
          <div class="form-group">
            <label for="full_name">Full Name</label>
            <input type="text" id="full_name" placeholder="Enter your full name" required />
          </div>
          <div class="form-group">
            <label for="email_id">Email</label>
            <input type="email" id="email_id" placeholder="Enter your email" required />
          </div>
          <div class="form-group">
            <label for="mobile_number">Mobile Number</label>
            <input type="text" id="mobile_number" placeholder="Enter your mobile number" required />
          </div>
          <button type="submit" class="submit-btn">Register</button>
          <div class="success-msg" id="success-msg">🎉 Thank you for registering!</div>
        </form>
      </div>
    </div>`;

  // Inject styles and html
  document.head.insertAdjacentHTML('beforeend', styles);
  const container = document.querySelector('main') || document.body;
  container.innerHTML = html;

  const form = document.getElementById('registration-form');
  const successMsg = document.getElementById('success-msg');

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    successMsg.style.display = 'none';

    const full_name = document.getElementById('full_name').value.trim();
    const email_id = document.getElementById('email_id').value.trim();
    const mobile_number = document.getElementById('mobile_number').value.trim();

    if (!full_name || !email_id || !mobile_number) {
      frappe.msgprint('Please fill in all fields.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email_id)) {
      frappe.msgprint('Please enter a valid email address.');
      return;
    }

    const button = form.querySelector('button');
    button.disabled = true;
    button.textContent = 'Submitting...';

    frappe.call({
      method: 'frappe.website.doctype.web_form.web_form.accept',
      args: {
        web_form: 'registration-from',
        data: JSON.stringify({ full_name, email_id, mobile_number }),
      },
      callback: (r) => {
        if (r.message) {
          // Redirect to thank_you.html with full_name in query param
          window.location.href = `/assets/job_club/thank_you.html?name=${encodeURIComponent(full_name)}`;
        } else {
          frappe.msgprint('Something went wrong. Please try again.');
          button.disabled = false;
          button.textContent = 'Register Now';
        }
      },
    });
  });
});
