/* content.js
   Text content: FAQ answers, example complaints for "Quick start", and contact topics.
   Plain script (no build tools). Scripts load in order from index.html. */
"use strict";

var FAQS = [
  ["Do I need an account to file a complaint?", "No. You can file a complaint without signing up. Your name and email are optional."],
  ["Can I stay anonymous?", "Yes. Turn on \u201cStay anonymous\u201d and your name and email are not stored. You can still follow the complaint with its tracking ID."],
  ["How do I see what happened to my complaint?", "Open the Track page and enter your tracking ID. You will see the status, any response from the admin, and the full history."],
  ["Who can see my complaint?", "Only the admins who manage the site. Public pages never show names or emails. The \u201cRecently resolved\u201d list shows only the category, the place and the admin's note."],
  ["What if the problem is not really fixed?", "When a complaint is marked Resolved, the Track page asks whether it was really fixed. Choose \u201cNo, still a problem\u201d and it is reopened."],
  ["Is this an emergency service?", "No. If someone is in danger, call 112 right away, or 100 (police), 101 (fire), 1098 (child helpline), 181 (women's helpline) or 1075 (health helpline)."]
];

function faqHtml() {
  return '<div class="faq">' + FAQS.map(function (f) {
    return '<details class="faq-item"><summary>' + esc(f[0]) + ico("chevron") + "</summary><p>" + esc(f[1]) + "</p></details>";
  }).join("") + "</div>";
}

function tipHtml(icon, title, text) { return '<div class="tip">' + ico(icon) + "<div><b>" + title + "</b>" + text + "</div></div>"; }

var QUICK = [
  ["Pothole or broken road", "Infrastructure", "There is a pothole / broken stretch of road at ____, near ____. It has been like this for ____ and it is dangerous for ____."],
  ["Garbage not collected", "Sanitation", "Garbage has not been collected at ____ for ____ days. It is causing a bad smell and attracting ____."],
  ["Streetlight not working", "Public Safety", "The streetlight near ____ has not been working for ____. The area is very dark at night and ____."],
  ["Scam or fraud call", "Cyber Security", "I received a call / message pretending to be ____ asking for ____. The number or link was ____."],
  ["Broken signal or crossing", "Road Safety", "The traffic signal / zebra crossing at ____ is not working. People, including ____, are at risk when crossing."],
  ["Water or health problem", "Health", "There is a problem with ____ (water supply / clinic / hygiene) at ____. It has been going on for ____ and affects ____."]
];

var TOPICS = ["General question", "Help with a complaint", "Feedback", "Report a bug"];
