frappe.pages['fees-portal'].on_page_load = function (wrapper) {
	frappe.require('assets/job_club/css/student_portal.css');
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'My Fees',
		single_column: true
	});

	new FeesPortal(page);
}

class FeesPortal {
	constructor(page) {
		this.page = page;
		this.wrapper = $(this.page.body);
		this.setup();
	}

	setup() {
		this.load_fee_data();
	}

	load_fee_data() {
		this.wrapper.html(`
            <div class="student-portal-wrapper">
                <div class="loader-container">
                    <div class="premium-loader"></div>
                    <div class="loader-text">Loading your fee summary...</div>
                </div>
            </div>
        `);

		frappe.call({
			method: 'job_club.api.student_portal_api.get_fee_status',
			callback: (r) => {
				if (r.message) {
					this.fee_data = r.message;
					this.render_page();
				}
			}
		});
	}

	render_page() {
		const data = this.fee_data;

		this.wrapper.html(`
			<div class="fees-portal-container student-portal-wrapper">
				<!-- Fee Overview Cards -->
				<div class="fee-overview-cards">
					<div class="fee-card total">
						<div class="card-icon"><i class="fa fa-file-text"></i></div>
						<div class="card-content">
							<div class="label">Total Fees</div>
							<div class="value">₹${this.format_currency(data.total_fees)}</div>
						</div>
					</div>
					
					<div class="fee-card paid">
						<div class="card-icon"><i class="fa fa-check-circle"></i></div>
						<div class="card-content">
							<div class="label">Amount Paid</div>
							<div class="value">₹${this.format_currency(data.total_paid)}</div>
						</div>
					</div>
					
					<div class="fee-card outstanding">
						<div class="card-icon"><i class="fa fa-exclamation-circle"></i></div>
						<div class="card-content">
							<div class="label">Outstanding</div>
							<div class="value">₹${this.format_currency(data.total_outstanding)}</div>
						</div>
					</div>
				</div>
				
				<!-- Payment Progress -->
				<div class="payment-progress-section">
					<h3>Payment Progress</h3>
					<div class="progress-bar-container">
						<div class="progress">
							<div class="progress-bar bg-success" style="width: ${this.get_payment_percentage(data)}%">
								${this.get_payment_percentage(data).toFixed(1)}%
							</div>
						</div>
						<div class="progress-labels">
							<span>Paid: ₹${this.format_currency(data.total_paid)}</span>
							<span>Remaining: ₹${this.format_currency(data.total_outstanding)}</span>
						</div>
					</div>
				</div>
				
				<!-- Payment History -->
				<div class="payment-history-section">
					<h3><i class="fa fa-history"></i> Payment History</h3>
					${this.render_payment_history(data.payment_history)}
				</div>
			</div>
		`);
	}

	render_payment_history(payments) {
		if (!payments || payments.length === 0) {
			return '<p class="text-muted text-center">No payment records found</p>';
		}

		return `
			<div class="payment-timeline">
				${payments.map(payment => `
					<div class="payment-record ${payment.status.toLowerCase()}">
						<div class="payment-header">
							<div class="payment-title">
								<h4>${payment.program}</h4>
								<span class="badge ${payment.status === 'Paid' ? 'badge-success' : 'badge-warning'}">
									${payment.status}
								</span>
							</div>
							<div class="payment-amount">₹${this.format_currency(payment.total)}</div>
						</div>
						<div class="payment-details">
							<div class="detail-row">
								<span class="label">Academic Year:</span>
								<span class="value">${payment.academic_year}</span>
							</div>
							<div class="detail-row">
								<span class="label">Payment Date:</span>
								<span class="value">${frappe.datetime.str_to_user(payment.date)}</span>
							</div>
							${payment.due_date ? `
								<div class="detail-row">
									<span class="label">Due Date:</span>
									<span class="value">${frappe.datetime.str_to_user(payment.due_date)}</span>
								</div>
							` : ''}
							<div class="detail-row">
								<span class="label">Amount Paid:</span>
								<span class="value text-success">₹${this.format_currency(payment.paid)}</span>
							</div>
							${payment.outstanding > 0 ? `
								<div class="detail-row">
									<span class="label">Outstanding:</span>
									<span class="value text-danger">₹${this.format_currency(payment.outstanding)}</span>
								</div>
							` : ''}
						</div>
						<div class="payment-actions">
							<a href="/app/fees/${payment.name}" class="btn btn-sm btn-default" target="_blank">
								<i class="fa fa-eye"></i> View Details
							</a>
							${payment.status === 'Paid' ? `
								<button class="btn btn-sm btn-primary" onclick="window.print()">
									<i class="fa fa-download"></i> Download Receipt
								</button>
							` : ''}
						</div>
					</div>
				`).join('')}
			</div>
		`;
	}

	get_payment_percentage(data) {
		if (data.total_fees === 0) return 0;
		return (data.total_paid / data.total_fees) * 100;
	}

	format_currency(amount) {
		return parseFloat(amount).toLocaleString('en-IN', {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		});
	}
}