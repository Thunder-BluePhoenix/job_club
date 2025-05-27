frappe.ui.form.on('Registration QR', {
    onload: function(frm) {
        // Load QRCode.js dynamically
        if (!window.QRCode) {
            const script = document.createElement("script");
            script.src = "https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js";
            script.onload = () => generate_qr(frm);
            document.head.appendChild(script);
        } else {
            generate_qr(frm);
        }
    },

    refresh: function(frm) {
        // Regenerate QR when refreshing
        if (window.QRCode) {
            generate_qr(frm);
        }
    },
    qr_link: function(frm) {
    if (window.QRCode) {
        generate_qr(frm);
    }
}

});

function generate_qr(frm) {
    if (!frm.doc.qr_link) return;

    // Target the HTML field container
    const wrapper = frm.fields_dict.qr_code.$wrapper;
    wrapper.empty(); // Clear previous content

    // Create container div for QR
    const qr_div = document.createElement('div');
    qr_div.id = 'qr-code-generated';
    wrapper.append(qr_div);

    // Generate the QR code
    new QRCode(qr_div, {
        text: frm.doc.qr_link,
        width: 200,
        height: 200
    });
}
