/**
 * Ensures .env.local exists with required Folio secrets.
 * Fills empty CUSTOMER_DATA_KEY / SESSION_SECRET / DOCUMENT_ENCRYPTION_KEY.
 */
import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const envPath = path.join(root, ".env.local");
const examplePath = path.join(root, ".env.example");

const REQUIRED_SECRETS = [
  "CUSTOMER_DATA_KEY",
  "SESSION_SECRET",
  "DOCUMENT_ENCRYPTION_KEY",
];

function hexSecret() {
  return randomBytes(32).toString("hex");
}

function parseEnv(text) {
  /** @type {Record<string, string>} */
  const values = {};
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    values[key] = value;
  }
  return values;
}

function serializeEnv(baseText, values) {
  const seen = new Set();
  const lines = baseText.split(/\r?\n/).map((line) => {
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) return line;
    const key = match[1];
    seen.add(key);
    if (key in values) return `${key}=${values[key]}`;
    return line;
  });

  for (const [key, value] of Object.entries(values)) {
    if (!seen.has(key)) lines.push(`${key}=${value}`);
  }

  let out = lines.join("\n");
  if (!out.endsWith("\n")) out += "\n";
  return out;
}

function main() {
  const exampleText = existsSync(examplePath)
    ? readFileSync(examplePath, "utf8")
    : REQUIRED_SECRETS.map((key) => `${key}=`).join("\n") + "\n";

  const existingText = existsSync(envPath)
    ? readFileSync(envPath, "utf8")
    : exampleText;
  const values = parseEnv(existingText);

  /** @type {string[]} */
  const generated = [];
  for (const key of REQUIRED_SECRETS) {
    if (!values[key]?.trim()) {
      values[key] = hexSecret();
      generated.push(key);
    }
  }

  if (!existsSync(envPath) || generated.length > 0) {
    const base = existsSync(envPath) ? existingText : exampleText;
    writeFileSync(envPath, serializeEnv(base, values), "utf8");
  }

  if (!existsSync(envPath)) {
    console.error("[folio] Failed to create .env.local");
    process.exit(1);
  }

  if (generated.length > 0) {
    console.log(
      `[folio] Wrote secrets to .env.local: ${generated.join(", ")}`,
    );
  }
}

main();
