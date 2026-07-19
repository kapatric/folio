"use client";

import { useCallback, useId, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  AccountPanel,
  type AccountCustomer,
} from "@/components/AccountPanel";
import { DocumentsWorkspace } from "@/components/DocumentsWorkspace";
import { WalletConnect } from "@/components/WalletConnect";
import { meRequest } from "@/lib/api/client";

export type AccountTabId = "information" | "documents";

const TABS: { id: AccountTabId; label: string; href: string }[] = [
  {
    id: "information",
    label: "Account information",
    href: "/account/profile",
  },
  {
    id: "documents",
    label: "Uploaded documents",
    href: "/account/documents",
  },
];

type AccountTabsProps = {
  customer: AccountCustomer;
  /** Which tab to show when the component mounts / is used. */
  initialTab?: AccountTabId;
};

function tabFromPathname(pathname: string): AccountTabId {
  if (pathname.startsWith("/account/documents")) return "documents";
  return "information";
}

export function AccountTabs({
  customer,
  initialTab,
}: AccountTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const baseId = useId();
  const [profile, setProfile] = useState(customer);
  const [activeTab, setActiveTab] = useState<AccountTabId>(
    initialTab ?? tabFromPathname(pathname),
  );
  const pathTab = tabFromPathname(pathname);
  if (pathTab !== activeTab) {
    setActiveTab(pathTab);
  }

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

  function selectTab(tab: AccountTabId) {
    setActiveTab(tab);
    const href = TABS.find((item) => item.id === tab)?.href;
    if (href && pathname !== href) {
      router.replace(href, { scroll: false });
    }
  }

  return (
    <div className="account-tabs">
      <div
        className="account-tablist"
        role="tablist"
        aria-label="Account sections"
      >
        {TABS.map((tab) => {
          const selected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`${baseId}-${tab.id}-tab`}
              aria-selected={selected}
              aria-controls={`${baseId}-${tab.id}-panel`}
              tabIndex={selected ? 0 : -1}
              className={`account-tab${selected ? " is-active" : ""}`}
              onClick={() => selectTab(tab.id)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`${baseId}-information-panel`}
        aria-labelledby={`${baseId}-information-tab`}
        hidden={activeTab !== "information"}
        className="account-tabpanel"
      >
        {activeTab === "information" && (
          <div className="account-panels">
            <AccountPanel
              key={profile.updatedAt}
              customer={profile}
              onUpdated={onProfileUpdated}
            />
            <section
              className="account-workflow account-workflow-compact"
              aria-labelledby="wallet-heading"
            >
              <div className="section-copy">
                <h2 id="wallet-heading">Linked wallet</h2>
                <p>
                  Link or relink MetaMask, Coinbase Wallet, WalletConnect, or
                  another browser wallet to save the address on your encrypted
                  Folio profile.
                </p>
              </div>
              <div className="account-wallet">
                <WalletConnect
                  syncProfile
                  savedWalletAddress={profile.walletAddress}
                  onProfileSynced={onWalletSynced}
                />
              </div>
            </section>
          </div>
        )}
      </div>

      <div
        role="tabpanel"
        id={`${baseId}-documents-panel`}
        aria-labelledby={`${baseId}-documents-tab`}
        hidden={activeTab !== "documents"}
        className="account-tabpanel"
      >
        {activeTab === "documents" && (
          <DocumentsWorkspace
            savedWalletAddress={profile.walletAddress}
            onWalletSynced={onWalletSynced}
          />
        )}
      </div>
    </div>
  );
}
