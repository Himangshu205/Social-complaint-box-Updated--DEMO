/* effects.js
   Visual effects: fade-in on scroll, loading placeholders and animated counters.
   Plain script (no build tools). Scripts load in order from index.html. */
"use strict";

/* ---------- scroll reveal ---------- */
function reveal() {
  if (!("IntersectionObserver" in window)) return;
  var els = document.querySelectorAll(".section h1, .section h2, .a-card, .steps li, .emergency-list li, .stat, .card.pad, .statsband li");
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      en.target.classList.add("in");
      io.unobserve(en.target);
      setTimeout(function () { en.target.classList.remove("reveal", "in"); }, 900);
    });
  }, { threshold: 0.12 });
  Array.prototype.forEach.call(els, function (el, i) {
    if (el.classList.contains("reveal")) return;
    el.classList.add("reveal");
    el.style.setProperty("--d", (i % 4) * 0.06 + "s");
    io.observe(el);
  });
}

function skeletons(n) {
  var one = '<div class="card sk-card" aria-hidden="true"><div class="skeleton sk-img"></div><div class="sk-body"><div class="skeleton sk-line s"></div><div class="skeleton sk-line m"></div><div class="skeleton sk-line"></div><div class="skeleton sk-btn"></div></div></div>';
  return new Array(n + 1).join(one);
}

function counters() {
  Array.prototype.forEach.call(document.querySelectorAll("[data-count]"), function (el) {
    if (UI.motion === "off" || !("IntersectionObserver" in window)) return;
    var to = parseFloat(el.getAttribute("data-count")), dec = +(el.getAttribute("data-dec") || 0);
    var io = new IntersectionObserver(function (en) {
      if (!en[0].isIntersecting) return;
      io.disconnect();
      var t0 = performance.now();
      (function tick(t) {
        var p = Math.min(1, (t - t0) / 1100), e = 1 - Math.pow(1 - p, 3);
        el.textContent = (to * e).toFixed(dec);
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
    });
    io.observe(el);
  });
}
