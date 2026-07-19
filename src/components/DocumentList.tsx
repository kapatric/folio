"use client";

import { useEffect, useState } from "react";
import { listDocumentsRequest } from "@/lib/api/client";
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

type DocumentListProps = {
  refreshKey?: number;
  emptyHint?: string;
};

export function DocumentList({
  refreshKey = 0,
  emptyHint = "No documents yet. Upload above to add your first file.",
}: DocumentListProps) {
  const [documents, setDocuments] = useState<PublicDocument[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void listDocumentsRequest()
      .then((data) => {
        if (cancelled) return;
        setDocuments(data.documents || []);
        setError(null);
        setLoaded(true);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(
          err instanceof Error ? err.message : "Unable to load documents.",
        );
        setLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  if (!loaded) {
    return (
      <section className="document-list" aria-labelledby="docs-heading">
        <div className="section-copy">
          <h2 id="docs-heading">Your documents</h2>
          <p>Loading your encrypted vault…</p>
        </div>
      </section>
    );
  }

  return (
    <section className="document-list" aria-labelledby="docs-heading">
      <div className="section-copy">
        <h2 id="docs-heading">Your documents</h2>
        <p>
          Downloads decrypt only for your signed-in session.
        </p>
      </div>

      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}

      {!error && documents.length === 0 && (
        <p className="upload-hint">{emptyHint}</p>
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
