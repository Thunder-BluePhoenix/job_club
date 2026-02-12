// Robust Admin Dashboard Script
// Uses polling to ensure button stays visible even if the workspace completely re-renders its DOM
let dashboard_poll_interval = null;

$(document).on("page-change", function () {
    const route = frappe.get_route();

    // Check if we are on the Admin Dashboard workspace
    const isDashboard = (route[0] === 'app' && route[1].toLowerCase() === 'admin-dashboard') ||
        (route[0].toLowerCase() === 'admin-dashboard') ||
        (route[0] === 'Workspaces' && route[1] === 'Admin Dashboard');

    if (isDashboard) {
        start_polling();
    } else {
        stop_polling();
    }
});

function stop_polling() {
    if (dashboard_poll_interval) {
        clearInterval(dashboard_poll_interval);
        dashboard_poll_interval = null;
    }
}

function start_polling() {
    stop_polling();

    // Check every 1 second
    dashboard_poll_interval = setInterval(() => {
        if (!is_on_dashboard()) {
            stop_polling();
            return;
        }
        ensure_button_exists();
    }, 1000);

    // Also run immediately
    ensure_button_exists();
}

function is_on_dashboard() {
    const route = frappe.get_route();
    if (!route || route.length < 2) return false;

    return (route[0] === 'app' && route[1].toLowerCase() === 'admin-dashboard') ||
        (route[0].toLowerCase() === 'admin-dashboard') ||
        (route[0] === 'Workspaces' && route[1] === 'Admin Dashboard');
}

function ensure_button_exists() {
    if (!cur_page || !cur_page.page) return;

    let page_obj = cur_page.page;
    // Handle nested page object structure
    if (page_obj.page && !page_obj.set_primary_action) {
        page_obj = page_obj.page;
    }

    // Check if button is already in DOM and visible
    if (page_obj.wrapper && $(page_obj.wrapper).find(`button:contains("Mark Attendance")`).is(":visible")) {
        return;
    }

    // console.log("Job Club: Button missing, adding/re-adding...");

    try {
        const action = function () {
            window.location.href = "/employee-attendance";
        };

        let $btn = null;

        if (typeof page_obj.set_primary_action === 'function') {
            $btn = page_obj.set_primary_action("Mark Attendance", action);
        } else if (typeof page_obj.add_inner_button === 'function') {
            $btn = page_obj.add_inner_button("Mark Attendance", action);
        }

        if ($btn) {
            $btn.css({
                "background-color": "rgb(49 46 129)", // User requested color
                "color": "white",
                "border-color": "rgb(49 46 129)"
            });
        }
    } catch (e) {
        // console.error("Job Club: Failed to add button", e);
    }
}
