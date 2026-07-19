"use client";

import {
  type ChangeEvent,
  type DragEvent,
  useId,
  useRef,
  useState,
} from "react";
import { useAccount } from "wagmi";
import { keccak256 } from "viem";
import { MintIP } from "@/components/MintIP";
import {
  ACCEPTED_EXTENSIONS,
  DOCUMENT_TYPE_LABELS,
  DOCUMENT_TYPES,
  MAX_DOCUMENT_BYTES,
  type DocumentType,
} from "@/lib/documents/types";

const ACCEPTED_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

type UploadState =
  | { status: "idle" }
  | { status: "selected"; file: File }
  | { status: "uploading"; file: File; progress: number }
  | {
      status: "success";
      file: File;
      certificateId: string;
      originalName: string;
      size: number;
      contentHash: `0x${string}`;
      documentType: DocumentType;
      linkedToAccount: boolean;
    }
  | { status: "error"; message: string; file?: File };

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function validateFile(file: File): string | null {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return "Upload a PDF, image, text, or Word document.";
  }
  if (file.size > MAX_DOCUMENT_BYTES) {
    return "File must be 12 MB or smaller.";
  }
  return null;
}

type CertificateUploadProps = {
  /** When true, page is already behind login; uploads always attach to the session. */
  requireSession?: boolean;
};

export function CertificateUpload({
  requireSession = false,
}: CertificateUploadProps) {
  const inputId = useId();
  const typeId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const { isConnected, address } = useAccount();
  const [documentType, setDocumentType] =
    useState<DocumentType>("copyright_certificate");
  const [state, setState] = useState<UploadState>({ status: "idle" });
  const [dragging, setDragging] = useState(false);

  const needsWalletForMint = documentType === "copyright_certificate";
  const canUpload = requireSession || isConnected;

  async function uploadFile(file: File) {
    const validationError = validateFile(file);
    if (validationError) {
      setState({ status: "error", message: validationError, file });
      return;
    }

    if (!requireSession && (!isConnected || !address)) {
      setState({
        status: "error",
        message: "Connect your wallet before uploading a document.",
        file,
      });
      return;
    }

    setState({ status: "uploading", file, progress: 18 });

    const formData = new FormData();
    formData.append("document", file);
    formData.append("certificate", file);
    formData.append("documentType", documentType);
    if (address) {
      formData.append("walletAddress", address);
    }

    try {
      const buffer = await file.arrayBuffer();
      const contentHash = keccak256(new Uint8Array(buffer));

      setState({ status: "uploading", file, progress: 55 });
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        credentials: "same-origin",
      });
      setState({ status: "uploading", file, progress: 88 });

      const payload = (await response.json()) as {
        error?: string;
        certificateId?: string;
        originalName?: string;
        size?: number;
        linkedToAccount?: boolean;
        documentType?: DocumentType;
      };

      if (!response.ok || !payload.certificateId) {
        throw new Error(payload.error || "Upload failed. Try again.");
      }

      setState({
        status: "success",
        file,
        certificateId: payload.certificateId,
        originalName: payload.originalName || file.name,
        size: payload.size || file.size,
        contentHash,
        documentType: payload.documentType || documentType,
        linkedToAccount: Boolean(payload.linkedToAccount),
      });
    } catch (error) {
      setState({
        status: "error",
        message:
          error instanceof Error ? error.message : "Upload failed. Try again.",
        file,
      });
    }
  }

  function onFileChosen(file: File | undefined) {
    if (!file) return;
    void uploadFile(file);
  }

  function onInputChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    onFileChosen(file);
    event.target.value = "";
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    if (!canUpload) return;
    onFileChosen(event.dataTransfer.files?.[0]);
  }

  const selectedFile =
    state.status === "idle" || state.status === "error"
      ? state.status === "error"
        ? state.file
        : undefined
      : state.file;

  return (
    <section className="upload-section account-upload" aria-labelledby="upload-heading">
      <div className="section-copy">
        <h2 id="upload-heading">Upload documents</h2>
        <p>
          Store certificates and supporting files in your encrypted vault.
          Copyright certificates can be minted once a wallet is connected.
        </p>
      </div>

      <label className="auth-field upload-type-field" htmlFor={typeId}>
        <span>Document type</span>
        <select
          id={typeId}
          value={documentType}
          onChange={(event) =>
            setDocumentType(event.target.value as DocumentType)
          }
          disabled={state.status === "uploading"}
        >
          {DOCUMENT_TYPES.map((type) => (
            <option key={type} value={type}>
              {DOCUMENT_TYPE_LABELS[type]}
            </option>
          ))}
        </select>
      </label>

      <div
        className={`upload-dropzone${dragging ? " is-dragging" : ""}${
          !canUpload ? " is-disabled" : ""
        }`}
        onDragEnter={(event) => {
          event.preventDefault();
          if (canUpload) setDragging(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          className="sr-only"
          accept={ACCEPTED_EXTENSIONS}
          disabled={!canUpload || state.status === "uploading"}
          onChange={onInputChange}
        />

        <div className="upload-visual" aria-hidden="true">
          <span className="upload-seal" />
        </div>

        {state.status === "uploading" ? (
          <div className="upload-progress">
            <p>Encrypting & storing {state.file.name}…</p>
            <div
              className="progress-track"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={state.progress}
            >
              <span style={{ width: `${state.progress}%` }} />
            </div>
          </div>
        ) : state.status === "success" ? (
          <div className="upload-success">
            <p className="upload-success-title">Stored in your vault</p>
            <p>
              <strong>{state.originalName}</strong> · {formatBytes(state.size)}
            </p>
            <p className="upload-id">
              {DOCUMENT_TYPE_LABELS[state.documentType]} · ID{" "}
              {state.certificateId}
            </p>
            <p className="upload-hint">
              Encrypted and linked to your Folio account.
              {needsWalletForMint && !isConnected
                ? " Connect a wallet above to mint this certificate."
                : ""}
            </p>
            <button
              type="button"
              className="cta-ghost"
              onClick={() => {
                setState({ status: "idle" });
                inputRef.current?.click();
              }}
            >
              Upload another
            </button>
            {state.documentType === "copyright_certificate" && isConnected && (
              <MintIP
                contentHash={state.contentHash}
                certificateId={state.certificateId}
                originalName={state.originalName}
              />
            )}
          </div>
        ) : (
          <>
            <p className="upload-prompt">
              Drag & drop a document, or browse
            </p>
            <p className="upload-hint">
              PDF, PNG, JPEG, WebP, TXT, DOC, DOCX · up to 12 MB · encrypted at
              rest
            </p>
            <button
              type="button"
              className="cta-secondary"
              disabled={!canUpload}
              onClick={() => inputRef.current?.click()}
            >
              Choose file
            </button>
            {selectedFile && state.status === "error" && (
              <p className="upload-filename">{selectedFile.name}</p>
            )}
          </>
        )}
      </div>

      {state.status === "error" && (
        <p className="field-error" role="alert">
          {state.message}
        </p>
      )}
    </section>
  );
}
