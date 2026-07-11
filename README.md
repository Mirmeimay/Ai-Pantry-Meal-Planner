# XAI Pantry & Meal Planner — Capstone Build

An explainable-AI pantry tracker and meal planner. Every AI meal suggestion
comes with a plain-language reason: which pantry items it uses, which of
those are about to expire, and what's still missing.

## Running it

No build step, no server, no dependencies. Just open `index.html` in a
browser, or serve the folder with any static file server, e.g.:

```
npx serve .
# or
python3 -m http.server 8080
```

Then visit the printed local URL. On the login page, click **"Try the demo
account"** to explore with pre-loaded sample data (14 pantry items across
several expiry states, a recipe catalog, notifications, and shopping list
items) — or register a fresh account, which starts empty.

## What this is (and isn't)

This is a complete, fully-wired **front-end demo application** — every page
is real and functional, all CRUD actions work, and the "AI" recommendation
engine is a genuine rule-based explainable system (not a mock). Because it
runs entirely client-side with `localStorage` standing in for a database,
it's ideal for a capstone demo: no hosting, no API keys, no setup, and your
data never leaves the browser.

It intentionally does **not** include a real backend server, a production
database (Postgres/MySQL/etc.), server-side authentication, or
infrastructure-grade security (rate limiting, CSRF tokens, TLS termination,
etc.) — those require a server runtime this environment can't deploy for
you. If your capstone rubric requires a real backend, the data layer in
`assets/js/app.js` (the `APP.Auth`, `APP.Ingredients`, `APP.Shopping`,
`APP.Notifications` modules) is written as a clean API you can swap for real
`fetch()` calls to a Node/Express + PostgreSQL (or similar) backend without
touching any page logic — every page only talks to `APP.*`, never to
`localStorage` directly. Happy to build that backend as a follow-up if you
want it.

## Architecture

```
xai-pantry/
├── index.html                  Landing / marketing page
├── login.html / register.html  Auth
├── dashboard.html               Stats, top AI pick, expiry tracker, notifications
├── pantry.html                  Inventory CRUD, search/filter/sort, expiry tabs
├── meal-recommendation.html     AI engine results + filters
├── recipe-details.html          Full recipe, explainability panel, steps, nutrition
├── shopping-list.html           Auto-generated + manual shopping list
├── notifications.html           Notification center
├── profile.html                 Account, password, preferences, danger zone
├── 404.html                     Error page
└── assets/
    ├── css/style.css            Design tokens + component library (light/dark)
    ├── css/pages.css            Page-specific layouts
    └── js/
        ├── app.js               Data layer (localStorage "DB"), auth, UI utils
        ├── recommend.js         Recipe catalog + explainable scoring engine
        └── pages/*.js            One controller per page
```

### The explainability engine (`recommend.js`)

For every recipe, the engine computes:
- **Match ratio** — how many required ingredients are already in the pantry
- **Expiry bonus** — extra weight for recipes that use ingredients expiring soon
- **Missing penalty** — down-ranks recipes needing many extra ingredients
- **Hard filters** — allergies, dietary restrictions, meal type, cuisine, and
  max cook time exclude a recipe outright rather than just down-ranking it

Every one of those factors is turned back into a human-readable sentence
(`buildExplanation()`), so the "why" shown on screen is always a direct,
traceable readout of the score — never a canned string.

### Data model (see `seedDB()` in `app.js`)

`users`, `ingredients`, `shopping`, `notifications`, `mealLog`, all scoped by
`userId`, mirroring how a real relational schema (users 1—N ingredients,
users 1—N shopping items, etc.) would be modeled if migrated to a real DB.

## Design system

Palette is a pantry-shelf theme (basil green, turmeric gold, paprika clay)
rather than a generic dashboard blue, with `Fraunces` for display type and
`Manrope` for UI/body text. Full light/dark theme with persisted preference,
responsive down to mobile (collapsing sidebar), toasts, confirm dialogs,
loading skeletons, and empty states throughout.
