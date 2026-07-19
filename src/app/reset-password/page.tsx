import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/ResetPasswordForm";
import { SiteHeader } from "@/components/SiteHeader";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Reset password — Folio",
  description: "Choose a new Folio password with your recovery link.",
};

type ResetPasswordPageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : "";

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
          <h1>Set a new password.</h1>
          <p className="hero-lede">
            Use your recovery link to replace the forgotten password, then
            continue into your account.
          </p>
        </div>
        <ResetPasswordForm token={token} />
      </main>
    </div>
  );
}
