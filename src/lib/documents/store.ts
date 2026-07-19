import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  decryptBytes,
  decryptText,
  encryptBytes,
  encryptText,
  sha256Hex,
} from "@/lib/documents/crypto";
import {
  ACCEPTED_MIME_TYPES,
  DOCUMENT_TYPES,
  MAX_DOCUMENT_BYTES,
  type DocumentRecord,
  type DocumentType,
  type PublicDocument,
} from "@/lib/documents/types";

type DocumentDatabase = {
  version: 1;
  documents: DocumentRecord[];
};

const DATA_DIR = path.join(process.cwd(), ".data");
const DOCS_DIR = path.join(DATA_DIR, "documents");
const BLOBS_DIR = path.join(DOCS_DIR, "blobs");
const MANIFEST_PATH = path.join(DOCS_DIR, "manifest.json");

const ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;

async function ensureDirs() {
  await mkdir(BLOBS_DIR, { recursive: true });
}

async function readDb(): Promise<DocumentDatabase> {
  await ensureDirs();
  try {
    const raw = await readFile(MANIFEST_PATH, "utf8");
    const parsed = JSON.parse(raw) as DocumentDatabase;
    if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.documents)) {
      return { version: 1, documents: [] };
    }
    return parsed;
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ENOENT") {
      const empty: DocumentDatabase = { version: 1, documents: [] };
      await writeFile(MANIFEST_PATH, JSON.stringify(empty, null, 2), "utf8");
      return empty;
    }
    throw error;
  }
}

async function writeDb(db: DocumentDatabase) {
  await ensureDirs();
  const tempPath = `${MANIFEST_PATH}.${randomUUID()}.tmp`;
  await writeFile(tempPath, JSON.stringify(db, null, 2), "utf8");
  await rename(tempPath, MANIFEST_PATH);
}

function isDocumentType(value: string): value is DocumentType {
  return (DOCUMENT_TYPES as readonly string[]).includes(value);
}

function toPublic(record: DocumentRecord): PublicDocument {
  return {
    id: record.id,
    documentType: record.documentType,
    mimeType: record.mimeType,
    size: record.size,
    contentHash: record.contentHash,
    originalName: decryptText(record.encryptedOriginalName),
    walletAddress: record.walletAddress,
    createdAt: record.createdAt,
  };
}

export async function storeDocument(input: {
  file: File;
  documentType: string;
  walletAddress?: string;
  ownerCustomerId?: string | null;
}): Promise<PublicDocument> {
  const { file } = input;

  if (!(file instanceof File)) {
    throw new Error("A document file is required.");
  }
  if (!ACCEPTED_MIME_TYPES.has(file.type)) {
    throw new Error(
      "Unsupported file type. Use PDF, PNG, JPEG, WebP, TXT, DOC, or DOCX.",
    );
  }
  if (file.size <= 0 || file.size > MAX_DOCUMENT_BYTES) {
    throw new Error("File must be between 1 byte and 12 MB.");
  }
  if (!isDocumentType(input.documentType)) {
    throw new Error("Invalid document type.");
  }

  const wallet = input.walletAddress?.trim() || "";
  if (wallet && !ADDRESS_RE.test(wallet)) {
    throw new Error("A valid wallet address is required.");
  }
  if (!input.ownerCustomerId && !wallet) {
    throw new Error("Sign in or connect a wallet to store a document.");
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const contentHash = sha256Hex(bytes);
  const id = `folio_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
  const blobFileName = `${id}.enc`;
  const encryptedBlob = encryptBytes(bytes);

  await ensureDirs();
  await writeFile(path.join(BLOBS_DIR, blobFileName), encryptedBlob, "utf8");

  const record: DocumentRecord = {
    id,
    ownerCustomerId: input.ownerCustomerId || null,
    walletAddress: wallet ? wallet.toLowerCase() : null,
    documentType: input.documentType,
    mimeType: file.type,
    size: file.size,
    contentHash,
    encryptedOriginalName: encryptText(file.name || "document"),
    blobFileName,
    createdAt: new Date().toISOString(),
  };

  const db = await readDb();
  db.documents.push(record);
  await writeDb(db);

  return toPublic(record);
}

export async function listDocumentsForCustomer(
  customerId: string,
): Promise<PublicDocument[]> {
  const db = await readDb();
  return db.documents
    .filter((doc) => doc.ownerCustomerId === customerId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(toPublic);
}

export async function getDocumentForCustomer(
  documentId: string,
  customerId: string,
): Promise<{ record: PublicDocument; bytes: Buffer } | null> {
  const db = await readDb();
  const record = db.documents.find((doc) => doc.id === documentId);
  if (!record || record.ownerCustomerId !== customerId) {
    return null;
  }

  const encrypted = await readFile(
    path.join(BLOBS_DIR, record.blobFileName),
    "utf8",
  );
  const bytes = decryptBytes(encrypted);
  return { record: toPublic(record), bytes };
}

export async function getDocumentRecord(
  documentId: string,
): Promise<DocumentRecord | null> {
  const db = await readDb();
  return db.documents.find((doc) => doc.id === documentId) ?? null;
}
