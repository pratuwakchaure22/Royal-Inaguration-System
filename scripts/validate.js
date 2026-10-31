#!/usr/bin/env node
/**
 * Lightweight project check (no dependencies):
 *  1. every JS file parses
 *  2. every local file referenced from the HTML pages exists
 *  3. every poster listed in gallery.js exists on disk
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const SRC = path.join(__dirname, "..", "src");
let errors = 0;
const fail = (msg) => { console.error("✖ " + msg); errors++; };
const ok = (msg) => console.log("✔ " + msg);

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]);
}

// 1. JS syntax
const jsFiles = walk(SRC).filter((f) => f.endsWith(".js"));
jsFiles.forEach((f) => {
  try { new vm.Script(fs.readFileSync(f, "utf8"), { filename: f }); }
  catch (e) { fail(`Syntax error in ${path.relative(SRC, f)}: ${e.message}`); }
});
ok(`${jsFiles.length} JavaScript files checked`);

// 2. HTML references
const htmlFiles = walk(SRC).filter((f) => f.endsWith(".html"));
htmlFiles.forEach((f) => {
  const html = fs.readFileSync(f, "utf8");
  const refs = [...html.matchAll(/(?:src|href)="([^"#]+)"/g)].map((m) => m[1])
    .filter((r) => !/^(https?:|mailto:|data:)/.test(r));
  refs.forEach((r) => {
    if (!fs.existsSync(path.join(path.dirname(f), decodeURI(r)))) {
      fail(`${path.basename(f)} references missing file: ${r}`);
    }
  });
});
ok(`${htmlFiles.length} HTML pages checked`);

// 3. Gallery images
const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(SRC, "assets/js/gallery.js"), "utf8"), sandbox);
const gallery = sandbox.window.GALLERY_IMAGES || [];
gallery.forEach((g) => {
  if (!fs.existsSync(path.join(SRC, g.src))) fail(`Gallery image missing: ${g.src}`);
});
ok(`${gallery.length} gallery posters checked`);

if (errors) { console.error(`\n${errors} problem(s) found.`); process.exit(1); }
console.log("\nAll checks passed 🎉");
