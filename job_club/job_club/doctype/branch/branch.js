// Copyright (c) 2025, BluePhoenix and contributors
// For license information, please see license.txt

frappe.ui.form.on('Branch', {
    refresh: function (frm) {
        if (frm.doc.location_link) {
            frm.trigger('location_link');
        }
    },

    location_link: function (frm) {
        if (!frm.doc.location_link) {
            frm.set_value('branch_latitude', null);
            frm.set_value('branch_longitude', null);
            frm.fields_dict['map_preview'].$wrapper.empty();
            return;
        }

        frappe.call({
            method: "job_club.job_club.doctype.recruitment_drive.recruitment_drive.get_embed_map_url",
            args: { location_link: frm.doc.location_link },
            callback: function (r) {
                if (r.message) {
                    const { embed_url, lat, lng } = r.message;

                    if (lat && lng) {
                        // Only set if values are different to avoid dirtying the form on refresh
                        if (frm.doc.branch_latitude != lat || frm.doc.branch_longitude != lng) {
                            frm.set_value('branch_latitude', lat);
                            frm.set_value('branch_longitude', lng);
                        }
                    }

                    render_map(frm, embed_url, frm.doc.location_link);
                } else {
                    frm.fields_dict["map_preview"].$wrapper.html(`<p style="color:#888;">Invalid or unavailable location link</p>`);
                }
            }
        });
    }
});

function render_map(frm, embedUrl, finalUrl) {
    frm.fields_dict["map_preview"].$wrapper.html(`
      <div style="margin-top:10px">
        <iframe 
          src="${embedUrl}" 
          width="100%" 
          height="350" 
          style="border:0; border-radius:8px;" 
          allowfullscreen="" 
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade">
        </iframe>
        <div style="margin-top:10px; text-align:center;">
          <a href="${finalUrl}" target="_blank" 
             style="display:inline-block; padding:10px 18px; background:linear-gradient(45deg,#00b09b,#96c93d); color:white; border-radius:6px; text-decoration:none; font-weight:600;">
             📍 Open in Google Maps
          </a>
        </div>
      </div>
    `);
}
