# ClearConsent

Offline-first patient management and digital consent app for **Dr. Praveen's Dental Clinic** (Radha, B4, New Vaddem, Vasco Da Gama, Goa 403802). Runs 100% locally — no server, no network calls — on Android phones, 8"+ Android tablets, or as a local desktop/web app.

This repository is the pre-native web build: plain HTML/CSS/JS with an IndexedDB data layer. It is wrapped into an installable Android APK via [Capacitor](https://capacitorjs.com/) (instructions below). No build tooling (webpack/vite/etc.) is required for the web layer itself — "build" just means syncing `/src` and `/locales` into `/public`.

## Repository layout

```
clearconsent-app/
├── public/            # servable app (Capacitor webDir) — generated + static assets
│   ├── index.html
│   ├── assets/        # fonts (Geist, Charter) + icons — static, committed
│   ├── css/           # generated from /src/css by `npm run build`
│   ├── js/             # generated from /src/js by `npm run build`
│   └── locales/       # generated from /locales by `npm run build`
├── src/
│   ├── js/
│   │   ├── app.js         # router, screen renderers, event wiring
│   │   ├── db.js           # IndexedDB data layer (patients, intakes, signed forms, settings)
│   │   ├── i18n.js         # local multi-language engine (reads locales/translations.json)
│   │   └── forms-data.js   # the 13-item form taxonomy + clinical intake schema
│   └── css/styles.css      # single stylesheet, all component styling behind CSS variables
├── locales/
│   └── translations.json   # source of truth for all UI + legal-clause translations
├── scripts/build.js         # copies /src + /locales into /public
├── docs/
│   └── ARCHITECTURE.md
├── capacitor.config.json
├── package.json
└── README.md
```

## Quick start (web preview)

```bash
npm install
npm start        # builds, then serves public/ at http://localhost:5173
```

### Editing while it's running (VS Code or any editor)

There's no bundler — `npm start` builds `public/` **once** and then just serves
that static folder. If you edit `src/` or `locales/` while the server is
running, nothing changes at `http://localhost:5173` until `public/` is
rebuilt and the browser is refreshed. Two ways to make edits show up live:

1. **Two terminals (simplest):** in a second terminal, run
   ```bash
   npm run watch     # rebuilds public/ automatically on every save in src/ or locales/
   ```
   keep `npm start` running in the first terminal, and manually refresh the
   browser tab after each save.
2. **Auto-refreshing browser too:** install the VS Code "Live Server"
   extension, right-click `public/index.html` → "Open with Live Server"
   (instead of `npm start`), and run `npm run watch` in a terminal alongside
   it — Live Server reloads the browser automatically once `watch` rewrites
   the files under `public/`.

Either way, always edit files under `src/` and `locales/` — never edit
`public/js`, `public/css`, or `public/locales` directly, since those are
overwritten on every build.

## Viewing it on a tablet via GitHub Pages

A GitHub Actions workflow (`.github/workflows/pages.yml`) builds `public/` and deploys it automatically on every push to `main` — no manual build/commit of generated files required.

1. Push this repo to GitHub (see the main README section below, or your own workflow).
2. On GitHub: **Settings → Pages → Build and deployment → Source → GitHub Actions**.
3. Push to `main` (or run the workflow manually from the **Actions** tab → "Deploy to GitHub Pages" → **Run workflow**).
4. Once the run finishes (~30–60s), the Pages URL appears at the top of Settings → Pages — typically `https://<your-username>.github.io/<repo-name>/`.
5. Open that URL in Chrome/Safari on the tablet. For an app-like feel, use the browser's "Add to Home Screen" — it'll launch full-screen without browser chrome.

Note: this is a *hosted preview*, not the offline PRD requirement — the app itself still runs 100% client-side (IndexedDB, no backend), so it works offline once loaded, but the very first load still needs an internet connection to fetch the page from GitHub Pages. The Android APK build (above) is the actual zero-network-ever deployment target.

Open the printed URL. PIN is `1234` by default (changeable in Settings once inside the app).

## Building the Android APK

1. `npm install`
2. `npm run cap:add:android` — creates the native `android/` project (first time only; requires Android Studio / Android SDK installed locally).
3. `npm run cap:sync` — rebuilds `public/` from source and syncs it into the native project. Run this after every change to `src/` or `locales/`.
4. `npm run cap:open:android` — opens the project in Android Studio.
5. In Android Studio: **Build → Generate Signed Bundle / APK**, choose APK, and build a release build.

The app requests no runtime permissions beyond local storage — it never calls out to the network. `capacitor.config.json` sets `webDir: "public"` and disables mixed content.

### Alternative: Cordova

The `public/` directory is a standard static web app and can equally be dropped into a Cordova project's `www/` folder (`cordova platform add android && cordova build android`).

## Data & persistence

All data lives in the browser's IndexedDB (`clearconsent_db`), scoped to the device — see `src/js/db.js`. Four object stores:

- `patients` — demographics (Module 4 fields)
- `intakes` — one clinical case-history record per patient (Module 5)
- `signedForms` — one record per signed consent, including the base64/PNG rasterized signature, the exact clause text shown at signing time (`textSnapshot`), the language signed in, and a snapshot of clinic + patient details at that moment
- `settings` — a single clinic/doctor settings row (also holds the 4-digit PIN)

`DB.exportAll()` / `DB.importAll()` (wired to the "Export local backup" button in Settings) produce/consume a single JSON file for manual backup or migration between devices — still fully local, no cloud involved.

If a later phase moves to a native SQLite plugin instead of IndexedDB, the object-store shapes above map 1:1 to SQLite tables (same field names), so `db.js` is the only file that needs to change.

## Multi-language engine

`locales/translations.json` is the single dictionary. `src/js/i18n.js` loads it once (local `fetch`, no network) and exposes `I18N.t(path)` for UI strings and `I18N.formContent(formId, fallback)` for per-form legal clauses.

- Supported out of the box: English (`en`), Konkani (`kok`), Marathi (`mr`), Hindi (`hi`), Gujarati (`gu`).
- To add a language: add its code + display name to `meta.languages`, then add a matching key to every string object in the file. Anything missing falls back to English automatically — nothing breaks.
- To add full legal-clause translation for a form that doesn't have one yet: add a `forms.<formId>` block (see `dental_examination` / `dental_imaging_radiology` for the shape). Until that exists, the reading screen shows the English clauses from `forms-data.js` with a small "translation pending" badge — the app never leaves a blank screen.
- Switching language on the consent-reading screen does not clear the patient's entered details or the (not-yet-drawn) signature — language state and form state are independent (`state.activePatientId` / `state.strokes` in `app.js` are untouched by `I18N.setLang`).
- The language actually used at signing time is stored on the signed record (`languageLabel`) and shown in the Signed Forms Registry.

## The 13-item form taxonomy

Defined once in `src/js/forms-data.js` (`CONSENT_FORMS`), in this exact order:

1. Patient Case History (clinical intake, not a signable consent form)
2. Dental Examination
3. Dental Imaging / Radiology
4. Restorations / Fillings
5. Root Canal Treatment
6. Orthodontics / Braces
7. Teeth Whitening
8. Child Dentistry
9. Local Anaesthesia
10. Extractions / Minor Surgeries
11. Crown n Bridge Replacement
12. Removable Replacements
13. Dental Implants

A **Financial Acknowledgement** clause (itemized treatment plan / estimate-only fee disclosure) is appended automatically to every form at render time and baked into the saved signature snapshot — see `withFinancialClause()` in `app.js`. It only needs to be edited in one place (`locales/translations.json` → `ui.financialClause`) to change it everywhere.

## Design system / visual spec

Colors, type scale, and fonts (Geist for UI, Charter for legal/medical body copy — both bundled under `public/assets/fonts`, no external font requests) are centralized in `src/css/styles.css` under a single `:root` block, carried over from the approved prototype (`ClearConsent/clearconsent-prototype.html` in the design folder). If a dedicated Design MD file is provided later, only that `:root` block (and, if needed, the individual component rules directly below it) needs to change — no markup or JS is coupled to specific color values.

## Responsive behaviour

- ≥820px (8"+ tablets, desktop): side navigation, master-detail split view for the Patients directory, 3–4 column form grid.
- <820px (phones): bottom tab navigation, single-pane sequential screens, 2-column form grid.
- All interactive elements respect a 48px (`--touch-min`) minimum touch target.

## Known gaps / next steps for contributors

- Only `dental_examination` and `dental_imaging_radiology` currently have full 5-language legal-clause translations in `locales/translations.json`; the remaining 10 forms render in English with a "translation pending" badge until translated content is added.
- No native SQLite bridge yet — see "Data & persistence" above for the migration path.
- Print/Export-PDF buttons currently call `window.print()`; a dedicated PDF export (e.g. via a bundled PDF library) is a good next contribution.
- No automated test suite yet; `scripts/` is a reasonable place to add one (e.g. Playwright against `public/`).
