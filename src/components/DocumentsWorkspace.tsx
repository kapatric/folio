"use client";

import { useCallback, useState } from "react";
import { CertificateUpload } from "@/components/CertificateUpload";
import { DocumentList } from "@/components/DocumentList";
import { WalletConnect } from "@/components/WalletConnect";

type DocumentsWorkspaceProps = {
  savedWalletAddress?: string;
  onWalletSynced?: () => void;
};

export function DocumentsWorkspace({
  savedWalletAddress = "",
  onWalletSynced,
}: DocumentsWorkspaceProps) {
  const [vaultVersion, setVaultVersion] = useState(0);

  const onUploaded = useCallback(() => {
    setVaultVersion((value) => value + 1);
  }, []);

  return (
    <>
      <section
        className="account-workflow"
        id="upload"
        aria-labelledby="workflow-heading"
      >
        <div className="section-copy">
          <h2 id="workflow-heading">Upload</h2>
          <p>
            Add documents to your encrypted Folio vault. Link or relink a wallet
            when you are ready to mint.
          </p>
        </div>
        <div className="account-wallet">
          <WalletConnect
            syncProfile
            savedWalletAddress={savedWalletAddress}
            onProfileSynced={onWalletSynced}
          />
        </div>
        <CertificateUpload onUploaded={onUploaded} />
      </section>

      <DocumentList
        refreshKey={vaultVersion}
        emptyHint="No documents yet. Upload above to add your first file."
      />
    </>
  );
}
