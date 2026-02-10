(function () {
    const HOME_URL = '/app/admin-dashboard';

    // Redirect based on user role after login
    function handleLoginRedirect() {
        // Check if we're on the home/workspace page after login
        if (window.location.pathname === '/app' || window.location.pathname === '/app/home') {
            // Wait for frappe to be ready, then check role and redirect
            if (typeof frappe !== 'undefined' && frappe.session && frappe.session.user) {
                // Use frappe.session.user_roles which is more reliable
                const roles = frappe.session.user_roles || frappe.user_roles || [];
                const isStudent = roles.includes('Student');

                // Debug logging - remove after testing
                console.log('Job Club Redirect - User:', frappe.session.user);
                console.log('Job Club Redirect - Roles:', roles);
                console.log('Job Club Redirect - Is Student:', isStudent);

                const targetRoute = isStudent ? 'student-dashboard' : 'admin-dashboard';
                console.log('Job Club Redirect - Target:', targetRoute);

                if (frappe.set_route) {
                    frappe.set_route(targetRoute);
                } else {
                    // Fallback to direct navigation
                    setTimeout(() => {
                        window.location.href = isStudent ? '/app/student-dashboard' : '/app/admin-dashboard';
                    }, 500);
                }
            } else {
                // Fallback if frappe not ready - default to admin dashboard
                console.log('Job Club Redirect - Frappe not ready, using fallback');
                setTimeout(() => {
                    window.location.href = '/app/admin-dashboard';
                }, 500);
            }
        }
    }

    function updateHomeLink() {
        // Try to find the navbar home link using multiple selectors
        const selectors = [
            '.navbar-brand.navbar-home',
            'a.navbar-home',
            '.navbar-home',
            'a[href="/app"]'
        ];

        let homeLink = null;
        for (let selector of selectors) {
            homeLink = document.querySelector(selector);
            if (homeLink) break;
        }

        if (!homeLink) return;

        // Determine target URL based on user role
        let targetUrl = '/app/admin-dashboard';
        let targetRoute = 'admin-dashboard';

        if (typeof frappe !== 'undefined' && frappe.session && frappe.session.user) {
            const roles = frappe.session.user_roles || frappe.user_roles || [];
            const hasStudentRole = roles.includes('Student');
            const hasAdminRoles = roles.some(role => ['System Manager', 'Administrator'].includes(role));

            // Only redirect to student dashboard if user has Student role and is not an admin
            if (hasStudentRole && !hasAdminRoles) {
                targetUrl = '/app/student-dashboard';
                targetRoute = 'student-dashboard';
            }
        }

        const currentHref = homeLink.getAttribute('href');

        // Update href if it's not already set to the target dashboard
        if (currentHref !== targetUrl) {
            homeLink.setAttribute('href', targetUrl);

            // Override click handler to use Frappe routing
            homeLink.addEventListener('click', function (e) {
                e.preventDefault();
                if (typeof frappe !== 'undefined' && frappe.set_route) {
                    frappe.set_route(targetRoute);
                } else {
                    window.location.href = targetUrl;
                }
            });
        }
    }

    // Handle login redirect
    handleLoginRedirect();

    // Try to update home link immediately
    updateHomeLink();

    // Try after DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            updateHomeLink();
            handleLoginRedirect();
        });
    }

    // Keep trying periodically to handle dynamic navbar updates
    setInterval(updateHomeLink, 2000);
})();