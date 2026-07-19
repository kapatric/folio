"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { resetPasswordRequest } from "@/lib/api/client";

type ResetPasswordFormProps = {
  token: string;
};

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") || "");
    const confirm = String(form.get("confirm") || "");

    if (password !== confirm) {
      setError("Passwords do not match.");
      setPending(false);
      return;
    }

    try {
      await resetPasswordRequest({ token, password });
      router.replace("/account");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setPending(false);
    }
  }

  if (!token) {
    return (
      <div className="auth-panel">
        <div className="auth-panel-intro">
          <h2>Reset link missing</h2>
          <p>
            Open the full link from your email or local reset outbox, or request
            a new one.
          </p>
        </div>
        <p className="auth-footnote">
          <Link href="/forgot-password">Request a new reset link</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="auth-panel">
      <div className="auth-panel-intro">
        <h2>Choose a new password</h2>
        <p>
          Enter a new password for your Folio account. You’ll be signed in after
          it saves.
        </p>
      </div>

      <form className="auth-form" onSubmit={onSubmit}>
        <label className="auth-field">
          <span>New password</span>
          <input
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            placeholder="At least 8 characters"
          />
        </label>
        <label className="auth-field">
          <span>Confirm password</span>
          <input
            name="confirm"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            placeholder="Re-enter password"
          />
        </label>

        {error && (
          <p className="field-error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="cta-primary" disabled={pending}>
          {pending ? "Saving…" : "Update password"}
        </button>
      </form>

      <p className="auth-footnote">
        <Link href="/login">Back to sign in</Link>
      </p>
    </div>
  );
}
