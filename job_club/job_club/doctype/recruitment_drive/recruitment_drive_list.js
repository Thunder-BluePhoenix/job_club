frappe.listview_settings['Recruitment Drive'] = {
    get_indicator: function (doc) {
        if (doc.status === "Open") {
            return [__("Open"), "green", "status,=,Open"];
        } else if (doc.status === "Closed") {
            return [__("Closed"), "red", "status,=,Closed"];
        }
    }
};
