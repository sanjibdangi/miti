// Copies the canonical core files from shared/ into each app variant.
// shared/ is the single source of truth — edit there, never in src/app/pwa.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const FILES = ['bs-data.js', 'date-converter.js', 'holidays.js'];
const TARGETS = ['src/js', 'app/js', 'pwa/js'];

let copied = 0;
for (const file of FILES) {
  const srcPath = path.join(ROOT, 'shared', file);
  const content = fs.readFileSync(srcPath);
  for (const target of TARGETS) {
    const destPath = path.join(ROOT, target, file);
    if (!fs.existsSync(destPath) || !content.equals(fs.readFileSync(destPath))) {
      fs.writeFileSync(destPath, content);
      console.log(`updated ${target}/${file}`);
      copied++;
    }
  }
}
// Regenerate the live holiday JSON served at miti-five.vercel.app/data/holidays.json
// from the same shared source, so the remote data can never drift from the bundled data.
const { HOLIDAYS, OBSERVANCES } = require(path.join(ROOT, 'shared', 'holidays.js'));
const json = JSON.stringify(
  {
    _comment: 'Generated from shared/holidays.js by scripts/sync-shared.js — do not edit by hand. Deploy to update all devices.',
    _observances: OBSERVANCES,
    ...HOLIDAYS,
  },
  null,
  2
);
const jsonPath = path.join(ROOT, 'app', 'data', 'holidays.json');
if (!fs.existsSync(jsonPath) || fs.readFileSync(jsonPath, 'utf8') !== json) {
  fs.writeFileSync(jsonPath, json);
  console.log('updated app/data/holidays.json');
  copied++;
}

console.log(copied ? `✅ Synced ${copied} file(s) from shared/` : '✅ All variants already in sync');
