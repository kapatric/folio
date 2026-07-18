import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import {
  decryptProfile,
  emailIndex,
  encryptProfile,
  hashPassword,
  normalizeEmail,
  type CustomerProfile,
  verifyPassword,
} from "@/lib/auth/crypto";

export type StoredCustomer = {
  id: string;
  emailIndex: string;
  passwordSalt: string;
  passwordHash: string;
  /** AES-256-GCM encrypted CustomerProfile */
  encryptedProfile: string;
  createdAt: string;
  updatedAt: string;
};

type CustomerDatabase = {
  version: 1;
  customers: StoredCustomer[];
};

const DATA_DIR = path.join(process.cwd(), ".data");
const DB_PATH = path.join(DATA_DIR, "customers.json");

async function ensureDb(): Promise<CustomerDatabase> {
  await mkdir(DATA_DIR, { recursive: true });
  try {
    const raw = await readFile(DB_PATH, "utf8");
    const parsed = JSON.parse(raw) as CustomerDatabase;
    if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.customers)) {
      return { version: 1, customers: [] };
    }
    return parsed;
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ENOENT") {
      const empty: CustomerDatabase = { version: 1, customers: [] };
      await writeFile(DB_PATH, JSON.stringify(empty, null, 2), "utf8");
      return empty;
    }
    throw error;
  }
}

async function saveDb(db: CustomerDatabase): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  const tempPath = `${DB_PATH}.${randomUUID()}.tmp`;
  await writeFile(tempPath, JSON.stringify(db, null, 2), "utf8");
  await rename(tempPath, DB_PATH);
}

export type PublicCustomer = {
  id: string;
  email: string;
  fullName: string;
  organization: string;
  phone: string;
  walletAddress: string;
  createdAt: string;
  updatedAt: string;
};

function toPublic(customer: StoredCustomer): PublicCustomer {
  const profile = decryptProfile(customer.encryptedProfile);
  return {
    id: customer.id,
    email: profile.email,
    fullName: profile.fullName,
    organization: profile.organization,
    phone: profile.phone,
    walletAddress: profile.walletAddress,
    createdAt: customer.createdAt,
    updatedAt: customer.updatedAt,
  };
}

export async function findCustomerByEmail(
  email: string,
): Promise<StoredCustomer | null> {
  const db = await ensureDb();
  const index = emailIndex(email);
  return db.customers.find((customer) => customer.emailIndex === index) ?? null;
}

export async function findCustomerById(
  id: string,
): Promise<StoredCustomer | null> {
  const db = await ensureDb();
  return db.customers.find((customer) => customer.id === id) ?? null;
}

export async function registerCustomer(input: {
  email: string;
  password: string;
  fullName: string;
  organization?: string;
  phone?: string;
  walletAddress?: string;
}): Promise<PublicCustomer> {
  const email = normalizeEmail(input.email);
  if (!email || !email.includes("@")) {
    throw new Error("A valid email is required.");
  }
  if (input.password.length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }
  if (!input.fullName.trim()) {
    throw new Error("Full name is required.");
  }

  const existing = await findCustomerByEmail(email);
  if (existing) {
    throw new Error("An account with this email already exists.");
  }

  const now = new Date().toISOString();
  const { salt, hash } = hashPassword(input.password);
  const profile: CustomerProfile = {
    email,
    fullName: input.fullName.trim(),
    organization: input.organization?.trim() || "",
    phone: input.phone?.trim() || "",
    walletAddress: input.walletAddress?.trim() || "",
  };

  const customer: StoredCustomer = {
    id: randomUUID(),
    emailIndex: emailIndex(email),
    passwordSalt: salt,
    passwordHash: hash,
    encryptedProfile: encryptProfile(profile),
    createdAt: now,
    updatedAt: now,
  };

  const db = await ensureDb();
  db.customers.push(customer);
  await saveDb(db);
  return toPublic(customer);
}

export async function authenticateCustomer(
  email: string,
  password: string,
): Promise<PublicCustomer | null> {
  const customer = await findCustomerByEmail(email);
  if (!customer) return null;
  const valid = verifyPassword(
    password,
    customer.passwordSalt,
    customer.passwordHash,
  );
  if (!valid) return null;
  return toPublic(customer);
}

export async function getPublicCustomerById(
  id: string,
): Promise<PublicCustomer | null> {
  const customer = await findCustomerById(id);
  if (!customer) return null;
  return toPublic(customer);
}

export async function updateCustomerProfile(
  id: string,
  updates: Partial<
    Pick<
      CustomerProfile,
      "fullName" | "organization" | "phone" | "walletAddress"
    >
  >,
): Promise<PublicCustomer> {
  const db = await ensureDb();
  const index = db.customers.findIndex((customer) => customer.id === id);
  if (index < 0) {
    throw new Error("Account not found.");
  }

  const customer = db.customers[index];
  const current = decryptProfile(customer.encryptedProfile);
  const next: CustomerProfile = {
    email: current.email,
    fullName: updates.fullName?.trim() || current.fullName,
    organization:
      updates.organization !== undefined
        ? updates.organization.trim()
        : current.organization,
    phone: updates.phone !== undefined ? updates.phone.trim() : current.phone,
    walletAddress:
      updates.walletAddress !== undefined
        ? updates.walletAddress.trim()
        : current.walletAddress,
  };

  if (!next.fullName) {
    throw new Error("Full name is required.");
  }

  const updated: StoredCustomer = {
    ...customer,
    encryptedProfile: encryptProfile(next),
    updatedAt: new Date().toISOString(),
  };
  db.customers[index] = updated;
  await saveDb(db);
  return toPublic(updated);
}
