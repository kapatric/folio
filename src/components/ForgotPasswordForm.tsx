"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";
import { forgotPasswordRequest } from "@/lib/api/client";

export function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [delivery, setDelivery] = useState<"email" | "outbox" | null>(null);
  const [resetUrl, setResetUrl] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setDelivery(null);
    setResetUrl(null);
    setPending(true);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "");

    try {
      const result = await forgotPasswordRequest({ email });
      setMessage(result.message);
      setDelivery(result.delivery);
      setResetUrl(result.resetUrl || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="auth-panel">
      <div className="auth-panel-intro">
        <h2>Forgot password</h2>
        <p>
          Enter the email for your Folio account. We’ll send a one-hour reset
          link if a matching account exists.
        </p>
      </div>

      <form className="auth-form" onSubmit={onSubmit}>
        <label className="auth-field">
          <span>Email</span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@studio.com"
          />
        </label>

        {error && (
          <p className="field-error" role="alert">
            {error}
          </p>
        )}
        {message && (
          <p className="field-success" role="status">
            {message}
          </p>
        )}

        {delivery === "outbox" && (
          <p className="auth-delivery-note">
            Email delivery isn’t configured on this install, so Folio wrote the
            reset link to <code>.data/password-reset-outbox.json</code> and the
            server log.
          </p>
        )}

        {resetUrl && (
          <p className="auth-delivery-note">
            Local recovery link:{" "}
            <Link href={resetUrl} className="auth-inline-link">
              Continue to reset password
            </Link>
          </p>
        )}

        <button type="submit" className="cta-primary" disabled={pending}>
          {pending ? "Sending…" : "Send reset link"}
        </button>
      </form>

      <p className="auth-footnote">
        <Link href="/login">Back to sign in</Link>
      </p>
    </div>
  );
}
