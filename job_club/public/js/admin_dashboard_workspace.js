// Robust Admin Dashboard Script
// Uses polling to ensure button stays visible even if the workspace completely re-renders its DOM
let dashboard_poll_interval = null;
let current_attendance_state = "Unknown";

$(document).on("page-change", function () {
    const route = frappe.get_route();

    // Check if we are on the Admin Dashboard workspace
    const isDashboard = (route[0] === 'app' && route[1].toLowerCase() === 'admin-dashboard') ||
        (route[0].toLowerCase() === 'admin-dashboard') ||
        (route[0] === 'Workspaces' && route[1] === 'Admin Dashboard');

    if (isDashboard) {
        fetch_attendance_status();
        start_polling();
    } else {
        stop_polling();
    }
});

let current_attendance_name = null;

function fetch_attendance_status() {
    frappe.call({
        method: "job_club.api.attendance.get_attendance_status",
        callback: function (r) {
            if (r.message) {
                current_attendance_state = r.message.status;
                if (r.message.name) {
                    current_attendance_name = r.message.name;
                }
                update_button_visuals();
            }
        }
    });
}
// ... existing code ...
const action = function () {
    if (current_attendance_state === "Checked In") {
        if (current_attendance_name) {
            window.location.href = "/employee-check-out/" + current_attendance_name;
        } else {
            frappe.msgprint("Error: Could not find attendance record to check out.");
        }
    } else {
        // If Not Checked In or Unknown, redirect to the Check-In page
        window.location.href = "/employee-attendance";
    }
};

function update_button_visuals() {
    const $btn = $(".btn-mark-attendance");
    if (!$btn.length) return;

    if (current_attendance_state === "Checked In") {
        $btn.text("Check Out");
        $btn.css({
            "background-color": "#e24c4c", // Red indicating stop/check-out
            "border-color": "#e24c4c",
            "color": "white"
        });
        $btn.prop("disabled", false);
    } else if (current_attendance_state === "Checked Out") {
        $btn.text("Checked Out");
        $btn.prop("disabled", true);
        $btn.css({
            "background-color": "#6c757d",
            "border-color": "#6c757d",
            "color": "white"
        });
    } else {
        $btn.text("Mark Attendance");
        $btn.prop("disabled", false);
        $btn.css({
            "background-color": "rgb(49 46 129)",
            "border-color": "rgb(49 46 129)",
            "color": "white"
        });
    }
}

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

    // Check for edit mode
    // In Frappe Workspace, when in edit mode, the 'Save' button is visible in standard-actions
    const isEditMode = $(page_obj.wrapper).find(".standard-actions button.btn-primary:contains('Save')").is(":visible");
    const $existing_btn = $(page_obj.wrapper).find(`button.btn-mark-attendance`);

    if (isEditMode) {
        if ($existing_btn.length) {
            $existing_btn.hide();
        }
        return;
    }

    // Check if button is already in DOM and visible
    if ($existing_btn.length && $existing_btn.is(":visible")) {
        // Just ensure visuals are correct even if it exists
        if ($existing_btn.text() !== get_expected_label()) {
            update_button_visuals();
        }
        return;
    }

    // If button exists but is hidden, make it visible since we are not in edit mode
    if ($existing_btn.length && !$existing_btn.is(":visible")) {
        $existing_btn.show();
        update_button_visuals();
        return;
    }

    try {
        const action = function () {
            if (current_attendance_state === "Checked In") {
                if (current_attendance_name) {
                    window.location.href = "/employee-check-out/" + current_attendance_name;
                } else {
                    frappe.msgprint("Error: Could not find attendance record to check out.");
                }
            } else {
                // If Not Checked In or Unknown, redirect to the Check-In page
                window.location.href = "/employee-attendance";
            }
        };

        let $btn = null;

        if (typeof page_obj.add_inner_button === 'function') {
            $btn = page_obj.add_inner_button("Mark Attendance", action);
        } else if (typeof page_obj.set_primary_action === 'function') {
            $btn = page_obj.set_primary_action("Mark Attendance", action);
        }

        if ($btn) {
            $btn.addClass("btn-mark-attendance");
            $btn.css({
                "background-color": "rgb(49 46 129)", // Initial color
                "color": "white",
                "border-color": "rgb(49 46 129)",
                "margin-right": "10px",
                "padding": "5px 12px",
                "font-size": "13px",
                "font-weight": "bold"
            });

            // Apply current state visuals immediately
            update_button_visuals();

            // Inject responsive CSS if not present
            if (!$("#job-club-dashboard-styles").length) {
                $("<style>")
                    .attr("id", "job-club-dashboard-styles")
                    .prop("type", "text/css")
                    .html(`
                        @media (max-width: 767px) {
                            .btn-mark-attendance {
                                display: inline-block !important;
                                padding: 8px 16px !important;
                                font-size: 16px !important;
                                margin-top: 10px;
                                width: 100%;
                            }
                        }
                    `)
                    .appendTo("head");
            }

            // Ensure button is visible on mobile by moving it to the main content area
            if (window.innerWidth < 768) {
                const $layoutMain = $(page_obj.wrapper).find('.layout-main-section');
                if ($layoutMain.length && !$btn.parent().is($layoutMain)) {
                    $layoutMain.prepend($btn);
                    $btn.css({
                        "margin-top": "10px",
                        "margin-bottom": "15px",
                        "display": "block",
                        "width": "100%",
                        "border-radius": "8px"
                    });
                }
            }
        }
    } catch (e) {
        // console.error("Job Club: Failed to add button", e);
    }
}

function get_expected_label() {
    if (current_attendance_state === "Checked In") return "Check Out";
    if (current_attendance_state === "Checked Out") return "Checked Out";
    return "Mark Attendance";
}
