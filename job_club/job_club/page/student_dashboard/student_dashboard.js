frappe.pages['student-dashboard'].on_page_load = function (wrapper) {
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
                    <div style="margin-top: 12px; font-weight: 500;">Loading Dashboard...</div>
				</div>
			</div>
		`);

        // Force Tailwind Re-injection/Check
        this.ensure_tailwind(() => {
            this.load_dashboard_data();
        });
    }

    ensure_tailwind(callback) {
        const load_chartjs = () => {
            if (window.Chart) {
                callback();
            } else {
                const script = document.createElement('script');
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

    load_dashboard_data() {
        frappe.call({
            method: 'job_club.api.student_portal_api.get_student_dashboard_data',
            callback: (r) => {
                if (r.message) {
                    this.data = r.message;
                    this.render_dashboard();
                    // Reveal content after a short delay to allow Tailwind to parse
                    setTimeout(() => {
                        this.wrapper.find('.sp-container').removeClass('sp-loading').addClass('sp-loaded');
                    }, 100);
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

        // Helper for initials
        const get_initials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'SP';

        // Helper for currency
        const format_currency = (amount) => parseFloat(amount || 0).toLocaleString('en-IN');

        this.wrapper.html(`
			<div class="sp-container sp-loading">
                <div class="w-full p-4 md:p-8 space-y-6">
                    <div class="flex items-center justify-between">
                        <img src="/assets/job_club/images/logo-es.png" alt="Emporium" class="h-10 md:h-14 object-contain">
                        <button class="text-[10px] font-bold text-red-600 bg-red-50 border border-red-100 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors btn-logout">
                            Logout
                        </button>
                    </div>

                    <div class="bg-indigo-100 border border-indigo-200 p-3 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                        <header class="flex flex-col md:flex-row md:items-end justify-between gap-4">
                            <div class="flex flex-col md:flex-row md:items-center gap-3">
                                <div class="h-12 w-12 rounded-full bg-white border border-indigo-200 flex items-center justify-center text-[11px] font-medium overflow-hidden text-indigo-700">
                                     ${student.image ? `<img src="${student.image}" alt="${student.student_name}" class="h-full w-full object-cover">` : get_initials(student.student_name)}
                                </div>
                                <div class="space-y-1">
                                    <h2 class="text-lg font-semibold tracking-tight text-indigo-950">Welcome Back! ${student.first_name} 👋</h2>
                                    <p class="text-xs text-indigo-900 flex flex-col md:flex-row md:items-center gap-2 font-bold">
                                        ${student.enrollment.batch ? `<span class="bg-indigo-200 text-indigo-800 px-1.5 py-0.5 rounded-[4px] text-[10px] max-w-fit">${student.enrollment.batch}</span>` : ''}
                                        ${student.enrollment.course_name || student.enrollment.program_name || 'Student Portal'}
                                    </p>
                                </div>
                            </div>
                            <div class="flex flex-wrap gap-2">
                                <button class="bg-indigo-900 text-white text-xs font-medium px-4 py-2 rounded-xl hover:bg-indigo-800 transition-all shadow-sm active:scale-95 btn-mark-attendance">
                                    Mark Attendance
                                </button>
                                <button class="border border-indigo-200 bg-white text-indigo-900 text-xs font-medium px-4 py-2 rounded-xl hover:bg-indigo-50 transition-all shadow-sm active:scale-95 btn-leave-application">
                                    Leave Application
                                </button>
                            </div>
                        </header>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div class="bg-emerald-100 border border-emerald-200 p-3 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.05)] cursor-pointer hover:border-emerald-300 transition-colors" onclick="frappe.set_route('attendance-view')">
                            <p class="text-[11px] font-bold text-emerald-600/80 uppercase tracking-widest mb-1">Attendance</p>
                            <div class="flex items-baseline gap-2">
                                <span class="text-xl font-bold tracking-tight text-emerald-900">${stats.attendance_percentage}%</span>
                                <span class="text-[10px] ${stats.attendance_percentage < 75 ? 'text-red-600' : 'text-emerald-600'} font-medium leading-none">${stats.attendance_percentage < 75 ? 'Below Target' : 'On Track'}</span>
                            </div>
                        </div>
                        <div class="bg-blue-100 border border-blue-200 p-3 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.05)] cursor-pointer hover:border-blue-300 transition-colors" onclick="frappe.set_route('course-details')">
                            <p class="text-[11px] font-bold text-blue-600/80 uppercase tracking-widest mb-1">Courses Enrolled</p>
                            <div class="flex items-baseline gap-2">
                                <span class="text-xl font-bold tracking-tight text-blue-900">${String(stats.courses_enrolled).padStart(2, '0')}</span>
                                <span class="text-[10px] text-blue-600 font-medium leading-none">Active Course</span>
                            </div>
                        </div>
                        <div class="bg-amber-100 border border-amber-200 p-3 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.05)] relative overflow-hidden cursor-pointer hover:border-amber-300 transition-colors" onclick="frappe.set_route('fees-portal')">
                            <p class="text-[11px] font-bold text-amber-600/80 uppercase tracking-widest mb-1">Outstanding Fees</p>
                            <div class="flex items-baseline gap-2">
                                <span class="text-xl font-bold tracking-tight text-amber-900">₹${format_currency(stats.pending_fees)}</span>
                                ${stats.pending_fees > 0 ?
                '<div class="absolute top-0 right-0 bg-red-100 text-red-600 px-3 py-1 text-[10px] font-bold rounded-bl-lg">Payment DUE</div>' :
                '<div class="absolute top-0 right-0 bg-emerald-100 text-emerald-600 px-3 py-1 text-[10px] font-bold rounded-bl-lg">All Clear</div>'}
                            </div>
                        </div>
                    </div>

                    <main class="grid gap-6 lg:grid-cols-3">
                        
                        <div class="lg:col-span-2 space-y-8">
                            
                            <section class="bg-violet-100 border border-violet-200 rounded-xl overflow-hidden courses-section cursor-pointer hover:shadow-md transition-all duration-300" onclick="frappe.set_route('course-details')">
                                <div class="px-4 py-3 border-b border-violet-200 flex items-center justify-between bg-white/50">
                                    <h3 class="text-xs font-bold uppercase tracking-wider text-violet-900">Learning Journey</h3>
                                </div>
                                <div class="p-4">
                                    ${this.render_courses(data.courses)}
                                </div>
                            </section>

                            <section class="bg-purple-100 border border-purple-200 rounded-xl p-4 cursor-pointer hover:shadow-md transition-all duration-300" onclick="frappe.set_route('attendance-view')">
                                <div class="px-0 pb-4 border-b border-purple-200 flex items-center justify-between">
                                    <h3 class="text-xs font-bold uppercase tracking-wider text-purple-900">Attendance Overview</h3>
                                    <span class="text-[11px] font-bold border border-purple-200 px-2 py-0.5 rounded text-purple-600 bg-white hover:text-purple-900 hover:bg-purple-100 transition-all">View Details</span>
                                </div>
                                <div class="mt-8 flex justify-center">
                                     <div class="w-full max-w-[280px]">
                                         <canvas id="attendance-donut-chart"></canvas>
                                     </div>
                                </div>
                            </section>
                        </div>

                        <div class="space-y-6">
                            
                            <section class="bg-rose-100 border border-rose-200 rounded-xl p-4 shadow-sm cursor-pointer hover:shadow-md transition-all duration-300" onclick="frappe.set_route('fees-portal')">
                                <div class="flex justify-between items-center mb-6">
                                    <h3 class="text-xs font-bold uppercase tracking-widest text-rose-900">Payment Summary</h3>
                                    <span class="text-[12px] font-medium text-rose-700/80 hover:text-rose-900 transition-colors cursor-pointer">View Details</span>
                                </div>
                                
                                ${this.render_fee_summary(data.fee_status)}
                            </section>
                        </div>
                    </main>
                </div>
            </div>
		`);

        // Bind interactions
        // Bind interactions
        this.wrapper.find('.btn-mark-attendance').click((e) => {
            e.preventDefault();
            window.location.href = '/mark-attendance';
        });

        this.wrapper.find('.btn-leave-application').click((e) => {
            e.preventDefault();
            frappe.new_doc('Student Leave Application', {
                student: this.data.student_info.name,
                student_batch: this.data.student_info.enrollment.batch
            });
        });

        this.wrapper.find('.btn-logout').click((e) => {
            e.preventDefault();
            frappe.call({
                method: 'logout',
                callback: () => {
                    window.location.replace('/login');
                }
            });
        });

        // Helper for onclick
        window.click_view_courses = () => {
            const el = document.querySelector('.courses-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
        }

        this.render_attendance_chart(data.attendance_summary);
    }

    format_duration(seconds) {
        if (!seconds) return 'N/A';
        const total_hours = Math.floor(seconds / 3600);
        const days = Math.floor(total_hours / 24);
        const hours = total_hours % 24;

        let result = '';
        if (days > 0) result += `${days} Days `;
        result += `${hours} Hours`;
        return result.trim();
    }

    render_courses(courses) {
        if (!courses || courses.length === 0) {
            return '<p class="text-muted text-center text-xs py-10 opacity-60">No enrolled courses discovered in your journey.</p>';
        }

        return courses.map(course => `
            <div class="group relative bg-white border border-violet-100 rounded-2xl p-4 transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.07)] hover:border-violet-300 mb-4 last:mb-0">
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div class="flex-1 space-y-4">
                        <div class="flex items-start justify-between md:justify-start md:gap-4">
                            <div class="space-y-1">
                                <h4 class="text-base font-bold tracking-tight text-violet-950 group-hover:text-violet-600 transition-colors">${course.course_name}</h4>
                                <div class="flex flex-wrap gap-2">
                                     ${course.batch ? `<span class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-violet-50 text-violet-600 border border-violet-100/50 uppercase tracking-tight">${course.batch}</span>` : ''}
                                     ${course.branch ? `<span class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-cyan-50 text-cyan-600 border border-cyan-100/50 uppercase tracking-tight">${course.branch}</span>` : ''}
                                     ${course.batch_status ? `<span class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100/50 uppercase tracking-tight">${course.batch_status}</span>` : ''}
                                </div>
                            </div>
                        </div>

                        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                            ${course.batch_start ? `
                            <div class="flex flex-col p-3 rounded-xl bg-violet-50/30 border border-violet-50 group-hover:bg-violet-50 transition-colors duration-500 min-w-0">
                                <p class="text-[9px] font-bold text-violet-400 uppercase tracking-widest leading-none mb-1">Batch Timing</p>
                                <span class="text-xs font-bold text-violet-900 truncate">${course.batch_start.split(':').slice(0, 2).join(':')} - ${course.batch_end ? course.batch_end.split(':').slice(0, 2).join(':') : 'End'}</span>
                            </div>` : ''}

                            <div class="flex flex-col p-3 rounded-xl bg-violet-50/30 border border-violet-50 group-hover:bg-violet-50 transition-colors duration-500 min-w-0">
                                <p class="text-[9px] font-bold text-violet-400 uppercase tracking-widest leading-none mb-1">Duration</p>
                                <span class="text-xs font-bold text-violet-900 truncate">${this.format_duration(course.course_duration)}</span>
                            </div>
                            
                            <div class="flex flex-col p-3 rounded-xl bg-violet-50/30 border border-violet-50 group-hover:bg-violet-50 transition-colors duration-500 min-w-0">
                                <p class="text-[9px] font-bold text-violet-400 uppercase tracking-widest leading-none mb-1">Academic Year</p>
                                <span class="text-xs font-bold text-violet-900 truncate">${course.academic_year || 'Ongoing'}</span>
                            </div>
                        </div>
                    </div>
                    
                    <button class="w-full md:w-auto px-6 py-3 rounded-xl bg-indigo-900 text-white text-[12px] font-bold hover:bg-indigo-800 hover:shadow-lg active:scale-95 transition-all duration-300 shrink-0" onclick="frappe.set_route('course-details', '${course.course_name}')">
                        Course Details
                    </button>
                </div>
            </div>
        `).join('');
    }

    render_attendance_chart(attendance) {
        const ctx = document.getElementById('attendance-donut-chart');
        if (!ctx || !attendance || attendance.total_days === 0) {
            if (ctx) ctx.parentElement.innerHTML = '<div class="flex items-center justify-center py-10 text-xs text-muted-fg">No attendance data available</div>';
            return;
        }

        if (this.donut_chart) {
            this.donut_chart.destroy();
        }

        this.donut_chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ["Present", "Absent", "Leave"],
                datasets: [{
                    data: [attendance.present_days || 0, attendance.absent_days || 0, attendance.leave_days || 0],
                    backgroundColor: ['#10b981', '#f43f5e', '#0ea5e9'],
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                cutout: '70%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        align: 'center',
                        labels: {
                            usePointStyle: true,
                            padding: 20,
                            font: {
                                size: 11,
                                weight: '500',
                                family: "'Inter', sans-serif"
                            }
                        }
                    },
                    tooltip: {
                        enabled: true,
                        callbacks: {
                            label: function (item) {
                                return ` ${item.label}: ${item.raw} days`;
                            }
                        }
                    }
                }
            }
        });
    }



    render_fee_summary(fee_status) {
        if (!fee_status) {
            return '<p class="text-xs text-muted-fg">No fee records found</p>';
        }

        const format = (amt) => parseFloat(amt).toLocaleString('en-IN');

        return `
            <div class="space-y-3 mb-6">
                <div class="flex justify-between text-xs">
                    <span class="text-muted-fg font-medium">Total Program Fee</span>
                    <span class="font-bold">₹${format(fee_status.total_fees)}</span>
                </div>
                <div class="flex justify-between text-xs">
                    <span class="text-muted-fg font-medium">Paid to date</span>
                    <span class="text-emerald-600 font-bold">₹${format(fee_status.total_paid)}</span>
                </div>
                <div class="h-px bg-neutral-100 w-full my-2"></div>
                <div class="flex justify-between text-sm font-bold text-neutral-900">
                    <span>Balance Due</span>
                    <span>₹${format(fee_status.total_outstanding)}</span>
                </div>
            </div>

            <div class="space-y-2">
                ${fee_status.payment_history ? fee_status.payment_history.slice(0, 2).map(pay => `
                   <div class="bg-neutral-50 border rounded-md p-2 flex flex-col gap-1 text-[10px]">
                       <div class="flex items-center justify-between">
                           <span class="font-bold text-neutral-700">${pay.program || 'Installment'}</span>
                           <span class="${pay.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-white border text-black'} text-[8px] px-1.5 py-0.5 rounded uppercase font-bold">${pay.status}</span>
                       </div>
                       ${pay.fee_category ? `<span class="text-[9px] text-muted-fg font-bold uppercase tracking-wider">${pay.fee_category}</span>` : ''}
                   </div>
                `).join('') : ''}
            </div>
		`;
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