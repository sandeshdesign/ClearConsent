#!/usr/bin/env node
/**
 * scripts/build.js
 * -----------------------------------------------------------------------
 * ClearConsent has no bundler by design (offline-first, minimal
 * dependency surface, easy to audit). "Build" just means: sync the
 * editable sources in /src and /locales into /public, which is the
 * actual servable directory (and the Capacitor/Cordova `webDir`).
 *
 * Usage: npm run build
 * -----------------------------------------------------------------------
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const copies = [
  { from: path.join(ROOT, "src", "js"), to: path.join(ROOT, "public", "js") },
  { from: path.join(ROOT, "src", "css"), to: path.join(ROOT, "public", "css") },
  { from: path.join(ROOT, "locales"), to: path.join(ROOT, "public", "locales") }
];

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

for (const { from, to } of copies) {
  copyDir(from, to);
  console.log(`copied ${path.relative(ROOT, from)} -> ${path.relative(ROOT, to)}`);
}

console.log("\nBuild complete. Serve/package the `public/` directory.");
console.log("  npm start            # serve public/ locally at http://localhost:5173");
console.log("  npx cap sync android # sync into the Capacitor Android project, if configured");
