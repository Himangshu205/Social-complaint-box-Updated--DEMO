/* events.js
   Click, typing, change and submit handlers that make the pages interactive.
   Plain script (no build tools). Scripts load in order from index.html. */
"use strict";

/* ---------- events ---------- */
document.addEventListener("click", function (e) {
  var t = e.target.closest("[data-act]"); if (!t) return;
  var act = t.getAttribute("data-act"), id = t.getAttribute("data-id");
  switch (act) {
    case "toggle-theme": setUI("theme", UI.theme === "dark" ? "light" : "dark"); break;
    case "toggle-nav": var nav = $("#main-nav"); var o = nav.classList.toggle("open"); t.setAttribute("aria-expanded", o); t.textContent = o ? "Close" : "Menu"; break;
    case "open-aw":
      S.modalList = location.hash.indexOf("/awareness") > -1 ? filteredAw() : db.awareness.slice().sort(function (a, b) { return b.at - a.at; });
      openModal(id); break;
    case "modal-go": openModal(id); break;
    case "save-aw":
      var sa = db.awareness.filter(function (x) { return x.id === id; })[0]; if (!sa) break;
      var nowSaved = toggleSaved(sa.title);
      toast(nowSaved ? "Saved. Find it under the Saved filter." : "Removed from saved");
      if (t.getAttribute("data-modal")) { openModal(id); }
      else { t.setAttribute("aria-pressed", String(nowSaved)); var ch = $("#aw-chips"); if (ch) ch.innerHTML = chips(); if (S.awCat === "Saved" && !nowSaved) refreshAw(); }
      break;
    case "share-aw":
      var sh = db.awareness.filter(function (x) { return x.id === id; })[0]; if (!sh) break;
      var shareText = sh.title + ": " + sh.summary + " " + location.href.split("#")[0] + "#/awareness";
      if (navigator.share) navigator.share({ title: sh.title, text: shareText }).catch(function () {});
      else if (navigator.clipboard) navigator.clipboard.writeText(shareText).then(function () { toast("Guide link copied"); }, function () { toast("Copy failed. Copy the address from the browser bar.", "error"); });
      else toast("Copy failed. Copy the address from the browser bar.", "error");
      break;
    case "aw-sort": S.awSort = t.getAttribute("data-v"); refreshAw(); break;
    case "close-modal": closeModal(); break;
    case "aw-cat": S.awCat = t.getAttribute("data-c"); refreshAw(); break;
    case "aw-view": S.awView = t.getAttribute("data-v"); refreshAw(); break;
    case "copy-id":
      if (navigator.clipboard) navigator.clipboard.writeText(S.receipt).then(function () { toast("Tracking ID copied"); }, function () { toast("Copy failed. Select the ID and copy it by hand.", "error"); });
      else toast("Copy isn't available here. Select the ID and copy it by hand.", "error");
      break;
    case "geo":
      if (!navigator.geolocation) { toast("This browser can't share a location. Type the place in instead.", "error"); break; }
      t.textContent = "Finding you…"; t.disabled = true;
      navigator.geolocation.getCurrentPosition(function (pos) {
        S.geo = { lat: +pos.coords.latitude.toFixed(5), lng: +pos.coords.longitude.toFixed(5) };
        var g = $("#c-geo"); if (g) g.innerHTML = geoHtml();
      }, function () {
        var g = $("#c-geo"); if (g) g.innerHTML = geoHtml();
        toast("Couldn't get your location. Allow access, or type the place in instead.", "error");
      }, { enableHighAccuracy: true, timeout: 10000 });
      break;
    case "rm-photo": S.complaintImgs.splice(+t.getAttribute("data-i"), 1); $("#c-prev").innerHTML = thumbsHtml(); break;
    case "geo-clear": S.geo = null; $("#c-geo").innerHTML = geoHtml(); break;
    case "copy-link":
    case "copy-track-link":
      var link = location.href.split("#")[0] + "#/track/" + (act === "copy-link" ? S.receipt : S.trackedId);
      if (navigator.clipboard) navigator.clipboard.writeText(link).then(function () { toast("Tracking link copied"); }, function () { toast("Copy failed. Copy the address from the Track page.", "error"); });
      else toast("Copy failed. Copy the address from the Track page.", "error");
      break;
    case "print": try { window.print(); } catch (e) { toast("Printing isn't available inside the preview.", "error"); } break;
    case "fb-yes": case "fb-reopen":
      var fc = db.complaints.filter(function (x) { return x.trackingId === id; })[0]; if (!fc) break;
      if (act === "fb-yes") { fc.feedback = { resolved: true }; fc.history.push({ status: "Resolved", note: "Reporter confirmed the problem is fixed", at: Date.now() }); toast("Thanks for confirming"); }
      else { var cm = ($("#fb-c") || {}).value || ""; fc.feedback = { resolved: false, comment: cm }; fc.status = "Pending"; fc.history.push({ status: "Pending", note: "Reporter says the problem is not fixed" + (cm ? ": " + cm : ""), at: Date.now() }); toast("Reopened. The team will look again."); }
      S.fbNo = false; render(); break;
    case "fb-no": S.fbNo = true; render(); break;
    case "show-more": S.cVisible += 20; refreshComplaints(); break;
    case "quick-fill":
      var qf = QUICK[+t.getAttribute("data-i")], sel = $("#c-cat"), det = $("#c-details");
      if (!qf || !sel || !det) break;
      sel.value = qf[1];
      if (!det.value.trim()) { det.value = qf[2]; var cnt = $("#c-count"); if (cnt) cnt.textContent = det.value.length + " / 3000"; }
      det.focus(); toast("Example filled in. Replace the blanks with your details.");
      break;
    case "topic":
      var tv = t.getAttribute("data-v"), mm = $("#m-msg");
      Array.prototype.forEach.call(document.querySelectorAll("[data-act=topic]"), function (b) { var on = b === t; b.classList.toggle("on", on); b.setAttribute("aria-pressed", String(on)); });
      if (mm) { mm.value = "[" + tv + "] " + mm.value.replace(/^\[[^\]]+\]\s*/, ""); mm.focus(); }
      break;
    case "qstatus": S.cStatus = t.getAttribute("data-v"); S.cVisible = 20; refreshComplaints(); break;
    case "file-another": S.receipt = null; S.complaintImgs = []; S.geo = null; render(); break;
    case "clear-complaint": S.complaintImgs = []; S.geo = null; setTimeout(function () { $("#c-prev").innerHTML = ""; $("#c-who").style.display = ""; $("#c-count").textContent = "0 / 3000"; var g = $("#c-geo"); if (g) g.innerHTML = geoHtml(); }, 0); break;
    case "forget-id": S.myIds = S.myIds.filter(function (x) { return x.id !== id; }); render(); break;
    case "logout": S.admin = null; location.hash = "#/admin/login"; break;
    case "toggle-c": S.openC[id] = !S.openC[id]; refreshComplaints(); break;
    case "save-c":
      var c = db.complaints.filter(function (x) { return x.id === id; })[0];
      var ns = $("#st-" + id).value, nn = $("#nt-" + id).value; c.urgency = $("#ur-" + id).value; c.internalNote = $("#in-" + id).value;
      if (ns !== c.status || nn !== c.adminNote) { c.status = ns; c.adminNote = nn; c.history.push({ status: ns, note: nn || "Status updated", at: Date.now() }); }
      refreshComplaints(); toast("Complaint updated"); break;
    case "del-c":
      if (confirm("Delete this complaint? This can't be undone.")) { db.complaints = db.complaints.filter(function (x) { return x.id !== id; }); refreshComplaints(); toast("Complaint deleted"); }
      break;
    case "edit-aw": S.editing = id; S.formImg = ""; render(); break;
    case "cancel-edit": S.editing = null; S.formImg = ""; render(); break;
    case "del-aw":
      if (confirm("Delete this post?")) { db.awareness = db.awareness.filter(function (x) { return x.id !== id; }); if (S.editing === id) S.editing = null; render(); toast("Post deleted"); }
      break;
    case "export-csv": openCsv(); break;
    case "copy-csv":
      var box = $("#csv-box"); box.select();
      if (navigator.clipboard) navigator.clipboard.writeText(box.value).then(function () { toast("CSV copied"); }, function () { toast("Press Ctrl+C to copy the selected text", "error"); });
      else toast("Press Ctrl+C to copy the selected text", "error");
      break;
    case "bulk-apply":
      var n = 0;
      db.complaints.forEach(function (c) {
        if (!S.pick[c.id] || c.status === S.bulkStatus) return;
        c.status = S.bulkStatus; c.history.push({ status: S.bulkStatus, note: c.adminNote || "Status updated", at: Date.now() }); n++;
      });
      S.pick = {}; refreshComplaints(); toast(n + " complaint" + (n === 1 ? "" : "s") + " marked " + S.bulkStatus); break;
    case "toggle-read": var m = db.messages.filter(function (x) { return x.id === id; })[0]; m.read = !m.read; render(); break;
    case "del-msg": if (confirm("Delete this message?")) { db.messages = db.messages.filter(function (x) { return x.id !== id; }); render(); toast("Message deleted"); } break;
  }
});

document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeModal(); });

document.addEventListener("mousedown", function (e) { if (e.target.id === "modal") closeModal(); });

document.addEventListener("input", function (e) {
  var t = e.target;
  if (t.id === "aw-q") { S.awQ = t.value; S.awLoaded = true; refreshAw(); }
  else if (t.id === "c-q") { S.cQ = t.value; refreshComplaints(); }
  else if (t.id === "c-details") { $("#c-count").textContent = t.value.length + " / 3000"; }
});

document.addEventListener("change", function (e) {
  var t = e.target;
  if (t.id === "c-status") { S.cStatus = t.value; refreshComplaints(); }
  else if (t.id === "c-catf") { S.cCat = t.value; refreshComplaints(); }
  else if (t.id === "c-urgf") { S.cUrg = t.value; refreshComplaints(); }
  else if (t.id === "c-sort") { S.cSort = t.value; refreshComplaints(); }
  else if (t.id === "bulk-status") { S.bulkStatus = t.value; }
  else if (t.id === "pick-all") { var vis = visibleComplaints(); vis.forEach(function (c) { if (t.checked) S.pick[c.id] = true; else delete S.pick[c.id]; }); refreshComplaints(); }
  else if (t.getAttribute && t.getAttribute("data-pick")) { var pid = t.getAttribute("data-pick"); if (t.checked) S.pick[pid] = true; else delete S.pick[pid]; refreshComplaints(); }
  else if (t.id === "c-urg") { $("#c-urg-help").textContent = URG_HELP[t.value]; }
  else if (t.id === "c-anon") { $("#c-who").style.display = t.checked ? "none" : ""; }
  else if (t.id === "c-img") readComplaintImages(t);
  else if (t.id === "w-img") readImage(t);
});

function readComplaintImages(input) {
  var err = $("#c-err"), picked = Array.prototype.slice.call(input.files), problem = "", todo = [];
  input.value = "";
  picked.forEach(function (f) {
    if (!/^image\/(png|jpe?g|webp|gif)$/.test(f.type)) { problem = "Photos must be PNG, JPG, WEBP or GIF."; return; }
    if (f.size > 3 * 1024 * 1024) { problem = '"' + f.name + '" is over 3 MB. Choose a smaller photo.'; return; }
    if (S.complaintImgs.length + todo.length >= 3) { problem = "You can attach up to 3 photos."; return; }
    todo.push(f);
  });
  err.textContent = problem; err.hidden = !problem;
  todo.forEach(function (f) {
    var r = new FileReader();
    r.onload = function () { S.complaintImgs.push(r.result); var p = $("#c-prev"); if (p) p.innerHTML = thumbsHtml(); };
    r.readAsDataURL(f);
  });
}

function readImage(input) {
  var isC = input.id === "c-img", f = input.files[0], err = $(isC ? "#c-err" : "#w-err");
  var fail = function (m) { err.textContent = m; err.hidden = false; input.value = ""; };
  if (!f) return;
  if (!/^image\/(png|jpe?g|webp|gif)$/.test(f.type)) return fail("Photos must be PNG, JPG, WEBP or GIF.");
  if (f.size > 3 * 1024 * 1024) return fail("That photo is over 3 MB. Choose a smaller one.");
  err.hidden = true;
  var r = new FileReader();
  r.onload = function () {
    if (isC) { S.complaintImg = r.result; $("#c-prev").innerHTML = '<div class="preview"><img src="' + r.result + '" alt="Selected photo preview"></div>'; }
    else { S.formImg = r.result; var old = input.parentNode.querySelector(".c-photo"); if (old) old.remove(); var im = document.createElement("img"); im.className = "c-photo"; im.src = r.result; im.alt = "Image preview"; input.parentNode.appendChild(im); }
  };
  r.readAsDataURL(f);
}

document.addEventListener("submit", function (e) {
  var form = e.target.closest("form[data-form]"); if (!form) return;
  e.preventDefault();
  var kind = form.getAttribute("data-form"), v = {};
  Array.prototype.forEach.call(form.elements, function (el) { if (el.name) v[el.name] = el.type === "checkbox" ? el.checked : el.value; });

  if (kind === "track") {
    var id = (v.id || "").trim().toUpperCase(); if (id) location.hash = "#/track/" + encodeURIComponent(id);
  } else if (kind === "complaint") {
    var err = $("#c-err"); err.hidden = true;
    if (!v.category) { err.textContent = "Choose a category."; err.hidden = false; return; }
    if (v.details.trim().length < 15) { err.textContent = "Describe the problem in at least 15 characters."; err.hidden = false; return; }
    if (v.website) { S.receipt = "SCB-000000"; render(); return; } // honeypot: pretend it worked
    var tid; do { tid = makeTrack(); } while (db.complaints.some(function (c) { return c.trackingId === tid; }));
    db.complaints.push({ id: nextId(), trackingId: tid, category: v.category, location: v.location.trim(), details: v.details.trim(), status: "Pending", urgency: v.urgency || "Medium", lat: S.geo ? S.geo.lat : null, lng: S.geo ? S.geo.lng : null, adminNote: "", anonymous: v.anonymous, name: v.anonymous ? "" : v.name.trim(), email: v.anonymous ? "" : v.email.trim(), images: S.complaintImgs.slice(), internalNote: "", feedback: null, history: [{ status: "Pending", note: "Complaint received", at: Date.now() }], at: Date.now() });
    S.myIds.unshift({ id: tid, category: v.category }); S.receipt = tid; S.complaintImgs = []; S.geo = null; render();
  } else if (kind === "contact") {
    var ce = $("#m-err"); ce.hidden = true;
    if (v.website) { form.reset(); toast("Message sent. We'll reply by email."); return; }
    if (!/^\S+@\S+\.\S+$/.test(v.email)) { ce.textContent = "That email address doesn't look right"; ce.hidden = false; return; }
    db.messages.push({ id: nextId(), name: v.name.trim(), email: v.email.trim(), message: v.message.trim(), read: false, at: Date.now() });
    form.reset(); toast("Message sent. We'll reply by email.");
  } else if (kind === "login") {
    if (v.email.toLowerCase().trim() === db.admin.email && v.password === db.admin.password) { S.admin = { name: db.admin.name }; location.hash = "#/admin"; render(); }
    else { var le = $("#a-err"); le.textContent = "Wrong email or password"; le.hidden = false; }
  } else if (kind === "pw") {
    var pe = $("#p-err"); pe.hidden = true;
    var pf = function (m) { pe.textContent = m; pe.hidden = false; };
    if (v.current !== db.admin.password) return pf("Your current password is wrong");
    if (v.next.length < 8) return pf("The new password must be at least 8 characters.");
    if (v.next !== v.again) return pf("The two new passwords don't match.");
    db.admin.password = v.next; form.reset(); toast("Password changed");
  } else if (kind === "aw") {
    var editing = S.editing ? db.awareness.filter(function (a) { return a.id === S.editing; })[0] : null;
    if (editing) { editing.title = v.title; editing.category = v.category; editing.summary = v.summary; editing.details = v.details; if (S.formImg) editing.image = S.formImg; }
    else db.awareness.push({ id: nextId(), title: v.title, category: v.category, summary: v.summary, details: v.details, image: S.formImg, at: Date.now() });
    toast(editing ? "Post updated" : "Post published"); S.editing = null; S.formImg = ""; render();
  }
});
