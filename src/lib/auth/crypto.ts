import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";

const AES_ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
const SCRYPT_KEYLEN = 64;
const SCRYPT_OPTIONS = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(
      `Missing ${name}. Run \`npm run setup\` (or restart \`npm run dev\`) to create .env.local secrets.`,
    );
  }
  return value;
}

function keyFromEnv(name: string): Buffer {
  const raw = requireEnv(name);
  if (/^[0-9a-fA-F]{64}$/.test(raw)) {
    return Buffer.from(raw, "hex");
  }
  // Derive a stable 32-byte key from a passphrase-style secret.
  return scryptSync(raw, "folio-customer-data-v1", 32, SCRYPT_OPTIONS);
}

export function getCustomerDataKey(): Buffer {
  return keyFromEnv("CUSTOMER_DATA_KEY");
}

export function getSessionSecret(): string {
  return requireEnv("SESSION_SECRET");
}

export function getEmailIndexSecret(): string {
  return process.env.EMAIL_INDEX_SECRET?.trim() || requireEnv("CUSTOMER_DATA_KEY");
}

export type CustomerProfile = {
  email: string;
  fullName: string;
  organization: string;
  phone: string;
  walletAddress: string;
};

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function emailIndex(email: string): string {
  return createHmac("sha256", getEmailIndexSecret())
    .update(normalizeEmail(email))
    .digest("hex");
}

export function hashPassword(password: string): { salt: string; hash: string } {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, SCRYPT_KEYLEN, SCRYPT_OPTIONS).toString(
    "hex",
  );
  return { salt, hash };
}

export function verifyPassword(
  password: string,
  salt: string,
  expectedHash: string,
): boolean {
  const actual = scryptSync(password, salt, SCRYPT_KEYLEN, SCRYPT_OPTIONS);
  const expected = Buffer.from(expectedHash, "hex");
  if (actual.length !== expected.length) return false;
  return timingSafeEqual(actual, expected);
}

/** Encrypt JSON-serializable customer profile with AES-256-GCM. */
export function encryptProfile(profile: CustomerProfile): string {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(AES_ALGORITHM, getCustomerDataKey(), iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });
  const plaintext = Buffer.from(JSON.stringify(profile), "utf8");
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, ciphertext]).toString("base64url");
}

export function decryptProfile(payload: string): CustomerProfile {
  const buffer = Buffer.from(payload, "base64url");
  if (buffer.length < IV_LENGTH + AUTH_TAG_LENGTH + 1) {
    throw new Error("Invalid encrypted profile payload.");
  }
  const iv = buffer.subarray(0, IV_LENGTH);
  const tag = buffer.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const ciphertext = buffer.subarray(IV_LENGTH + AUTH_TAG_LENGTH);
  const decipher = createDecipheriv(AES_ALGORITHM, getCustomerDataKey(), iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });
  decipher.setAuthTag(tag);
  const plaintext = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);
  return JSON.parse(plaintext.toString("utf8")) as CustomerProfile;
}

export type SessionPayload = {
  sub: string;
  exp: number;
};

export function createSessionToken(customerId: string, ttlSeconds = 60 * 60 * 24 * 7) {
  const payload: SessionPayload = {
    sub: customerId,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  };
  const body = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const signature = createHmac("sha256", getSessionSecret())
    .update(body)
    .digest("base64url");
  return `${body}.${signature}`;
}

export function verifySessionToken(token: string): SessionPayload | null {
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;

  const expected = createHmac("sha256", getSessionSecret())
    .update(body)
    .digest("base64url");

  const sigBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expected);
  if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8"),
    ) as SessionPayload;
    if (!payload.sub || !payload.exp) return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}
