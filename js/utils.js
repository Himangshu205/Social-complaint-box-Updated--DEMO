/* utils.js
   Small helpers and the lists the whole site uses (categories, statuses, urgency levels, emergency numbers).
   Plain script (no build tools). Scripts load in order from index.html. */
"use strict";

/* ---------- helpers ---------- */
var esc = function (s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
};

var $ = function (sel, root) { return (root || document).querySelector(sel); };

var fmt = function (t) {
  return new Date(t).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
};

var slug = function (s) { return s.toLowerCase().replace(/\s+/g, "-"); };

var ago = function (d, h) { return Date.now() - d * 864e5 - (h || 0) * 36e5; };

var uid = 100;

var nextId = function () { return "id" + ++uid; };

var AW_CATS = ["Health", "Cyber Security", "Environment", "Road Safety", "Mental Health", "Education"];

var C_CATS = AW_CATS.concat(["Infrastructure", "Sanitation", "Public Safety", "Other"]);

var STATUSES = ["Pending", "In progress", "Resolved", "Rejected"];

var URGENCIES = ["Low", "Medium", "High", "Urgent"];

var URG_HELP = { Low: "Not harmful, can wait", Medium: "Needs fixing soon", High: "Affects many people or daily life", Urgent: "Risk to safety or health right now" };

var RANK = { Urgent: 0, High: 1, Medium: 2, Low: 3 };

var EMERGENCY = [["100", "Police"], ["101", "Fire"], ["1098", "Child helpline"], ["181", "Women's helpline"], ["1075", "Health helpline"]];

var ALPHA = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

var makeTrack = function () {
  var s = "SCB-";
  for (var i = 0; i < 6; i++) s += ALPHA[Math.floor(Math.random() * ALPHA.length)];
  return s;
};
