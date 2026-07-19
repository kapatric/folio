import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AccountWelcome } from "@/components/AccountWelcome";
import { AccountWorkspace } from "@/components/AccountWorkspace";
import { SiteHeader } from "@/components/SiteHeader";
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
        <AccountWorkspace customer={customer} />
      </main>

      <footer className="site-footer">
        <p>Folio · Signed-in account</p>
      </footer>
    </div>
  );
}
