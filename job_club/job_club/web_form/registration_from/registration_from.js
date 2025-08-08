frappe.ready(() => {
    const pageStyle = `
    <link href="https://fonts.googleapis.com/css2?family=Lato:wght@400&display=swap" rel="stylesheet" />
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body {
        font-family: 'Lato', sans-serif;
        background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 30px 15px;
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

      /* Logo */
      .page-logo {
        text-align: center;
        margin-bottom: 10px;
        background: rgba(255, 255, 255, 0.85);
        border-radius: 12px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
      }
      .page-logo img {
        width: 200px;
        max-width: 80%;
        filter: drop-shadow(0 4px 8px rgba(0,0,0,0.4));
      }

      /* Air Hostess Image */
      .air-hostess {
        text-align: center;
        z-index: 0;
        position: relative;
      }
      .air-hostess img {
        width: 260px;
        max-width: 100%;
        height: auto;
        filter: drop-shadow(0 6px 12px rgba(0,0,0,0.5));
      }

      /* Form wrapper - pull form up to overlap image */
      .form-wrapper {
        margin-top: -60px; /* pulls form up over image */
        position: relative;
        width: 100%;
        max-width: 340px;
        z-index: 1;
      }

      /* Form card */
      .form-card {
        background: rgba(255, 255, 255, 0.08);
        border-radius: 16px;
        padding: 28px;
        width: 100%;
        backdrop-filter: blur(14px);
        border: 1px solid rgba(255, 255, 255, 0.12);
        box-shadow: 0 8px 40px rgba(0,0,0,0.4);
        color: white;
        text-align: center;
        animation: fadeUp 0.8s ease 0.2s forwards;
        opacity: 0;
      }

      @keyframes fadeUp {
        from { opacity: 0; transform: translateY(30px); }
        to { opacity: 1; transform: translateY(0); }
      }

      .form-card h2 {
        margin-bottom: 16px;
        line-height: 1.4;
        margin-top: 0rem;
        font-weight: bold;
        font-size: 1.4rem;
        color: #ffd700;
      }

      .form-group {
        margin-bottom: 14px;
        text-align: left;
      }
      .form-group label {
        font-size: 13px;
        font-weight: 600;
        display: block;
        margin-bottom: 5px;
      }
      .form-group input {
        width: 100%;
        padding: 10px 12px;
        border-radius: 8px;
        border: none;
        outline: none;
        background: rgba(255,255,255,0.15);
        color: white;
        font-size: 13px;
        transition: all 0.3s ease;
      }
      .form-group input::placeholder {
        color: rgba(255,255,255,0.6);
      }
      .form-group input:focus {
        background: rgba(255,255,255,0.25);
        box-shadow: 0 0 6px #00f2fe, 0 0 12px #4facfe;
      }

      .submit-btn {
        width: 100%;
        padding: 12px;
        border: none;
        border-radius: 10px;
        background: linear-gradient(90deg, #4facfe, #00f2fe);
        color: #1a1a1a;
        font-size: 15px;
        font-weight: 600;
        cursor: pointer;
        transition: transform 0.2s ease, box-shadow 0.3s ease;
      }
      .submit-btn:hover {
        transform: scale(1.05);
        box-shadow: 0 4px 20px rgba(0,242,254,0.5);
      }

      .success-msg {
        margin-top: 12px;
        font-size: 14px;
        color: #a5ff95;
        display: none;
      }

      /* Mobile */
      @media (max-width: 480px) {
        .page-logo img { width: 160px; }
        .air-hostess img { width: 200px; }
        .form-wrapper { margin-top: -60px; }
        .form-card { padding-top: 20px; }
      }
    </style>`;

    const formHTML = `
    <div class="page-logo">
      <img src="https://www.emporiumsolutions.com/wp-content/uploads/2025/07/logo-erp.png" alt="Emporium Logo">
    </div>
    <div class="air-hostess">
      <img src="https://www.emporiumsolutions.com/wp-content/uploads/2025/07/2girl.png" alt="Air Hostess">
    </div>
    <div class="form-wrapper">
      <div class="form-card">
        <h2>Free Career Counselling</h2>
        <div class="form-group">
          <label for="full_name">Full Name</label>
          <input type="text" id="full_name" placeholder="Enter your full name">
        </div>
        <div class="form-group">
          <label for="email_id">Email</label>
          <input type="email" id="email_id" placeholder="Enter your email">
        </div>
        <div class="form-group">
          <label for="mobile_number">Mobile Number</label>
          <input type="text" id="mobile_number" placeholder="Enter your mobile number">
        </div>
        <button class="submit-btn" onclick="submitRegistration()">Register Now</button>
        <div class="success-msg" id="success_msg">🎉 Thank you for registering!</div>
      </div>
    </div>`;

    document.head.insertAdjacentHTML("beforeend", pageStyle);
    document.querySelector("main").innerHTML = formHTML;
});

function submitRegistration() {
    const full_name = document.getElementById("full_name").value.trim();
    const email_id = document.getElementById("email_id").value.trim();
    const mobile_number = document.getElementById("mobile_number").value.trim();
    const button = document.querySelector(".submit-btn");

    if (!full_name || !email_id || !mobile_number) {
        frappe.msgprint("Please fill in all fields.");
        return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email_id)) {
        frappe.msgprint("Please enter a valid email address.");
        return;
    }

    button.disabled = true;
    button.innerText = "Submitting...";

    frappe.call({
        method: 'frappe.website.doctype.web_form.web_form.accept',
        args: { web_form: 'registration-from', data: JSON.stringify({ full_name, email_id, mobile_number }) },
        callback: (r) => {
            if (r.message) {
                window.location.href = `/assets/job_club/thank_you.html?name=${encodeURIComponent(full_name)}`;
            } else {
                frappe.msgprint("Something went wrong. Please try again.");
                button.disabled = false;
                button.innerText = "Register Now";
            }
        }
    });
}
