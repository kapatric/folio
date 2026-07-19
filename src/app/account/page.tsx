import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AccountPanel } from "@/components/AccountPanel";
import { AccountWelcome } from "@/components/AccountWelcome";
import { DocumentList } from "@/components/DocumentList";
import { SiteHeader } from "@/components/SiteHeader";
import { getSessionCustomer } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Account — Folio",
  description:
    "Your Folio account home after sign-in: encrypted profile, documents, and next steps.",
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

        <div className="account-panels">
          <AccountPanel customer={customer} />
          <DocumentList />
        </div>
      </main>

      <footer className="site-footer">
        <p>Folio · Signed-in account</p>
      </footer>
    </div>
  );
}
