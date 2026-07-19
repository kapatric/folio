/**
 * Create or reset a local Folio account in .data/customers.json.
 *
 * Usage:
 *   npm run seed:account
 *   SEED_PASSWORD='YourPass123' npm run seed:account
 */
import {
  createCipheriv,
  createHmac,
  randomBytes,
  randomUUID,
  scryptSync,
} from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const envPath = path.join(root, ".env.local");
const dataDir = path.join(root, ".data");
const dbPath = path.join(dataDir, "customers.json");

const AES_ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
const SCRYPT_KEYLEN = 64;
const SCRYPT_OPTIONS = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return;
  for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
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
    if (!process.env[key]) process.env[key] = value;
  }
}

function requireEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing ${name}. Run npm run setup first.`);
  }
  return value;
}

function customerKey() {
  const raw = requireEnv("CUSTOMER_DATA_KEY");
  if (/^[0-9a-fA-F]{64}$/.test(raw)) return Buffer.from(raw, "hex");
  return scryptSync(raw, "folio-customer-data-v1", 32, SCRYPT_OPTIONS);
}

function emailIndexSecret() {
  return process.env.EMAIL_INDEX_SECRET?.trim() || requireEnv("CUSTOMER_DATA_KEY");
}

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function emailIndex(email) {
  return createHmac("sha256", emailIndexSecret())
    .update(normalizeEmail(email))
    .digest("hex");
}

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, SCRYPT_KEYLEN, SCRYPT_OPTIONS).toString(
    "hex",
  );
  return { salt, hash };
}

function encryptProfile(profile) {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(AES_ALGORITHM, customerKey(), iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });
  const plaintext = Buffer.from(JSON.stringify(profile), "utf8");
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, ciphertext]).toString("base64url");
}

function readDb() {
  if (!existsSync(dbPath)) return { version: 1, customers: [] };
  const parsed = JSON.parse(readFileSync(dbPath, "utf8"));
  if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.customers)) {
    return { version: 1, customers: [] };
  }
  return parsed;
}

function writeDb(db) {
  mkdirSync(dataDir, { recursive: true });
  writeFileSync(dbPath, JSON.stringify(db, null, 2), "utf8");
}

function main() {
  // Ensure secrets exist before seeding.
  spawnSync(process.execPath, [path.join(root, "scripts/ensure-env.js")], {
    stdio: "inherit",
    cwd: root,
  });
  loadEnvFile(envPath);

  const email = normalizeEmail(
    process.env.SEED_EMAIL || "iampatrickhris@gmail.com",
  );
  const phone = String(process.env.SEED_PHONE || "5102068416");
  const fullName = process.env.SEED_NAME || "Khristopher Patrick";
  const password = process.env.SEED_PASSWORD || "FolioTest2026!";

  if (password.length < 8) {
    throw new Error("SEED_PASSWORD must be at least 8 characters.");
  }

  const now = new Date().toISOString();
  const { salt, hash } = hashPassword(password);
  const profile = {
    email,
    fullName,
    organization: "",
    phone,
    walletAddress: "",
  };
  const index = emailIndex(email);
  const db = readDb();
  const existingIndex = db.customers.findIndex((c) => c.emailIndex === index);

  let action = "created";
  if (existingIndex >= 0) {
    db.customers[existingIndex] = {
      ...db.customers[existingIndex],
      passwordSalt: salt,
      passwordHash: hash,
      encryptedProfile: encryptProfile(profile),
      updatedAt: now,
    };
    action = "updated";
  } else {
    db.customers.push({
      id: randomUUID(),
      emailIndex: index,
      passwordSalt: salt,
      passwordHash: hash,
      encryptedProfile: encryptProfile(profile),
      createdAt: now,
      updatedAt: now,
    });
  }

  writeDb(db);

  console.log(`[folio] Account ${action} in .data/customers.json`);
  console.log(`[folio] Email:    ${email}`);
  console.log(`[folio] Phone:    ${phone}`);
  console.log(`[folio] Password: ${password}`);
  console.log("[folio] Sign in at /login");
}

try {
  main();
} catch (error) {
  console.error(`[folio] ${error instanceof Error ? error.message : error}`);
  process.exit(1);
}
