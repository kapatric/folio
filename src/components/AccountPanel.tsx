"use client";

import { type FormEvent, useState } from "react";
import { updateProfileRequest } from "@/lib/api/client";

export type AccountCustomer = {
  id: string;
  email: string;
  fullName: string;
  organization: string;
  phone: string;
  walletAddress: string;
  createdAt: string;
  updatedAt: string;
};

type AccountPanelProps = {
  customer: AccountCustomer;
  onUpdated?: (customer: AccountCustomer) => void;
};

export function AccountPanel({ customer, onUpdated }: AccountPanelProps) {
  const [form, setForm] = useState({
    fullName: customer.fullName,
    organization: customer.organization,
    phone: customer.phone,
    walletAddress: customer.walletAddress,
  });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setMessage(null);

    try {
      const data = await updateProfileRequest(form);
      setForm({
        fullName: data.customer.fullName,
        organization: data.customer.organization,
        phone: data.customer.phone,
        walletAddress: data.customer.walletAddress,
      });
      setMessage("Encrypted profile saved.");
      onUpdated?.(data.customer);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="account-section" aria-labelledby="account-heading">
      <div className="section-copy">
        <h2 id="account-heading">Your encrypted profile</h2>
        <p>
          Names, contact details, and wallet links are sealed with AES-256-GCM
          at rest.
        </p>
      </div>

      <dl className="account-meta">
        <div>
          <dt>Email</dt>
          <dd>{customer.email}</dd>
        </div>
        <div>
          <dt>Member since</dt>
          <dd>{new Date(customer.createdAt).toLocaleDateString()}</dd>
        </div>
      </dl>

      <form className="auth-form account-form" onSubmit={onSubmit}>
        <label className="auth-field">
          <span>Full name</span>
          <input
            value={form.fullName}
            onChange={(event) =>
              setForm((current) => ({ ...current, fullName: event.target.value }))
            }
            required
          />
        </label>
        <label className="auth-field">
          <span>Organization</span>
          <input
            value={form.organization}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                organization: event.target.value,
              }))
            }
          />
        </label>
        <label className="auth-field">
          <span>Phone</span>
          <input
            value={form.phone}
            onChange={(event) =>
              setForm((current) => ({ ...current, phone: event.target.value }))
            }
          />
        </label>
        <label className="auth-field">
          <span>Wallet address</span>
          <input
            value={form.walletAddress}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                walletAddress: event.target.value,
              }))
            }
            placeholder="0x…"
          />
        </label>

        {error && (
          <p className="field-error" role="alert">
            {error}
          </p>
        )}
        {message && <p className="field-success">{message}</p>}

        <button type="submit" className="cta-primary" disabled={pending}>
          {pending ? "Saving…" : "Save encrypted profile"}
        </button>
      </form>
    </section>
  );
}
