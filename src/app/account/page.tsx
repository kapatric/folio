import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AccountPanel } from "@/components/AccountPanel";
import { AuthNav } from "@/components/AuthNav";
import { getSessionCustomer } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Account — Folio",
  description: "View and update your encrypted Folio customer profile.",
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

      <header className="site-header">
        <p className="brand-mark">Folio</p>
        <AuthNav />
      </header>

      <main className="account-main">
        <p className="brand-hero account-brand">Folio</p>
        <AccountPanel customer={customer} />
      </main>
    </div>
  );
}
