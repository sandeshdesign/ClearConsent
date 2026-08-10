#!/usr/bin/env node
/**
 * scripts/watch.js
 * -----------------------------------------------------------------------
 * Dev-only helper: re-runs the build (sync /src + /locales -> /public)
 * automatically whenever a source file changes, so `public/` stays in
 * sync while you edit in an editor like VS Code. Pair with `npm start`
 * (or a Live Server pointed at public/index.html) in a second terminal
 * so the browser picks up the rebuilt files.
 *
 * Usage: npm run dev   (runs this alongside `npm start` — see README)
 * -----------------------------------------------------------------------
 */
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const WATCH_DIRS = [
  path.join(ROOT, "src"),
  path.join(ROOT, "locales")
];

function build() {
  try {
    execFileSync(process.execPath, [path.join(__dirname, "build.js")], { stdio: "inherit" });
  } catch (e) {
    console.error("Build failed:", e.message);
  }
}

let pending = false;
function scheduleBuild(reason) {
  if (pending) return;
  pending = true;
  setTimeout(() => {
    pending = false;
    console.log(`\n[watch] change detected (${reason}) — rebuilding...`);
    build();
  }, 150); // small debounce so a save-triggered burst of fs events only rebuilds once
}

function walkDirs(dir, out) {
  out.push(dir);
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) walkDirs(path.join(dir, entry.name), out);
  }
  return out;
}

function watchDir(dir) {
  fs.watch(dir, (eventType, filename) => scheduleBuild(filename || dir));
}

console.log("[watch] watching src/ and locales/ for changes. Ctrl+C to stop.");
build(); // initial build so public/ is up to date before you start editing

for (const dir of WATCH_DIRS) {
  // `recursive: true` isn't supported by fs.watch on Linux, so watch every
  // subdirectory individually instead — works the same on macOS/Windows/Linux.
  try {
    fs.watch(dir, { recursive: true }, (eventType, filename) => scheduleBuild(filename || dir));
  } catch (e) {
    walkDirs(dir, []).forEach(watchDir);
  }
}
