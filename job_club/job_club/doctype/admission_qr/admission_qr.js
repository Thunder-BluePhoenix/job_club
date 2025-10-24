frappe.ui.form.on('Admission QR', {
    onload: function(frm) {
        // Load QRCode.js dynamically if not already loaded
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

    const wrapper = frm.fields_dict.qr_code.$wrapper;
    wrapper.empty();

    const container = document.createElement('div');
    container.style.textAlign = 'center';

    const qr_div = document.createElement('div');
    qr_div.id = 'qr-code-generated';
    container.appendChild(qr_div);
    wrapper.append(container);

    // Generate the QR code
    const qr = new QRCode(qr_div, {
        text: frm.doc.qr_link,
        width: 200,
        height: 200
    });

    // Add download button after QR is rendered
    setTimeout(() => {
        const qr_img = qr_div.querySelector('img') || qr_div.querySelector('canvas');
        if (!qr_img) return;

        const buttonWrapper = document.createElement('div');
        buttonWrapper.style.textAlign = 'left'; // align button to the left
        buttonWrapper.style.marginTop = '10px';

        const downloadBtn = document.createElement('button');
        downloadBtn.innerText = 'Download QR';
        downloadBtn.classList.add('btn', 'btn-primary');
        downloadBtn.onclick = function() {
            const logoSrc = '/assets/job_club/images/logo-es.png';
            const logo = new Image();
            logo.crossOrigin = 'anonymous';
            logo.src = logoSrc;

            logo.onload = function() {
                const qrSize = 200;
                const padding = 20;
                const logoHeight = 50;
                const textHeight = 30;

                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                canvas.width = qrSize + padding * 2;
                canvas.height = logoHeight + qrSize + textHeight + padding * 3;

                // Background
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // Logo on top
                const logoX = (canvas.width - 100) / 2;
                ctx.drawImage(logo, logoX, padding, 100, logoHeight);

                // Draw QR
                const qrImage = new Image();
                qrImage.crossOrigin = 'anonymous';
                qrImage.src = qr_img.src || qr_img.toDataURL('image/png');

                qrImage.onload = function() {
                    const qrX = padding;
                    const qrY = padding * 2 + logoHeight;
                    ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);

                    // Text under QR
                    ctx.font = 'bold 16px Arial';
                    ctx.fillStyle = '#000000';
                    ctx.textAlign = 'center';
                    ctx.fillText('Inquiry Form', canvas.width / 2, qrY + qrSize + 25);

                    // Download
                    const link = document.createElement('a');
                    link.download = 'admission_qr.png';
                    link.href = canvas.toDataURL('image/png');
                    link.click();
                };
            };
        };

        buttonWrapper.appendChild(downloadBtn);
        wrapper.append(buttonWrapper);
    }, 500);
}
