"use client";

import {
  type ChangeEvent,
  type DragEvent,
  useId,
  useRef,
  useState,
} from "react";
import { useAccount } from "wagmi";

const ACCEPTED_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
];
const MAX_BYTES = 12 * 1024 * 1024;

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
    }
  | { status: "error"; message: string; file?: File };

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function validateFile(file: File): string | null {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return "Upload a PDF or image (PNG, JPEG, WebP).";
  }
  if (file.size > MAX_BYTES) {
    return "File must be 12 MB or smaller.";
  }
  return null;
}

export function CertificateUpload() {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const { isConnected, address } = useAccount();
  const [state, setState] = useState<UploadState>({ status: "idle" });
  const [dragging, setDragging] = useState(false);

  async function uploadFile(file: File) {
    const validationError = validateFile(file);
    if (validationError) {
      setState({ status: "error", message: validationError, file });
      return;
    }

    if (!isConnected || !address) {
      setState({
        status: "error",
        message: "Connect your wallet before uploading a certificate.",
        file,
      });
      return;
    }

    setState({ status: "uploading", file, progress: 18 });

    const formData = new FormData();
    formData.append("certificate", file);
    formData.append("walletAddress", address);

    try {
      setState({ status: "uploading", file, progress: 55 });
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      setState({ status: "uploading", file, progress: 88 });

      const payload = (await response.json()) as {
        error?: string;
        certificateId?: string;
        originalName?: string;
        size?: number;
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
    onFileChosen(event.dataTransfer.files?.[0]);
  }

  const selectedFile =
    state.status === "idle" || state.status === "error"
      ? state.status === "error"
        ? state.file
        : undefined
      : state.file;

  return (
    <section className="upload-section" aria-labelledby="upload-heading">
      <div className="section-copy">
        <h2 id="upload-heading">Copyright certificate</h2>
        <p>
          Drop your official certificate. Folio binds it to your connected
          wallet for tokenization.
        </p>
      </div>

      <div
        className={`upload-dropzone${dragging ? " is-dragging" : ""}${
          !isConnected ? " is-disabled" : ""
        }`}
        onDragEnter={(event) => {
          event.preventDefault();
          if (isConnected) setDragging(true);
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
          accept=".pdf,image/png,image/jpeg,image/webp"
          disabled={!isConnected || state.status === "uploading"}
          onChange={onInputChange}
        />

        <div className="upload-visual" aria-hidden="true">
          <span className="upload-seal" />
        </div>

        {state.status === "uploading" ? (
          <div className="upload-progress">
            <p>Securing {state.file.name}…</p>
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
            <p className="upload-success-title">Certificate ready</p>
            <p>
              <strong>{state.originalName}</strong> · {formatBytes(state.size)}
            </p>
            <p className="upload-id">ID {state.certificateId}</p>
            <button
              type="button"
              className="cta-ghost"
              onClick={() => {
                setState({ status: "idle" });
                inputRef.current?.click();
              }}
            >
              Replace file
            </button>
          </div>
        ) : (
          <>
            <p className="upload-prompt">
              {isConnected
                ? "Drag & drop your certificate, or browse"
                : "Connect a wallet to enable uploads"}
            </p>
            <p className="upload-hint">PDF, PNG, JPEG, or WebP · up to 12 MB</p>
            <button
              type="button"
              className="cta-secondary"
              disabled={!isConnected}
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
