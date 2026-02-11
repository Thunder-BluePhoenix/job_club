frappe.pages['course-details'].on_page_load = function (wrapper) {
    var page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'Course Details',
        single_column: true
    });

    new CourseDetails(page);
}

class CourseDetails {
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
                    <div style="margin-top: 12px; font-weight: 500;">Loading Course...</div>
				</div>
			</div>
		`);

        // Force Tailwind Re-injection/Check
        this.ensure_tailwind(() => {
            this.load_course_data();
        });
    }

    ensure_tailwind(callback) {
        if (window.tailwind) {
            this.configure_tailwind();
            callback();
        } else {
            const script = document.createElement('script');
            script.src = "https://cdn.tailwindcss.com";
            script.onload = () => {
                this.configure_tailwind();
                callback();
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

    load_course_data() {
        // We need to get the course name from the route if possible, or fallback
        const route = frappe.get_route();
        let course_name = null;
        if (route.length > 1) {
            course_name = route[1];
        }

        // If specific course is provided in route, load it directly
        if (course_name) {
            this.load_course_structure(course_name);
        } else {
            // Fallback to getting first course if not specified (legacy behavior support)
            frappe.call({
                method: 'job_club.api.student_portal_api.get_course_progress',
                callback: (r) => {
                    if (r.message && r.message.length > 0) {
                        this.load_course_structure(r.message[0].course);
                    } else {
                        this.show_no_course();
                    }
                },
                error: (r) => {
                    this.show_error("Error loading course details.");
                }
            });
        }
    }

    load_course_structure(course_name) {
        frappe.call({
            method: 'frappe.client.get',
            args: {
                doctype: 'Course',
                name: course_name
            },
            callback: (r) => {
                if (r.message) {
                    this.course_doc = r.message;
                    this.render_page();
                    // Reveal content
                    setTimeout(() => {
                        this.wrapper.find('.sp-container').removeClass('sp-loading').addClass('sp-loaded');
                    }, 100);
                } else {
                    this.show_error("Course not found.");
                }
            },
            error: (r) => {
                this.show_error("Error loading course structure.");
            }
        });
    }

    render_page() {
        const course = this.course_doc;
        const topics = course.topics || [];

        // Duration logic helper
        const format_duration = (seconds) => {
            if (!seconds) return 'N/A';
            const total_hours = Math.floor(seconds / 3600);
            const days = Math.floor(total_hours / 24);
            const hours = total_hours % 24;

            let result = '';
            if (days > 0) result += `${days} Days `;
            result += `${hours} Hours`;
            return result.trim();
        };

        this.wrapper.html(`
			<div class="sp-container sp-loading">
                <div class="w-full p-4 md:p-8 space-y-6">
                    
                    <div class="flex items-center justify-between mb-2">
                        <nav class="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-muted-fg">
                            <span class="cursor-pointer hover:text-black transition-colors" onclick="frappe.set_route('student-dashboard')">Dashboard</span> 
                            <span class="text-neutral-300">/</span> 
                            <span class="text-black">My Courses</span>
                        </nav>
                        <button class="text-[10px] font-bold text-red-600 bg-red-50 border border-red-100 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors btn-logout">
                            Logout
                        </button>
                    </div>

                    <div class="space-y-4">
                        <div class="flex items-center justify-between">
                             <h1 class="text-xl font-semibold text-neutral-900">My Courses</h1>
                        </div>

                        <div class="bg-gradient-to-br from-indigo-100 to-white border border-indigo-200 p-4 rounded-xl shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between relative overflow-hidden group">
                            <!-- Decorative accent -->
                            <div class="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>

                            <div class="flex-1 space-y-1 relative z-10 pl-3">
                                <h2 class="text-lg font-bold text-indigo-950 leading-tight">${course.course_name}</h2>
                                ${course.description ? `<p class="text-[11px] text-indigo-700/70 leading-relaxed font-medium max-w-2xl line-clamp-1">${course.description}</p>` : ''}
                            </div>
                            
                            <div class="flex flex-row gap-3 w-full md:w-auto relative z-10">
                                 <div class="bg-white/60 backdrop-blur-md border border-indigo-200 px-3 py-2 rounded-lg flex items-center gap-2 shadow-sm flex-1 md:flex-none min-w-[110px]">
                                    <div class="h-8 w-8 rounded-md bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    </div>
                                    <div>
                                        <p class="text-[9px] font-bold text-indigo-400 uppercase tracking-widest leading-none mb-0.5">Duration</p>
                                        <p class="text-xs font-bold tracking-tight text-indigo-950 whitespace-nowrap">${format_duration(course.course_duration)}</p>
                                    </div>
                                </div>

                                <div class="bg-white/60 backdrop-blur-md border border-blue-200 px-3 py-2 rounded-lg flex items-center gap-2 shadow-sm flex-1 md:flex-none min-w-[90px]">
                                    <div class="h-8 w-8 rounded-md bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
                                    </div>
                                    <div>
                                        <p class="text-[9px] font-bold text-blue-400 uppercase tracking-widest leading-none mb-0.5">Modules</p>
                                        <p class="text-xs font-bold tracking-tight text-blue-950">${topics.length}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <main class="space-y-6">
                        <div class="flex items-center justify-between px-1">
                            <h3 class="text-xs font-bold uppercase tracking-widest text-muted-fg">Course Topics</h3>
                        </div>

                        <div class="space-y-3">
                            ${this.render_modules(topics)}
                        </div>
                    </main>
                    
                    <div class="pt-8 flex justify-center">
                        <button class="px-6 py-3 rounded-xl bg-indigo-900 text-white hover:bg-indigo-950 transition-all text-sm font-bold shadow-sm hover:shadow-md active:scale-95" onclick="frappe.set_route('student-dashboard')">
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            </div>
		`);

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

    render_modules(topics) {
        if (!topics || topics.length === 0) {
            return '<div class="text-center py-10 border-2 border-dashed rounded-xl bg-neutral-50/50 text-muted-fg">No topics found for this course.</div>';
        }

        return topics.map((topic, index) => {
            return `
              <div class="bg-indigo-100 border border-indigo-200 rounded-xl p-3 shadow-sm hover:bg-indigo-200 hover:border-indigo-300 transition-all group cursor-default">
                <div class="flex items-start gap-4">
                  <div class="h-8 w-8 rounded-full bg-white border border-indigo-200 flex items-center justify-center text-[10px] font-black shrink-0 text-indigo-600 group-hover:scale-110 transition-transform">
                    ${String(index + 1).padStart(2, '0')}
                  </div>
                  <div class="space-y-1 flex-1">
                    <h4 class="text-sm font-bold text-indigo-950 group-hover:text-indigo-800 transition-colors">${topic.topic}</h4>
                    <!-- Description from Topic link could be fetched if needed, keeping it simple for now -->
                  </div>
                </div>
              </div>
            `;
        }).join('');
    }

    show_no_course() {
        this.wrapper.html(`
                <div class="mx-auto max-w-4xl p-8 py-20 text-center">
				<h2 class="text-lg font-bold">No Course Found</h2>
				<p class="text-muted-fg mt-2">Could not find the specified course details.</p>
				<button onclick="frappe.set_route('student-dashboard')" class="inline-block mt-6 px-6 py-3 bg-indigo-900 text-white rounded-xl text-xs font-bold hover:bg-indigo-950 transition-all shadow-sm hover:shadow-md active:scale-95">
					Back to Dashboard
				</button>
			</div >
                `);
    }

    show_error(message) {
        this.wrapper.html(`
                < div class="mx-auto max-w-6xl p-8" >
                    <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <strong class="font-bold">Error:</strong>
                        <span class="block sm:inline">${message}</span>
                        <div class="mt-4">
                            <button onclick="frappe.set_route('student-dashboard')" class="text-xs underline font-bold">Return to Dashboard</button>
                        </div>
                    </div>
			</div >
                `);
    }
}