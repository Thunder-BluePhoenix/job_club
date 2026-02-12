frappe.ready(function () {
  let employeeData = null;
  let branchCoords = null;
  let userLocation = null;
  let distance = null;
  let watchId = null; // For continuous GPS tracking
  let employeeDepartment = null;

  // Inject custom styles
  const style = document.createElement('style');
  style.textContent = `
    body {
      background: linear-gradient(135deg, #1e40af 0%, #7c3aed 50%, #db2777 100%) !important;
      min-height: 100vh;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .form-section, .page-header, .breadcrumb-container {
      display: none !important;
    }

    .attendance-container {
      max-width: 380px;
      margin: 30px auto;
      padding: 15px;
    }

    .attendance-card {
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%);
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

    .attendance-header p {
      font-size: 14px;
      font-weight: 500;
    }

    .attendance-clock {
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%);
      border-radius: 16px;
      padding: 15px;
      text-align: center;
      margin-bottom: 20px;
      border: 1px solid rgba(255, 255, 255, 0.15);
      background-color: #1e3a8a;
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
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(124, 58, 237, 0.2) 100%);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 14px;
      padding: 14px;
      background-color: #1e3a8a;
    }

    .attendance-info-icon {
      width: 20px;
      height: 20px;
      flex-shrink: 0;
    }

    .attendance-info-content {
      flex: 1;
    }

    .attendance-info-label {
      font-size: 0.75rem;
      opacity: 0.7;
      margin-bottom: 4px;
    }

    .attendance-info-value {
      font-size: 0.95rem;
      font-weight: 600;
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
    }

    .attendance-submit-btn:not(:disabled) {
      background: linear-gradient(135deg, #FFFFFF 0%, #F3F4F6 100%);
      color: #1e40af;
    }

    .attendance-submit-btn:not(:disabled):hover {
      transform: scale(1.03);
      box-shadow: 0 12px 35px rgba(0, 0, 0, 0.3);
    }

    .attendance-submit-btn:disabled {
      background: linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%);
      color: white;
      cursor: not-allowed;
    }

    .attendance-status-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 24px;
      border-radius: 50px;
      font-weight: 600;
      font-size: 0.875rem;
      margin-bottom: 10px;
    }

    .attendance-status-badge.success {
      background: #10b981;
      color: white;
    }

    .attendance-status-badge.warning {
      background: #f59e0b;
      color: white;
    }

    .attendance-popup-overlay {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      z-index: 9999;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .attendance-popup-overlay.error {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    }

    .attendance-popup-overlay.info {
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    }

    .attendance-popup-overlay.show {
      display: flex !important;
      animation: fadeIn 0.3s ease;
    }

    .attendance-popup-content {
      background: white;
      border-radius: 24px;
      padding: 35px;
      text-align: center;
      max-width: 420px;
      width: 100%;
      animation: bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }

    .attendance-popup-icon {
      width: 80px;
      height: 80px;
      margin: 0 auto 20px;
      animation: scaleIn 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }

    .attendance-popup-title {
      font-size: 2rem;
      font-weight: bold;
      color: #1f2937;
      margin-top: -6px;
    }

    .attendance-popup-details {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin: 20px 0;
    }

    .attendance-popup-detail {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      color: #6b7280;
      font-size: 0.95rem;
    }

    .attendance-popup-status {
      padding: 8px 24px;
      border-radius: 50px;
      font-weight: 600;
      font-size: 0.95rem;
    }

    .attendance-popup-status.present {
      background: #d1fae5;
      color: #065f46;
    }

    .attendance-popup-status.outside {
      background: #fed7aa;
      color: #92400e;
    }

    .attendance-popup-btn {
      padding: 16px 40px;
      border: none;
      border-radius: 50px;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
      color: white;
    }

    .attendance-popup-btn.success {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    }

    .attendance-popup-btn.error {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    }

    .attendance-popup-btn.info {
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    }

    .attendance-popup-btn:hover {
      transform: scale(1.05);
    }

    .attendance-spinner {
      border: 3px solid rgba(255, 255, 255, 0.3);
      border-top: 3px solid white;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      animation: spin 1s linear infinite;
    }

    .attendance-hidden {
      display: none !important;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes bounceIn {
      0% {
        transform: scale(0);
        opacity: 0;
      }
      50% {
        transform: scale(1.1);
      }
      100% {
        transform: scale(1);
        opacity: 1;
      }
    }

    @keyframes scaleIn {
      0% {
        transform: scale(0);
      }
      50% {
        transform: scale(1.2);
      }
      100% {
        transform: scale(1);
      }
    }

    @media (max-width: 640px) {
      .attendance-header h1 {
        font-size: 2rem;
      }
      .attendance-popup-content {
        padding: 30px;
      }
    }
  `;
  document.head.appendChild(style);

  // Create UI
  const container = document.createElement('div');
  container.className = 'attendance-container';
  container.innerHTML = `
    <div class="attendance-card">
      <div class="attendance-header">
        <h1>Employee Attendance</h1>
        <p id="currentDate"></p>
      </div>

      <div class="attendance-clock">
        <div class="attendance-clock-time" id="currentTime"></div>
      </div>

      <div class="attendance-info-grid">
        <div class="attendance-info-item">
          <svg class="attendance-info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
          </svg>
          <div class="attendance-info-content">
            <div class="attendance-info-label">Employee ID</div>
            <div class="attendance-info-value" id="employeeID">---</div>
          </div>
        </div>

        <div class="attendance-info-item">
          <svg class="attendance-info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
          </svg>
          <div class="attendance-info-content">
            <div class="attendance-info-label">Department</div>
            <div class="attendance-info-value" id="employeeDept">---</div>
          </div>
        </div>

        <div class="attendance-info-item">
          <svg class="attendance-info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
          <div class="attendance-info-content">
            <div class="attendance-info-label">Branch</div>
            <div class="attendance-info-value" id="branchName">---</div>
          </div>
        </div>
      </div>
    </div>

    <div style="text-align: center;">
      <div class="attendance-status-badge attendance-hidden" id="statusBadge"></div>
    </div>

    <button class="attendance-submit-btn" id="submitBtn" disabled>
      <div class="attendance-spinner"></div>
      <span>Detecting Location...</span>
    </button>

    <div style="text-align: center; margin-top: 15px;">
      <p class="attendance-restriction-text attendance-hidden" id="restrictionText" style="color: rgba(255, 255, 255, 0.9); font-size: 0.85rem; font-weight: 500;">
        ⚠️ You must be within office zone to mark attendance
      </p>
    </div>
  `;

  // Create popup
  const popup = document.createElement('div');
  popup.className = 'attendance-popup-overlay';
  popup.id = 'attendancePopup';
  popup.innerHTML = `
    <div class="attendance-popup-content">
      <div id="popupIcon"></div>
      <h2 class="attendance-popup-title" id="popupTitle"></h2>
      <div class="attendance-popup-details" id="popupDetails"></div>
      <button class="attendance-popup-btn" id="popupBtn">Done</button>
    </div>
  `;

  // Replace form content
  document.body.innerHTML = '';
  document.body.appendChild(container);
  document.body.appendChild(popup);

  // Update clock
  function updateClock() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    const dateStr = now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    document.getElementById('currentTime').textContent = timeStr;
    document.getElementById('currentDate').textContent = dateStr;
  }

  updateClock();
  setInterval(updateClock, 1000);

  // Check if attendance already marked today
  function checkTodayAttendance(employee) {
    frappe.call({
      method: 'job_club.api.employee_attendance.check_today_attendance',
      args: {
        employee: employee
      },
      callback: (r) => {
        if (r.message && r.message.already_marked) {
          showAlreadyMarked(r.message);
        }
      },
      error: (err) => {
        console.error('Error checking attendance:', err);
      }
    });
  }

  // Fetch employee department
  function fetchEmployeeDepartment(employee) {
    frappe.call({
      method: 'job_club.api.employee_attendance.get_employee_department',
      args: {
        employee: employee
      },
      callback: (r) => {
        if (r.message && r.message.department) {
          employeeDepartment = r.message.department;
          document.getElementById('employeeDept').textContent = employeeDepartment;
        } else {
          document.getElementById('employeeDept').textContent = 'Not Assigned';
        }
      },
      error: (err) => {
        console.error('Error fetching department:', err);
        document.getElementById('employeeDept').textContent = 'Error';
      }
    });
  }

  // Fetch employee and branch
  setTimeout(() => {
    frappe.call({
      method: 'job_club.api.employee_attendance.get_employee_branch',
      callback: (r) => {
        if (r.message && !r.message.error) {
          employeeData = r.message;
          document.getElementById('employeeID').textContent = employeeData.employee;
          document.getElementById('branchName').textContent = employeeData.branch;

          fetchBranchCoordinates(employeeData.branch);
          fetchEmployeeDepartment(employeeData.employee);
          checkTodayAttendance(employeeData.employee);
        } else {
          showError(r.message?.error || 'Unable to fetch employee/branch.');
        }
      },
      error: (err) => {
        console.error('Error:', err);
        showError('Error fetching employee/branch data.');
      }
    });

    // Start location capture immediately in parallel
    captureLocation();
  }, 300);

  function fetchBranchCoordinates(branch) {
    console.log('📍 Fetching branch coordinates for:', branch);

    frappe.call({
      method: 'job_club.api.employee_attendance.get_branch_coordinates',
      args: {
        branch_name: branch
      },
      callback: (r) => {
        if (r.message && !r.message.error) {
          branchCoords = {
            latitude: parseFloat(r.message.latitude),
            longitude: parseFloat(r.message.longitude)
          };

          // Validate coordinates
          if (isNaN(branchCoords.latitude) || isNaN(branchCoords.longitude)) {
            console.error('❌ Invalid branch coordinates:', r.message);
            showError('Invalid branch coordinates received.');
            return;
          }

          console.log('✓ Branch coordinates:', branchCoords);

          // If user location already captured, calculate immediately
          if (userLocation) {
            console.log('✓ User location already available, calculating...');
            calculateDistance();
            enableSubmitButton();
          } else {
            console.log('⏳ Waiting for user location...');
          }
        } else {
          showError(r.message?.error || 'Unable to fetch branch coordinates.');
        }
      },
      error: (err) => {
        console.error('❌ API Error:', err);
        showError('Failed to fetch branch coordinates.');
      }
    });
  }

  function captureLocation() {
    if (!navigator.geolocation) {
      showError('Geolocation is not supported by your browser.');
      return;
    }

    // Show loading immediately
    document.getElementById('submitBtn').innerHTML = '<div class="attendance-spinner"></div><span>Getting GPS Location...</span>';

    // First, get initial position quickly
    navigator.geolocation.getCurrentPosition(
      (position) => {
        updateLocation(position);
        console.log('✓ Initial location captured');

        // Then start continuous watching
        startContinuousTracking();
      },
      (error) => {
        console.error('❌ Initial geolocation error:', error);
        // Even if initial fails, try continuous tracking
        startContinuousTracking();
      }, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
    );
  }

  function startContinuousTracking() {
    console.log('🔄 Starting continuous GPS tracking...');

    // Watch position continuously - updates every time GPS changes
    watchId = navigator.geolocation.watchPosition(
      (position) => {
        updateLocation(position);
      },
      (error) => {
        console.error('❌ GPS tracking error:', error);
        let errorMsg = 'GPS tracking error. Please check your location settings.';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMsg = 'Location permission denied. Please enable location access.';
            if (watchId) navigator.geolocation.clearWatch(watchId);
            showError(errorMsg);
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg = 'Location unavailable. Retrying...';
            console.warn('⚠️', errorMsg);
            break;
          case error.TIMEOUT:
            console.warn('⚠️ GPS timeout, continuing to track...');
            break;
        }
      }, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0 // Always fresh data
    }
    );
  }

  function updateLocation(position) {
    const newLocation = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy
    };

    // Only update if location actually changed or first time
    const hasChanged = !userLocation ||
      Math.abs(userLocation.latitude - newLocation.latitude) > 0.000001 ||
      Math.abs(userLocation.longitude - newLocation.longitude) > 0.000001;

    if (hasChanged) {
      userLocation = newLocation;
      console.log('📍 Location updated:', {
        lat: userLocation.latitude.toFixed(6),
        lng: userLocation.longitude.toFixed(6),
        accuracy: '±' + Math.round(userLocation.accuracy) + 'm',
        time: new Date().toLocaleTimeString()
      });

      // Calculate distance immediately if branch coords available
      if (branchCoords) {
        calculateDistance();
        enableSubmitButton();
      } else {
        console.log('⏳ Waiting for branch coordinates...');
      }
    }
  }

  function calculateDistance() {
    // Validate both coordinates exist
    if (!userLocation || !branchCoords) {
      console.warn('⚠️ Missing coordinates for calculation');
      return;
    }

    if (isNaN(userLocation.latitude) || isNaN(userLocation.longitude) ||
      isNaN(branchCoords.latitude) || isNaN(branchCoords.longitude)) {
      console.error('❌ Invalid coordinates for calculation');
      showError('Invalid location data. Please refresh and try again.');
      return;
    }

    const R = 6371000; // Earth radius in meters
    const toRad = (deg) => deg * (Math.PI / 180);

    const lat1 = userLocation.latitude;
    const lon1 = userLocation.longitude;
    const lat2 = branchCoords.latitude;
    const lon2 = branchCoords.longitude;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    distance = R * c;

    console.log('📏 Distance Calculation:');
    console.log('  User Location:', lat1.toFixed(6), lon1.toFixed(6));
    console.log('  Branch Location:', lat2.toFixed(6), lon2.toFixed(6));
    console.log('  Calculated Distance:', distance.toFixed(2), 'meters');
    console.log('  GPS Accuracy: ±' + Math.round(userLocation.accuracy) + 'm');

    const statusBadge = document.getElementById('statusBadge');
    const restrictionText = document.getElementById('restrictionText');

    statusBadge.classList.remove('attendance-hidden');

    const zoneRadius = employeeData?.attendance_radius || 200;
    const isWithinZone = distance <= zoneRadius;

    if (isWithinZone) {
      statusBadge.className = 'attendance-status-badge success';
      statusBadge.innerHTML = '<svg style="width:20px;height:20px" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> Within Office Zone';
      restrictionText.classList.add('attendance-hidden');
      console.log('✓ Status: Within Office Zone - Attendance allowed');
    } else {
      statusBadge.className = 'attendance-status-badge warning';
      statusBadge.innerHTML = '<svg style="width:20px;height:20px" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg> Outside Office Zone';
      restrictionText.classList.remove('attendance-hidden');
      console.log('⚠️ Status: Outside Office Zone - Attendance blocked');
    }

    // Update button state based on zone
    updateButtonState(isWithinZone);
  }

  function updateButtonState(isWithinZone) {
    const btn = document.getElementById('submitBtn');

    if (isWithinZone) {
      btn.disabled = false;
      btn.style.opacity = '1';
      btn.style.cursor = 'pointer';
    } else {
      btn.disabled = true;
      btn.style.opacity = '0.5';
      btn.style.cursor = 'not-allowed';
    }
  }

  function enableSubmitButton() {
    const btn = document.getElementById('submitBtn');
    const zoneRadius = employeeData?.attendance_radius || 200;
    const isWithinZone = distance <= zoneRadius;

    btn.innerHTML = '<svg style="width:24px;height:24px" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg><span>Mark My Attendance</span>';
    btn.onclick = submitAttendance;

    // Only enable if within zone
    if (isWithinZone) {
      btn.disabled = false;
      btn.style.opacity = '1';
      btn.style.cursor = 'pointer';
    } else {
      btn.disabled = true;
      btn.style.opacity = '0.5';
      btn.style.cursor = 'not-allowed';
    }
  }

  function submitAttendance() {
    // Double-check zone restriction before submitting
    const zoneRadius = employeeData?.attendance_radius || 200;
    if (distance > zoneRadius) {
      showError('You must be within office zone to mark attendance.');
      return;
    }

    const btn = document.getElementById('submitBtn');
    btn.disabled = true;
    btn.innerHTML = '<div class="attendance-spinner"></div><span>Submitting...</span>';

    // Stop GPS tracking when submitting
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      console.log('🛑 GPS tracking stopped for submission');
    }

    frappe.call({
      method: 'job_club.api.employee_attendance.mark_attendance',
      args: {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        employee: employeeData.employee,
        branch: employeeData.branch,
        distance: distance ? distance.toFixed(2) : null
      },
      callback: (r) => {
        if (r.message && !r.message.error && !r.message.outside_zone) {
          if (r.message.already_marked) {
            showAlreadyMarked(r.message);
          } else {
            showSuccess(r.message);
          }
        } else {
          showError(r.message?.error || r.message || 'Failed to mark attendance.');
        }
      },
      error: (err) => {
        console.error('Submission error:', err);
        showError('Failed to mark attendance. Please try again.');
      }
    });
  }

  function showSuccess(data) {
    const popupEl = document.getElementById('attendancePopup');
    const icon = document.getElementById('popupIcon');
    const title = document.getElementById('popupTitle');
    const details = document.getElementById('popupDetails');
    const btn = document.getElementById('popupBtn');

    icon.innerHTML = '<svg class="attendance-popup-icon" fill="none" stroke="#10b981" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>';
    title.textContent = 'Attendance Marked!';

    const status = data.status || 'Present';
    const statusClass = 'present';

    // Format time nicely
    let displayTime = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    // If backend sends time, use it
    if (data.time) {
      const timeParts = data.time.split(':');
      if (timeParts.length >= 3) {
        const hour = parseInt(timeParts[0]);
        const minute = timeParts[1];
        const second = timeParts[2].split('.')[0]; // Remove microseconds if present
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        displayTime = `${hour12}:${minute}:${second} ${ampm}`;
      }
    }

    details.innerHTML = `
      <div class="attendance-popup-detail">
        <div class="attendance-popup-status ${statusClass}">${status}</div>
      </div>
      <div class="attendance-popup-detail">
        <svg style="width:20px;height:20px" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        <span>Within Office Zone</span>
      </div>
      <div class="attendance-popup-detail">
        <svg style="width:20px;height:20px" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        <span>${displayTime}</span>
      </div>
    `;

    btn.className = 'attendance-popup-btn success';
    btn.onclick = () => window.location.reload();

    popupEl.classList.remove('error');
    popupEl.classList.remove('info');
    popupEl.classList.add('show');
  }

  function showAlreadyMarked(data) {
    const popupEl = document.getElementById('attendancePopup');
    const icon = document.getElementById('popupIcon');
    const title = document.getElementById('popupTitle');
    const details = document.getElementById('popupDetails');
    const btn = document.getElementById('popupBtn');

    icon.innerHTML = '<svg class="attendance-popup-icon" fill="none" stroke="#3b82f6" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>';
    title.textContent = 'Already Marked!';

    const status = data.status || 'Present';
    const statusClass = status === 'Present' ? 'present' : 'outside';

    // Format time nicely
    let displayTime = 'Earlier today';
    if (data.time) {
      const timeStr = data.time.toString();
      const timeParts = timeStr.split(':');
      if (timeParts.length >= 3) {
        const hour = parseInt(timeParts[0]);
        const minute = timeParts[1];
        const second = timeParts[2].split('.')[0]; // Remove microseconds if present
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        displayTime = `${hour12}:${minute}:${second} ${ampm}`;
      }
    }

    // Determine location status
    const locationStatus = status === 'Present' ? 'Within Office Zone' : 'Outside Office Zone';

    details.innerHTML = `
      <div class="attendance-popup-detail" style="color:#6b7280;font-size:1.1rem">
        Attendance already marked for today
      </div>
      <div class="attendance-popup-detail">
        <div class="attendance-popup-status ${statusClass}">${status}</div>
      </div>
      <div class="attendance-popup-detail">
        <svg style="width:20px;height:20px" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg>
        <span>${locationStatus}</span>
      </div>
      <div class="attendance-popup-detail">
        <svg style="width:20px;height:20px" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        <span>${displayTime}</span>
      </div>
    `;

    btn.className = 'attendance-popup-btn info';
    btn.textContent = 'OK';
    btn.onclick = () => window.location.reload();

    popupEl.classList.remove('error');
    popupEl.classList.add('info');
    popupEl.classList.add('show');
  }

  function showError(message) {
    const popupEl = document.getElementById('attendancePopup');
    const icon = document.getElementById('popupIcon');
    const title = document.getElementById('popupTitle');
    const details = document.getElementById('popupDetails');
    const btn = document.getElementById('popupBtn');

    icon.innerHTML = '<svg class="attendance-popup-icon" fill="none" stroke="#ef4444" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>';
    title.textContent = 'Oops!';
    details.innerHTML = `<div class="attendance-popup-detail" style="color:#6b7280;font-size:1.1rem">${message}</div>`;

    btn.className = 'attendance-popup-btn error';
    btn.textContent = 'Try Again';
    btn.onclick = () => window.location.reload();

    popupEl.classList.remove('info');
    popupEl.classList.add('error');
    popupEl.classList.add('show');
  }
});