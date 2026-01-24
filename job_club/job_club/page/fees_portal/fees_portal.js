frappe.pages['fees-portal'].on_page_load = function (wrapper) {
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
                    <div style="margin-top: 12px; font-weight: 500;">Loading Fee Details...</div>
				</div>
			</div>
		`);

		// Force Tailwind Re-injection/Check
		this.ensure_tailwind(() => {
			this.load_fee_data();
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

	load_fee_data() {
		frappe.call({
			method: 'job_club.api.student_portal_api.get_fee_status',
			callback: (r) => {
				if (r.message) {
					this.fee_data = r.message;
					this.render_page();
					// Reveal content
					setTimeout(() => {
						this.wrapper.find('.sp-container').removeClass('sp-loading').addClass('sp-loaded');
					}, 100);
				}
			}
		});
	}

	render_page() {
		const data = this.fee_data;
		const percent = this.get_payment_percentage(data);

		this.wrapper.html(`
			<div class="sp-container sp-loading">
                <div class="mx-auto max-w-6xl p-4 md:p-8 space-y-6">
                    
                    <nav class="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-muted-fg mb-2">
                        <span class="cursor-pointer hover:text-black transition-colors" onclick="frappe.set_route('student-dashboard')">Dashboard</span> 
                        <span class="text-neutral-300">/</span> 
                        <span class="text-black">Fees</span>
                    </nav>

                    <section class="space-y-4">
                        <div class="flex items-center justify-between">
                             <h1 class="text-xl font-semibold text-neutral-900">Payment Details</h1>
                        </div>
                       
                        <div class="grid md:grid-cols-3 gap-4">
                            <div class="bg-white border p-3 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.05)] flex items-center justify-between group hover:border-black transition-all">
                            <div><p class="text-[11px] font-bold text-muted-fg uppercase tracking-widest mb-1">Total Fees</p><p class="text-xl font-bold tracking-tight text-neutral-900">₹${this.format_currency(data.total_fees)}</p></div>
                            <div class="h-8 w-8 bg-indigo-50 rounded flex items-center justify-center text-indigo-500 font-bold group-hover:scale-110 transition-transform">₹</div>
                            </div>
                            <div class="bg-white border p-3 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.05)] flex items-center justify-between group hover:border-black transition-all">
                            <div><p class="text-[11px] font-bold text-muted-fg uppercase tracking-widest mb-1">Amount Paid</p><p class="text-xl font-bold tracking-tight text-neutral-900">₹${this.format_currency(data.total_paid)}</p></div>
                            <div class="h-8 w-8 bg-emerald-50 rounded flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">✓</div>
                            </div>
                            <div class="bg-white border p-3 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.05)] flex items-center justify-between border-l-4 border-l-red-500 group hover:border-black transition-all">
                            <div><p class="text-[11px] font-bold text-muted-fg uppercase tracking-widest mb-1">Outstanding</p><p class="text-xl font-bold tracking-tight text-neutral-900">₹${this.format_currency(data.total_outstanding)}</p></div>
                            <div class="h-8 w-8 bg-red-50 rounded flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">!</div>
                            </div>
                        </div>

                        <div class="bg-white border p-3 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.05)] space-y-3">
                            <div class="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-neutral-900">
                            <span>Payment Progress</span>
                            <span>${percent.toFixed(1)}%</span>
                            </div>
                            <div class="h-2 w-full bg-muted rounded-full overflow-hidden">
                            <div class="h-full bg-emerald-500 transition-all duration-1000 shadow-[0_0_10px_rgba(16,185,129,0.3)]" style="width: ${percent}%"></div>
                            </div>
                            <div class="flex justify-between text-[11px] text-neutral-500 font-bold uppercase tracking-tight">
                            <span>PAID: ₹${this.format_currency(data.total_paid)}</span>
                            <span>REMAINING: ₹${this.format_currency(data.total_outstanding)}</span>
                            </div>
                        </div>

                        <div class="space-y-3">
                            <h4 class="text-xs font-bold uppercase tracking-wider mb-3 mt-6 text-neutral-400">Payment History</h4>
                            
                            <div class="space-y-3">
                                ${this.render_payment_history(data.payment_history)}
                            </div>
                        </div>
                    </section>
                </div>
			</div>
		`);
	}

	render_payment_history(payments) {
		if (!payments || payments.length === 0) {
			return '<p class="text-muted text-center text-xs">No payment records found</p>';
		}

		return payments.map(payment => {
			const isPaid = payment.status === 'Paid';
			const statusClass = isPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700';
			const borderClass = isPaid ? 'border-l-emerald-500' : 'border-l-amber-400';

			return `
            <div class="bg-white border p-3 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.05)] shadow-sm border-l-3 ${borderClass} flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <span class="text-xs font-bold">${payment.program || 'Fee Installment'}</span>
                  <span class="${statusClass} text-[8px] font-bold px-1.5 rounded uppercase">${payment.status}</span>
                </div>
                ${payment.fee_category ? `<p class="text-[9px] text-muted-fg font-bold uppercase tracking-tight">${payment.fee_category}</p>` : ''}
                <p class="text-[10.5px] text-muted-fg font-medium">
                   ${payment.due_date ? `Due: ${frappe.datetime.str_to_user(payment.due_date)}` : ''} 
                   ${payment.date ? `• Paid: ${frappe.datetime.str_to_user(payment.date)}` : ''}
                </p>
              </div>
              <div class="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto">
                <span class="text-sm font-black">₹${this.format_currency(payment.total || payment.amount)}</span>
                <div class="flex items-center gap-2 text-right">
                    <button class="px-3 py-1.5 rounded-md border hover:bg-neutral-200 transition-all text-[12px] font-medium hover:text-black opacity-80 cursor-pointer" onclick="frappe.set_route('Form', 'Fees', '${payment.name}')">View</button>
                    ${isPaid ?
					`<button class="px-3 py-1.5 rounded-md border hover:bg-neutral-200 transition-all text-[12px] font-medium hover:text-black opacity-80 cursor-pointer bg-emerald-700 text-white" onclick="window.print()">Download</button>` :
					`<button class="px-3 py-1.5 rounded-md border hover:bg-neutral-200 bg-black text-white transition-all text-[12px] font-medium hover:text-black opacity-80 cursor-pointer">Pay Now</button>`
				}
                </div>  
              </div>
            </div>
            `;
		}).join('');
	}

	get_payment_percentage(data) {
		if (data.total_fees === 0) return 0;
		return (data.total_paid / data.total_fees) * 100;
	}

	format_currency(amount) {
		return parseFloat(amount || 0).toLocaleString('en-IN', {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		});
	}
}