frappe.pages['attendance-view'].on_page_load = function (wrapper) {
    frappe.require('assets/job_club/css/student_portal.css');
    var page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'My Attendance',
        single_column: true
    });

    new AttendanceView(page);
}

class AttendanceView {
    constructor(page) {
        this.page = page;
        this.wrapper = $(this.page.body);
        this.current_month = new Date();
        this.setup();
    }

    setup() {
        this.add_toolbar_buttons();
        this.load_attendance_data();
    }

    add_toolbar_buttons() {
        this.page.add_inner_button('Previous Month', () => {
            this.current_month.setMonth(this.current_month.getMonth() - 1);
            this.render_calendar();
        });

        this.page.add_inner_button('Next Month', () => {
            this.current_month.setMonth(this.current_month.getMonth() + 1);
            this.render_calendar();
        });

        this.page.add_inner_button('Today', () => {
            this.current_month = new Date();
            this.render_calendar();
        });
    }

    load_attendance_data() {
        this.wrapper.html(`
            <div class="student-portal-wrapper">
                <div class="loader-container">
                    <div class="premium-loader"></div>
                    <div class="loader-text">Fetching your attendance history...</div>
                </div>
            </div>
        `);

        frappe.call({
            method: 'job_club.api.student_portal_api.get_attendance_summary',
            callback: (r) => {
                if (r.message) {
                    this.attendance_data = r.message;
                    this.render_page();
                }
            }
        });
    }

    render_page() {
        const data = this.attendance_data;

        this.wrapper.html(`
			<div class="attendance-view-container student-portal-wrapper">
				<div class="attendance-summary-cards">
					<div class="summary-card total">
						<div class="card-icon"><i class="fa fa-calendar"></i></div>
						<div class="card-content">
							<div class="value">${data.total_days}</div>
							<div class="label">Total Days</div>
						</div>
					</div>
					
					<div class="summary-card present">
						<div class="card-icon"><i class="fa fa-check-circle"></i></div>
						<div class="card-content">
							<div class="value">${data.present_days}</div>
							<div class="label">Present</div>
						</div>
					</div>
					<div class="summary-card absent">
						<div class="card-icon"><i class="fa fa-times-circle"></i></div>
						<div class="card-content">
							<div class="value">${data.absent_days}</div>
							<div class="label">Absent</div>
						</div>
					</div>
					<div class="summary-card leave">
						<div class="card-icon"><i class="fa fa-calendar-minus-o"></i></div>
						<div class="card-content">
							<div class="value">${data.leave_days}</div>
							<div class="label">Leave</div>
						</div>
					</div>
					
					<div class="summary-card percentage">
						<div class="card-icon"><i class="fa fa-percent"></i></div>
						<div class="card-content">
							<div class="value">${data.percentage.toFixed(1)}%</div>
							<div class="label">Attendance Rate</div>
						</div>
					</div>
				</div>
				
				<div class="attendance-content-row">
					<div class="attendance-calendar-section">
						<div class="calendar-header">
							<h3>Attendance Calendar</h3>
							<div class="calendar-legend">
								<span class="legend-item"><span class="dot present"></span> Present</span>
								<span class="legend-item"><span class="dot absent"></span> Absent</span>
								<span class="legend-item"><span class="dot leave"></span> Leave</span>
							</div>
						</div>
						<div id="attendanceCalendar"></div>
					</div>
					
					<div class="monthly-trend-section">
						<h3>Monthly Trend</h3>
						<div class="chart-wrapper">
							<div id="monthlyChart"></div>
						</div>
					</div>
				</div>
			</div>
		`);

        this.render_calendar();
        this.render_monthly_chart();
    }


    render_calendar() {
        const calendar_data = this.attendance_data.calendar_data || [];
        const attendance_map = {};

        calendar_data.forEach(record => {
            attendance_map[record.date] = record;
        });

        const year = this.current_month.getFullYear();
        const month = this.current_month.getMonth();
        const first_day = new Date(year, month, 1);
        const last_day = new Date(year, month + 1, 0);
        const days_in_month = last_day.getDate();
        const start_day = first_day.getDay();

        let calendar_html = `
			<div class="calendar-month-year">
				${first_day.toLocaleString('default', { month: 'long', year: 'numeric' })}
			</div>
			<div class="calendar-grid">
				<div class="calendar-day-header">Sun</div>
				<div class="calendar-day-header">Mon</div>
				<div class="calendar-day-header">Tue</div>
				<div class="calendar-day-header">Wed</div>
				<div class="calendar-day-header">Thu</div>
				<div class="calendar-day-header">Fri</div>
				<div class="calendar-day-header">Sat</div>
		`;

        // Empty cells before first day
        for (let i = 0; i < start_day; i++) {
            calendar_html += '<div class="calendar-day empty"></div>';
        }

        // Days of month
        for (let day = 1; day <= days_in_month; day++) {
            const date = new Date(year, month, day);
            const date_str = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const attendance = attendance_map[date_str];

            let class_name = 'calendar-day';
            let status_class = '';
            let tooltip = '';

            if (attendance) {
                status_class = attendance.status.toLowerCase().replace(' ', '-');
                tooltip = `title="${attendance.status}"`;
            }

            if (date.toDateString() === new Date().toDateString()) {
                class_name += ' today';
            }

            calendar_html += `
				<div class="${class_name} ${status_class}" ${tooltip}>
					<span class="day-number">${day}</span>
				</div>
			`;
        }

        calendar_html += '</div>';

        $('#attendanceCalendar').html(calendar_html);
    }

    render_monthly_chart() {
        const data = this.attendance_data;
        if (!data.monthly_stats || data.monthly_stats.length === 0) return;
        const wrapper = this.wrapper[0];

        let retries = 0;
        const MAX_RETRIES = 10;

        const init_chart = () => {
            if (!document.contains(wrapper)) return;

            const chart_container = wrapper.querySelector('#monthlyChart');
            if (chart_container) {
                this.monthly_chart = new frappe.Chart(chart_container, {
                    data: {
                        labels: data.monthly_stats.map(m => m.month),
                        datasets: [{
                            name: "Present %",
                            values: data.monthly_stats.map(m => m.percentage)
                        }]
                    },
                    type: 'bar',
                    height: 250,
                    colors: ['#3182ce'],
                    barOptions: { spaceRatio: 0.5 },
                    axisOptions: { xIsSeries: 1, yIsSeries: 1 },
                    tooltipOptions: {
                        formatTooltipY: d => d + '%'
                    }
                });
            } else if (retries < MAX_RETRIES) {
                retries++;
                setTimeout(init_chart, 100);
            }
        };

        init_chart();
    }
}