/* panel.js
   The floating Customize panel, back-to-top button, scroll progress bar and the button ripple effect.
   Plain script (no build tools). Scripts load in order from index.html. */
"use strict";

function buildChrome() {
  var wrap = document.createElement("div");
  var seg = function (k) {
    return '<div class="seg" role="group" aria-label="' + k + '">' + OPTS[k].map(function (o) { return '<button data-ui="' + k + '" data-v="' + o[0] + '" aria-pressed="false">' + o[1] + "</button>"; }).join("") + "</div>";
  };
  wrap.innerHTML =
    '<button class="ui-fab" aria-expanded="false" aria-controls="ui-panel" aria-label="Customize the look of this site"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 6h10M18 6h2M4 12h2M10 12h10M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="8" cy="12" r="2"/><circle cx="18" cy="18" r="2"/></svg><span>Customize</span></button>' +
    '<aside class="ui-panel" id="ui-panel" role="dialog" aria-label="Customize appearance" hidden><header><strong>Customize</strong><button class="ui-x" aria-label="Close">×</button></header>' +
    '<section><h3>Theme</h3>' + seg("theme") + "</section>" +
    '<section><h3>Accent colour</h3><div class="swatches">' + OPTS.accent.map(function (o) { return '<button class="sw" data-ui="accent" data-v="' + o[0] + '" style="--c:' + o[1] + '" aria-label="' + o[2] + '" title="' + o[2] + '" aria-pressed="false"></button>'; }).join("") + "</div></section>" +
    '<section><h3>Background</h3>' + seg("bg") + "</section><section><h3>Font</h3>" + seg("font") + "</section><section><h3>Corners</h3>" + seg("radius") + "</section><section><h3>Animations</h3>" + seg("motion") + "</section>" +
    '<footer><button class="btn btn-quiet" data-ui="reset">Reset to default</button></footer></aside>' +
    '<button class="to-top" aria-label="Back to top"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg></button>';
  while (wrap.firstChild) document.body.appendChild(wrap.firstChild);
  syncPanel();
  var bar = document.createElement("div"); bar.className = "progress-bar"; bar.setAttribute("aria-hidden", "true"); bar.innerHTML = "<i></i>"; document.body.appendChild(bar);
  window.addEventListener("scroll", function () {
    var b = $(".to-top"); if (b) b.classList.toggle("show", window.scrollY > 700);
    var h = document.documentElement.scrollHeight - window.innerHeight;
    bar.firstChild.style.transform = "scaleX(" + (h > 0 ? Math.min(1, window.scrollY / h) : 0) + ")";
  }, { passive: true });
}

function togglePanel(force) {
  var p = $("#ui-panel"), f = $(".ui-fab"); if (!p) return;
  var open = typeof force === "boolean" ? force : p.hidden;
  p.hidden = !open; f.setAttribute("aria-expanded", String(open));
  if (open) { var first = p.querySelector("[aria-pressed=true]"); if (first) first.focus(); }
}

document.addEventListener("click", function (e) {
  var b = e.target.closest("[data-ui]");
  if (b) {
    var k = b.getAttribute("data-ui");
    if (k === "reset") { UI = Object.assign({}, UI_DEFAULT); applyUI(); saveUI(); syncPanel(); toast("Appearance reset to default"); }
    else setUI(k, b.getAttribute("data-v"));
    return;
  }
  if (e.target.closest(".ui-fab")) return togglePanel();
  if (e.target.closest(".ui-x")) return togglePanel(false);
  if (e.target.closest(".to-top")) window.scrollTo({ top: 0, behavior: UI.motion === "off" ? "auto" : "smooth" });
});

document.addEventListener("keydown", function (e) { if (e.key === "Escape") togglePanel(false); });

document.addEventListener("pointerdown", function (e) {
  var b = e.target.closest(".btn");
  if (!b || b.disabled || UI.motion === "off") return;
  var r = b.getBoundingClientRect(), d = Math.max(r.width, r.height), sp = document.createElement("span");
  sp.className = "ripple"; sp.style.width = sp.style.height = d * 0.6 + "px";
  sp.style.left = e.clientX - r.left - d * 0.3 + "px"; sp.style.top = e.clientY - r.top - d * 0.3 + "px";
  b.appendChild(sp); sp.addEventListener("animationend", function () { sp.remove(); });
});
