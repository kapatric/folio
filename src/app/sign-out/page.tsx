import type { Metadata } from "next";
import { SignOutPageClient } from "@/components/SignOutPageClient";
import { SiteHeader } from "@/components/SiteHeader";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign out — Folio",
  description: "End your Folio session and return to sign in.",
};

/** Dedicated sign-out route for the shared logout workflow. */
export default function SignOutPage() {
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
          <h1>Signing out.</h1>
          <p className="hero-lede">
            Clearing your secure session and disconnecting any linked wallet.
          </p>
        </div>
        <SignOutPageClient />
      </main>
    </div>
  );
}
