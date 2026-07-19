"use client";

import { SignOutButton } from "@/components/SignOutButton";

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
      <div className="account-welcome-top">
        <p className="brand-hero account-brand">Folio</p>
        <SignOutButton />
      </div>
      <h1 id="account-welcome-heading">Welcome back, {firstName}.</h1>
      <p className="hero-lede account-welcome-lede">
        You’re signed in as {email}. Use the tabs below to view and edit your
        account information, or open uploaded documents. Sign out when you’re
        done to clear this session.
      </p>
    </section>
  );
}
