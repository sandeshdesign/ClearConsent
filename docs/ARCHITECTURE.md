# ClearConsent — Architecture Notes

## Why no frontend framework / bundler

The app is a single admin/kiosk-style tablet app running fully offline on
low-spec Android hardware in a clinic. Vanilla HTML/CSS/JS keeps the
dependency surface (and therefore the audit surface, given this handles
patient health data) minimal, keeps cold-start time low, and avoids a
build toolchain that could break years from now when a contributor picks
this back up. `scripts/build.js` is intentionally ~30 lines.

## Module map (matches the PRD's 8 functional modules)

| PRD Module | Source |
|---|---|
| 1. Security & PIN Authentication | `#screen-pin` in `public/index.html`, `handlePinKey()` / PIN check in `app.js` |
| 2. Navigation Bar & Clinic Header | `.clinic-header` in `index.html`, `applyClinicHeaderFromSettings()` |
| 3. Home / Consent Forms Library | `renderHome()`, `CONSENT_FORMS` in `forms-data.js` |
| 4. Patient Management | `renderSelectPatient()`, `renderPatients()`, `renderPatientDetail()`, `DB.*Patient*` in `db.js` |
| 5. Clinical Intake | `renderIntake()`, `INTAKE_SCHEMA` in `forms-data.js`, `DB.saveIntake` |
| 6. In-Form Consent & Canvas Signature | `renderConsentRead()`, `renderConsentSign()`, `initSignaturePad()` |
| 7. Signed Forms Registry | `renderSigned()`, `renderViewSigned()`, `DB.getAllSignedForms` |
| 8. Clinic & Doctor Settings | `renderSettings()`, `DB.getSettings` / `DB.saveSettings` |

## Data flow for "sign a consent form"

1. `renderHome()` → user taps a form card → `navigate("select-patient", {formId})`.
2. `renderSelectPatient()` → user picks/creates a patient → `navigate("consent-read", {formId, patientId})`.
3. `renderConsentRead()` calls `I18N.formContent(formId, form.fallback)` to get localized (or English-fallback) clause text, then `withFinancialClause()` appends the universal financial clause. Patient details are read from `DB.getPatient` and rendered read-only at the bottom of the form.
4. User may switch language via the pill row at any time — this only re-runs `renderConsentBody()`; it never touches `state.activePatientId` or any drawn strokes, satisfying the PRD's "must not erase entered fields or clear the canvas" rule (the signature screen is a separate route entered only after "Read & Understood", so in practice the canvas doesn't exist yet at this point — but the same non-destructive re-render pattern is used everywhere language can change).
5. "Read & Understood" → `navigate("consent-sign", ...)` → `initSignaturePad()` wires mouse + touch listeners onto a `<canvas>`, recording stroke point arrays in `state.strokes` (not just raw canvas pixels) so `Undo` can pop the last stroke and redraw.
6. "I provide consent" → `submitConsent()` rasterizes the canvas via `canvas.toDataURL("image/png")` (Base64 PNG, per PRD §3.2), snapshots the exact clause text + patient + clinic details, and writes one record to the `signedForms` IndexedDB store via `DB.saveSignedForm`.
7. Success modal → back to Home. The new record immediately shows up under "Today" in the Signed Forms Registry (`renderSigned()` groups by day using `signedAt`).

## Extensibility hooks

- **New consent form:** add one object to `CONSENT_FORMS` in `forms-data.js`. It appears in the Home grid automatically.
- **New language:** add to `locales/translations.json` (`meta.languages` + matching keys). No JS changes.
- **New per-form translated legal text:** add a `forms.<id>` block to `locales/translations.json`.
- **Swap storage engine** (e.g. native SQLite via a Capacitor plugin): reimplement the `DB` object in `db.js` with the same method signatures; nothing else in the app touches IndexedDB directly.
- **Visual redesign:** edit the `:root` custom properties (and, if needed, component rules) in `src/css/styles.css`. No component markup encodes a raw color/font value outside that file.
