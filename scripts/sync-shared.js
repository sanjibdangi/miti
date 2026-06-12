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
console.log(copied ? `✅ Synced ${copied} file(s) from shared/` : '✅ All variants already in sync');
