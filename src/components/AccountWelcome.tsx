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
        You’re signed in as {email}. Manage your encrypted profile, review
        stored documents, and continue tokenizing IP on Base.
      </p>
      <div className="account-welcome-actions">
        <Link href="/#tokenize" className="cta-primary">
          Upload a document
        </Link>
        <Link href="/about" className="cta-secondary">
          About Folio
        </Link>
      </div>
    </section>
  );
}
