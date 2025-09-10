import fs from 'fs/promises';
import path from 'path';
//import translate from '@vitalets/google-translate-api';
import mod from "@vitalets/google-translate-api";
// quick smoke test
await translate("Hello", { to: "hi" }).then(
  r => console.log("Translator OK"),
  e => { console.warn("Translator test failed:", e?.message); }
);

// Normalize the export to a callable function in both CJS/ESM builds
const translate =
  typeof mod === "function"
    ? mod
    : (mod && typeof mod.default === "function" ? mod.default : null);

if (!translate) {
  console.error(
    "Failed to load translate function from @vitalets/google-translate-api. " +
      "Check the package version or switch to the alternative adapter."
  );
  process.exit(1);
}

const rootDir = path.dirname(new URL(import.meta.url).pathname);
const projectDir = path.resolve(rootDir, '..');
const i18nDir = path.join(projectDir, 'i18n');

const manifest = JSON.parse(await fs.readFile(path.join(projectDir, 'manifest.json'), 'utf-8'));
const sourcePath = path.join(i18nDir, (manifest.source || 'hi') + '.json');

const src = JSON.parse(await fs.readFile(sourcePath, 'utf-8'));

function flatten(obj, prefix = '', out = {}, sep = '.') {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}${sep}${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      flatten(v, key, out, sep);
    } else {
      out[key] = String(v);
    }
  }
  return out;
}
function unflatten(map, sep = '.') {
  const result = {};
  for (const [flatKey, value] of Object.entries(map)) {
    const parts = flatKey.split(sep);
    let curr = result;
    while (parts.length > 1) {
      const p = parts.shift();
      if (!curr[p]) curr[p] = {};
      curr = curr[p];
    }
    curr[parts[0]] = value;
  }
  return result;
}
const flat = flatten(src);
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

for (const { code, name } of manifest.targets) {
  console.log(`\n▶ Translating to ${name} (${code})`);
  const out = {};
  let i = 0;
  for (const [k, v] of Object.entries(flat)) {
    try {
      const res = await translate(v, { from: 'hi', to: code });
      out[k] = res.text;
    } catch (e) {
      console.warn(`  • Failed "${k}":`, e?.message ?? e);
      out[k] = v;
    }
    i++;
    if (i % 20 === 0) await sleep(250);
  }
  const nested = unflatten(out);
  const outPath = path.join(i18nDir, code + '.json');
  await fs.writeFile(outPath, JSON.stringify(nested, null, 2), 'utf-8');
  console.log(`✔ Wrote ${outPath}`);
}
console.log("\nDone.");
