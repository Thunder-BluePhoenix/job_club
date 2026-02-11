frappe.pages['attendance-view'].on_page_load = function (wrapper) {
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
        // Load the shared CSS for basic structure and FOUC prevention
        frappe.require('/assets/job_club/css/student_portal.css')
            .then(() => {
                this.initialize_page();
            });
    }

    initialize_page() {
        // Initial Loader HTML
        this.wrapper.html(`
			<div class="sp-container sp-loading">
				<div class="sp-loader-container">
					<div class="sp-spinner"></div>
                    <div style="margin-top: 12px; font-weight: 500;">Loading Attendance...</div>
				</div>
			</div>
		`);

        // Force Tailwind Re-injection/Check
        this.ensure_tailwind(() => {
            this.load_attendance_data();
        });
    }

    ensure_tailwind(callback) {
        const load_chartjs = () => {
            if (window.Chart) {
                callback();
            } else {
                const script = document.createElement('script');
                script.id = 'chartjs-script';
                script.src = "https://cdn.jsdelivr.net/npm/chart.js";
                script.onload = callback;
                document.head.appendChild(script);
            }
        };

        if (window.tailwind) {
            this.configure_tailwind();
            load_chartjs();
        } else {
            const script = document.createElement('script');
            script.src = "https://cdn.tailwindcss.com";
            script.onload = () => {
                this.configure_tailwind();
                load_chartjs();
            };
            document.head.appendChild(script);
        }
    }

    configure_tailwind() {
        if (window.tailwind) {
            window.tailwind.config = {
                theme: {
                    extend: {
                        fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
                        colors: {
                            border: "hsl(240 5.9% 90%)",
                            background: "hsl(0 0% 100%)",
                            foreground: "hsl(240 10% 3.9%)",
                            muted: "hsl(240 4.8% 95.9%)",
                            "muted-fg": "hsl(240 3.8% 46.1%)",
                        }
                    },
                },
            };
        }
    }

    load_attendance_data() {
        frappe.call({
            method: 'job_club.api.student_portal_api.get_attendance_summary',
            callback: (r) => {
                if (r.message) {
                    this.attendance_data = r.message;
                    this.render_page();
                    // Reveal content
                    setTimeout(() => {
                        this.wrapper.find('.sp-container').removeClass('sp-loading').addClass('sp-loaded');
                    }, 100);
                } else {
                    this.show_error("Could not load attendance data.");
                }
            },
            error: (r) => {
                this.show_error("Error loading attendance data.");
            }
        });
    }

    render_page() {
        const data = this.attendance_data;

        this.wrapper.html(`
			<div class="sp-container sp-loading">
                <style>
                    .calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; }
                    .calendar-day { aspect-ratio: 1; display: flex; align-items: center; justify-content: center; border-radius: 4px; font-size: 11px; border: 1px solid transparent; }
                </style>
                <div class="w-full p-4 md:p-8 space-y-6">
                    
                    <div class="flex items-center justify-between mb-2">
                        <nav class="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-muted-fg">
                            <span class="cursor-pointer hover:text-black transition-colors" onclick="frappe.set_route('student-dashboard')">Dashboard</span> 
                            <span class="text-neutral-300">/</span> 
                            <span class="text-black">Attendance</span>
                        </nav>
                        <button class="text-[10px] font-bold text-red-600 bg-red-50 border border-red-100 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors btn-logout">
                            Logout
                        </button>
                    </div>

                    <div class="flex flex-col md:flex-row md:justify-between md:items-center gap-3 ">
                        <h1 class="text-xl font-semibold text-neutral-900">My Attendance</h1>
                        <div class="flex gap-2">
                            <button class="px-3 py-1.5 rounded-md border hover:bg-neutral-200 transition-all text-[12px] font-medium hover:text-black opacity-80 cursor-pointer" id="btn-prev-month">Previous Month</button>
                            <button class="px-3 py-1.5 rounded-md border hover:bg-neutral-200 transition-all text-[12px] font-medium hover:text-black opacity-80 cursor-pointer" id="btn-next-month">Next Month</button>
                            <button class="px-3 py-1.5 rounded-md border hover:bg-indigo-950 transition-all text-[12px] bg-indigo-900 text-white font-medium cursor-pointer" id="btn-today">Today</button>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
                        <div class="bg-indigo-50 border border-indigo-100 p-3 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.05)] flex items-center gap-3">
                            <div class="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                            </div>
                            <div>
                                <p class="text-[11px] font-bold text-indigo-500 uppercase tracking-widest mb-1">Total Days</p>
                                <p class="text-2xl font-bold tracking-tight text-indigo-950">${data.total_days}</p>
                            </div>
                        </div>
                        <div class="bg-emerald-50 border border-emerald-100 p-3 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.05)] flex items-center gap-3">
                            <div class="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                            </div>
                            <div>
                                <p class="text-[11px] font-bold text-emerald-500 uppercase tracking-widest mb-1">Present</p>
                                <p class="text-2xl font-bold tracking-tight text-emerald-950">${data.present_days}</p>
                            </div>
                        </div>
                        <div class="bg-rose-50 border border-rose-100 p-3 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.05)] flex items-center gap-3">
                            <div class="h-10 w-10 rounded-lg bg-rose-100 flex items-center justify-center text-rose-600">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                            </div>
                            <div>
                                <p class="text-[11px] font-bold text-rose-500 uppercase tracking-widest mb-1">Absent</p>
                                <p class="text-2xl font-bold tracking-tight text-rose-950">${data.absent_days}</p>
                            </div>
                        </div>
                        <div class="bg-sky-50 border border-sky-100 p-3 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.05)] flex items-center gap-3">
                            <div class="h-10 w-10 rounded-lg bg-sky-100 flex items-center justify-center text-sky-600">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg>
                            </div>
                            <div>
                                <p class="text-[11px] font-bold text-sky-500 uppercase tracking-widest mb-1">Leave</p>
                                <p class="text-2xl font-bold tracking-tight text-sky-950">${data.leave_days}</p>
                            </div>
                        </div>
                        <div class="bg-violet-50 border border-violet-100 p-3 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.05)] flex items-center gap-3">
                            <div class="h-10 w-10 rounded-lg bg-violet-100 flex items-center justify-center text-violet-600 font-bold text-xs group-hover:scale-110 transition-transform">%</div>
                            <div>
                                <p class="text-[11px] font-bold text-violet-400 uppercase tracking-widest mb-0.5">Rate</p>
                                <p class="text-2xl font-bold tracking-tight text-violet-950">${data.percentage.toFixed(1)}%</p>
                            </div>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                        
                        <section class="lg:col-span-2 bg-white border rounded-xl p-4 shadow-sm space-y-3">
                            <div class="flex items-center justify-between border-b border-neutral-100 pb-2">
                                <h3 class="text-xs font-bold uppercase tracking-wider current-month-label text-neutral-900"></h3>
                                <div class="flex gap-2">
                                    <span class="flex items-center gap-1 text-[9px] font-bold text-muted-fg"><span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span> Present</span>
                                    <span class="flex items-center gap-1 text-[9px] font-bold text-muted-fg"><span class="h-1.5 w-1.5 rounded-full bg-red-500"></span> Absent</span>
                                    <span class="flex items-center gap-1 text-[9px] font-bold text-muted-fg"><span class="h-1.5 w-1.5 rounded-full bg-sky-500"></span> Leave</span>
                                </div>
                            </div>

                            <div class="calendar-grid text-center font-bold text-[10px] text-muted-fg mb-1">
                                <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
                            </div>

                            <div class="calendar-grid" id="calendar-days-container">
                                <!-- Calendar days injected here -->
                            </div>
                        </section>

                        <section class="lg:col-span-2 bg-white border rounded-xl p-4 shadow-sm h-full flex flex-col min-h-[260px]">
                            <h3 class="text-xs font-bold uppercase tracking-wider mb-3 text-neutral-900">Attendance Trend</h3>
                            
                            <div class="flex-1 w-full" id="attendance-trend-chart-container">
                                <canvas id="attendance-trend-chart"></canvas>
                            </div>
                        </section>
                    </div>

                </div>
			</div>
		`);

        this.render_calendar();
        this.render_trend_chart();
        this.bind_events();
    }

    bind_events() {
        this.wrapper.find('#btn-prev-month').click(() => {
            this.current_month.setMonth(this.current_month.getMonth() - 1);
            this.render_calendar();
        });
        this.wrapper.find('#btn-next-month').click(() => {
            this.current_month.setMonth(this.current_month.getMonth() + 1);
            this.render_calendar();
        });
        this.current_month = new Date();
        this.render_calendar();

        this.wrapper.find('.btn-logout').click((e) => {
            e.preventDefault();
            frappe.call({
                method: 'logout',
                callback: () => {
                    window.location.replace('/login');
                }
            });
        });
    }

    render_calendar() {
        const calendar_data = this.attendance_data.calendar_data || [];
        const attendance_map = {};

        calendar_data.forEach(record => {
            attendance_map[record.date] = record;
        });

        const year = this.current_month.getFullYear();
        const month = this.current_month.getMonth(); // 0-indexed

        // Update label
        this.wrapper.find('.current-month-label').text(this.current_month.toLocaleString('default', { month: 'long', year: 'numeric' }));

        const first_day = new Date(year, month, 1);
        const last_day = new Date(year, month + 1, 0);
        const days_in_month = last_day.getDate();
        const start_day = first_day.getDay(); // 0=Sun

        let calendar_html = '';

        // Empty cells before first day
        for (let i = 0; i < start_day; i++) {
            calendar_html += '<div class="calendar-day text-transparent">.</div>';
        }

        // Days of month
        for (let day = 1; day <= days_in_month; day++) {
            const date = new Date(year, month, day);
            // Frappe dates are YYYY-MM-DD. JS months are 0-indexed, so add 1.
            const date_str = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const record = attendance_map[date_str];

            let cellClass = 'border';
            let textColor = '';

            if (record) {
                const status = record.status;
                if (status === 'Present') {
                    cellClass = 'border bg-emerald-50 border-emerald-200 text-emerald-700';
                } else if (status === 'Absent') {
                    cellClass = 'border bg-red-50 border-red-200 text-red-700';
                } else if (status === 'Leave') {
                    cellClass = 'border bg-sky-50 border-sky-200 text-sky-700';
                }
            }

            // Highlight today
            if (date.toDateString() === new Date().toDateString()) {
                cellClass += ' border-2 border-black font-bold bg-neutral-50 shadow-sm';
            }

            calendar_html += `
				<div class="calendar-day ${cellClass}">${day}</div>
			`;
        }

        this.wrapper.find('#calendar-days-container').html(calendar_html);
    }

    render_trend_chart() {
        const ctx = document.getElementById('attendance-trend-chart');
        if (!ctx) return;

        const calendar_data = this.attendance_data.calendar_data || [];
        calendar_data.sort((a, b) => new Date(a.date) - new Date(b.date));

        const recent_data = calendar_data.slice(-30);
        const labels = recent_data.map(d => frappe.datetime.str_to_user(d.date).split('-')[0]);

        const present_values = recent_data.map(d => d.status === 'Present' ? 1 : 0);
        const absent_values = recent_data.map(d => d.status === 'Absent' ? 1 : 0);
        const leave_values = recent_data.map(d => d.status === 'Leave' ? 1 : 0);

        if (this.trend_chart) {
            this.trend_chart.destroy();
        }

        // Create gradients
        const gradient_present = ctx.getContext('2d').createLinearGradient(0, 0, 0, 300);
        gradient_present.addColorStop(0, 'rgba(16, 185, 129, 0.4)');
        gradient_present.addColorStop(1, 'rgba(16, 185, 129, 0)');

        const gradient_absent = ctx.getContext('2d').createLinearGradient(0, 0, 0, 300);
        gradient_absent.addColorStop(0, 'rgba(244, 63, 94, 0.4)');
        gradient_absent.addColorStop(1, 'rgba(244, 63, 94, 0)');

        const gradient_leave = ctx.getContext('2d').createLinearGradient(0, 0, 0, 300);
        gradient_leave.addColorStop(0, 'rgba(14, 165, 233, 0.4)');
        gradient_leave.addColorStop(1, 'rgba(14, 165, 233, 0)');

        this.trend_chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: "Present",
                        data: present_values,
                        borderColor: "#10b981",
                        backgroundColor: gradient_present,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 0,
                        pointHoverRadius: 6,
                        borderWidth: 3
                    },
                    {
                        label: "Absent",
                        data: absent_values,
                        borderColor: "#f43f5e",
                        backgroundColor: gradient_absent,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 0,
                        pointHoverRadius: 6,
                        borderWidth: 3
                    },
                    {
                        label: "Leave",
                        data: leave_values,
                        borderColor: "#0ea5e9",
                        backgroundColor: gradient_leave,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 0,
                        pointHoverRadius: 6,
                        borderWidth: 3
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index',
                },
                plugins: {
                    legend: {
                        position: 'bottom',
                        align: 'center',
                        labels: {
                            usePointStyle: true,
                            padding: 25,
                            font: {
                                size: 12,
                                weight: '600',
                                family: "'Inter', sans-serif"
                            }
                        }
                    },
                    tooltip: {
                        enabled: true,
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        titleColor: '#1a1a1a',
                        titleFont: { size: 14, weight: '700' },
                        bodyColor: '#4b5563',
                        bodyFont: { size: 12 },
                        padding: 12,
                        borderColor: '#e5e7eb',
                        borderWidth: 1,
                        displayColors: true,
                        usePointStyle: true,
                        callbacks: {
                            label: function (context) {
                                return ` ${context.dataset.label}: ${context.raw === 1 ? 'Yes' : 'No'}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 1.2,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)',
                        },
                        ticks: {
                            display: false
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            font: { size: 10, weight: '500' },
                            color: '#9ca3af'
                        }
                    }
                }
            }
        });
    }

    show_error(message) {
        this.wrapper.html(`
			<div class="mx-auto max-w-6xl p-8">
				<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
					<strong class="font-bold">Error:</strong>
					<span class="block sm:inline">${message}</span>
				</div>
			</div>
		`);
    }
}