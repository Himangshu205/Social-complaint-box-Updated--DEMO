/* appearance.js
   The "Customize" settings: theme, accent colour, background, font, corners and animations. Saved in the browser only when the visitor changes something.
   Plain script (no build tools). Scripts load in order from index.html. */
"use strict";

/* ---------- appearance (theme, accent, background, font, corners, motion) ---------- */
var UI_KEY = "scb_ui_v2";

 // new key, so an old saved "dark" can never override the bright default
var UI_DEFAULT = { theme: "light", accent: "crimson", bg: "mesh", font: "modern", radius: "soft", motion: "on" };

var OPTS = {
  theme: [["light", "Light"], ["dark", "Dark"]],
  accent: [["crimson", "#d63b2e", "Crimson"], ["ocean", "#2563eb", "Ocean"], ["emerald", "#059669", "Emerald"], ["violet", "#7c3aed", "Violet"], ["orange", "#ea580c", "Sunset"], ["slate", "#334155", "Slate"]],
  bg: [["mesh", "Mesh"], ["grid", "Grid"], ["dots", "Dots"], ["waves", "Waves"], ["plain", "Plain"]],
  font: [["modern", "Modern"], ["editorial", "Editorial"], ["friendly", "Friendly"]],
  radius: [["sharp", "Sharp"], ["soft", "Soft"], ["round", "Round"]],
  motion: [["on", "On"], ["off", "Off"]]
};

function validUI(k, v) { return !!OPTS[k] && OPTS[k].some(function (o) { return o[0] === v; }); }

function loadUI() {
  var o = {}, out = {};
  try { o = JSON.parse(localStorage.getItem(UI_KEY)) || {}; } catch (e) {}
  Object.keys(UI_DEFAULT).forEach(function (k) { out[k] = validUI(k, o[k]) ? o[k] : UI_DEFAULT[k]; });
  return out;
}

var UI = loadUI();

function applyUI() {
  var h = document.documentElement;
  h.setAttribute("data-theme", UI.theme); h.setAttribute("data-accent", UI.accent); h.setAttribute("data-bg", UI.bg);
  h.setAttribute("data-font", UI.font); h.setAttribute("data-radius", UI.radius); h.setAttribute("data-motion", UI.motion);
}

function saveUI() { try { localStorage.setItem(UI_KEY, JSON.stringify(UI)); } catch (e) {} }

 // only called when the visitor changes something
function syncPanel() {
  Array.prototype.forEach.call(document.querySelectorAll("[data-ui][data-v]"), function (b) {
    b.setAttribute("aria-pressed", String(UI[b.getAttribute("data-ui")] === b.getAttribute("data-v")));
  });
}

function setUI(k, v) { if (!validUI(k, v)) return; UI[k] = v; applyUI(); saveUI(); syncPanel(); }

applyUI();

function themeBtn() {
  return '<button class="theme-toggle" data-act="toggle-theme" aria-label="Switch between light and dark theme" title="Switch theme">' +
    '<svg class="i-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>' +
    '<svg class="i-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg></button>';
}

function brandMark() {
  return '<svg class="brand-mark" viewBox="0 0 32 32" aria-hidden="true"><path d="M4 11 L8 5 H24 L28 11Z" fill="var(--accent-hi)"/><rect x="4" y="11" width="24" height="17" rx="3" fill="var(--accent)"/><rect x="10" y="15" width="12" height="3.5" rx="1.75" fill="#14203a" opacity=".55"/><rect x="11" y="21" width="10" height="3" rx="1.5" fill="#fff" opacity=".92"/></svg>';
}
