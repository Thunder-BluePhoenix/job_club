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
                <div class="mx-auto max-w-6xl p-4 md:p-8 space-y-6">
                    
                    <nav class="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-muted-fg mb-6">
                        <span class="cursor-pointer hover:text-black transition-colors" onclick="frappe.set_route('student-dashboard')">Dashboard</span> 
                        <span class="text-neutral-300">/</span> 
                        <span class="text-black">Course Details</span>
                    </nav>

                    <header class="bg-white border p-4 rounded-xl shadow-sm space-y-4">
                        <div class="flex flex-col md:flex-row md:items-start justify-between gap-4">
                            <div>
                                <h1 class="text-2xl font-bold tracking-tight mb-2">${course.course_name}</h1>
                                ${course.description ? `<p class="text-sm text-muted-fg leading-relaxed max-w-2xl">${course.description}</p>` : ''}
                            </div>
                            <div class="bg-neutral-50 border px-3 py-2 rounded-lg text-center min-w-[100px]">
                                <p class="text-[10px] font-bold uppercase tracking-widest text-muted-fg mb-1">Duration</p>
                                <p class="text-lg font-bold">${format_duration(course.course_duration)}</p>
                            </div>
                        </div>
                    </header>

                    <main class="space-y-6">
                        <div class="flex items-center justify-between px-1">
                            <h3 class="text-xs font-bold uppercase tracking-widest text-muted-fg">Course Topics</h3>
                            <span class="text-[11px] font-bold text-black border px-2 py-0.5 rounded bg-neutral-100">${topics.length} Modules</span>
                        </div>

                        <div class="space-y-3">
                            ${this.render_modules(topics)}
                        </div>
                    </main>
                    
                    <div class="pt-8 flex justify-center">
                        <button class="px-5 py-2 rounded-md bg-black text-white hover:bg-neutral-800 transition-all text-sm font-medium shadow-sm hover:shadow-md active:scale-95" onclick="frappe.set_route('student-dashboard')">
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            </div>
		`);
    }

    render_modules(topics) {
        if (!topics || topics.length === 0) {
            return '<div class="text-center py-10 border-2 border-dashed rounded-xl bg-neutral-50/50 text-muted-fg">No topics found for this course.</div>';
        }

        return topics.map((topic, index) => {
            return `
              <div class="bg-white border rounded-xl p-3 shadow-sm hover:border-black transition-all group cursor-default">
                <div class="flex items-start gap-4">
                  <div class="h-8 w-8 rounded-full bg-neutral-100 flex items-center justify-center text-[10px] font-black shrink-0 text-muted-fg group-hover:bg-black group-hover:text-white transition-colors">
                    ${String(index + 1).padStart(2, '0')}
                  </div>
                  <div class="space-y-1 flex-1">
                    <h4 class="text-sm font-bold group-hover:text-blue-600 transition-colors">${topic.topic}</h4>
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
				<button onclick="frappe.set_route('student-dashboard')" class="inline-block mt-6 px-4 py-2 bg-black text-white rounded-md text-xs font-bold hover:opacity-80">
					Back to Dashboard
				</button>
			</div>
		`);
    }

    show_error(message) {
        this.wrapper.html(`
			<div class="mx-auto max-w-6xl p-8">
				<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
					<strong class="font-bold">Error:</strong>
					<span class="block sm:inline">${message}</span>
                    <div class="mt-4">
                         <button onclick="frappe.set_route('student-dashboard')" class="text-xs underline font-bold">Return to Dashboard</button>
                    </div>
				</div>
			</div>
		`);
    }
}