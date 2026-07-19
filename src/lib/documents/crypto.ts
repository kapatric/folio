import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
  scryptSync,
} from "node:crypto";

const AES_ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
const SCRYPT_OPTIONS = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };

function resolveKeyMaterial(): string {
  const dedicated = process.env.DOCUMENT_ENCRYPTION_KEY?.trim();
  if (dedicated) return dedicated;
  const fallback = process.env.CUSTOMER_DATA_KEY?.trim();
  if (fallback) return fallback;
  throw new Error(
    "Missing DOCUMENT_ENCRYPTION_KEY (or CUSTOMER_DATA_KEY). Copy .env.example to .env.local.",
  );
}

function getDocumentKey(): Buffer {
  const raw = resolveKeyMaterial();
  if (/^[0-9a-fA-F]{64}$/.test(raw)) {
    return Buffer.from(raw, "hex");
  }
  return scryptSync(raw, "folio-document-storage-v1", 32, SCRYPT_OPTIONS);
}

export function sha256Hex(data: Buffer): string {
  return createHash("sha256").update(data).digest("hex");
}

/** Encrypt bytes with AES-256-GCM. Returns base64url(iv + tag + ciphertext). */
export function encryptBytes(plaintext: Buffer): string {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(AES_ALGORITHM, getDocumentKey(), iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, ciphertext]).toString("base64url");
}

export function decryptBytes(payload: string): Buffer {
  const buffer = Buffer.from(payload, "base64url");
  if (buffer.length < IV_LENGTH + AUTH_TAG_LENGTH + 1) {
    throw new Error("Invalid encrypted payload.");
  }
  const iv = buffer.subarray(0, IV_LENGTH);
  const tag = buffer.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const ciphertext = buffer.subarray(IV_LENGTH + AUTH_TAG_LENGTH);
  const decipher = createDecipheriv(AES_ALGORITHM, getDocumentKey(), iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}

export function encryptText(value: string): string {
  return encryptBytes(Buffer.from(value, "utf8"));
}

export function decryptText(payload: string): string {
  return decryptBytes(payload).toString("utf8");
}
