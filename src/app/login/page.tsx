import type { Metadata } from "next";
import { AuthForm } from "@/components/AuthForm";
import { SiteHeader } from "@/components/SiteHeader";
import { getSessionCustomer } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign in — Folio",
  description:
    "Create or access your Folio account. Customer data is encrypted at rest.",
};

type LoginPageProps = {
  searchParams: Promise<{ signedOut?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const customer = await getSessionCustomer().catch(() => null);
  if (customer) {
    redirect("/account");
  }

  const params = await searchParams;
  const signedOut = params.signedOut === "1";

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
          <h1>{signedOut ? "Signed out." : "Your identity, sealed."}</h1>
          <p className="hero-lede">
            {signedOut
              ? "Your Folio session is cleared. Sign in again when you want to manage documents or your encrypted profile."
              : "Sign in to manage IP tokenization. Customer details are encrypted before they touch disk."}
          </p>
        </div>
        <AuthForm signedOut={signedOut} />
      </main>
    </div>
  );
}
