import type { Metadata } from "next";
import { AuthForm } from "@/components/AuthForm";
import { SiteHeader } from "@/components/SiteHeader";
import { getSessionCustomer } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign in — Folio",
  description: "Create or access your Folio account. Customer data is encrypted at rest.",
};

export default async function LoginPage() {
  const customer = await getSessionCustomer().catch(() => null);
  if (customer) {
    redirect("/account");
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

      <main className="auth-hero">
        <div className="auth-hero-copy">
          <p className="brand-hero">Folio</p>
          <h1>Your identity, sealed.</h1>
          <p className="hero-lede">
            Sign in to manage IP tokenization. Customer details are encrypted
            before they touch disk.
          </p>
        </div>
        <AuthForm />
      </main>
    </div>
  );
}
