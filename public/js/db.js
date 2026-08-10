/**
 * db.js — Offline-first local data layer (IndexedDB).
 * -----------------------------------------------------------------------
 * No network calls anywhere in this file. All patient records, clinical
 * intakes, signed consent records, and clinic settings persist entirely
 * on-device. This is the "SQLite or IndexedDB" requirement from the PRD
 * (section 3.2) — IndexedDB is used here for the web/PWA/Android WebView
 * build; the schema below maps 1:1 to SQLite tables if a native/Capacitor
 * build later swaps the storage engine (see README in project root).
 * -----------------------------------------------------------------------
 */

const DB_NAME = "clearconsent_db";
const DB_VERSION = 1;

const STORES = {
  patients: "patients",       // { id, firstName, surname, contact, gender, dob, addr1, addr2, city, state, zipcode, createdAt }
  intakes: "intakes",         // { id, patientId, ...INTAKE_SCHEMA fields, createdAt }
  signedForms: "signedForms", // { id, patientId, formId, formName, language, signedAt, signatureImage(base64), clinicSnapshot, textSnapshot }
  settings: "settings"        // singleton row, id: 'clinic'
};

let _dbPromise = null;

function openDB() {
  if (_dbPromise) return _dbPromise;
  _dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (e) => {
      const db = e.target.result;

      if (!db.objectStoreNames.contains(STORES.patients)) {
        const s = db.createObjectStore(STORES.patients, { keyPath: "id" });
        s.createIndex("byName", "searchName", { unique: false });
        s.createIndex("byContact", "contact", { unique: false });
        s.createIndex("byLetter", "firstLetter", { unique: false });
      }
      if (!db.objectStoreNames.contains(STORES.intakes)) {
        const s = db.createObjectStore(STORES.intakes, { keyPath: "id" });
        s.createIndex("byPatient", "patientId", { unique: false });
      }
      if (!db.objectStoreNames.contains(STORES.signedForms)) {
        const s = db.createObjectStore(STORES.signedForms, { keyPath: "id" });
        s.createIndex("byPatient", "patientId", { unique: false });
        s.createIndex("bySignedAt", "signedAt", { unique: false });
      }
      if (!db.objectStoreNames.contains(STORES.settings)) {
        db.createObjectStore(STORES.settings, { keyPath: "id" });
      }
    };

    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = (e) => reject(e.target.error);
  });
  return _dbPromise;
}

function tx(storeName, mode = "readonly") {
  return openDB().then(db => db.transaction(storeName, mode).objectStore(storeName));
}

function uid() {
  return "id_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 9);
}

const DB = {
  uid,

  // ---------- Patients ----------
  async addPatient(patient) {
    const store = await tx(STORES.patients, "readwrite");
    const id = patient.id || uid();
    const record = {
      ...patient,
      id,
      searchName: `${patient.firstName || ""} ${patient.surname || ""}`.toLowerCase().trim(),
      firstLetter: (patient.firstName || "?").charAt(0).toUpperCase(),
      createdAt: patient.createdAt || Date.now()
    };
    return new Promise((resolve, reject) => {
      const req = store.put(record);
      req.onsuccess = () => resolve(record);
      req.onerror = (e) => reject(e.target.error);
    });
  },

  async updatePatient(patient) {
    return this.addPatient(patient); // put() upserts
  },

  async getPatient(id) {
    const store = await tx(STORES.patients);
    return new Promise((resolve, reject) => {
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = (e) => reject(e.target.error);
    });
  },

  async getAllPatients() {
    const store = await tx(STORES.patients);
    return new Promise((resolve, reject) => {
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = (e) => reject(e.target.error);
    });
  },

  async searchPatients(query) {
    const all = await this.getAllPatients();
    const q = (query || "").toLowerCase().trim();
    if (!q) return all;
    return all.filter(p =>
      p.searchName.includes(q) || (p.contact || "").includes(q)
    );
  },

  // Permanently removes a patient record along with everything tied to
  // them (clinical intake + all signed consent forms) — a patient delete
  // is a full cascade, not just hiding the directory entry, since a signed
  // form with no patient record left would be orphaned data.
  async deletePatient(patientId) {
    const pStore = await tx(STORES.patients, "readwrite");
    await new Promise((resolve, reject) => {
      const req = pStore.delete(patientId);
      req.onsuccess = () => resolve();
      req.onerror = (e) => reject(e.target.error);
    });

    const iStore = await tx(STORES.intakes, "readwrite");
    const intakeIds = await new Promise((resolve, reject) => {
      const req = iStore.index("byPatient").getAllKeys(patientId);
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = (e) => reject(e.target.error);
    });
    for (const id of intakeIds) {
      await new Promise((resolve, reject) => {
        const req = iStore.delete(id);
        req.onsuccess = () => resolve();
        req.onerror = (e) => reject(e.target.error);
      });
    }

    const sStore = await tx(STORES.signedForms, "readwrite");
    const signedIds = await new Promise((resolve, reject) => {
      const req = sStore.index("byPatient").getAllKeys(patientId);
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = (e) => reject(e.target.error);
    });
    for (const id of signedIds) {
      await new Promise((resolve, reject) => {
        const req = sStore.delete(id);
        req.onsuccess = () => resolve();
        req.onerror = (e) => reject(e.target.error);
      });
    }
  },

  // ---------- Clinical Intake ----------
  async saveIntake(intake) {
    const store = await tx(STORES.intakes, "readwrite");
    const id = intake.id || uid();
    const record = { ...intake, id, updatedAt: Date.now() };
    return new Promise((resolve, reject) => {
      const req = store.put(record);
      req.onsuccess = () => resolve(record);
      req.onerror = (e) => reject(e.target.error);
    });
  },

  async getIntakeByPatient(patientId) {
    const store = await tx(STORES.intakes);
    const idx = store.index("byPatient");
    return new Promise((resolve, reject) => {
      const req = idx.getAll(patientId);
      req.onsuccess = () => resolve((req.result || [])[0] || null);
      req.onerror = (e) => reject(e.target.error);
    });
  },

  // ---------- Signed Forms ----------
  async saveSignedForm(record) {
    const store = await tx(STORES.signedForms, "readwrite");
    const id = record.id || uid();
    const full = { ...record, id, signedAt: record.signedAt || Date.now() };
    return new Promise((resolve, reject) => {
      const req = store.put(full);
      req.onsuccess = () => resolve(full);
      req.onerror = (e) => reject(e.target.error);
    });
  },

  async getSignedFormsByPatient(patientId) {
    const store = await tx(STORES.signedForms);
    const idx = store.index("byPatient");
    return new Promise((resolve, reject) => {
      const req = idx.getAll(patientId);
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = (e) => reject(e.target.error);
    });
  },

  async getAllSignedForms() {
    const store = await tx(STORES.signedForms);
    return new Promise((resolve, reject) => {
      const req = store.getAll();
      req.onsuccess = () => resolve((req.result || []).sort((a, b) => b.signedAt - a.signedAt));
      req.onerror = (e) => reject(e.target.error);
    });
  },

  async getSignedForm(id) {
    const store = await tx(STORES.signedForms);
    return new Promise((resolve, reject) => {
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = (e) => reject(e.target.error);
    });
  },

  // ---------- Settings ----------
  async getSettings() {
    const store = await tx(STORES.settings);
    return new Promise((resolve, reject) => {
      const req = store.get("clinic");
      req.onsuccess = () => resolve(req.result || DB.defaultSettings());
      req.onerror = (e) => reject(e.target.error);
    });
  },

  async saveSettings(settings) {
    const store = await tx(STORES.settings, "readwrite");
    const record = { ...settings, id: "clinic" };
    return new Promise((resolve, reject) => {
      const req = store.put(record);
      req.onsuccess = () => resolve(record);
      req.onerror = (e) => reject(e.target.error);
    });
  },

  // First-run state: no clinic/doctor identity and no PIN pre-filled.
  // The doctor fills these in themselves in Clinic & Doctor Settings, and
  // the app stays unlocked (no PIN screen) until a PIN is explicitly set —
  // see boot()/lockApp() in app.js.
  defaultSettings() {
    return {
      id: "clinic",
      clinicName: "",
      doctorName: "",
      contactNumber: "",
      addressLine1: "",
      city: "",
      state: "",
      zipcode: "",
      pin: null,
      logoDataUrl: null
    };
  },

  // ---------- Export / Import (local JSON backup, per PRD §6.1) ----------
  async exportAll() {
    const [patients, signedForms, settings] = await Promise.all([
      this.getAllPatients(),
      this.getAllSignedForms(),
      this.getSettings()
    ]);
    const intakeStore = await tx(STORES.intakes);
    const intakes = await new Promise((resolve, reject) => {
      const req = intakeStore.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = (e) => reject(e.target.error);
    });
    return {
      exportedAt: new Date().toISOString(),
      version: DB_VERSION,
      patients, intakes, signedForms, settings
    };
  },

  async importAll(payload) {
    if (!payload) return;
    for (const p of payload.patients || []) await this.addPatient(p);
    for (const i of payload.intakes || []) await this.saveIntake(i);
    for (const f of payload.signedForms || []) await this.saveSignedForm(f);
    if (payload.settings) await this.saveSettings(payload.settings);
  }
};
