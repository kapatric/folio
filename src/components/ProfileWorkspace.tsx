"use client";

import { useCallback, useState } from "react";
import { AccountPanel, type AccountCustomer } from "@/components/AccountPanel";
import { WalletConnect } from "@/components/WalletConnect";
import { meRequest } from "@/lib/api/client";

type ProfileWorkspaceProps = {
  customer: AccountCustomer;
};

export function ProfileWorkspace({ customer }: ProfileWorkspaceProps) {
  const [profile, setProfile] = useState(customer);

  const onProfileUpdated = useCallback((next: AccountCustomer) => {
    setProfile(next);
  }, []);

  const onWalletSynced = useCallback(() => {
    void meRequest()
      .then((data) => {
        if (data.customer) setProfile(data.customer);
      })
      .catch(() => {
        // Keep the last known profile if refresh fails.
      });
  }, []);

  return (
    <div className="account-panels">
      <section
        className="account-workflow"
        aria-labelledby="wallet-heading"
      >
        <div className="section-copy">
          <h2 id="wallet-heading">Linked wallet</h2>
          <p>
            Connect a wallet to save the address on your encrypted Folio
            profile.
          </p>
        </div>
        <div className="account-wallet">
          <WalletConnect syncProfile onProfileSynced={onWalletSynced} />
        </div>
      </section>

      <AccountPanel
        key={profile.updatedAt}
        customer={profile}
        onUpdated={onProfileUpdated}
      />
    </div>
  );
}
