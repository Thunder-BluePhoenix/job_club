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
        // Use shared utility to load CSS
        if (window.StudentPortalUtils) {
            window.StudentPortalUtils.loadAllStyles();
        } else {
            this.add_tailwind_css();
        }

        // Wait for Tailwind to load
        setTimeout(() => this.load_course_data(), 500);
    }

    add_tailwind_css() {
        // Fallback if shared utility not available
        const tailwindId = 'student-portal-tailwind-css';
        if (!document.getElementById(tailwindId)) {
            const script = document.createElement('script');
            script.id = tailwindId;
            script.src = 'https://cdn.tailwindcss.com';
            document.head.appendChild(script);
        }

        const iconId = 'student-portal-material-icons';
        if (!document.getElementById(iconId)) {
            const link = document.createElement('link');
            link.id = iconId;
            link.rel = 'stylesheet';
            link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap';
            document.head.appendChild(link);
        }
    }

    load_course_data() {
        this.wrapper.html(`
            <div class="flex items-center justify-center min-h-screen bg-slate-50">
                <div class="text-center">
                    <div class="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p class="text-slate-600 font-medium">Loading course details...</p>
                </div>
            </div>
        `);

        frappe.call({
            method: 'job_club.api.student_portal_api.get_course_progress',
            callback: (r) => {
                if (r.message && r.message.length > 0) {
                    this.course = r.message[0];
                    this.load_course_structure();
                } else {
                    this.show_no_course();
                }
            },
            error: (r) => {
                this.show_error("Error loading course details. Please ensure you have proper access permissions.");
            }
        });
    }

    load_course_structure() {
        frappe.call({
            method: 'frappe.client.get',
            args: {
                doctype: 'Course',
                name: this.course.course
            },
            callback: (r) => {
                if (r.message) {
                    this.course_doc = r.message;
                    setTimeout(() => this.render_page(), 100);
                } else {
                    this.show_error("Unable to load course structure.");
                }
            },
            error: (r) => {
                // If can't access Course doctype, render with limited info
                this.course_doc = {
                    course_name: this.course.course_name || this.course.course,
                    description: '',
                    topics: []
                };
                setTimeout(() => this.render_page(), 100);
            }
        });
    }

    render_page() {
        const course = this.course_doc;
        const progress = this.course;

        this.wrapper.html(`
            <div class="bg-slate-50 dark:bg-slate-950 min-h-screen">
                ${this.render_navbar()}
                
                <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    ${this.render_header(course, progress)}
                    
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        ${this.render_curriculum(course)}
                        ${this.render_sidebar(course, progress)}
                    </div>
                </main>

                ${this.render_footer()}
            </div>
        `);
    }

    render_navbar() {
        return `
            <nav class="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="flex justify-between h-20 items-center">
                        <div class="flex items-center gap-12">
                            <div class="flex flex-col">
                                <span class="font-bold text-2xl tracking-tighter text-blue-900 dark:text-blue-400 leading-none uppercase">EMPORIUM</span>
                                <span class="text-[10px] font-bold text-red-600 tracking-widest leading-none mt-1">Building a New Nation</span>
                            </div>
                            <div class="hidden md:flex gap-8 text-sm font-semibold text-slate-600 dark:text-slate-400">
                                <a class="hover:text-blue-900 dark:hover:text-blue-400 transition-colors" href="/app/student-dashboard">Dashboard</a>
                                <a class="text-blue-900 dark:text-blue-400 border-b-2 border-blue-900 dark:border-blue-400 pb-1" href="/app/course-details">My Courses</a>
                                <a class="hover:text-blue-900 dark:hover:text-blue-400 transition-colors" href="/app/fees-details">Fee Structure</a>
                            </div>
                        </div>
                        <button class="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" onclick="document.documentElement.classList.toggle('dark')">
                            <span class="material-symbols-outlined text-slate-600 dark:text-slate-400">dark_mode</span>
                        </button>
                    </div>
                </div>
            </nav>
        `;
    }

    render_header(course, progress) {
        return `
            <div class="mb-10">
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div class="space-y-3">
                        <nav class="flex items-center text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                            <a class="hover:text-blue-900 dark:hover:text-blue-400 transition-colors" href="/app/course-details">COURSES</a>
                            <span class="mx-2 text-slate-300">/</span>
                            <span class="text-blue-900 dark:text-blue-400">${course.course_name}</span>
                        </nav>
                        <h1 class="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-3xl leading-tight">${course.course_name}</h1>
                        <div class="flex items-center gap-3 pt-1">
                            <span class="px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-800">Academic Year ${progress.academic_year}</span>
                            <span class="px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800">In Progress</span>
                        </div>
                    </div>
                    
                    <div class="w-full md:w-80 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl">
                        <div class="flex justify-between items-center mb-3">
                            <span class="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Attendance</span>
                            <span class="text-sm font-black text-blue-900 dark:text-blue-400">${Math.round(progress.attendance_percentage)}%</span>
                        </div>
                        <div class="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                            <div class="bg-blue-900 dark:bg-blue-500 h-full transition-all duration-1000 ease-out" style="width: ${progress.attendance_percentage}%"></div>
                        </div>
                        <p class="text-[11px] mt-3 text-slate-400 font-medium">${progress.total_classes} classes attended</p>
                    </div>
                </div>
            </div>
        `;
    }

    render_curriculum(course) {
        const topics = course.topics || [];

        return `
            <div class="lg:col-span-2 space-y-8">
                <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                    <h2 class="text-2xl font-bold text-slate-900 dark:text-white">Course Curriculum</h2>
                </div>
                
                ${course.description ? `
                    <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <h3 class="font-bold mb-3 text-slate-900 dark:text-white">Course Description</h3>
                        <p class="text-slate-600 dark:text-slate-400 leading-relaxed">${course.description}</p>
                    </div>
                ` : ''}
                
                <div class="space-y-5">
                    ${topics.length > 0 ? this.render_topics(topics) : this.render_no_topics()}
                </div>
            </div>
        `;
    }

    render_topics(topics) {
        return topics.map((topic, index) => {
            const isFirst = index === 0;
            const topicData = this.get_topic_data(topic.topic);

            return `
                <div class="bg-white dark:bg-slate-900 border ${isFirst ? 'border-2 border-blue-900/20 dark:border-blue-500/20' : 'border-slate-200 dark:border-slate-800'} rounded-2xl overflow-hidden hover:border-emerald-200 dark:hover:border-emerald-800 transition-all">
                    <div class="p-6 flex items-center justify-between cursor-pointer group">
                        <div class="flex items-center gap-5">
                            <div class="w-12 h-12 rounded-xl ${isFirst ? 'bg-blue-900 dark:bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800'} flex items-center justify-center">
                                <span class="material-symbols-outlined font-bold">${isFirst ? 'auto_stories' : 'check_circle'}</span>
                            </div>
                            <div>
                                <h3 class="font-bold text-lg text-slate-900 dark:text-white group-hover:text-blue-900 dark:group-hover:text-blue-400 transition-colors">Module ${String(index + 1).padStart(2, '0')}: ${topic.topic}</h3>
                                ${topicData ? `<p class="text-sm text-slate-500 dark:text-slate-400 font-medium">${topicData.description || 'Course module'}</p>` : ''}
                            </div>
                        </div>
                        <span class="material-symbols-outlined text-slate-300 dark:text-slate-700 group-hover:text-blue-900 dark:group-hover:text-blue-400 transition-all">${isFirst ? 'expand_less' : 'expand_more'}</span>
                    </div>
                    
                    ${isFirst && topicData ? this.render_topic_contents(topicData) : ''}
                </div>
            `;
        }).join('');
    }

    render_topic_contents(topicData) {
        const contents = topicData.topic_content || [];

        if (contents.length === 0) {
            return `
                <div class="px-6 pb-6 border-t border-slate-100 dark:border-slate-800 pt-5">
                    <p class="text-sm text-slate-500 dark:text-slate-400 text-center py-4">No content available for this topic</p>
                </div>
            `;
        }

        return `
            <div class="px-6 pb-6 border-t border-slate-100 dark:border-slate-800 pt-5">
                <div class="space-y-4">
                    ${contents.map(content => this.render_content_item(content)).join('')}
                </div>
            </div>
        `;
    }

    render_content_item(content) {
        const icons = {
            'Video': 'play_circle',
            'Article': 'description',
            'Quiz': 'task_alt'
        };

        const colors = {
            'Video': 'text-blue-900 dark:text-blue-400',
            'Article': 'text-slate-600 dark:text-slate-400',
            'Quiz': 'text-emerald-600 dark:text-emerald-400'
        };

        const icon = icons[content.content_type] || 'description';
        const color = colors[content.content_type] || 'text-slate-400';

        return `
            <div class="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 group hover:border-blue-900/50 dark:hover:border-blue-500/50 transition-all">
                <div class="flex items-center gap-4">
                    <span class="material-symbols-outlined ${color}">${icon}</span>
                    <div>
                        <p class="text-sm font-bold text-slate-900 dark:text-white">${content.content}</p>
                        <p class="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold mt-0.5">${content.content_type}</p>
                    </div>
                </div>
                <button class="px-5 py-2 bg-blue-900 dark:bg-blue-600 text-white text-[10px] font-black rounded-lg hover:bg-blue-800 dark:hover:bg-blue-700 transition-colors tracking-widest">START</button>
            </div>
        `;
    }

    render_no_topics() {
        return `
            <div class="bg-white dark:bg-slate-900 p-10 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
                <span class="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-700 mb-4">school</span>
                <p class="text-slate-500 dark:text-slate-400">No topics available for this course</p>
            </div>
        `;
    }

    render_sidebar(course, progress) {
        return `
            <div class="space-y-8">
                <section class="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h4 class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Course Information</h4>
                    <div class="space-y-4">
                        ${course.department ? `
                        <div>
                            <p class="text-xs text-slate-500 dark:text-slate-400 mb-1">Department</p>
                            <p class="font-bold text-slate-900 dark:text-white">${course.department}</p>
                        </div>
                        ` : ''}
                        
                        <div>
                            <p class="text-xs text-slate-500 dark:text-slate-400 mb-1">Batch</p>
                            <p class="font-bold text-slate-900 dark:text-white">${progress.batch || 'Not Assigned'}</p>
                        </div>
                        
                        <div>
                            <p class="text-xs text-slate-500 dark:text-slate-400 mb-1">Total Classes</p>
                            <p class="font-bold text-slate-900 dark:text-white">${progress.total_classes} Classes</p>
                        </div>
                    </div>
                </section>

                <section class="bg-blue-900 dark:bg-blue-800 p-8 rounded-2xl text-white shadow-xl relative overflow-hidden group">
                    <div class="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                        <span class="material-symbols-outlined text-[120px]">cloud_download</span>
                    </div>
                    <div class="relative z-10">
                        <div class="flex items-start justify-between mb-6">
                            <div>
                                <h4 class="text-xl font-bold">Course Resources</h4>
                                <p class="text-xs text-blue-200 mt-1 font-medium">Download full curriculum PDF</p>
                            </div>
                        </div>
                        <button class="w-full py-3.5 rounded-xl bg-white text-blue-900 text-[11px] font-black uppercase tracking-widest hover:bg-blue-50 transition-all flex items-center justify-center gap-2">
                            <span class="material-symbols-outlined text-sm">download</span>
                            Download Syllabus
                        </button>
                    </div>
                </section>
            </div>
        `;
    }

    render_footer() {
        return `
            <footer class="mt-24 border-t border-slate-200 dark:border-slate-800 py-16 bg-white dark:bg-slate-900">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="grid grid-cols-1 md:grid-cols-3 items-center gap-10">
                        <div class="flex flex-col">
                            <span class="font-black text-lg tracking-tight text-blue-900 dark:text-blue-400">EMPORIUM</span>
                            <span class="text-[8px] font-bold text-red-600 tracking-[0.3em] leading-none">STUDENT PORTAL v4.2</span>
                        </div>
                        <div class="flex justify-center gap-10 text-xs font-bold text-slate-400 uppercase tracking-widest">
                            <a class="hover:text-blue-900 dark:hover:text-blue-400 transition-colors" href="#">Support</a>
                            <a class="hover:text-blue-900 dark:hover:text-blue-400 transition-colors" href="#">Privacy</a>
                            <a class="hover:text-blue-900 dark:hover:text-blue-400 transition-colors" href="#">Terms</a>
                        </div>
                        <div class="text-right">
                            <p class="text-xs text-slate-400 font-medium italic">© 2024 Emporium Education Group.<br/>All global rights reserved.</p>
                        </div>
                    </div>
                </div>
            </footer>
        `;
    }

    get_topic_data(topic_name) {
        // This would normally fetch topic details from the server
        // For now, return a placeholder
        return {
            description: 'Course topic content',
            topic_content: []
        };
    }

    show_no_course() {
        this.wrapper.html(`
            <div class="flex items-center justify-center min-h-screen bg-slate-50">
                <div class="text-center max-w-md mx-auto p-8">
                    <div class="text-blue-600 mb-4">
                        <span class="material-symbols-outlined text-6xl">school</span>
                    </div>
                    <p class="text-lg font-semibold text-slate-900 mb-2">No Course Found</p>
                    <p class="text-slate-600 mb-6">You don't have any enrolled courses yet.</p>
                    <a href="/app/student-dashboard" class="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                        Back to Dashboard
                    </a>
                </div>
            </div>
        `);
    }

    show_error(message) {
        this.wrapper.html(`
            <div class="flex items-center justify-center min-h-screen bg-slate-50">
                <div class="text-center max-w-md mx-auto p-8">
                    <div class="text-red-600 mb-4">
                        <span class="material-symbols-outlined text-6xl">error</span>
                    </div>
                    <p class="text-lg font-semibold text-slate-900 mb-2">Error</p>
                    <p class="text-slate-600 mb-6">${message}</p>
                    <button onclick="location.reload()" class="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                        Retry
                    </button>
                </div>
            </div>
        `);
    }
}