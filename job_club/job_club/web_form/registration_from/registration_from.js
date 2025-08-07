frappe.ready(() => {
    const pageStyle = `
    <link href="https://fonts.googleapis.com/css2?family=Lato:wght@400&amp;display=swap" rel="stylesheet" />
    <style>
      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        padding: 0;
        font-family: 'Lato', sans-serif;
        background: url('/assets/job_club/images/background.png') no-repeat center center fixed;
        background-size: cover;
        position: relative;
      }

      body::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.6);
        z-index: 0;
      }

      .bg-overlay {
        position: fixed;
        top: 0;
        left: 0;
        height: 100vh;
        width: 100vw;
        background: rgba(0, 0, 0, 0);
        z-index: 0;
      }

      .form-card {
        position: relative;
        z-index: 1;
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(70, 70, 70, 0.2));
        border-radius: 18px;
        padding: 24px 24px 32px 24px;
        width: 100%;
        max-width: 360px;
        margin: 8vh auto;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(14px);
        border: 1px solid rgba(255, 255, 255, 0.08);
        color: white;
        animation: fadeIn 0.6s ease-in-out;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(20px);
        }

        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .form-card .logo {
        display: block;
        margin: 0 auto 12px auto;
        max-width: 140px;
        padding: 10px;
        background: rgba(255, 255, 255, 0.85);
        border-radius: 12px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
      }

      .form-card h2 {
        text-align: center;
        font-size: 24px;
        margin: 24px 0 20px 0;
        font-weight: 600;
        color: #f3f3f3;
      }

      .form-group {
        margin-bottom: 20px;
      }

      .form-group label {
        display: block;
        margin-bottom: 6px;
        font-weight: 600;
      }

      .form-group input {
        width: 100%;
        padding: 12px 15px;
        border-radius: 10px;
        border: none;
        outline: none;
        background: rgba(255, 255, 255, 0.2);
        color: white;
        font-size: 14px;
        transition: 0.3s ease;
      }

      .form-group input::placeholder {
        color: rgba(255, 255, 255, 0.6);
      }

      .form-group input:focus {
        background: rgba(255, 255, 255, 0.3);
      }

      .submit-btn {
        display: block;
        margin: 24px auto 0 auto;
        padding: 12px 20px;
        background: #ffffff;
        color: #1e88e5;
        font-weight: bold;
        font-size: 15px;
        border: none;
        border-radius: 10px;
        cursor: pointer;
        transition: 0.3s;
      }

      .submit-btn:hover {
        animation: bounce 0.8s ease-in-out;
      }

      @keyframes bounce {

        0%,
        100% {
          transform: translateY(0);
        }

        30% {
          transform: translateY(-8px);
        }

        60% {
          transform: translateY(4px);
        }
      }

      .success-msg {
        text-align: center;
        font-size: 16px;
        margin-top: 20px;
        color: #a5ff95;
        display: none;
      }

      @media (max-width: 500px) {
        .form-card {
          margin: 5vh 20px;
        }

        .form-card h2 {
          font-size: 22px;
        }
      }
    </style> `;

    const formHTML = `
    <div class="form-card">
      <img src="/assets/job_club/images/logo-es.png" alt="Logo" class="logo">
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
    <div class="bg-overlay"></div>

  `;

    // Inject CSS & HTML
    document.head.insertAdjacentHTML("beforeend", pageStyle);
    document.querySelector("main").innerHTML = formHTML;
    });

    function submitRegistration() {
        const full_name = document.getElementById("full_name").value.trim();
        const email_id = document.getElementById("email_id").value.trim();
        const mobile_number = document.getElementById("mobile_number").value.trim();
        const successDiv = document.getElementById("success_msg");
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
            args: {
                web_form: 'registration-from',
                data: JSON.stringify({
                    full_name,
                    email_id,
                    mobile_number
                })
            },
            callback: (r) => {
                if (r.message) {
                    showStylishSuccess("🎉 Registered Successfully!");
                    button.innerText = "Submitted";
                    button.disabled = true;

                    // Optional: clear form fields
                    document.getElementById("full_name").value = "";
                    document.getElementById("email_id").value = "";
                    document.getElementById("mobile_number").value = "";

                    // ✅ Refresh the page after 2 seconds
                    setTimeout(() => {
                        location.reload();
                    }, 3000);
                } else {
                    frappe.msgprint("Something went wrong. Please try again.");
                    button.disabled = false;
                    button.innerText = "Submit";
                }
            }
        });
    }

    function showStylishSuccess(message) {
        const overlay = document.createElement("div");
        overlay.style.position = "fixed";
        overlay.style.top = "0";
        overlay.style.left = "0";
        overlay.style.width = "100vw";
        overlay.style.height = "100vh";
        overlay.style.background = "rgba(0, 0, 0, 0.4)";
        overlay.style.zIndex = "9998";
        overlay.style.display = "flex";
        overlay.style.alignItems = "center";
        overlay.style.justifyContent = "center";
        overlay.style.animation = "fadeIn 0.3s ease";

        const modal = document.createElement("div");
        modal.style.background = "linear-gradient(135deg, #1f1c2c, #928DAB)";
        modal.style.color = "#fff";
        modal.style.padding = "30px 35px";
        modal.style.borderRadius = "16px";
        modal.style.boxShadow = "0 8px 25px rgba(0, 0, 0, 0.4)";
        modal.style.textAlign = "center";
        modal.style.maxWidth = "400px";
        modal.style.animation = "slideUp 0.4s ease";

        modal.innerHTML = `
    <div style="font-size: 24px; font-weight: bold; margin-bottom: 12px;">${message}</div>
    <div style="font-size: 16px; opacity: 1; margin-bottom: 20px;">Thank you for registering with us!</div>
    <div style="font-size: 16px; opacity: 1; margin-bottom: 20px;">We’ll reach out shortly! 🚀</div>
  `;

        overlay.id = "success-overlay";
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
    }


