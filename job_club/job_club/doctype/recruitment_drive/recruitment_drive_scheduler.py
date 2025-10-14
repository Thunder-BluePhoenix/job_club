import frappe
from frappe.utils import now_datetime

def close_expired_drives():
    """
    Automatically close Recruitment Drives when their closing_date has passed.
    Ignores drives without a closing_date.
    Broadcasts realtime updates to all users.
    """
    current_time = now_datetime()

    # ✅ Fetch only drives that have a closing_date and are still Open
    expired_drives = frappe.get_all(
        "Recruitment Drive",
        filters={
            "status": "Open",
            "closing_date": ["is", "set"],  # ensures closing_date is not empty
            "closing_date": ["<=", current_time]
        },
        fields=["name", "drive_name"]
    )

    if not expired_drives:
        return

    closed_names = []

    for drive in expired_drives:
        frappe.db.set_value("Recruitment Drive", drive.name, "status", "Closed")
        closed_names.append(drive.drive_name)
        frappe.logger().info(f"[Auto Close] Drive '{drive.drive_name}' closed automatically at {current_time}")

    frappe.db.commit()

    # 🔔 Broadcast realtime update to all users
    frappe.publish_realtime(
        event="recruitment_drive_closed",
        message={
            "closed_drives": closed_names,
            "timestamp": str(current_time)
        },
        user=None,  # broadcast globally
    )
