// Copyright (c) 2025, BluePhoenix and contributors
// For license information, please see license.txt

frappe.ui.form.on('Branch', {
    onload: function(frm) {
        // Load QRCode.js dynamically
        if (!window.QRCode) {
            const script = document.createElement("script");
            script.src = "https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js";
            script.onload = () => generate_branch_qr(frm);
            document.head.appendChild(script);
        } else {
            generate_branch_qr(frm);
        }
    },

    refresh: function(frm) {
        if (window.QRCode) {
            generate_branch_qr(frm);
        }
    }
});

function generate_branch_qr(frm) {
    if (!frm.doc.name) return;

    // Build branch-specific registration URL
    const base_url = window.location.origin;
    const qr_url = `${base_url}/registration-from/new?branch=${encodeURIComponent(frm.doc.name)}`;

    // Ensure you have a field "qr_code" (HTML type) in Branch
    const wrapper = frm.fields_dict.qr_code.$wrapper;
    wrapper.empty();

    // Create QR container
    const qr_div = document.createElement('div');
    qr_div.id = 'branch-qr-generated';
    wrapper.append(qr_div);

    // Generate the QR code (using QRCode.js)
    new QRCode(qr_div, {
        text: qr_url,
        width: 200,
        height: 200
    });

    // Add download button
    const downloadBtn = document.createElement('button');
    downloadBtn.innerText = "Download QR Code";
    downloadBtn.className = "btn btn-primary mt-2";
    wrapper.append(downloadBtn);

    // Handle download with logo + QR + branch name
    downloadBtn.addEventListener("click", () => {
        const qrImg = qr_div.querySelector("img") || qr_div.querySelector("canvas");
        if (!qrImg) {
            frappe.msgprint("QR Code not available yet.");
            return;
        }

        // Create canvas for Logo + QR + Text
        const qrSize = 220; 
        const logoHeight = 60; 
        const textHeight = 40; 
        const canvas = document.createElement("canvas");
        canvas.width = qrSize;
        canvas.height = logoHeight + qrSize + textHeight;

        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Load logo first
        const logo = new Image();
        logo.crossOrigin = "anonymous";
        logo.onload = function() {
            const logoW = 120;
            const logoH = 40;
            ctx.drawImage(logo, (canvas.width - logoW) / 2, 10, logoW, logoH);

            // Load QR code next
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = function() {
                ctx.drawImage(img, 10, logoHeight, qrSize - 20, qrSize - 20);

                // Add branch name text
                ctx.fillStyle = "#000000";
                ctx.font = "bold 16px Arial";
                ctx.textAlign = "center";
                ctx.fillText(`Branch - ${frm.doc.name}`, qrSize / 2, logoHeight + qrSize);

                // Download final PNG
                const link = document.createElement("a");
                link.href = canvas.toDataURL("image/png");
                link.download = `QR-${frm.doc.name}.png`;
                link.click();
            };
            img.src = qrImg.src || qrImg.toDataURL("image/png");
        };

        // 🔹 Replace with your actual company logo URL
        logo.src = "/files/logo-es.png";
    });
}
