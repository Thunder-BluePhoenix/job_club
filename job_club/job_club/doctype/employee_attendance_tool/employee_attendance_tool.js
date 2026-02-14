// Copyright (c) 2026, BluePhoenix and contributors
// For license information, please see license.txt

frappe.provide("job_club");

frappe.ui.form.on('Employee Attendance Tool', {
	setup: (frm) => {
		frm.employees_area = $('<div>')
			.appendTo(frm.fields_dict.employees_html.wrapper);
	},

	onload: function (frm) {
		frm.set_value("month", moment().format("MMMM"));
		frm.set_value("year", moment().format("YYYY"));

		frm.set_query("department", function () {
			return {
				"filters": {
					"is_group": 0
				}
			};
		});
	},

	refresh: function (frm) {
		frm.disable_save();
	},

	branch: function (frm) {
		frm.trigger("department");
	},

	department: function (frm) {
		if ((frm.doc.department || frm.doc.branch) && frm.doc.month && frm.doc.year) {
			frm.employees_area.html(
				`<div class="text-center" style="padding: 2rem; font-size: 18px; color: #666;">
					<i class="fa fa-spinner fa-spin"></i> Fetching Attendance Data...
				</div>`
			);

			frappe.call({
				method: "job_club.job_club.doctype.employee_attendance_tool.employee_attendance_tool.get_employee_attendance_records",
				args: {
					department: frm.doc.department,
					branch: frm.doc.branch || null,
					month: frm.doc.month,
					year: frm.doc.year
				},
				callback: function (r) {
					frm.events.get_employees(frm, r.message);
				}
			});
		} else {
			frm.employees_area.empty();
		}
	},

	month: function (frm) {
		frm.trigger("department");
	},

	year: function (frm) {
		frm.trigger("department");
	},

	get_employees: function (frm, data) {
		if (data && data.employees && data.employees.length > 0) {
			frm.employees_editor = new job_club.EmployeesEditor(frm, frm.employees_area, data);
		} else {
			frm.employees_area.html(
				`<div class="text-center text-muted" 
					style="line-height: 100px; font-size: 16px; border: 1px dashed #ccc; border-radius: 5px; margin: 20px 0;">
					No employees found in the selected department/branch.
				</div>`
			);
		}
	}
});


job_club.EmployeesEditor = class EmployeesEditor {
	constructor(frm, wrapper, data) {
		this.wrapper = wrapper;
		this.frm = frm;
		this.make(frm, data);
	}

	make(frm, data) {
		let me = this;
		$(this.wrapper).empty();

		let year = data.year;
		let month_num = data.month_num;

		let html = `
		<div style="overflow-x:auto; background:#fff; border-radius:12px; 
		            box-shadow:0 6px 18px rgba(0,0,0,0.08); padding:20px;">
			<table class="table table-bordered" 
			       style="border-collapse:separate; border-spacing:0; width:100%; text-align:center; table-layout:auto;">
				<thead style="background:#1e40af; color:#fff;">
					<tr>
						<th style="min-width:120px; padding:12px; position:sticky; left:0; z-index:10; background:#1e40af;">Employee ID</th>
						<th style="min-width:180px; padding:12px; position:sticky; left:120px; z-index:10; background:#1e40af;">Employee Name</th>
						<th style="min-width:120px; padding:12px; position:sticky; left:300px; z-index:10; background:#1e40af;">Department</th>
						${Array.from({ length: data.num_days }, (_, i) => {
			let d = i + 1;
			let weekday = moment(`${year}-${month_num}-${d}`, "YYYY-M-D").format("ddd");
			let is_holiday = data.holidays.includes(d);
			let header_bg = is_holiday ? 'background:#f59e0b;' : 'background:#1e40af;';
			return `<th style="${header_bg} min-width:80px; padding:8px;">${d}<br><span style="font-size:11px; color:#eee;">${weekday}</span></th>`;
		}).join('')}
					</tr>
				</thead>
				<tbody>
					${data.employees.map(e => `
						<tr data-employee="${e.employee}" data-employee-name="${e.employee_name}">
							<td style="font-weight:600; background:#f9fafc; padding:10px; min-width:120px; position:sticky; left:0; z-index:5;">${e.employee || ''}</td>
							<td style="background:#f9fafc; padding:10px; min-width:180px; position:sticky; left:120px; z-index:5;">${e.employee_name}</td>
							<td style="background:#f9fafc; font-size:14px; padding:10px; min-width:120px; position:sticky; left:300px; z-index:5;">${e.department || ''}</td>
							${Array.from({ length: data.num_days }, (_, i) => {
			let d = i + 1;
			let att = e.attendance?.[d] || { status: '', remarks: '' };
			let status = att.status || '';
			let remarks = att.remarks || '';
			let is_holiday = data.holidays.includes(d);

			// Get today
			let current_date = moment(frappe.datetime.get_today());
			let today_day = current_date.date();
			let today_month = current_date.month() + 1;
			let today_year = current_date.year();
			let is_today = (d === today_day && month_num === today_month && year === today_year);

			let bg = this.get_status_color(status, is_holiday);

			if (is_today && !is_holiday) {
				// Today → Editable (unless holiday)
				return `
									<td style="padding:8px; vertical-align:top; background:${bg}; min-width:80px;">
										<select class="form-control att-select" data-day="${d}" 
												style="width:100%; max-width:70px; margin:0 auto 4px; border-radius:6px; text-align:center; font-size:13px; padding:4px;">
											<option value="" ${status == "" ? "selected" : ""}></option>
											<option value="Present" ${status == "Present" ? "selected" : ""}>Present</option>
											<option value="Absent" ${status == "Absent" ? "selected" : ""}>Absent</option>
											<option value="Leave" ${status == "Leave" ? "selected" : ""}>Leave</option>
											<option value="Work From Home" ${status == "Work From Home" ? "selected" : ""}>WFH</option>
										</select>
										<input type="text" class="form-control remarks" data-day="${d}" 
											style="font-size:11px; padding:4px; border-radius:6px; text-align:center; width:100%; max-width:70px; margin:0 auto;" 
											placeholder="Note" value="${remarks}">
									</td>`;
			} else {
				// Other days or holidays → Display only
				let display = '';
				if (is_holiday) {
					display = '<div style="font-size:20px;">🏖️</div>';
				} else if (status) {
					display = `<div style="font-size:14px; font-weight:600;">${status.charAt(0)}</div>`;
				}
				let remark_display = remarks ? `<div style="font-size:10px; color:#555; margin-top:4px;">${remarks}</div>` : '';
				return `<td style="padding:8px; vertical-align:middle; background:${bg}; min-width:80px;">
												${display}${remark_display}
											</td>`;
			}
		}).join('')}
						</tr>
					`).join('')}
				</tbody>
			</table>
		</div>`;

		$(`<div class="employee-attendance-checks">${html}</div>`).appendTo(me.wrapper);

		// Status change = immediate background update
		$(me.wrapper).find('.att-select').on('change', function () {
			let status = $(this).val();
			let bg = me.get_status_color(status, false);
			$(this).closest('td').css('background', bg);
		});

		// Save button
		let save_button = $(`<button class="btn" 
			style="float:right; margin-top:32px; border-radius:8px; 
				padding:8px 20px; font-weight:600; box-shadow:0 4px 10px rgba(0,0,0,0.15);
				background-color:#1e40af; color:#fff; border:none;">
			💾 Save Today's Attendance</button>`);

		// Add hover effect
		save_button.hover(
			function () { $(this).css("background-color", "#1e3a8a"); },
			function () { $(this).css("background-color", "#1e40af"); }
		);

		save_button.on("click", function () {
			$(save_button).attr("disabled", true);
			let employees_present = [], employees_absent = [], employees_leave = [], employees_wfh = [];

			$(me.wrapper).find('tr[data-employee]').each(function (_, row) {
				let $row = $(row);
				let employee = $row.data('employee');
				let employee_name = $row.data('employee-name');

				$row.find('.att-select').each(function () {
					let day = $(this).data('day');
					let status = $(this).val();
					let remarks = $row.find(`.remarks[data-day='${day}']`).val() || '';

					if (status) {
						let entry = { employee, employee_name, remarks };
						if (status == "Present") employees_present.push(entry);
						if (status == "Absent") employees_absent.push(entry);
						if (status == "Leave") employees_leave.push(entry);
						if (status == "Work From Home") employees_wfh.push(entry);
					}
				});
			});

			frappe.call({
				method: "job_club.api.employee_attendance_tool.mark_employee_attendance_tool",
				freeze: true,
				freeze_message: __("Marking attendance"),
				args: {
					employees_present: JSON.stringify(employees_present),
					employees_absent: JSON.stringify(employees_absent),
					employees_leave: JSON.stringify(employees_leave),
					employees_wfh: JSON.stringify(employees_wfh),
					department: frm.doc.department,
					branch: frm.doc.branch || null,
					date: frappe.datetime.get_today()
				},
				callback: function (r) {
					$(save_button).attr("disabled", false);
					if (r.message) {
						frappe.msgprint(__("Attendance saved for {0} employees.", [r.message.count]));
					}
					frm.trigger("department");
				}
			});
		});
		$(this.wrapper).append(save_button);

		// Legend
		let legend = $(`
			<div style="margin-top:20px; padding:15px; background:#f8f9fa; border-radius:8px; display:flex; gap:20px; flex-wrap:wrap; justify-content:center; align-items:center;">
				<div style="display:flex; align-items:center; gap:8px;">
					<div style="width:30px; height:30px; background:#2f8b1e80; border-radius:4px; border:1px solid #ddd;"></div>
					<span style="font-size:14px; font-weight:600; color:#333;">Present</span>
				</div>
				<div style="display:flex; align-items:center; gap:8px;">
					<div style="width:30px; height:30px; background:#a24a4ab3; border-radius:4px; border:1px solid #ddd;"></div>
					<span style="font-size:14px; font-weight:600; color:#333;">Absent</span>
				</div>
				<div style="display:flex; align-items:center; gap:8px;">
					<div style="width:30px; height:30px; background:#9dc0dd; border-radius:4px; border:1px solid #ddd;"></div>
					<span style="font-size:14px; font-weight:600; color:#333;">Leave</span>
				</div>
				<div style="display:flex; align-items:center; gap:8px;">
					<div style="width:30px; height:30px; background:#8b5cf6; border-radius:4px; border:1px solid #ddd;"></div>
					<span style="font-size:14px; font-weight:600; color:#333;">WFH</span>
				</div>
				<div style="display:flex; align-items:center; gap:8px;">
					<div style="width:30px; height:30px; background:#fbbf24; border-radius:4px; border:1px solid #ddd; display:flex; align-items:center; justify-content:center; font-size:18px;">🏖️</div>
					<span style="font-size:14px; font-weight:600; color:#333;">Holiday</span>
				</div>
			</div>
		`);
		$(this.wrapper).append(legend);
	}

	get_status_color(status, is_holiday) {
		if (is_holiday) return "#fbbf24";        // yellow for holidays
		if (status == "Present") return "#2f8b1e80";   // green
		if (status == "Absent") return "#a24a4ab3";    // red
		if (status == "Leave") return "#9dc0dd";     // blue
		if (status == "Work From Home") return "#8b5cf6"; // purple
		return "#fafafa"; // default neutral
	}

	show_empty_state() {
		$(this.wrapper).html(
			`<div class="text-center text-muted" 
				style="line-height: 100px; font-size: 16px; border: 1px dashed #ccc; border-radius: 5px; margin: 20px 0;">
				No employees found in the selected department/branch.
			</div>`
		);
	}
};