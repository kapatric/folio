"use client";

import { useCallback, useState } from "react";
import { AccountPanel, type AccountCustomer } from "@/components/AccountPanel";
import { CertificateUpload } from "@/components/CertificateUpload";
import { DocumentList } from "@/components/DocumentList";
import { WalletConnect } from "@/components/WalletConnect";
import { meRequest } from "@/lib/api/client";

type AccountWorkspaceProps = {
  customer: AccountCustomer;
};

export function AccountWorkspace({ customer }: AccountWorkspaceProps) {
  const [vaultVersion, setVaultVersion] = useState(0);
  const [profile, setProfile] = useState(customer);

  const onUploaded = useCallback(() => {
    setVaultVersion((value) => value + 1);
  }, []);

  const onProfileUpdated = useCallback((next: AccountCustomer) => {
    setProfile(next);
  }, []);

  const onWalletSynced = useCallback(() => {
    void meRequest()
      .then((data) => {
        if (data.customer) setProfile(data.customer);
      })
      .catch(() => {
        // Profile panel keeps its last known values if refresh fails.
      });
  }, []);

  return (
    <>
      <section
        className="account-workflow"
        id="tokenize"
        aria-labelledby="workflow-heading"
      >
        <div className="section-copy">
          <h2 id="workflow-heading">Document workflow</h2>
          <p>
            Upload documents to your encrypted Folio vault. Connect a wallet
            when you are ready to mint.
          </p>
        </div>
        <div className="account-wallet">
          <WalletConnect syncProfile onProfileSynced={onWalletSynced} />
        </div>
        <CertificateUpload onUploaded={onUploaded} />
      </section>

      <div className="account-panels">
        <DocumentList refreshKey={vaultVersion} />
        <AccountPanel
          key={profile.updatedAt}
          customer={profile}
          onUpdated={onProfileUpdated}
        />
      </div>
    </>
  );
}
