import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AccountPanel } from "@/components/AccountPanel";
import { AccountWelcome } from "@/components/AccountWelcome";
import { CertificateUpload } from "@/components/CertificateUpload";
import { DocumentList } from "@/components/DocumentList";
import { SiteHeader } from "@/components/SiteHeader";
import { WalletConnect } from "@/components/WalletConnect";
import { getSessionCustomer } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Account — Folio",
  description:
    "Signed-in Folio workspace: upload documents, manage your encrypted profile, and tokenize IP.",
};

export default async function AccountPage() {
  let customer;
  try {
    customer = await getSessionCustomer();
  } catch {
    redirect("/login");
  }

  if (!customer) {
    redirect("/login");
  }

  return (
    <div className="page-shell">
      <div className="atmosphere" aria-hidden="true">
        <div className="atmosphere-wash" />
        <div className="atmosphere-grid" />
        <div className="atmosphere-orb atmosphere-orb-a" />
        <div className="atmosphere-orb atmosphere-orb-b" />
      </div>

      <SiteHeader />

      <main className="account-main">
        <AccountWelcome fullName={customer.fullName} email={customer.email} />

        <section
          className="account-workflow"
          id="tokenize"
          aria-labelledby="workflow-heading"
        >
          <div className="section-copy">
            <h2 id="workflow-heading">Document workflow</h2>
            <p>
              Internal tools for signed-in accounts: connect a wallet when you
              are ready to mint, then upload and store documents securely.
            </p>
          </div>
          <div className="account-wallet">
            <WalletConnect />
          </div>
          <CertificateUpload requireSession />
        </section>

        <div className="account-panels">
          <DocumentList />
          <AccountPanel customer={customer} />
        </div>
      </main>

      <footer className="site-footer">
        <p>Folio · Signed-in account</p>
      </footer>
    </div>
  );
}
