#!/usr/bin/env node
import fs from "fs";
import path from "path";
import fg from "fast-glob";
import pLimit from "p-limit";
import { fileURLToPath } from "url";
import translate from "@vitalets/google-translate-api"; // fallback alt in comments below
// import { translateText } from "./deepl-or-gcloud-adapter.mjs"; // if you prefer an API

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---- CONFIG ----
const INPUT_FILE = process.argv[2] || path.resolve("../../i18n/locales/hi.json");
const OUT_DIR = process.argv[3] || path.resolve("../../i18n/locales/gen");
const CONCURRENCY = 4;

// 20 widely used languages in India (BCP-47 / ISO codes)
const TARGETS = [
  ["bn", "Bengali"],
  ["mr", "Marathi"],
  ["te", "Telugu"],
  ["ta", "Tamil"],
  ["gu", "Gujarati"],
  ["ur", "Urdu"],
  ["kn", "Kannada"],
  ["or", "Odia"],
  ["ml", "Malayalam"],
  ["pa", "Punjabi"],
  ["as", "Assamese"],
  ["mai", "Maithili"],
  ["bho", "Bhojpuri"],
  ["sat", "Santali"],
  ["ks", "Kashmiri"],
  ["ne", "Nepali"],
  ["sd", "Sindhi"],
  ["brx", "Bodo"],
  ["mni", "Meitei"],
  ["en", "English"], // convenience file
];

// Placeholders/patterns you don’t want translated
const PLACEHOLDER_RE = /\{[^}]+\}|\%\w|%\d+\$s|%\d+|{{\s*[^}]+\s*}}/g;

// ---- UTILITIES ----
function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf-8"));
}
function writeJson(file, obj) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(obj, null, 2), "utf-8");
}

function maskPlaceholders(text) {
  const map = [];
  let i = 0;
  const masked = text.replace(PLACEHOLDER_RE, (m) => {
    const token = `__PH_${i++}__`;
    map.push([token, m]);
    return token;
  });
  return { masked, map };
}
function unmaskPlaceholders(text, map) {
  let out = text;
  for (const [token, original] of map) {
    out = out.replaceAll(token, original);
  }
  return out;
}

async function translateString(s, to) {
  if (!s || typeof s !== "string") return s;

  // Don’t translate short tokens, pure numbers, or obvious keys
  if (/^\s*$/.test(s) || /^[\d\s.,:%]+$/.test(s)) return s;

  const { masked, map } = maskPlaceholders(s);
  try {
    const res = await translate(masked, { to, client: "dict" });
    return unmaskPlaceholders(res.text, map);
  } catch (e) {
    // Fallback: return original on failure
    return s;
  }
  // If you want to use DeepL or Google Cloud:
  // const res = await translateText(masked, to);
  // return unmaskPlaceholders(res, map);
}

async function translateDeep(obj, to, limit) {
  if (Array.isArray(obj)) {
    return await Promise.all(obj.map((v) => translateDeep(v, to, limit)));
  } else if (obj && typeof obj === "object") {
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
      out[k] = await translateDeep(v, to, limit);
    }
    return out;
  } else if (typeof obj === "string") {
    return await limit(() => translateString(obj, to));
  } else {
    return obj;
  }
}

// ---- MAIN ----
(async () => {
  if (!fs.existsSync(INPUT_FILE)) {
    console.error(`Input not found: ${INPUT_FILE}`);
    process.exit(1);
  }
  const base = readJson(INPUT_FILE);
  const limit = pLimit(CONCURRENCY);

  const outputs = [];
  for (const [code, name] of TARGETS) {
    console.log(`→ Translating to ${name} (${code})`);
    const translated = await translateDeep(base, code, limit);
    const outFile = path.join(OUT_DIR, `${code}.json`);
    writeJson(outFile, translated);
    outputs.push(outFile);
  }

  // Zip them
  const zipPath = path.resolve(OUT_DIR, "india-locales.zip");
  // jszip-cli packs a directory; we’ll pack all generated files together via temp dir
  const packDir = path.join(OUT_DIR, "__pack__");
  fs.rmSync(packDir, { recursive: true, force: true });
  fs.mkdirSync(packDir, { recursive: true });
  for (const f of outputs) {
    fs.copyFileSync(f, path.join(packDir, path.basename(f)));
  }
  console.log(`→ Zipping to ${zipPath}`);
  // Use jszip-cli
  const { spawnSync } = await import("node:child_process");
  const r = spawnSync(
    path.resolve("node_modules/.bin/jszip"),
    ["-o", zipPath, packDir],
    { stdio: "inherit" }
  );
  if (r.status !== 0) {
    console.warn("Zip step failed via jszip-cli. You can zip manually:");
    console.warn(`zip -j ${zipPath} ${packDir}/*.json`);
  } else {
    console.log("✓ Done.");
    console.log(`Zip: ${zipPath}`);
  }
})();

