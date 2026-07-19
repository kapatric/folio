import Link from "next/link";

type AccountWelcomeProps = {
  fullName: string;
  email: string;
};

export function AccountWelcome({ fullName, email }: AccountWelcomeProps) {
  const firstName = fullName.trim().split(/\s+/)[0] || "there";

  return (
    <section className="account-welcome" aria-labelledby="account-welcome-heading">
      <p className="brand-hero account-brand">Folio</p>
      <h1 id="account-welcome-heading">Welcome back, {firstName}.</h1>
      <p className="hero-lede account-welcome-lede">
        You’re signed in as {email}. Use your private workspace to upload
        documents, review the vault, and tokenize IP on Base.
      </p>
      <div className="account-welcome-actions">
        <Link href="/account#tokenize" className="cta-primary">
          Go to document upload
        </Link>
        <Link href="/about" className="cta-secondary">
          About Folio
        </Link>
      </div>
    </section>
  );
}
