"use client";

import { useEffect, useState } from "react";
import {
  DOCUMENT_TYPE_LABELS,
  type DocumentType,
  type PublicDocument,
} from "@/lib/documents/types";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentList() {
  const [documents, setDocuments] = useState<PublicDocument[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/documents", { credentials: "same-origin" })
      .then(async (response) => {
        const data = (await response.json()) as {
          documents?: PublicDocument[];
          error?: string;
        };
        if (!response.ok) {
          throw new Error(data.error || "Unable to load documents.");
        }
        if (!cancelled) setDocuments(data.documents || []);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unable to load documents.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!loaded) {
    return (
      <section className="document-list" aria-labelledby="docs-heading">
        <div className="section-copy">
          <h2 id="docs-heading">Your documents</h2>
          <p>Loading encrypted vault…</p>
        </div>
      </section>
    );
  }

  return (
    <section className="document-list" aria-labelledby="docs-heading">
      <div className="section-copy">
        <h2 id="docs-heading">Your documents</h2>
        <p>
          Files you uploaded while signed in. Stored encrypted; download
          decrypts only for your session.
        </p>
      </div>

      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}

      {!error && documents.length === 0 && (
        <p className="upload-hint">No documents yet. Upload from the home page.</p>
      )}

      {documents.length > 0 && (
        <ul className="document-items">
          {documents.map((doc) => (
            <li key={doc.id} className="document-item">
              <div>
                <p className="document-name">{doc.originalName}</p>
                <p className="document-meta">
                  {DOCUMENT_TYPE_LABELS[doc.documentType as DocumentType] ||
                    doc.documentType}{" "}
                  · {formatBytes(doc.size)} ·{" "}
                  {new Date(doc.createdAt).toLocaleString()}
                </p>
              </div>
              <a
                className="cta-ghost"
                href={`/api/documents/${doc.id}`}
                download={doc.originalName}
              >
                Download
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
