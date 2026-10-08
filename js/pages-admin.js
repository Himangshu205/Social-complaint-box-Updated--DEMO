/* pages-admin.js
   The admin pages: login, dashboard, complaints (filters, bulk actions, CSV export), awareness posts, messages, settings.
   Plain script (no build tools). Scripts load in order from index.html. */
"use strict";

/* ---------- admin ---------- */
function pageLogin() {
  return '<div class="login-page"><form class="card form login" data-form="login"><div class="brand" style="color:var(--ink)">' + brandMark() + 'Social Complaint Box</div>' +
    '<h1 class="h2">Admin sign in</h1>' +
    '<p class="notice">Preview login is filled in for you: admin@example.com / demo123</p>' +
    '<div class="field"><label for="a-email">Email</label><input id="a-email" name="email" type="email" value="admin@example.com" required autocomplete="username"></div>' +
    '<div class="field"><label for="a-pass">Password</label><input id="a-pass" name="password" type="password" value="demo123" required autocomplete="current-password"></div>' +
    '<p class="notice notice-error" id="a-err" role="alert" hidden></p><button class="btn btn-primary">Sign in</button><a href="#/" class="text-link">Back to the site</a></form></div>';
}

function adminShell(path, inner) {
  var unread = db.messages.filter(function (m) { return !m.read; }).length;
  var items = [["/admin", "Dashboard"], ["/admin/complaints", "Complaints"], ["/admin/awareness", "Awareness posts"], ["/admin/messages", "Messages" + (unread ? " (" + unread + ")" : "")], ["/admin/settings", "Settings"]];
  return '<div class="admin"><aside class="admin-side"><div class="brand admin-brand">' + brandMark() + 'Complaint Box</div><nav class="admin-nav">' +
    items.map(function (l) { return '<a href="#' + l[0] + '"' + (path === l[0] ? ' class="active"' : "") + ">" + l[1] + "</a>"; }).join("") +
    '</nav><div class="admin-user"><span>' + esc(S.admin.name) + '</span><a href="#/">View site</a>' + themeBtn() + '<button class="btn btn-quiet" data-act="logout">Log out</button></div></aside><div class="admin-main">' + inner + "</div></div>";
}

function avgDays() {
  var spans = [];
  db.complaints.forEach(function (c) {
    if (c.status !== "Resolved") return;
    for (var i = c.history.length - 1; i >= 0; i--) if (c.history[i].status === "Resolved") { spans.push((c.history[i].at - c.at) / 864e5); return; }
  });
  if (!spans.length) return "–";
  return (Math.round(spans.reduce(function (a, b) { return a + b; }, 0) / spans.length * 10) / 10).toString();
}

function pageDashboard() {
  var cs = db.complaints, total = cs.length;
  var by = {}; STATUSES.forEach(function (s) { by[s] = cs.filter(function (c) { return c.status === s; }).length; });
  var cats = {}; cs.forEach(function (c) { cats[c.category] = (cats[c.category] || 0) + 1; });
  var catList = Object.keys(cats).map(function (k) { return [k, cats[k]]; }).sort(function (a, b) { return b[1] - a[1]; });
  var days = [];
  for (var i = 6; i >= 0; i--) {
    var d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - i);
    var n = cs.filter(function (c) { var t = new Date(c.at); t.setHours(0, 0, 0, 0); return t.getTime() === d.getTime(); }).length;
    days.push([d.toLocaleDateString("en-IN", { weekday: "short" }), n]);
  }
  var maxD = Math.max.apply(null, days.map(function (x) { return x[1]; }).concat(1));
  var maxC = Math.max.apply(null, catList.map(function (x) { return x[1]; }).concat(1));
  var unread = db.messages.filter(function (m) { return !m.read; }).length;
  return '<h1 class="h2">Dashboard</h1><div class="actions-row"><a class="btn btn-primary btn-sm" href="#/admin/complaints">' + ico("layers") + "Review complaints</a>" +
    '<a class="btn btn-soft btn-sm" href="#/admin/awareness">' + ico("plus") + "Add a guide</a>" +
    '<a class="btn btn-soft btn-sm" href="#/admin/messages">' + ico("mail") + "Read messages</a>" +
    '<a class="btn btn-soft btn-sm" href="#/admin/settings">' + ico("shield") + "Settings</a></div>" + '<div class="stats">' +
    '<a class="card stat" href="#/admin/complaints"><strong>' + total + "</strong><span>Total complaints</span></a>" +
    '<a class="card stat" href="#/admin/complaints"><strong>' + (by.Pending + by["In progress"]) + "</strong><span>Still open</span></a>" +
    '<a class="card stat stat-alert" href="#/admin/complaints"><strong>' + cs.filter(function (c) { return (c.status === "Pending" || c.status === "In progress") && (c.urgency === "High" || c.urgency === "Urgent"); }).length + "</strong><span>High or urgent, still open</span></a>" +
    '<div class="card stat"><strong>' + avgDays() + "</strong><span>Avg. days to resolve</span></div>" +
    '<a class="card stat" href="#/admin/awareness"><strong>' + db.awareness.length + "</strong><span>Awareness posts</span></a>" +
    '<a class="card stat" href="#/admin/messages"><strong>' + unread + "</strong><span>Unread messages</span></a></div>" +
    '<div class="admin-grid"><section class="card pad"><h2 class="h3">Complaints by status</h2><ul class="bars">' +
    STATUSES.map(function (s) { return "<li><span>" + s + '</span><div class="bar-track"><div class="bar bar-' + slug(s) + '" style="width:' + (total ? (by[s] / total) * 100 : 0) + '%"></div></div><b>' + by[s] + "</b></li>"; }).join("") + "</ul></section>" +
    '<section class="card pad"><h2 class="h3">Last 7 days</h2><div class="cols" role="img" aria-label="Complaints filed per day for the last seven days">' +
    days.map(function (d) { return '<div class="col"><b>' + d[1] + '</b><div class="col-bar" style="height:' + (d[1] / maxD) * 100 + '%"></div><span>' + d[0] + "</span></div>"; }).join("") + "</div></section>" +
    '<section class="card pad"><h2 class="h3">Complaints by urgency</h2><ul class="bars">' +
    URGENCIES.map(function (u) { var n = cs.filter(function (c) { return c.urgency === u; }).length; return "<li><span>" + u + '</span><div class="bar-track"><div class="bar bar-u-' + u.toLowerCase() + '" style="width:' + (total ? (n / total) * 100 : 0) + '%"></div></div><b>' + n + "</b></li>"; }).join("") + "</ul></section>" +
    '<section class="card pad"><h2 class="h3">Complaints by category</h2><ul class="bars">' +
    catList.map(function (c) { return "<li><span>" + esc(c[0]) + '</span><div class="bar-track"><div class="bar" style="width:' + (c[1] / maxC) * 100 + '%"></div></div><b>' + c[1] + "</b></li>"; }).join("") + "</ul></section></div>";
}

function visibleComplaints() {
  var q = S.cQ.trim().toLowerCase();
  var list = db.complaints.filter(function (c) {
    if (S.cStatus !== "All" && c.status !== S.cStatus) return false;
    if (S.cCat !== "All" && c.category !== S.cCat) return false;
    if (S.cUrg !== "All" && c.urgency !== S.cUrg) return false;
    return !q || (c.trackingId + " " + c.details + " " + c.location + " " + c.name).toLowerCase().indexOf(q) > -1;
  });
  list.sort(function (a, b) {
    if (S.cSort === "oldest") return a.at - b.at;
    if (S.cSort === "urgency") return (RANK[a.urgency] - RANK[b.urgency]) || (b.at - a.at);
    return b.at - a.at;
  });
  return list;
}

function complaintRow(c) {
  var open = !!S.openC[c.id], picked = !!S.pick[c.id];
  var head = '<div class="c-line"><label class="c-pick"><input type="checkbox" data-pick="' + c.id + '"' + (picked ? " checked" : "") + ' aria-label="Select ' + esc(c.trackingId) + '"></label>' +
    '<button class="c-head" data-act="toggle-c" data-id="' + c.id + '" aria-expanded="' + open + '"><span class="track-id small">' + esc(c.trackingId) + '</span><span class="c-cat">' + esc(c.category) + '</span><span class="c-snippet">' + esc(c.details) + '</span><span class="c-badges">' + ubadge(c.urgency) + badge(c.status) + '</span><time class="muted">' + fmt(c.at) + "</time></button></div>";
  var cls = "card c-row" + (picked ? " picked" : "");
  if (!open) return '<li class="' + cls + '">' + head + "</li>";
  return '<li class="' + cls + '">' + head + '<div class="c-detail"><p class="pre">' + esc(c.details) + "</p>" +
    '<dl class="meta"><div><dt>Location</dt><dd>' + esc(c.location || "Not given") + "</dd></div>" +
    (c.lat != null ? '<div><dt>Map</dt><dd><a href="' + mapLink(c.lat, c.lng) + '" target="_blank" rel="noreferrer">Open pin on map</a></dd></div>' : "") +
    "<div><dt>Reporter</dt><dd>" + (c.anonymous ? "Anonymous" : esc(c.name || "No name given")) + "</dd></div>" +
    (c.anonymous ? "" : "<div><dt>Email</dt><dd>" + (c.email ? '<a href="mailto:' + esc(c.email) + '">' + esc(c.email) + "</a>" : "Not given") + "</dd></div>") + "</dl>" +
    (c.feedback ? '<p class="notice' + (c.feedback.resolved ? "" : " notice-error") + '">' + (c.feedback.resolved ? "Reporter confirmed this was fixed." : "Reporter says this is NOT fixed" + (c.feedback.comment ? ": " + esc(c.feedback.comment) : ".")) + "</p>" : "") +
    (c.images && c.images.length ? '<div class="gallery">' + c.images.map(function (im, i) { return '<a href="' + esc(im) + '" target="_blank" rel="noreferrer"><img src="' + esc(im) + '" alt="Photo ' + (i + 1) + ' attached to the complaint"></a>'; }).join("") + "</div>" : "") +
    '<div class="two"><div class="field"><label for="st-' + c.id + '">Status</label><select id="st-' + c.id + '">' + STATUSES.map(function (x) { return "<option" + (x === c.status ? " selected" : "") + ">" + x + "</option>"; }).join("") + "</select></div>" +
    '<div class="field"><label for="ur-' + c.id + '">Urgency</label><select id="ur-' + c.id + '">' + URGENCIES.map(function (x) { return "<option" + (x === c.urgency ? " selected" : "") + ">" + x + "</option>"; }).join("") + "</select></div></div>" +
    '<div class="field"><label for="nt-' + c.id + '">Public response (shown when the reporter tracks this complaint)</label><textarea id="nt-' + c.id + '" rows="3">' + esc(c.adminNote) + "</textarea></div>" +
    '<div class="field"><label for="in-' + c.id + '">Internal note (private, only admins see this)</label><textarea id="in-' + c.id + '" rows="2">' + esc(c.internalNote) + "</textarea></div>" +
    '<div class="row gap"><button class="btn btn-primary" data-act="save-c" data-id="' + c.id + '">Save changes</button><button class="btn btn-danger" data-act="del-c" data-id="' + c.id + '">Delete complaint</button></div></div></li>';
}

function complaintList() {
  var list = visibleComplaints();
  if (!list.length) return '<li class="muted">No complaints match these filters.</li>';
  return list.slice(0, S.cVisible).map(complaintRow).join("") + (list.length > S.cVisible ? '<li class="more"><button class="btn btn-outline" data-act="show-more">Show 20 more (' + (list.length - S.cVisible) + " left)</button></li>" : "");
}

function bulkBar() {
  var list = visibleComplaints();
  if (!list.length) return "";
  var n = list.filter(function (c) { return S.pick[c.id]; }).length;
  return '<div class="bulkbar' + (n ? " on" : "") + '"><label class="check-inline"><input type="checkbox" id="pick-all"' + (n === list.length ? " checked" : "") + "> Select all (" + list.length + ")</label>" +
    (n ? '<div class="row gap"><strong>' + n + ' selected</strong><select id="bulk-status" aria-label="New status for selected complaints">' + STATUSES.map(function (x) { return "<option" + (x === S.bulkStatus ? " selected" : "") + ">" + x + "</option>"; }).join("") + '</select><button class="btn btn-primary" data-act="bulk-apply">Apply to selected</button></div>' : "") + "</div>";
}

function qchipsHtml() {
  var all = db.complaints;
  return ["All"].concat(STATUSES).map(function (st) {
    var n = st === "All" ? all.length : all.filter(function (c) { return c.status === st; }).length;
    return '<button class="chip' + (S.cStatus === st ? " on" : "") + '" aria-pressed="' + (S.cStatus === st) + '" data-act="qstatus" data-v="' + st + '">' + st + " <b>" + n + "</b></button>";
  }).join("");
}

function refreshComplaints() {
  var qc = $("#qchips"); if (qc) qc.innerHTML = qchipsHtml();
  var ss = $("#c-status"); if (ss) ss.value = S.cStatus;
  var l = $("#c-list"), b = $("#bulk"), h = $("#export-btn");
  if (l) l.innerHTML = complaintList();
  if (b) b.innerHTML = bulkBar();
  if (h) h.textContent = "Export CSV (" + visibleComplaints().length + ")";
}

function csvText(list) {
  var q = function (v) { return '"' + String(v == null ? "" : v).replace(/"/g, '""').replace(/\r?\n/g, " ") + '"'; };
  var cols = ["Tracking ID", "Filed", "Category", "Urgency", "Status", "Location", "Latitude", "Longitude", "Reporter", "Email", "Details", "Public response"];
  var rows = list.map(function (c) { return [c.trackingId, new Date(c.at).toISOString(), c.category, c.urgency, c.status, c.location, c.lat == null ? "" : c.lat, c.lng == null ? "" : c.lng, c.anonymous ? "Anonymous" : c.name, c.anonymous ? "" : c.email, c.details, c.adminNote]; });
  return [cols].concat(rows).map(function (r) { return r.map(q).join(","); }).join("\r\n");
}

function openCsv() {
  var list = visibleComplaints();
  if (!list.length) { toast("Nothing to export with these filters", "error"); return; }
  closeModal();
  var m = document.createElement("div");
  m.className = "modal-backdrop"; m.id = "modal";
  m.innerHTML = '<div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div class="modal-body"><h2 id="modal-title">Export CSV</h2>' +
    "<p>" + list.length + ' complaint(s) with the current filters. In the real app this downloads as a .csv file you can open in Excel or Google Sheets. Here you can copy it.</p><textarea class="csv-box" id="csv-box" readonly>' + esc(csvText(list)) + '</textarea><div class="row gap" style="margin-top:1rem"><button class="btn btn-primary" data-act="copy-csv">Copy CSV</button><button class="btn btn-outline" data-act="close-modal" id="modal-close">Close</button></div></div></div>';
  document.body.appendChild(m); document.body.style.overflow = "hidden"; $("#modal-close").focus();
}

function pageAdminComplaints() {
  var sel = function (id, label, opts, cur, all) {
    return '<select id="' + id + '" aria-label="' + label + '">' + opts.map(function (o) { var v = Array.isArray(o) ? o[0] : o, t = Array.isArray(o) ? o[1] : o; return '<option value="' + esc(v) + '"' + (v === cur ? " selected" : "") + ">" + esc(t) + "</option>"; }).join("") + "</select>";
  };
  return '<div class="row between wrap-row"><h1 class="h2">Complaints</h1><button class="btn btn-outline" id="export-btn" data-act="export-csv">Export CSV (' + visibleComplaints().length + ")</button></div>" +
    '<div class="filters row gap wrap-row"><input type="search" id="c-q" value="' + esc(S.cQ) + '" placeholder="Search ID, text, name or location" aria-label="Search complaints">' +
    sel("c-status", "Filter by status", [["All", "All statuses"]].concat(STATUSES), S.cStatus) +
    sel("c-urgf", "Filter by urgency", [["All", "Any urgency"]].concat(URGENCIES), S.cUrg) +
    sel("c-catf", "Filter by category", [["All", "All categories"]].concat(C_CATS), S.cCat) +
    sel("c-sort", "Sort complaints", [["newest", "Newest first"], ["oldest", "Oldest first"], ["urgency", "Most urgent first"]], S.cSort) + "</div>" +
    '<div class="qchips" id="qchips" role="group" aria-label="Quick status filter">' + qchipsHtml() + "</div>" +
    '<div id="bulk">' + bulkBar() + '</div><ul class="list" id="c-list">' + complaintList() + "</ul>";
}

function pageAdminAwareness() {
  var e = S.editing ? db.awareness.filter(function (a) { return a.id === S.editing; })[0] : null;
  var v = e || { title: "", category: AW_CATS[0], summary: "", details: "" };
  var img = S.formImg || (e && imgOf(e.image)) || "";
  return '<h1 class="h2">Awareness posts</h1><form class="card form" data-form="aw"><h2 class="h3">' + (e ? 'Edit "' + esc(e.title) + '"' : "Add a post") + "</h2>" +
    '<div class="two"><div class="field"><label for="w-title">Title</label><input id="w-title" name="title" value="' + esc(v.title) + '" maxlength="120" required></div>' +
    '<div class="field"><label for="w-cat">Category</label><select id="w-cat" name="category">' + AW_CATS.map(function (c) { return "<option" + (c === v.category ? " selected" : "") + ">" + c + "</option>"; }).join("") + "</select></div></div>" +
    '<div class="field"><label for="w-sum">One-line summary (shown on the card)</label><input id="w-sum" name="summary" value="' + esc(v.summary) + '" maxlength="240"></div>' +
    '<div class="field"><label for="w-det">Details (a blank line starts a new paragraph)</label><textarea id="w-det" name="details" rows="6" required>' + esc(v.details) + "</textarea></div>" +
    '<div class="field"><label for="w-img">' + (e ? "Replace image (optional)" : "Image") + '</label><input id="w-img" type="file" accept="image/png,image/jpeg,image/webp,image/gif">' + (img ? '<img class="c-photo" src="' + esc(img) + '" alt="Image preview">' : "") + "</div>" +
    '<p class="notice notice-error" id="w-err" role="alert" hidden></p><div class="row gap"><button class="btn btn-primary">' + (e ? "Save changes" : "Publish post") + "</button>" + (e ? '<button type="button" class="btn btn-outline" data-act="cancel-edit">Cancel editing</button>' : "") + "</div></form>" +
    '<h2 class="h3 gap-top">Published posts (' + db.awareness.length + ')</h2><ul class="list">' +
    db.awareness.slice().sort(function (a, b) { return b.at - a.at; }).map(function (a) {
      return '<li class="card a-admin">' + (a.image ? '<img src="' + esc(imgOf(a.image)) + '" alt="">' : tileHtml(a.category)) +
        '<div><p class="a-cat">' + esc(a.category) + "</p><h3>" + esc(a.title) + '</h3><p class="muted">' + esc(a.summary) + '</p></div><div class="row gap"><button class="btn btn-outline" data-act="edit-aw" data-id="' + a.id + '">Edit</button><button class="btn btn-danger" data-act="del-aw" data-id="' + a.id + '">Delete</button></div></li>';
    }).join("") + "</ul>";
}

function pageSettings() {
  return '<h1 class="h2">Settings</h1><form class="card form" data-form="pw" style="max-width:520px"><h2 class="h3">Change password</h2>' +
    '<div class="field"><label for="p-cur">Current password</label><input id="p-cur" name="current" type="password" required autocomplete="current-password"></div>' +
    '<div class="field"><label for="p-new">New password (at least 8 characters)</label><input id="p-new" name="next" type="password" required autocomplete="new-password"></div>' +
    '<div class="field"><label for="p-again">New password again</label><input id="p-again" name="again" type="password" required autocomplete="new-password"></div>' +
    '<p class="notice notice-error" id="p-err" role="alert" hidden></p><div><button class="btn btn-primary">Change password</button></div>' +
    '<p class="muted">Preview note: your current demo password is demo123. It resets when you reload.</p></form>';
}

function pageAdminMessages() {
  return '<h1 class="h2">Messages</h1>' + (db.messages.length ? "" : '<p class="muted">No messages yet. They\'ll appear here when someone uses the contact form.</p>') + '<ul class="list">' +
    db.messages.slice().sort(function (a, b) { return b.at - a.at; }).map(function (m) {
      return '<li class="card msg ' + (m.read ? "" : "unread") + '"><div class="row between"><div><strong>' + esc(m.name) + '</strong> <a href="mailto:' + esc(m.email) + '">' + esc(m.email) + '</a></div><time class="muted">' + fmt(m.at) + '</time></div><p class="pre">' + esc(m.message) + '</p><div class="row gap"><button class="btn btn-outline" data-act="toggle-read" data-id="' + m.id + '">' + (m.read ? "Mark as unread" : "Mark as read") + '</button><button class="btn btn-danger" data-act="del-msg" data-id="' + m.id + '">Delete</button></div></li>';
    }).join("") + "</ul>";
}
