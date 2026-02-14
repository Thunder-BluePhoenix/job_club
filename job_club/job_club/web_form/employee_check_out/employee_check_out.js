frappe.ready(function () {
  let employeeData = null;
  let branchCoords = null;
  let userLocation = null;
  let distance = null;
  let watchId = null;

  // Custom Styles (Red/Orange theme for Checkout)
  const style = document.createElement('style');
  style.textContent = `
    body {
      background: linear-gradient(135deg, #1e3a8a 0%, #c2410c 50%, #991b1b 100%) !important;
      min-height: 100vh;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .form-section, .page-header, .breadcrumb-container, .navbar {
      display: none !important;
    }

    .attendance-container {
      max-width: 380px;
      margin: 30px auto;
      padding: 15px;
    }

    .attendance-card {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 24px;
      padding: 25px;
      box-shadow: 0 15px 40px rgba(0, 0, 0, 0.25);
      color: white;
      margin-bottom: 20px;
    }

    .attendance-header {
      text-align: center;
      margin-bottom: 20px;
    }

    .attendance-header h1 {
      font-size: 1.75rem;
      font-weight: bold;
      margin-bottom: 8px;
      margin-top: 1rem;
      color: white;
    }

    .attendance-clock {
      background: rgba(0, 0, 0, 0.2);
      border-radius: 16px;
      padding: 15px;
      text-align: center;
      margin-bottom: 20px;
      border: 1px solid rgba(255, 255, 255, 0.15);
    }

    .attendance-clock-time {
      font-size: 30px;
      font-weight: bold;
    }

    .attendance-info-grid {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .attendance-info-item {
      display: flex;
      align-items: center;
      gap: 12px;
      background: rgba(0, 0, 0, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 14px;
      padding: 14px;
    }

    .attendance-submit-btn {
      width: 100%;
      padding: 18px;
      border: none;
      border-radius: 16px;
      font-size: 1rem;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
      margin-top: 20px;
    }

    .attendance-submit-btn:not(:disabled) {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      color: white;
    }
    
    .attendance-submit-btn:hover:not(:disabled) {
       transform: scale(1.02);
       box-shadow: 0 10px 30px rgba(220, 38, 38, 0.4);
    }

    .attendance-spinner {
      border: 3px solid rgba(255, 255, 255, 0.3);
      border-top: 3px solid white;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      animation: spin 1s linear infinite;
    }

    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  `;
  document.head.appendChild(style);

  // Clear body and build UI
  const container = document.createElement('div');
  container.className = 'attendance-container';
  container.innerHTML = `
    <div class="attendance-card">
      <div class="attendance-header">
        <h1>Check Out</h1>
        <p id="currentDate"></p>
      </div>

      <div class="attendance-clock">
        <div class="attendance-clock-time" id="currentTime">--:--:--</div>
      </div>

      <div class="attendance-info-grid">
         <div class="attendance-info-item">
            <div style="flex:1">
               <div style="font-size:0.75rem; opacity:0.8">Employee Name</div>
               <div style="font-weight:600" id="employeeName">Loading...</div>
               <div style="font-size:0.75rem; opacity:0.8; margin-top: 8px;">Employee ID</div>
               <div style="font-weight:600; opacity: 0.9;" id="employeeID">Loading...</div>
            </div>
         </div>
         <div class="attendance-info-item">
            <div style="flex:1">
               <div style="font-size:0.75rem; opacity:0.8">Branch</div>
               <div style="font-weight:600" id="branchName">Loading...</div>
            </div>
         </div>
      </div>
    </div>

    <button class="attendance-submit-btn" id="checkoutBtn" disabled>
       <div class="attendance-spinner"></div>
       <span>Loading...</span>
    </button>
  `;

  document.body.innerHTML = '';
  document.body.appendChild(container);

  // Clock
  function updateClock() {
    const now = new Date();
    document.getElementById('currentTime').innerText = now.toLocaleTimeString();
    document.getElementById('currentDate').innerText = now.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }
  setInterval(updateClock, 1000);
  updateClock();

  // Load Employee Info
  frappe.call({
    method: 'job_club.api.employee_attendance.get_employee_branch',
    callback: (r) => {
      if (r.message && !r.message.error) {
        employeeData = r.message;
        document.getElementById('employeeName').innerText = r.message.employee_name;
        document.getElementById('employeeID').innerText = r.message.employee;
        document.getElementById('branchName').innerText = r.message.branch;

        enableCheckout();
      } else {
        document.getElementById('checkoutBtn').innerText = "Error Loading Employee";
      }
    }
  });

  function enableCheckout() {
    const btn = document.getElementById('checkoutBtn');
    btn.innerHTML = '<span>Checking Out...</span>';

    // We can enable the button now
    btn.innerHTML = '<span>Confirm Check Out</span>';
    btn.disabled = false;
    btn.onclick = performCheckout;
  }

  function performCheckout() {
    const btn = document.getElementById('checkoutBtn');
    btn.disabled = true;
    btn.innerHTML = '<div class="attendance-spinner"></div><span>Checking Out...</span>';

    frappe.call({
      method: 'job_club.api.attendance.mark_attendance',
      freeze: true,
      callback: function (r) {
        if (r.message && r.message.status === "Checked Out") {
          // Success
          btn.innerHTML = '<span>Checked Out!</span>';
          btn.style.background = '#10b981';
          btn.style.color = 'white';

          // Redirect after short delay
          setTimeout(() => {
            window.location.href = "/app/admin-dashboard";
          }, 1500);
        } else {
          btn.disabled = false;
          btn.innerHTML = '<span>Failed. Try Again</span>';
          frappe.msgprint(r.message ? r.message.message : "Error checking out");
        }
      },
      error: function (err) {
        console.error(err);
        btn.disabled = false;
        btn.innerHTML = '<span>Error. Try Again</span>';
      }
    });
  }

});
