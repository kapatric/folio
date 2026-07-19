export const DOCUMENT_TYPES = [
  "copyright_certificate",
  "contract",
  "identity",
  "supporting",
  "other",
] as const;

export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  copyright_certificate: "Copyright certificate",
  contract: "Contract",
  identity: "Identity document",
  supporting: "Supporting document",
  other: "Other",
};

export const ACCEPTED_MIME_TYPES = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

export const ACCEPTED_EXTENSIONS =
  ".pdf,.png,.jpg,.jpeg,.webp,.txt,.doc,.docx";

export const MAX_DOCUMENT_BYTES = 12 * 1024 * 1024;

export type DocumentRecord = {
  id: string;
  ownerCustomerId: string | null;
  walletAddress: string | null;
  documentType: DocumentType;
  mimeType: string;
  size: number;
  contentHash: string;
  /** AES-GCM encrypted original filename */
  encryptedOriginalName: string;
  blobFileName: string;
  createdAt: string;
};

export type PublicDocument = {
  id: string;
  documentType: DocumentType;
  mimeType: string;
  size: number;
  contentHash: string;
  originalName: string;
  walletAddress: string | null;
  createdAt: string;
};
