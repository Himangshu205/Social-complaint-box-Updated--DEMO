# Social Complaint Box (front-end demo)

A website where people report local problems, get a tracking ID, and follow the complaint until it is resolved. Admins manage everything from a dashboard.

**Live demo:** https://himangshu205.github.io/social-complaint-box-demo/

This is a front-end demo. It runs entirely in the browser with sample data, so nothing is saved and it resets when you reload. Admin demo login: `admin@example.com` / `demo123`.

## What you can try

**Visitors**
- File a complaint: category, urgency, location pin, up to 3 photos, anonymous mode, quick-start examples
- Get a tracking ID, then track status and history; confirm or reopen a resolved complaint; share the link
- Browse awareness guides: search, filter, sort, save with a heart, grid or list view, previous and next in the popup
- Category shortcuts, quick actions, FAQ, contact form with topics
- Customize panel: light or dark theme, accent colour, background style, font, corner style, animations

**Admin**
- Dashboard with totals, status, urgency and category charts
- Search, filter, sort and quick-filter complaints; bulk status change; export as CSV
- Change status and urgency, write a public reply and a private note
- Add, edit and delete awareness guides; read messages; change password

## How the code is organised

```
index.html            the single page; loads everything below
css/
  base.css            reset, typography, layout, buttons, forms, header, cards
  modern.css          polish: header, buttons, hero, cards, logo, skeleton loaders, 404
  features.css        urgency badges, bulk actions, location button, print styles
  theme.css           design system: accent colours, fonts, corners, backgrounds, Customize panel
  components.css      newer parts: quick actions, FAQ, feature cards, call-to-action, save hearts
  demo.css            the demo banner
js/
  utils.js            small helpers and shared lists (categories, statuses, urgency levels)
  appearance.js       theme / accent / font / corner / animation settings
  icons.js            line icons and the category tiles
  content.js          FAQ text, example complaints, contact topics
  effects.js          scroll fade-in, loading placeholders, animated counters
  state.js            sample data and page state (kept in memory)
  components.js       toast messages, guide popup, badges, guide cards and filtering
  pages-public.js     Home, Awareness, File a complaint, Track, About, Contact, 404
  pages-admin.js      login, dashboard, complaints, guides, messages, settings
  router.js           page routing (#/awareness, #/track/ID, ...) and page titles
  panel.js            Customize panel, back-to-top, scroll progress bar, button ripple
  events.js           click, typing and submit handlers
  main.js             starts the app
assets/
  favicon.svg         site icon
```

## How it works

- Plain HTML, CSS and JavaScript. There are no frameworks, no Tailwind and no build step, so it runs by simply opening `index.html`.
- Pages are drawn by JavaScript functions that return HTML; the address after `#` (for example `#/track/SCB-K7M2QX`) decides which page shows, so refreshing a page works on GitHub Pages.
- Appearance options are stored as `data-` attributes on the page and styled with CSS variables, so changing the accent colour or font updates everything at once.
- Sample data lives in `js/state.js`. Anything a visitor or admin does is kept in memory only.

## Run it on your computer

Double-click `index.html`. That's it.

## Put it online (GitHub Pages)

1. Create a public repository, for example `social-complaint-box-demo`.
2. Upload everything in this folder (keep the `css`, `js` and `assets` folders).
3. In **Settings > Pages**, choose **Deploy from a branch**, then **main** and **/(root)**.

A full-stack version of this project (MongoDB, Express, React, Node.js) with a real database and login is a separate codebase.

Created by Himangshu Sikder.
