/* components.js
   Reusable pieces: toast messages, the guide popup, badges, guide cards and their filtering.
   Plain script (no build tools). Scripts load in order from index.html. */
"use strict";

/* ---------- toast + modal ---------- */
var toastTimer;

function toast(msg, type) {
  var old = $(".toast"); if (old) old.remove();
  var t = document.createElement("div");
  t.className = "toast toast-" + (type || "ok"); t.setAttribute("role", "status"); t.textContent = msg;
  document.body.appendChild(t);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () { t.remove(); }, 3200);
}

function openModal(id) {
  var a = db.awareness.filter(function (x) { return x.id === id; })[0]; if (!a) return;
  closeModal();
  var list = S.modalList && S.modalList.length ? S.modalList : db.awareness, idx = 0;
  list.forEach(function (x, n) { if (x.id === id) idx = n; });
  var prev = list.length > 1 ? list[(idx - 1 + list.length) % list.length] : null, next = list.length > 1 ? list[(idx + 1) % list.length] : null;
  var m = document.createElement("div");
  m.className = "modal-backdrop"; m.id = "modal";
  m.innerHTML = '<div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">' +
    (a.image ? '<img src="' + esc(imgOf(a.image)) + '" alt="">' : tileHtml(a.category)) +
    '<div class="modal-body"><p class="a-cat">' + esc(a.category) + '</p><h2 id="modal-title">' + esc(a.title) + "</h2>" +
    a.details.split(/\n+/).map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("") +
    '<div class="modal-tools"><button class="btn btn-soft btn-sm" data-act="save-aw" data-id="' + a.id + '" data-modal="1" aria-pressed="' + (S.saved.indexOf(a.title) > -1) + '">' + ico("heart") + (S.saved.indexOf(a.title) > -1 ? "Saved" : "Save guide") + "</button>" +
    '<button class="btn btn-soft btn-sm" data-act="share-aw" data-id="' + a.id + '">' + ico("share") + "Share</button></div>" +
    '<div class="row gap"><a class="btn btn-primary" href="#/complaint?cat=' + encodeURIComponent(a.category) + '" data-act="close-modal">Report a ' + esc(a.category.toLowerCase()) + ' problem ' + ico("arrow", "arrow") + "</a>" +
    '<button class="btn btn-outline" data-act="close-modal" id="modal-close">Close</button></div>' +
    (prev ? '<div class="modal-nav"><button class="btn btn-outline btn-sm" data-act="modal-go" data-id="' + prev.id + '">' + ico("left") + "Previous</button>" +
      '<button class="btn btn-outline btn-sm" data-act="modal-go" data-id="' + next.id + '">Next ' + ico("arrow", "arrow") + "</button></div>" : "") +
    "</div></div>";
  document.body.appendChild(m);
  document.body.style.overflow = "hidden";
  $("#modal-close").focus();
}

function closeModal() {
  var m = $("#modal"); if (m) m.remove();
  document.body.style.overflow = "";
}

/* ---------- shared partials ---------- */
function ubadge(u) { u = u || "Medium"; return '<span class="badge u-' + u.toLowerCase() + '">' + esc(u) + "</span>"; }

function mapLink(lat, lng) { return "https://www.openstreetmap.org/?mlat=" + lat + "&mlon=" + lng + "#map=17/" + lat + "/" + lng; }

function badge(s) { return '<span class="badge badge-' + slug(s) + '">' + esc(s) + "</span>"; }

function emergency() {
  return '<section class="emergency"><div class="wrap"><h2>In an emergency, call first</h2>' +
    '<p class="muted">A complaint is not an emergency service. Use these numbers if someone is in danger.</p><ul class="emergency-list">' +
    EMERGENCY.map(function (e) { return '<li><a href="tel:' + e[0] + '"><strong>' + e[0] + "</strong><span>" + e[1] + "</span></a></li>"; }).join("") +
    "</ul></div></section>";
}

function aCard(a) {
  var media = a.image ? '<img src="' + esc(imgOf(a.image)) + '" alt="" loading="lazy">' : tileHtml(a.category);
  return '<article class="card a-card" data-act="open-aw" data-id="' + a.id + '"><div class="a-media">' + media + '<span class="a-chip">' + esc(a.category) + '</span><button class="a-save" data-act="save-aw" data-id="' + a.id + '" aria-pressed="' + (S.saved.indexOf(a.title) > -1) + '" aria-label="Save this guide" title="Save this guide">' + ico("heart") + "</button></div>" +
    '<div class="a-body"><h3>' + esc(a.title) + "</h3>" + (a.summary ? '<p class="muted">' + esc(a.summary) + "</p>" : "") +
    '<button class="a-more" data-act="open-aw" data-id="' + a.id + '">Read guide ' + ARROW + "</button></div></article>";
}

function filteredAw() {
  var q = S.awQ.trim().toLowerCase();
  var list = db.awareness.filter(function (a) {
    if (S.awCat === "Saved") { if (S.saved.indexOf(a.title) === -1) return false; }
    else if (S.awCat !== "All" && a.category !== S.awCat) return false;
    return !q || (a.title + " " + a.summary + " " + a.details).toLowerCase().indexOf(q) > -1;
  });
  list.sort(function (a, b) { return S.awSort === "az" ? a.title.localeCompare(b.title) : b.at - a.at; });
  return list;
}

function awGrid() {
  var list = filteredAw();
  return list.length ? list.map(aCard).join("") : '<p class="muted">' + (S.awCat === "Saved" ? "You haven\'t saved any guides yet. Tap the heart on a guide to keep it here." : "Nothing matches that search. Try another word or choose All.") + "</p>";
}

function refreshAw() {
  var g = $("#aw-grid"); if (!g) return;
  g.className = "grid " + (S.awView === "list" ? "list-view" : "grid-3");
  g.innerHTML = awGrid();
  var c = $("#aw-chips"); if (c) c.innerHTML = chips();
  var n = $("#aw-count"); if (n) n.textContent = filteredAw().length + " guide" + (filteredAw().length === 1 ? "" : "s");
  Array.prototype.forEach.call(document.querySelectorAll("[data-act=aw-view]"), function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-v") === S.awView)); });
  Array.prototype.forEach.call(document.querySelectorAll("[data-act=aw-sort]"), function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-v") === S.awSort)); });
  reveal();
}
