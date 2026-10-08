/* pages-public.js
   The public pages: Home, Awareness, File a complaint, Track, About, Contact, 404, plus the header and footer.
   Plain script (no build tools). Scripts load in order from index.html. */
"use strict";

var PUBLIC_LINKS = [["/", "Home"], ["/awareness", "Awareness"], ["/complaint", "Complaint box"], ["/track", "Track"], ["/about", "About us"], ["/contact", "Contact"]];

function publicShell(path, inner) {
  var base = "/" + (path.split("/")[1] || "");
  return '<div class="demo-bar"><div class="wrap"><span><strong>Demo version.</strong> Sample data only, nothing is saved. Admin demo login: admin@example.com / demo123</span>' +
    '<a href="#/admin/login">Try the admin side</a></div></div>' +
    '<div class="site"><header class="nav"><div class="wrap nav-inner">' +
    '<a href="#/" class="brand" aria-label="Social Complaint Box home">' + brandMark() + 'Social Complaint Box</a>' +
    '<nav id="main-nav" class="nav-links">' +
    PUBLIC_LINKS.map(function (l) {
      var on = l[0] === "/" ? path === "/" : base === l[0];
      var cls = (on ? "active" : "") + (l[0] === "/complaint" ? " cta" : "");
      return '<a href="#' + l[0] + '"' + (cls.trim() ? ' class="' + cls.trim() + '"' : "") + (on ? ' aria-current="page"' : "") + ">" + l[1] + "</a>";
    }).join("") + '</nav><div class="nav-actions">' + themeBtn() + '<button class="nav-toggle" data-act="toggle-nav" aria-expanded="false" aria-controls="main-nav">Menu</button></div></div></header><main>' + inner + "</main>" +
    '<footer class="footer"><div class="wrap footer-grid"><div><div class="brand">' + brandMark() + 'Social Complaint Box</div><p>Report a problem, follow it until it is fixed, and learn about the issues that matter in your area.</p><p>Created by Himangshu Sikder.</p></div>' +
    '<div><h4>Explore</h4><ul>' + PUBLIC_LINKS.map(function (l) { return '<li><a href="#' + l[0] + '">' + l[1] + "</a></li>"; }).join("") + '</ul></div>' +
    '<div><h4>Emergency</h4><ul>' + EMERGENCY.map(function (e) { return '<li><a href="tel:' + e[0] + '"><strong>' + e[0] + "</strong> " + e[1] + "</a></li>"; }).join("") + '</ul></div></div>' +
    '<div class="wrap footer-bottom"><span>© ' + new Date().getFullYear() + ' Social Complaint Box</span><a href="#/admin/login">Admin sign in</a></div></footer></div>';
}

/* ---------- public pages ---------- */
function resolvedWall() {
  var list = db.complaints.filter(function (c) { return c.status === "Resolved"; })
    .sort(function (a, b) { return b.history[b.history.length - 1].at - a.history[a.history.length - 1].at; }).slice(0, 6);
  if (!list.length) return "";
  return '<section class="section"><div class="wrap"><p class="eyebrow">Proof it works</p><h2>Recently resolved</h2><p class="muted">Problems reported here that have been fixed. No personal details are shown.</p><div class="grid grid-3">' +
    list.map(function (r) {
      return '<article class="card pad resolved-card"><p class="a-cat">' + esc(r.category) + "</p><h3>" + esc(r.location || "Location not given") + '</h3><p class="muted">' + esc(r.adminNote || "Marked as resolved.") + '</p><small class="muted">Resolved ' + fmt(r.history[r.history.length - 1].at) + "</small></article>";
    }).join("") + "</div></div></section>";
}

function pageHome() {
  var latest = db.awareness.slice().sort(function (a, b) { return b.at - a.at; }).slice(0, 3);
  var total = db.complaints.length, done = db.complaints.filter(function (c) { return c.status === "Resolved"; }).length;
  var avg = avgDays();
  var ticker = C_CATS.map(function (c) { return "<span>" + esc(c) + "</span>"; }).join("");
  var qa = function (href, icon, title, text, go) { return '<a class="qa" href="' + href + '"><span class="qa-ico">' + ico(icon) + "</span><strong>" + title + '</strong><span class="muted">' + text + '</span><span class="go">' + go + " " + ico("arrow") + "</span></a>"; };
  var bento = function (cls, icon, title, text) { return '<div class="bento-item ' + cls + '">' + ico(icon) + "<h3>" + title + "</h3><p>" + text + "</p></div>"; };
  var catTiles = C_CATS.map(function (c) {
    var k = SLUG[c] || "other";
    return '<a class="cat" href="#/complaint?cat=' + encodeURIComponent(c) + '"><i><svg viewBox="0 0 24 24" aria-hidden="true">' + ICONS[k] + "</svg></i>" + esc(c) + "</a>";
  }).join("");
  return '<section class="hero"><div class="wrap hero-grid"><div class="hero-copy">' +
    '<p class="eyebrow live"><span class="live-dot"></span> Citizen complaint platform</p>' +
    '<h1>Report it once. <span class="hl">Watch it get fixed.</span></h1>' +
    '<p class="lead">Tell us about a problem in your area: a broken road, unsafe water, a cyber scam. You don\'t need an account, and you can stay anonymous. You\'ll get a tracking ID so you can see what happens next.</p>' +
    '<div class="row gap"><a class="btn btn-primary btn-lg" href="#/complaint">' + ico("pencil") + "File a complaint" + ico("arrow", "arrow") + '</a><a class="btn btn-outline btn-lg" href="#/awareness">' + ico("book") + "Read awareness guides</a></div>" +
    '<form class="hero-track" data-form="track"><label for="hero-id">Already filed one? Enter your tracking ID</label>' +
    '<div class="row"><input id="hero-id" name="id" placeholder="SCB-K7M2QX" autocomplete="off"><button class="btn btn-dark" type="submit">' + ico("search") + "Check status</button></div></form></div>" +
    '<div class="hero-visual" aria-hidden="true">' +
    '<div class="hv-card hv-main"><p class="hv-id">SCB-K7M2QX</p><p class="hv-meta">Road Safety · Salt Lake crossing</p><span class="badge badge-in-progress">In progress</span>' +
    '<div class="hv-steps"><i class="on"></i><i class="on"></i><i></i></div><p class="hv-lab"><span>Pending</span><span>In progress</span><span>Resolved</span></p></div>' +
    '<div class="hv-card hv-note"><b>Response from the admin</b><p>Repair crew scheduled for Thursday. Thank you for reporting.</p></div>' +
    '<div class="hv-card hv-done"><span class="tick">✓</span><div><strong>Resolved</strong><small>Fixed in 3 days</small></div></div></div></div></section>' +
    '<div class="marquee" aria-hidden="true"><div class="marquee-track">' + ticker + ticker + "</div></div>" +
    '<section class="section"><div class="wrap"><p class="eyebrow">Quick actions</p><h2>What would you like to do?</h2><div class="qa-grid">' +
    qa("#/complaint", "pencil", "File a complaint", "Takes about two minutes. Name and email are optional.", "Start") +
    qa("#/track", "search", "Track a complaint", "Enter your tracking ID to see the status and any reply.", "Check status") +
    qa("#/awareness", "book", "Awareness guides", "Short, practical guides on health, safety, the environment and more.", "Browse guides") +
    qa("tel:112", "phone", "Emergency? Call 112", "A complaint is not an emergency service. Call first if someone is in danger.", "Call now") +
    "</div></div></section>" +
    '<section class="statsband"><div class="wrap"><ul>' +
    '<li><b data-count="' + total + '">' + total + "</b><span>complaints filed</span></li>" +
    '<li><b data-count="' + done + '">' + done + "</b><span>resolved</span></li>" +
    '<li><b' + (avg === "–" ? "" : ' data-count="' + avg + '" data-dec="1"') + ">" + avg + "</b><span>average days to resolve</span></li>" +
    '<li><b data-count="' + db.awareness.length + '">' + db.awareness.length + "</b><span>awareness guides</span></li></ul></div></section>" +
    '<section class="section"><div class="wrap"><p class="eyebrow">How it works</p><h2>How a complaint moves</h2><ol class="steps">' +
    "<li><h3>You describe the problem</h3><p>Pick a category, say where it is, add photos if you have them. Name and email are optional.</p></li>" +
    "<li><h3>You get a tracking ID</h3><p>Save it. It is the only way to look up your complaint, and it shows no personal details.</p></li>" +
    "<li><h3>Admins review and respond</h3><p>Status moves from Pending to In progress to Resolved, with a note explaining what was done.</p></li></ol></div></section>" +
    '<section class="section section-tint"><div class="wrap"><p class="eyebrow">Start here</p><h2>What is the problem about?</h2><p class="muted">Pick a topic and the form opens with it already chosen.</p><div class="cat-grid">' + catTiles + "</div></div></section>" +
    '<section class="section"><div class="wrap"><p class="eyebrow">Built for trust</p><h2>Why people use it</h2><div class="bento">' +
    bento("wide accent", "shield", "Stay anonymous", "Turn on anonymous mode and your name and email are not stored. You can still follow your complaint with its ID.") +
    bento("wide", "clock", "Follow every step", "Each complaint has a status and a history, so you can see when it was received, reviewed and resolved.") +
    bento("", "camera", "Photos and location", "Attach up to three photos and pin your location so the team can find the problem fast.") +
    bento("", "gauge", "Urgency, not guesswork", "Mark how serious it is. Admins can sort the most urgent complaints to the top.") +
    bento("", "check", "Proof, not promises", "Resolved problems appear on the home page, and you can say if it was really fixed.") +
    "</div></div></section>" +
    resolvedWall() +
    '<section class="section section-tint"><div class="wrap"><p class="eyebrow">Learn</p><div class="row between"><h2>Latest awareness guides</h2><a class="text-link" href="#/awareness">See all guides</a></div>' +
    '<div class="grid grid-3">' + latest.map(aCard).join("") + "</div></div></section>" +
    '<section class="section"><div class="wrap"><p class="eyebrow">Questions</p><h2>Quick answers</h2>' + faqHtml() + "</div></section>" +
    '<section class="section"><div class="wrap"><div class="cta-band"><div><h2>Something wrong near you?</h2><p>Report it in about two minutes. You\'ll get an ID to follow it until it is fixed.</p></div>' +
    '<div class="row gap"><a class="btn btn-light btn-lg" href="#/complaint">File a complaint ' + ico("arrow", "arrow") + '</a><a class="btn btn-ghost-light btn-lg" href="#/track">Track a complaint</a></div></div></div></section>' +
    emergency();
}

function pageAwareness() {
  return '<section class="section"><div class="wrap"><h1>Awareness guides</h1><p class="lead">Short, practical guides on the issues people report most.</p>' +
    '<div class="filters"><input type="search" id="aw-q" value="' + esc(S.awQ) + '" placeholder="Search guides" aria-label="Search awareness guides">' +
    '<div class="chips" id="aw-chips" role="group" aria-label="Filter by category">' + chips() + "</div></div>" +
    '<div class="viewbar"><span class="muted" id="aw-count">' + filteredAw().length + ' guides</span><div class="right-tools"><div class="seg" role="group" aria-label="Sort guides"><button data-act="aw-sort" data-v="newest" aria-pressed="' + (S.awSort === "newest") + '">Newest</button><button data-act="aw-sort" data-v="az" aria-pressed="' + (S.awSort === "az") + '">A–Z</button></div><div class="seg" role="group" aria-label="Card layout"><button data-act="aw-view" data-v="grid" aria-pressed="' + (S.awView === "grid") + '">Grid</button><button data-act="aw-view" data-v="list" aria-pressed="' + (S.awView === "list") + '">List</button></div></div></div>' +
    '<div class="grid ' + (S.awView === "list" ? "list-view" : "grid-3") + '" id="aw-grid">' + (S.awLoaded ? awGrid() : skeletons(6)) + "</div></div></section>" + emergency();
}

function chips() {
  return ["All"].concat(AW_CATS, ["Saved"]).map(function (c) {
    var label = c === "Saved" ? ico("heart") + "Saved (" + S.saved.length + ")" : esc(c);
    return '<button class="chip' + (S.awCat === c ? " on" : "") + '" aria-pressed="' + (S.awCat === c) + '" data-act="aw-cat" data-c="' + esc(c) + '">' + label + "</button>";
  }).join("");
}

function pageComplaint() {
  if (S.receipt) {
    return '<section class="section"><div class="wrap narrow"><div class="card receipt"><h1>Complaint received</h1>' +
      "<p>Keep this tracking ID. Without it you can't look up your complaint.</p>" +
      '<p class="track-id">' + esc(S.receipt) + '</p><div class="row gap">' +
      '<button class="btn btn-dark" data-act="copy-id">' + ico("copy") + 'Copy ID</button><button class="btn btn-outline" data-act="copy-link">' + ico("link") + 'Copy tracking link</button><button class="btn btn-outline" data-act="print">' + ico("printer") + 'Print receipt</button>' +
      '<a class="btn btn-primary" href="#/track/' + esc(S.receipt) + '">Track this complaint ' + ico("arrow", "arrow") + '</a>' +
      '<button class="btn btn-outline" data-act="file-another">File another</button></div></div></div></section>';
  }
  return '<section class="section"><div class="wrap narrow"><h1>File a complaint</h1>' +
    '<p class="lead">Be specific. A clear location and description gets a complaint resolved faster.</p>' +
    '<div class="tips">' + tipHtml("pin", "Say where", "A street, a landmark or your location pin helps most.") + tipHtml("camera", "Add a photo", "Up to three photos show the problem clearly.") + tipHtml("shield", "Stay safe", "Don\'t approach danger. Call 112 in an emergency.") + "</div>" +
    '<div class="quick"><p>Quick start: tap an example and edit it to match your problem</p><div class="chips" role="group" aria-label="Example complaints">' +
    QUICK.map(function (q, n) { return '<button type="button" class="chip" data-act="quick-fill" data-i="' + n + '">' + ico("plus") + esc(q[0]) + "</button>"; }).join("") + "</div></div>" +
    '<form class="card form" data-form="complaint" novalidate>' +
    '<div class="hp" aria-hidden="true"><label>Website <input name="website" tabindex="-1" autocomplete="off"></label></div>' +
    '<label class="check"><input type="checkbox" name="anonymous" id="c-anon"><span><strong>Stay anonymous</strong><small>We won\'t store your name or email. You can still track the complaint with its ID.</small></span></label>' +
    '<div class="two" id="c-who"><div class="field"><label for="c-name">Your name (optional)</label><input id="c-name" name="name" autocomplete="name"></div>' +
    '<div class="field"><label for="c-email">Your email (optional)</label><input id="c-email" name="email" type="email" autocomplete="email"></div></div>' +
    '<div class="two"><div class="field"><label for="c-cat">Category</label><select id="c-cat" name="category"><option value="">Choose one</option>' +
    C_CATS.map(function (c) { return "<option" + (c === S.query.cat ? " selected" : "") + ">" + esc(c) + "</option>"; }).join("") + "</select></div>" +
    '<div class="field"><label for="c-urg">How urgent is it?</label><select id="c-urg" name="urgency">' + URGENCIES.map(function (u) { return "<option" + (u === "Medium" ? " selected" : "") + ">" + u + "</option>"; }).join("") + '</select><small class="muted" id="c-urg-help">' + URG_HELP.Medium + "</small></div></div>" +
    '<div class="field"><label for="c-loc">Where is it? (optional)</label><input id="c-loc" name="location" placeholder="Street, area or landmark"><div class="geo" id="c-geo">' + geoHtml() + "</div></div>" +
    '<div class="field"><label for="c-details">What happened?</label><textarea id="c-details" name="details" rows="6" maxlength="3000" placeholder="Describe the problem and how long it has been happening"></textarea><small class="muted right" id="c-count">0 / 3000</small></div>' +
    '<div class="field"><label for="c-img">Photos (optional, up to 3, 3 MB each)</label><input id="c-img" type="file" multiple accept="image/png,image/jpeg,image/webp,image/gif"><div id="c-prev">' + thumbsHtml() + "</div></div>" +
    '<p class="notice notice-error" id="c-err" role="alert" hidden></p>' +
    '<div class="row gap"><button class="btn btn-primary btn-lg">Submit complaint ' + ico("send") + '</button><button type="reset" class="btn btn-outline" data-act="clear-complaint">Clear form</button></div></form></div></section>' + emergency();
}

function thumbsHtml() {
  if (!S.complaintImgs.length) return "";
  return '<div class="thumbs">' + S.complaintImgs.map(function (src, i) {
    return '<figure><img src="' + src + '" alt="Selected photo ' + (i + 1) + '"><button type="button" class="btn btn-quiet" data-act="rm-photo" data-i="' + i + '">Remove</button></figure>';
  }).join("") + "</div>";
}

function geoHtml() {
  return '<button type="button" class="btn btn-outline" data-act="geo">' + (S.geo ? "Update my location" : "Use my current location") + "</button>" +
    (S.geo ? '<span class="geo-ok">Location attached · <a href="' + mapLink(S.geo.lat, S.geo.lng) + '" target="_blank" rel="noreferrer">view on map</a> · <button type="button" class="btn btn-quiet" data-act="geo-clear">Remove</button></span>' : "");
}

function trackResult(c) {
  var FLOW = ["Pending", "In progress", "Resolved"], step = FLOW.indexOf(c.status);
  return '<div class="card result"><div class="row between"><div><p class="track-id small">' + esc(c.trackingId) + '</p><p class="muted">' +
    esc(c.category) + (c.location ? ", " + esc(c.location) : "") + " · filed " + fmt(c.at) + '</p></div><div class="row gap">' + badge(c.status) + '<button class="btn btn-quiet" data-act="copy-track-link">' + ico("link") + 'Copy link</button></div></div>' +
    '<div class="share-row"><a class="btn btn-soft btn-sm" target="_blank" rel="noopener" href="https://wa.me/?text=' + encodeURIComponent("Complaint " + c.trackingId + " is " + c.status + ". Track it: " + location.href.split("#")[0] + "#/track/" + c.trackingId) + '">' + ico("chat") + 'Share on WhatsApp</a>' +
    '<a class="btn btn-soft btn-sm" href="mailto:?subject=' + encodeURIComponent("Complaint " + c.trackingId) + '&body=' + encodeURIComponent("Track it here: " + location.href.split("#")[0] + "#/track/" + c.trackingId) + '">' + ico("mail") + "Email the link</a></div>" +
    (c.status === "Rejected" ? '<p class="notice">This complaint was closed without action. See the note below.</p>' :
      '<ol class="progress" aria-label="Progress">' + FLOW.map(function (s, i) { return '<li class="' + (i <= step ? "done" : "") + '">' + s + "</li>"; }).join("") + "</ol>") +
    (c.adminNote ? '<div class="admin-note"><strong>Response from the admin</strong><p>' + esc(c.adminNote) + "</p></div>" : "") +
    (c.status === "Resolved" && !c.feedback ? '<div class="feedback-box"><strong>Was this really fixed for you?</strong><p class="muted">Your answer helps the team. If it isn\'t fixed, the complaint is reopened.</p>' +
      (S.fbNo ? '<div class="field"><label for="fb-c">What is still wrong? (optional)</label><textarea id="fb-c" rows="3" maxlength="500"></textarea></div>' : "") +
      '<div class="row gap"><button class="btn btn-primary" data-act="fb-yes" data-id="' + esc(c.trackingId) + '">Yes, it\'s fixed</button>' +
      (S.fbNo ? '<button class="btn btn-danger" data-act="fb-reopen" data-id="' + esc(c.trackingId) + '">Reopen this complaint</button>' : '<button class="btn btn-outline" data-act="fb-no">No, still a problem</button>') + "</div></div>" : "") +
    (c.feedback ? '<p class="notice">' + (c.feedback.resolved ? "You confirmed this was fixed. Thank you." : "You reported this was not fixed. It has been reopened.") + "</p>" : "") +
    '<h2 class="h3">History</h2><ul class="timeline">' +
    c.history.slice().reverse().map(function (h) { return '<li><span class="dot" aria-hidden="true"></span><div><strong>' + esc(h.status) + "</strong><p>" + esc(h.note) + '</p><small class="muted">' + fmt(h.at) + "</small></div></li>"; }).join("") + "</ul></div>";
}

function legendHtml() {
  var row = function (st, text) { return "<dt>" + badge(st) + "</dt><dd>" + text + "</dd>"; };
  return '<details class="faq-item legend"><summary>What do the statuses mean?' + ico("chevron") + "</summary><dl>" +
    row("Pending", "Your complaint is received and waiting to be reviewed.") + row("In progress", "Someone is working on it. Check for a note from the admin.") +
    row("Resolved", "The team marked it as fixed. You can confirm it, or reopen it if it isn\'t.") + row("Rejected", "Closed without action. The admin\'s note explains why.") + "</dl></details>";
}

function pageTrack(id) {
  S.trackedId = id;
  var found = id ? db.complaints.filter(function (c) { return c.trackingId === id.toUpperCase(); })[0] : null;
  var body = "";
  if (id && !found) body = '<p class="notice notice-error" role="alert">No complaint found with that ID</p>';
  if (found) body = trackResult(found);
  var saved = S.myIds.length ? '<div class="saved"><h2 class="h3">Filed from this device</h2><ul>' + S.myIds.map(function (s) {
    return '<li class="row between"><a href="#/track/' + s.id + '"><strong>' + esc(s.id) + '</strong> <span class="muted">' + esc(s.category) + '</span></a><button class="btn btn-quiet" data-act="forget-id" data-id="' + s.id + '">Remove from list</button></li>';
  }).join("") + "</ul></div>" : "";
  var sample = db.complaints.slice(0, 3).map(function (c) { return '<a href="#/track/' + c.trackingId + '">' + c.trackingId + "</a>"; }).join(", ");
  return '<section class="section"><div class="wrap narrow"><h1>Track a complaint</h1><p class="lead">Enter the tracking ID you received when you filed it.</p>' +
    '<form class="row track-form" data-form="track"><label for="t-id" class="sr-only">Tracking ID</label><input id="t-id" name="id" value="' + esc(id || "") + '" placeholder="SCB-K7M2QX" autocomplete="off"><button class="btn btn-primary">Check status</button></form>' +
    '<p class="muted" style="margin-top:.75rem">Preview tip: try ' + sample + ".</p>" + body + saved + legendHtml() + "</div></section>";
}

function pageAbout() {
  var pr = function (icon, title, text) { return '<div class="principle">' + ico(icon) + "<h3>" + title + "</h3><p>" + text + "</p></div>"; };
  return '<section class="section"><div class="wrap narrow"><p class="eyebrow">About</p><h1>About us</h1><p class="lead">Social Complaint Box is a place to raise local problems in an organised, transparent way, and to learn about the issues behind them.</p>' +
    "<h2>Why it exists</h2><p>Complaints are often slow and hard to follow. People don't know who received theirs or whether anything happened. Here every complaint gets a tracking ID and a visible status, so the person who reported it can follow it through to the end.</p>" +
    "<h2>What we stand for</h2><div class=\"principles\">" +
    pr("shield", "Private by default", "Name and email are optional, and anonymous mode doesn't store them.") +
    pr("eye", "Open about progress", "Every complaint has a visible status and a history you can check any time.") +
    pr("mobile", "Simple to use", "No account to create, and it works on any phone or computer.") + "</div>" +
    "<h2>What it does</h2><p>Visitors can file complaints with or without personal details, read awareness guides, and track progress. Admins review complaints, update their status with a public note, and publish awareness guides.</p>" +
    "<h2>Created by</h2><p>This website was created by Himangshu Sikder.</p>" +
    '<h2>Questions people ask</h2>' + faqHtml() +
    '<div class="row gap" style="margin-top:2rem"><a class="btn btn-primary" href="#/complaint">File a complaint ' + ico("arrow", "arrow") + '</a><a class="btn btn-outline" href="#/contact">Contact us</a></div></div></section>';
}

function pageContact() {
  return '<section class="section"><div class="wrap narrow"><p class="eyebrow">Contact</p><h1>Contact us</h1><p class="lead">Questions about the platform or a complaint you filed? Send us a note.</p>' +
    '<div class="quick"><p>What is this about?</p><div class="chips" role="group" aria-label="Message topic">' +
    TOPICS.map(function (t) { return '<button type="button" class="chip" data-act="topic" data-v="' + t + '" aria-pressed="false">' + ico("chat") + t + "</button>"; }).join("") + "</div></div>" +
    '<form class="card form" data-form="contact"><div class="hp" aria-hidden="true"><label>Website <input name="website" tabindex="-1" autocomplete="off"></label></div><div class="two"><div class="field"><label for="m-name">Your name</label><input id="m-name" name="name" required autocomplete="name"></div>' +
    '<div class="field"><label for="m-email">Your email</label><input id="m-email" name="email" type="email" required autocomplete="email"></div></div>' +
    '<div class="field"><label for="m-msg">Message</label><textarea id="m-msg" name="message" rows="6" maxlength="2000" required></textarea></div>' +
    '<p class="notice notice-error" id="m-err" role="alert" hidden></p><div><button class="btn btn-primary btn-lg">Send message ' + ico("send") + "</button></div></form>" +
    '<h2 style="margin-top:2.5rem">Quick answers</h2>' + faqHtml() + "</div></section>" + emergency();
}

function pageNotFound() {
  return '<section class="section"><div class="wrap narrow nf"><p class="nf-code" aria-hidden="true">404</p><h1 class="h2">This page isn\'t in the box</h1><p class="lead">That address doesn\'t exist. It may have moved or been mistyped.</p><div class="row gap" style="justify-content:center"><a class="btn btn-primary" href="#/">Go to the home page</a><a class="btn btn-outline" href="#/complaint">File a complaint</a></div></div></section>';
}
