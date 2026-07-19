import Link from "next/link";
import { AccountNav } from "@/components/AccountNav";

type AccountWelcomeProps = {
  fullName: string;
  email: string;
};

export function AccountWelcome({ fullName, email }: AccountWelcomeProps) {
  const firstName = fullName.trim().split(/\s+/)[0] || "there";

  return (
    <section
      className="account-welcome"
      aria-labelledby="account-welcome-heading"
    >
      <p className="brand-hero account-brand">Folio</p>
      <h1 id="account-welcome-heading">Welcome back, {firstName}.</h1>
      <p className="hero-lede account-welcome-lede">
        You’re signed in as {email}. Open your account information or review
        uploaded documents in your encrypted vault.
      </p>

      <AccountNav />

      <div className="account-hub-links" aria-label="Account destinations">
        <Link href="/account/profile" className="account-hub-link">
          <span className="account-hub-link-title">Account information</span>
          <span className="account-hub-link-copy">
            Update your encrypted profile, contact details, and linked wallet.
          </span>
        </Link>
        <Link href="/account/documents" className="account-hub-link">
          <span className="account-hub-link-title">Uploaded documents</span>
          <span className="account-hub-link-copy">
            Upload files to the vault, download existing documents, and prepare
            minting.
          </span>
        </Link>
      </div>
    </section>
  );
}
