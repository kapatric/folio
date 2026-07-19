import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/ForgotPasswordForm";
import { SiteHeader } from "@/components/SiteHeader";
import { getSessionCustomer } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Forgot password — Folio",
  description: "Recover access to your Folio account with a secure reset link.",
};

export default async function ForgotPasswordPage() {
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
          <h1>Recover access.</h1>
          <p className="hero-lede">
            Password recovery uses a one-time link that expires in one hour.
            Your encrypted profile stays sealed while you reset credentials.
          </p>
        </div>
        <ForgotPasswordForm />
      </main>
    </div>
  );
}
