/* state.js
   Sample data (complaints, guides, messages) and the page state. Everything lives in memory, so nothing is saved.
   Plain script (no build tools). Scripts load in order from index.html. */
"use strict";

function loadSaved() { var a = []; try { a = JSON.parse(localStorage.getItem("scb_saved")) || []; } catch (e) {} return Array.isArray(a) ? a : []; }

function storeSaved() { try { localStorage.setItem("scb_saved", JSON.stringify(S.saved)); } catch (e) {} }

function toggleSaved(title) { var i = S.saved.indexOf(title); if (i > -1) S.saved.splice(i, 1); else S.saved.push(title); storeSaved(); return i === -1; }

/* ---------- sample data ---------- */
var db = {
  admin: { name: "Admin", email: "admin@example.com", password: "demo123" },
  awareness: [
    { id: nextId(), title: "Health Awareness", category: "Health", image: "", summary: "Small daily habits that protect your health and your community's.", details: "Good health starts with routine: balanced meals, regular movement, enough sleep, and timely check-ups. Keep vaccinations up to date, wash hands often, and do not ignore symptoms that last more than a few days.\n\nIf a clinic, hospital or public water source in your area is unsafe or unhygienic, report it through the Complaint Box so it can be looked at. Health helpline: 1075.", at: ago(6) },
    { id: nextId(), title: "Cyber Security Awareness", category: "Cyber Security", image: "", summary: "Spot scams, protect passwords and report cyber fraud early.", details: "Never share OTPs, PINs or passwords, even with someone claiming to be from your bank. Use a different strong password for each account and turn on two-step verification.\n\nBe careful with links and attachments from unknown senders. If you are a victim of online fraud, report it quickly on the national cybercrime portal or call 1930.", at: ago(5) },
    { id: nextId(), title: "Environmental Awareness", category: "Environment", image: "", summary: "Reduce waste, save water and keep your neighbourhood clean.", details: "Separate wet and dry waste, carry a cloth bag, and avoid single-use plastic. Fix leaking taps, switch off lights and fans when not needed, and plant trees where you can.\n\nIllegal dumping, burning of garbage and blocked drains are community problems, so report them with a location and photo.", at: ago(4) },
    { id: nextId(), title: "Road Safety Awareness", category: "Road Safety", image: "", summary: "Simple rules that prevent most road accidents.", details: "Wear a helmet or seat belt every time, never drink and drive, and keep to speed limits. Cross at zebra crossings and wait for the signal.\n\nBroken signals, missing signs, potholes and unlit roads are safety hazards. Report them so they can be repaired. Emergency: 112.", at: ago(3) },
    { id: nextId(), title: "Mental Health Awareness", category: "Mental Health", image: "", summary: "It is okay to talk about how you feel, and to ask for help.", details: "Stress, anxiety and low mood are common and treatable. Talk to someone you trust, keep a routine, sleep well and take breaks from screens.\n\nIf you or someone you know is struggling, contact a doctor or a counsellor. In India you can reach the Tele-MANAS helpline at 14416.", at: ago(2) },
    { id: nextId(), title: "Education Awareness", category: "Education", image: "", summary: "Every child deserves a school, a teacher and a chance to learn.", details: "Education is a right for every child. Make sure children in your family and neighbourhood are enrolled in school and attend regularly.\n\nIf a school lacks basic facilities such as safe toilets, drinking water or teachers, or if a child is being kept out of school, you can report it. Child helpline: 1098.", at: ago(1) }
  ],
  complaints: [
    mk("SCB-K7M2QX", "Infrastructure", "Ballygunge Phari Road", "Large pothole near the bus stop has been there for three weeks. Two-wheelers swerve into traffic to avoid it.", "In progress", "Forwarded to the road maintenance team. Repair is scheduled this week.", 2, false, ""),
    mk("SCB-9TD4HN", "Sanitation", "Ward 12 market lane", "Garbage has not been collected for five days and the smell is spreading to nearby homes.", "Pending", "", 1, true),
    mk("SCB-P3V8YA", "Road Safety", "Salt Lake Sector V crossing", "The pedestrian signal at the main crossing is not working. Children cross here to reach school.", "Resolved", "Signal repaired and tested on Monday. Thank you for reporting.", 6, false, ""),
    mk("SCB-W5E6JC", "Cyber Security", "", "Received a call asking for my bank OTP, saying my account would be blocked. Number is saved if needed.", "Pending", "", 0, true),
    mk("SCB-B2N7RF", "Environment", "Behala canal side", "Plastic waste is being burned at night near the canal. Smoke is affecting residents.", "In progress", "Local ward office informed. Inspection planned.", 3, true),
    mk("SCB-T8Q3ZM", "Health", "Primary health centre, Barasat", "The centre has no drinking water and the toilets are locked.", "Rejected", "This falls under the district health office. We have shared the details with them; please contact them directly on 1075.", 8, false, ""),
    mk("SCB-H4X9DK", "Education", "Govt. primary school, Dum Dum", "Only one teacher for around 90 students. Classes for younger children are often skipped.", "Pending", "", 4, false, "")
  ],
  messages: [
    { id: nextId(), name: "A visitor", email: "visitor1@example.com", message: "Can I file a complaint on behalf of an elderly neighbour who doesn't use a smartphone?", read: false, at: ago(0, 5) },
    { id: nextId(), name: "A visitor", email: "visitor2@example.com", message: "Great project. Would you consider adding Bengali language support?", read: true, at: ago(2) }
  ]
};

(function () {
  var U = ["High", "Medium", "Low", "Urgent", "High", "Medium", "Medium"];
  db.complaints.forEach(function (c, i) { c.urgency = U[i] || "Medium"; c.lat = null; c.lng = null; c.images = []; c.internalNote = ""; c.feedback = null; });
  db.complaints[0].internalNote = "Called the ward office; they promised a repair crew on Thursday.";
  db.complaints[0].lat = 22.5236; db.complaints[0].lng = 88.364;
  db.complaints[3].lat = 22.5726; db.complaints[3].lng = 88.3639;
})();

function mk(id, cat, loc, details, status, note, days, anon, name) {
  var h = [{ status: "Pending", note: "Complaint received", at: ago(days, 2) }];
  if (status !== "Pending") h.push({ status: status, note: note || "Status updated", at: ago(Math.max(days - 1, 0), 1) });
  return { id: nextId(), trackingId: id, category: cat, location: loc, details: details, status: status, adminNote: note, anonymous: anon, name: anon ? "" : name || "", email: "", image: "", history: h, at: ago(days, 2) };
}

var S = {
  admin: null, myIds: [], receipt: null, awQ: "", awCat: "All", cQ: "", cStatus: "All", cCat: "All",
  openC: {}, awView: "grid", awSort: "newest", saved: loadSaved(), modalList: null, editing: null, formImg: "", complaintImg: "", complaintImgs: [], fbNo: false, cVisible: 20, track: "", geo: null, pick: {}, cUrg: "All", cSort: "newest", bulkStatus: "In progress"
};

var imgOf = function (k) { return (window.IMGS && window.IMGS[k]) || k || ""; };
