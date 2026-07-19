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
        You’re signed in as {email}. Use the tabs below to view and edit your
        account information, or open uploaded documents.
      </p>
    </section>
  );
}
