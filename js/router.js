/* router.js
   Page routing based on the address (#/awareness, #/track/ID, ...), page titles and rendering.
   Plain script (no build tools). Scripts load in order from index.html. */
"use strict";

var TITLES = { "/": "Social Complaint Box", "/awareness": "Awareness guides", "/complaint": "File a complaint", "/track": "Track a complaint", "/about": "About us", "/contact": "Contact us", "/admin": "Dashboard · Admin", "/admin/complaints": "Complaints · Admin", "/admin/awareness": "Awareness posts · Admin", "/admin/messages": "Messages · Admin", "/admin/settings": "Settings · Admin", "/admin/login": "Admin sign in" };

function setTitle(path) {
  var key = path.indexOf("/track/") === 0 ? "/track" : path;
  var t = TITLES[key];
  document.title = t ? (t === "Social Complaint Box" ? t : t + " | Social Complaint Box") : "Page not found | Social Complaint Box";
}

/* ---------- router ---------- */
function render() {
  closeModal();
  var rawHash = location.hash.slice(1) || "/", qIdx = rawHash.indexOf("?");
  S.query = {};
  if (qIdx > -1) { rawHash.slice(qIdx + 1).split("&").forEach(function (kv) { var p = kv.split("="); if (p[0]) S.query[decodeURIComponent(p[0])] = decodeURIComponent(p[1] || ""); }); rawHash = rawHash.slice(0, qIdx); }
  var path = rawHash.replace(/\/+$/, "") || "/";
  var app = $("#app"), html;
  if (path.indexOf("/admin") === 0) {
    if (path === "/admin/login") {
      if (S.admin) { location.hash = "#/admin"; return; }
      html = pageLogin();
    } else if (!S.admin) { location.hash = "#/admin/login"; return; }
    else {
      var inner = path === "/admin" ? pageDashboard() : path === "/admin/complaints" ? pageAdminComplaints() : path === "/admin/awareness" ? pageAdminAwareness() : path === "/admin/messages" ? pageAdminMessages() : path === "/admin/settings" ? pageSettings() : "<p>Not found.</p>";
      html = adminShell(path, inner);
    }
  } else {
    var inner2;
    if (path === "/") inner2 = pageHome();
    else if (path === "/awareness") inner2 = pageAwareness();
    else if (path === "/complaint") inner2 = pageComplaint();
    else if (path === "/track") inner2 = pageTrack("");
    else if (path.indexOf("/track/") === 0) inner2 = pageTrack(decodeURIComponent(path.slice(7)));
    else if (path === "/about") inner2 = pageAbout();
    else if (path === "/contact") inner2 = pageContact();
    else inner2 = pageNotFound();
    html = publicShell(path, inner2);
  }
  app.innerHTML = html;
  window.scrollTo(0, 0);
  setTitle(path);
  if (path === "/awareness" && !S.awLoaded) {
    setTimeout(function () { S.awLoaded = true; if ($("#aw-grid") && location.hash.indexOf("/awareness") > -1) refreshAw(); }, 700);
  }
  reveal();
  counters();
}

window.addEventListener("hashchange", render);
