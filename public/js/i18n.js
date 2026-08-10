/**
 * i18n.js — Local, extensible multi-language engine.
 * Reads locales/translations.json (bundled with the app, no network calls).
 * -----------------------------------------------------------------------
 */
const I18N = (() => {
  let dict = null;
  let currentLang = "en";

  async function load() {
    if (dict) return dict;
    const res = await fetch("locales/translations.json");
    dict = await res.json();
    return dict;
  }

  function languages() {
    return dict ? dict.meta.languages : { en: "English" };
  }

  function setLang(code) {
    if (dict && dict.meta.languages[code]) currentLang = code;
  }

  function getLang() { return currentLang; }

  // t("ui.clear") or t("medicalHistoryOptions.diabetes")
  // Optional 3rd arg `lang` overrides the app-wide currentLang for this one
  // lookup, without changing it globally — used by the consent screen's
  // in-form language picker so switching a form's language never bleeds
  // into the surrounding app chrome (nav, buttons, other screens).
  function t(path, fallback, lang) {
    if (!dict) return fallback || path;
    const useLang = lang || currentLang;
    const parts = path.split(".");
    let node = dict;
    for (const p of parts) {
      node = node && node[p];
      if (node === undefined) return fallback || path;
    }
    if (typeof node === "object" && node[useLang] !== undefined) {
      return node[useLang];
    }
    if (typeof node === "object" && node.en !== undefined) return node.en;
    return fallback || path;
  }

  // Returns the localized form-content block, falling back to the
  // English `fallback` object bundled in forms-data.js when the active
  // language has no translated clauses for this form yet. `lang` overrides
  // the app-wide currentLang the same way t()'s does — see note above.
  //
  // Schema (data-driven, mirrors forms-data.js's fallback shape 1:1 so any
  // form — with whatever section headings it actually has — can be fully
  // translated, not just ones that fit a fixed important/risks/safety set):
  //   forms.<id> = {
  //     title: { en, hi, ... }, purpose: { en, hi, ... },
  //     sections: [ { heading: {en,hi,...}, body: {en,hi,...} }, ... ],
  //     acknowledgment: { en, hi, ... }
  //   }
  // `sections` must line up positionally with fallbackObj.sections (same
  // headings, same order) — only the text per language differs.
  function formContent(formId, fallbackObj, lang) {
    const node = dict && dict.forms && dict.forms[formId];
    const useLang = lang || currentLang;
    const pick = (field) => field && (field[useLang] || field.en);

    if (!node || !node.title || !node.purpose) return { content: fallbackObj, translated: false };

    const sections = (fallbackObj.sections || []).map((fallbackSection, i) => {
      const s = node.sections && node.sections[i];
      return {
        heading: (s && pick(s.heading)) || fallbackSection.heading,
        body: (s && pick(s.body)) || fallbackSection.body
      };
    });

    return {
      translated: true,
      content: {
        title: pick(node.title) || fallbackObj.title,
        purpose: pick(node.purpose) || fallbackObj.purpose,
        sections,
        acknowledgment: pick(node.acknowledgment) || fallbackObj.acknowledgment
      }
    };
  }

  return { load, languages, setLang, getLang, t, formContent };
})();
