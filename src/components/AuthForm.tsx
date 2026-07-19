"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { loginRequest, registerRequest } from "@/lib/api/client";

type Mode = "login" | "register";

export function AuthForm({ initialMode = "login" }: { initialMode?: Mode }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "");
    const password = String(form.get("password") || "");

    try {
      if (mode === "login") {
        await loginRequest({ email, password });
      } else {
        await registerRequest({
          email,
          password,
          fullName: String(form.get("fullName") || ""),
          organization: String(form.get("organization") || ""),
          phone: String(form.get("phone") || ""),
        });
      }
      router.replace("/account");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="auth-panel">
      <div className="auth-mode-toggle" role="tablist" aria-label="Account mode">
        <button
          type="button"
          role="tab"
          aria-selected={mode === "login"}
          className={mode === "login" ? "is-active" : ""}
          onClick={() => {
            setMode("login");
            setError(null);
          }}
        >
          Sign in
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "register"}
          className={mode === "register" ? "is-active" : ""}
          onClick={() => {
            setMode("register");
            setError(null);
          }}
        >
          Create account
        </button>
      </div>

      <form className="auth-form" onSubmit={onSubmit}>
        {mode === "register" && (
          <>
            <label className="auth-field">
              <span>Full name</span>
              <input
                name="fullName"
                type="text"
                autoComplete="name"
                required
                placeholder="Ada Lovelace"
              />
            </label>
            <label className="auth-field">
              <span>Organization</span>
              <input
                name="organization"
                type="text"
                autoComplete="organization"
                placeholder="Optional"
              />
            </label>
            <label className="auth-field">
              <span>Phone</span>
              <input
                name="phone"
                type="tel"
                autoComplete="tel"
                placeholder="Optional"
              />
            </label>
          </>
        )}

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

        <label className="auth-field">
          <span>Password</span>
          <input
            name="password"
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            required
            minLength={8}
            placeholder="At least 8 characters"
          />
        </label>

        {error && (
          <p className="field-error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="cta-primary" disabled={pending}>
          {pending
            ? mode === "login"
              ? "Signing in…"
              : "Creating account…"
            : mode === "login"
              ? "Sign in"
              : "Create encrypted account"}
        </button>
      </form>

      <p className="auth-footnote">
        If sign-in fails on a fresh machine, run{" "}
        <code>npm run seed:account</code>. <Link href="/">Back to Folio</Link>
      </p>
    </div>
  );
}
