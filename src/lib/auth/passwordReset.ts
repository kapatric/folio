import { createHash, randomBytes, randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  findCustomerByEmail,
  updateCustomerPassword,
  type PublicCustomer,
} from "@/lib/auth/customerStore";
import { normalizeEmail } from "@/lib/auth/crypto";

type ResetRecord = {
  id: string;
  customerId: string;
  email: string;
  tokenHash: string;
  expiresAt: string;
  usedAt: string | null;
  createdAt: string;
};

type ResetDatabase = {
  version: 1;
  tokens: ResetRecord[];
};

type OutboxEntry = {
  id: string;
  email: string;
  resetUrl: string;
  createdAt: string;
  expiresAt: string;
};

type OutboxDatabase = {
  version: 1;
  entries: OutboxEntry[];
};

const DATA_DIR = path.join(process.cwd(), ".data");
const RESET_DB_PATH = path.join(DATA_DIR, "password-resets.json");
const OUTBOX_PATH = path.join(DATA_DIR, "password-reset-outbox.json");

const RESET_TTL_MS = 60 * 60 * 1000; // 1 hour
const MAX_OUTBOX_ENTRIES = 20;

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const raw = await readFile(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ENOENT") return fallback;
    throw error;
  }
}

async function writeJsonFile(filePath: string, value: unknown): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  const tempPath = `${filePath}.${randomUUID()}.tmp`;
  await writeFile(tempPath, JSON.stringify(value, null, 2), "utf8");
  await rename(tempPath, filePath);
}

async function ensureResetDb(): Promise<ResetDatabase> {
  const parsed = await readJsonFile<ResetDatabase>(RESET_DB_PATH, {
    version: 1,
    tokens: [],
  });
  if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.tokens)) {
    return { version: 1, tokens: [] };
  }
  return parsed;
}

function pruneExpired(tokens: ResetRecord[], now = Date.now()): ResetRecord[] {
  return tokens.filter((token) => {
    if (token.usedAt) return true;
    return Date.parse(token.expiresAt) > now;
  });
}

export function getAppBaseUrl(request?: Request): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");

  if (request) {
    const host =
      request.headers.get("x-forwarded-host") || request.headers.get("host");
    const proto =
      request.headers.get("x-forwarded-proto") ||
      (host?.includes("localhost") ? "http" : "https");
    if (host) return `${proto}://${host}`.replace(/\/$/, "");
  }

  return "http://localhost:3000";
}

export function canRevealResetUrl(): boolean {
  if (process.env.PASSWORD_RESET_REVEAL_URL === "true") return true;
  return process.env.NODE_ENV !== "production";
}

export function hasEmailDelivery(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

async function writeOutbox(entry: OutboxEntry): Promise<void> {
  const db = await readJsonFile<OutboxDatabase>(OUTBOX_PATH, {
    version: 1,
    entries: [],
  });
  const entries = [entry, ...(db.entries || [])].slice(0, MAX_OUTBOX_ENTRIES);
  await writeJsonFile(OUTBOX_PATH, { version: 1, entries });
}

async function sendResetEmail(input: {
  email: string;
  resetUrl: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured.");
  }

  const from =
    process.env.PASSWORD_RESET_FROM_EMAIL?.trim() ||
    "Folio <onboarding@resend.dev>";

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [input.email],
      subject: "Reset your Folio password",
      text: [
        "We received a request to reset your Folio password.",
        "",
        `Open this link within one hour to choose a new password:`,
        input.resetUrl,
        "",
        "If you did not request this, you can ignore this email.",
      ].join("\n"),
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(
      `Unable to send password reset email (${response.status}): ${detail}`,
    );
  }
}

export type ForgotPasswordResult = {
  ok: true;
  message: string;
  delivery: "email" | "outbox";
  /** Present only when local reveal is enabled and an account matched. */
  resetUrl?: string;
};

export async function requestPasswordReset(input: {
  email: string;
  request?: Request;
}): Promise<ForgotPasswordResult> {
  const email = normalizeEmail(input.email);
  const genericMessage =
    "If an account exists for that email, password reset instructions are on the way.";

  if (!email || !email.includes("@")) {
    throw new Error("A valid email is required.");
  }

  const customer = await findCustomerByEmail(email);
  if (!customer) {
    return {
      ok: true,
      message: genericMessage,
      delivery: hasEmailDelivery() ? "email" : "outbox",
    };
  }

  const rawToken = randomBytes(32).toString("base64url");
  const now = Date.now();
  const expiresAt = new Date(now + RESET_TTL_MS).toISOString();
  const createdAt = new Date(now).toISOString();

  const db = await ensureResetDb();
  db.tokens = pruneExpired(db.tokens, now).map((token) =>
    token.customerId === customer.id && !token.usedAt
      ? { ...token, usedAt: createdAt }
      : token,
  );
  db.tokens.push({
    id: randomUUID(),
    customerId: customer.id,
    email,
    tokenHash: hashToken(rawToken),
    expiresAt,
    usedAt: null,
    createdAt,
  });
  await writeJsonFile(RESET_DB_PATH, db);

  const resetUrl = `${getAppBaseUrl(input.request)}/reset-password?token=${encodeURIComponent(rawToken)}`;
  const delivery = hasEmailDelivery() ? "email" : "outbox";

  if (delivery === "email") {
    await sendResetEmail({ email, resetUrl });
  } else {
    await writeOutbox({
      id: randomUUID(),
      email,
      resetUrl,
      createdAt,
      expiresAt,
    });
    console.info(`[folio] Password reset link for ${email}: ${resetUrl}`);
  }

  return {
    ok: true,
    message: genericMessage,
    delivery,
    resetUrl: canRevealResetUrl() ? resetUrl : undefined,
  };
}

export async function resetPasswordWithToken(input: {
  token: string;
  password: string;
}): Promise<PublicCustomer> {
  const token = input.token.trim();
  if (!token) {
    throw new Error("A reset token is required.");
  }
  if (input.password.length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }

  const db = await ensureResetDb();
  const now = Date.now();
  db.tokens = pruneExpired(db.tokens, now);

  const tokenHash = hashToken(token);
  const index = db.tokens.findIndex(
    (entry) => entry.tokenHash === tokenHash && !entry.usedAt,
  );
  if (index < 0) {
    throw new Error("This reset link is invalid or has already been used.");
  }

  const record = db.tokens[index];
  if (Date.parse(record.expiresAt) <= now) {
    throw new Error("This reset link has expired. Request a new one.");
  }

  const customer = await updateCustomerPassword(record.customerId, input.password);
  db.tokens[index] = {
    ...record,
    usedAt: new Date().toISOString(),
  };
  await writeJsonFile(RESET_DB_PATH, db);
  return customer;
}
