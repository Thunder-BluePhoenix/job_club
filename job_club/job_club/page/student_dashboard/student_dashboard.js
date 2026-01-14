frappe.pages['student-dashboard'].on_page_load = function (wrapper) {
	frappe.require('assets/job_club/css/student_portal.css');
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Student Dashboard',
		single_column: true
	});

	new StudentDashboard(page);
}

class StudentDashboard {
	constructor(page) {
		this.page = page;
		this.wrapper = $(this.page.body);
		this.setup();
	}

	setup() {
		this.wrapper.html(`
			<div class="student-dashboard-container student-portal-wrapper">
				<div class="loader-container">
					<div class="premium-loader"></div>
					<div class="loader-text">Preparing your dashboard...</div>
				</div>
			</div>
		`);

		this.load_dashboard_data();
	}

	load_dashboard_data() {
		frappe.call({
			method: 'job_club.api.student_portal_api.get_student_dashboard_data',
			callback: (r) => {
				if (r.message) {
					this.data = r.message;
					this.render_dashboard();
				} else {
					this.show_error("Unable to load dashboard data");
				}
			},
			error: (r) => {
				this.show_error("Error loading dashboard. Please ensure you have a student record.");
			}
		});
	}

	render_dashboard() {
		const data = this.data;
		const student = data.student_info;
		const stats = data.quick_stats;

		this.wrapper.html(`
			<div class="student-dashboard-container student-portal-wrapper">
				<!-- Welcome Header -->
				<div class="welcome-header">
					<div class="welcome-content">
						<div class="student-avatar">
							${student.image ?
				`<img src="${student.image}" alt="${student.student_name}">` :
				`<div class="avatar-placeholder">${this.get_initials(student.student_name)}</div>`
			}
						</div>
						<div class="welcome-text">
							<h1>Welcome back, ${student.first_name}!👋</h1>
							<div class="student-meta">
								<p class="subtitle"><i class="fa fa-graduation-cap"></i> ${student.enrollment.program_name || 'Student Portal'}</p>
								<div class="meta-badges">
									${student.enrollment.branch ? `<span class="meta-badge branch-badge"><i class="fa fa-building"></i> ${student.enrollment.branch}</span>` : ''}
									${student.enrollment.batch ? `<span class="meta-badge batch-badge"><i class="fa fa-users"></i> ${student.enrollment.batch}</span>` : ''}
								</div>
							</div>
						</div>
					</div>
					<div class="header-actions">
						<a href="/mark-attendance" class="btn btn-primary btn-mark-attendance">
							<i class="fa fa-check-square-o"></i> Mark Attendance
						</a>
					</div>
				</div>
				
				<!-- Quick Stats Cards -->
				<div class="stats-grid">
					<div class="stat-card attendance-card">
						<div class="stat-icon">
							<i class="fa fa-calendar-check-o"></i>
						</div>
						<div class="stat-content">
							<div class="stat-value">${stats.attendance_percentage}%</div>
							<div class="stat-label">Attendance</div>
							<div class="stat-progress">
								<div class="progress">
									<div class="progress-bar ${this.get_attendance_class(stats.attendance_percentage)}" 
										style="width: ${stats.attendance_percentage}%"></div>
								</div>
							</div>
						</div>
					</div>
					
					<div class="stat-card courses-card">
						<div class="stat-icon">
							<i class="fa fa-book"></i>
						</div>
						<div class="stat-content">
							<div class="stat-value">${stats.courses_enrolled}</div>
							<div class="stat-label">Courses Enrolled</div>
							<a href="#" class="stat-link" onclick="window.scrollTo({top: document.querySelector('.courses-section').offsetTop - 100, behavior: 'smooth'}); return false;">
								View Courses →
							</a>
						</div>
					</div>
					
					<div class="stat-card fees-card">
						<div class="stat-icon">
							<i class="fa fa-money"></i>
						</div>
						<div class="stat-content">
							<div class="stat-value">₹${this.format_currency(stats.pending_fees)}</div>
							<div class="stat-label">Pending Fees</div>
							${stats.pending_fees > 0 ?
				'<span class="badge badge-warning">Payment Due</span>' :
				'<span class="badge badge-success">All Clear</span>'
			}
						</div>
					</div>
				</div>
				
				<!-- Main Content Grid -->
				<div class="dashboard-grid">
					<!-- Left Column -->
					<div class="dashboard-left">
						<!-- Courses Section -->
						<div class="dashboard-card courses-section">
							<div class="card-header">
								<h3><i class="fa fa-book"></i> My Courses</h3>
							</div>
							<div class="card-body">
								${this.render_courses(data.courses)}
							</div>
						</div>

						<!-- Attendance Widget -->
						<div class="dashboard-card attendance-widget">
							<div class="card-header">
								<h3><i class="fa fa-calendar"></i> Attendance Overview</h3>
								<a href="/app/attendance-view" class="btn btn-sm btn-default">View Details</a>
							</div>
							<div class="card-body">
								${this.render_attendance_chart(data.attendance_summary)}
							</div>
						</div>
					</div>
					
					<!-- Right Column -->
					<div class="dashboard-right">
						<!-- Upcoming Events -->
						<div class="dashboard-card events-widget">
							<div class="card-header">
								<h3><i class="fa fa-bell"></i> Upcoming Events</h3>
							</div>
							<div class="card-body">
								${this.render_events(data.upcoming_events)}
							</div>
						</div>
						
						<!-- Fee Status -->
						<div class="dashboard-card fee-widget">
							<div class="card-header">
								<h3><i class="fa fa-money"></i> Fee Status</h3>
								<a href="/app/fees-portal" class="btn btn-sm btn-default">View All</a>
							</div>
							<div class="card-body">
								${this.render_fee_summary(data.fee_status)}
							</div>
						</div>
					</div>
				</div>
			</div>
		`);

		// Initialize charts after DOM is ready
		setTimeout(() => {
			this.setup_charts(data);
		}, 100);
	}

	setup_charts(data) {
		if (!data.attendance_summary) return;

		const attendance = data.attendance_summary;

		// Create custom donut chart
		this.create_donut_chart(attendance);

		// Create custom bar chart
		this.create_bar_chart(attendance);
	}

	create_donut_chart(attendance) {
		const present = attendance.present_days || 0;
		const absent = attendance.absent_days || 0;
		const leave = attendance.leave_days || 0;
		const total = present + absent + leave || 1;

		const presentPercent = (present / total * 100).toFixed(1);
		const absentPercent = (absent / total * 100).toFixed(1);
		const leavePercent = (leave / total * 100).toFixed(1);

		// Calculate angles for SVG arc
		const presentAngle = (present / total) * 360;
		const absentAngle = (absent / total) * 360;
		const leaveAngle = (leave / total) * 360;

		// Create SVG paths
		const radius = 80;
		const innerRadius = 50;
		const centerX = 100;
		const centerY = 100;

		// Helper function to create arc path
		const createArc = (startAngle, endAngle, color) => {
			const start = this.polarToCartesian(centerX, centerY, radius, endAngle);
			const end = this.polarToCartesian(centerX, centerY, radius, startAngle);
			const innerStart = this.polarToCartesian(centerX, centerY, innerRadius, endAngle);
			const innerEnd = this.polarToCartesian(centerX, centerY, innerRadius, startAngle);

			const largeArc = endAngle - startAngle <= 180 ? 0 : 1;

			return `
				<path d="M ${start.x} ${start.y}
					A ${radius} ${radius} 0 ${largeArc} 0 ${end.x} ${end.y}
					L ${innerEnd.x} ${innerEnd.y}
					A ${innerRadius} ${innerRadius} 0 ${largeArc} 1 ${innerStart.x} ${innerStart.y}
					Z"
					fill="${color}"
					stroke="white"
					stroke-width="2"
					opacity="0.9"
					style="transition: opacity 0.3s ease;"
					onmouseover="this.style.opacity='1'"
					onmouseout="this.style.opacity='0.9'"
				/>
			`;
		};

		let currentAngle = 0;
		const arcs = [];

		if (present > 0) {
			arcs.push(createArc(currentAngle, currentAngle + presentAngle, '#10B981'));
			currentAngle += presentAngle;
		}
		if (absent > 0) {
			arcs.push(createArc(currentAngle, currentAngle + absentAngle, '#EF4444'));
			currentAngle += absentAngle;
		}
		if (leave > 0) {
			arcs.push(createArc(currentAngle, currentAngle + leaveAngle, '#3182ce'));
		}

		const svg = `
			<svg viewBox="0 0 200 200" style="width: 100%; height: 100%;">
				${arcs.join('')}
			</svg>
		`;

		const chartEl = this.wrapper.find('.custom-donut-chart');
		if (chartEl.length) {
			chartEl.html(svg);
		}
	}

	create_bar_chart(attendance) {
		const days = Array.from({ length: 31 }, (_, i) => i + 1);
		const dayData = {};

		// Process calendar data
		if (attendance.calendar_data && Array.isArray(attendance.calendar_data)) {
			attendance.calendar_data.forEach(item => {
				try {
					const date_parts = item.date.split('-');
					const day = parseInt(date_parts[2]);
					if (day >= 1 && day <= 31) {
						dayData[day] = item.status;
					}
				} catch (e) {
					console.warn('Error processing date:', e);
				}
			});
		}

		// Create bars HTML
		const barsHtml = days.map(day => {
			const status = dayData[day];
			let barClass = '';
			let height = '8px';
			let tooltip = 'No record';

			if (status === 'Present') {
				barClass = 'has-data';
				height = '100%';
				tooltip = 'Present';
			} else if (status === 'Absent') {
				barClass = 'absent';
				height = '85%';
				tooltip = 'Absent';
			} else if (status === 'Leave') {
				barClass = 'leave';
				height = '70%';
				tooltip = 'On Leave';
			}

			return `
				<div class="bar-item">
					<div class="bar-container">
						<div class="bar ${barClass}" style="height: ${height};">
							<div class="bar-tooltip">${tooltip}</div>
						</div>
					</div>
					<div class="bar-day">${day}</div>
				</div>
			`;
		}).join('');

		const chartEl = this.wrapper.find('.custom-bar-chart');
		if (chartEl.length) {
			chartEl.html(barsHtml);
		}
	}

	polarToCartesian(centerX, centerY, radius, angleInDegrees) {
		const angleInRadians = (angleInDegrees - 90) * Math.PI / 180;
		return {
			x: centerX + (radius * Math.cos(angleInRadians)),
			y: centerY + (radius * Math.sin(angleInRadians))
		};
	}

	render_attendance_chart(attendance) {
		if (!attendance || attendance.total_days === 0) {
			return '<p class="text-muted">No attendance records found</p>';
		}

		const total = (attendance.present_days || 0) + (attendance.absent_days || 0) + (attendance.leave_days || 0);
		const attendancePercent = total > 0 ? ((attendance.present_days || 0) / total * 100).toFixed(1) : 0;

		// Get current month name
		const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

		return `
			<div class="attendance-dashboard-section">
				<!-- Donut Chart Section -->
				<div class="attendance-chart-section">
					<div class="custom-donut-chart">
						<!-- SVG will be inserted here by JS -->
						<div class="donut-center-text">
							<div class="percentage">${attendancePercent}%</div>
							<div class="label">Attendance</div>
						</div>
					</div>
					<div class="attendance-legend">
						<div class="legend-item present">
							<div class="legend-left">
								<span class="dot"></span>
								<span class="label">Present</span>
							</div>
							<span class="value">${attendance.present_days || 0} <small>days</small></span>
						</div>
						<div class="legend-item absent">
							<div class="legend-left">
								<span class="dot"></span>
								<span class="label">Absent</span>
							</div>
							<span class="value">${attendance.absent_days || 0} <small>days</small></span>
						</div>
						<div class="legend-item leave">
							<div class="legend-left">
								<span class="dot"></span>
								<span class="label">Leave</span>
							</div>
							<span class="value">${attendance.leave_days || 0} <small>days</small></span>
						</div>
					</div>
				</div>

				<!-- Bar Chart Section -->
				<div class="attendance-timeline-section">
					<div class="timeline-header">
						<div class="timeline-title">Monthly Attendance</div>
						<div class="timeline-period">${currentMonth}</div>
					</div>
					<div class="custom-bar-chart">
						<!-- Bars will be inserted here by JS -->
					</div>
					<div class="timeline-legend">
						<div class="timeline-legend-item present">
							<span class="legend-dot"></span>
							<span>Present</span>
						</div>
						<div class="timeline-legend-item absent">
							<span class="legend-dot"></span>
							<span>Absent</span>
						</div>
						<div class="timeline-legend-item leave">
							<span class="legend-dot"></span>
							<span>Leave</span>
						</div>
					</div>
				</div>
			</div>
		`;
	}

	render_courses(courses) {
		if (!courses || courses.length === 0) {
			return '<p class="text-muted">No courses enrolled</p>';
		}

		return `
			<div class="courses-list">
				${courses.map(course => `
					<div class="course-item">
						<div class="course-info">
							<h4>${course.course_name}</h4>
							<p class="text-muted">
								<span><i class="fa fa-graduation-cap"></i> ${course.program}</span>
								${course.batch ? `<span class="course-batch-label"><i class="fa fa-users"></i> ${course.batch}</span>` : ''}
							</p>
						</div>
						<div class="course-stats">
							<div class="course-attendance">
								<div class="attendance-label-row">
									<span class="label">Attendance</span>
									<span class="percentage-value">${course.attendance_percentage}%</span>
								</div>
								<div class="progress">
									<div class="progress-bar ${this.get_attendance_class(course.attendance_percentage)}" 
										style="width: ${course.attendance_percentage}%">
									</div>
								</div>
							</div>
							<span class="badge ${course.required ? 'badge-primary' : 'badge-secondary'}">
								${course.required ? 'Required' : 'Elective'}
							</span>
						</div>
					</div>
				`).join('')}
			</div>
		`;
	}

	render_events(events) {
		if (!events || events.length === 0) {
			return '<p class="text-muted">No upcoming events</p>';
		}

		return `
			<div class="events-timeline">
				${events.slice(0, 5).map(event => {
			const event_date = frappe.datetime.str_to_obj(event.date);
			return `
						<div class="event-item ${event.type}">
							<div class="event-date">
								<span class="day">${event_date.getDate()}</span>
								<span class="month">${event_date.toLocaleString('default', { month: 'short' })}</span>
							</div>
							<div class="event-content">
								<h4>${event.title}</h4>
								<p>${event.description}</p>
							</div>
						</div>
					`;
		}).join('')}
			</div>
		`;
	}

	render_fee_summary(fee_status) {
		if (!fee_status) {
			return '<p class="text-muted">No fee records found</p>';
		}

		return `
			<div class="fee-summary">
				<div class="fee-overview">
					<div class="fee-stat">
						<span class="label">Total Fees</span>
						<span class="value">₹${this.format_currency(fee_status.total_fees)}</span>
					</div>
					<div class="fee-stat">
						<span class="label">Paid</span>
						<span class="value text-success">₹${this.format_currency(fee_status.total_paid)}</span>
					</div>
					<div class="fee-stat">
						<span class="label">Outstanding</span>
						<span class="value text-danger">₹${this.format_currency(fee_status.total_outstanding)}</span>
					</div>
				</div>
				${fee_status.payment_history && fee_status.payment_history.length > 0 ? `
					<div class="recent-payments">
						<h4>Recent Payments</h4>
						${fee_status.payment_history.slice(0, 3).map(payment => `
							<div class="payment-item">
								<div class="payment-info">
									<span class="payment-program">${payment.program}</span>
									<span class="payment-date">${frappe.datetime.str_to_user(payment.date)}</span>
								</div>
								<span class="badge ${payment.status === 'Paid' ? 'badge-success' : 'badge-warning'}">
									${payment.status}
								</span>
							</div>
						`).join('')}
					</div>
				` : ''}
			</div>
		`;
	}

	// Helper methods
	get_initials(name) {
		return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
	}

	get_attendance_class(percentage) {
		if (percentage >= 75) return 'bg-success';
		if (percentage >= 60) return 'bg-warning';
		return 'bg-danger';
	}

	format_currency(amount) {
		return parseFloat(amount || 0).toLocaleString('en-IN', {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		});
	}

	show_error(message) {
		this.wrapper.html(`
			<div class="student-dashboard-container">
				<div class="alert alert-danger">
					<strong>Error:</strong> ${message}
				</div>
			</div>
		`);
	}
}