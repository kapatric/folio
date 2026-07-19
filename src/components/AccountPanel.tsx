"use client";

import { type FormEvent, useId, useState } from "react";
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

type ProfileForm = {
  fullName: string;
  organization: string;
  phone: string;
  walletAddress: string;
};

type AccountPanelProps = {
  customer: AccountCustomer;
  onUpdated?: (customer: AccountCustomer) => void;
  /** Start in edit mode when the tab/panel mounts. */
  startEditing?: boolean;
};

function formFromCustomer(customer: AccountCustomer): ProfileForm {
  return {
    fullName: customer.fullName,
    organization: customer.organization,
    phone: customer.phone,
    walletAddress: customer.walletAddress,
  };
}

function displayValue(value: string) {
  return value.trim() ? value : "—";
}

export function AccountPanel({
  customer,
  onUpdated,
  startEditing = false,
}: AccountPanelProps) {
  const formId = useId();
  const [form, setForm] = useState(() => formFromCustomer(customer));
  const [editing, setEditing] = useState(startEditing);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function beginEdit() {
    setForm(formFromCustomer(customer));
    setError(null);
    setMessage(null);
    setEditing(true);
  }

  function cancelEdit() {
    setForm(formFromCustomer(customer));
    setError(null);
    setMessage(null);
    setEditing(false);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setMessage(null);

    try {
      const data = await updateProfileRequest(form);
      setForm(formFromCustomer(data.customer));
      setMessage("Account information saved.");
      setEditing(false);
      onUpdated?.(data.customer);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="account-section" aria-labelledby="account-heading">
      <div className="section-copy account-section-head">
        <div>
          <h2 id="account-heading">Account information</h2>
          <p>
            Your Folio profile details. Contact fields and wallet links are
            encrypted at rest.
          </p>
        </div>
        {!editing && (
          <button type="button" className="cta-secondary" onClick={beginEdit}>
            Edit info
          </button>
        )}
      </div>

      {!editing ? (
        <dl className="account-meta account-meta-grid">
          <div>
            <dt>Full name</dt>
            <dd>{displayValue(customer.fullName)}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{customer.email}</dd>
          </div>
          <div>
            <dt>Organization</dt>
            <dd>{displayValue(customer.organization)}</dd>
          </div>
          <div>
            <dt>Phone</dt>
            <dd>{displayValue(customer.phone)}</dd>
          </div>
          <div>
            <dt>Wallet address</dt>
            <dd className="account-mono">
              {displayValue(customer.walletAddress)}
            </dd>
          </div>
          <div>
            <dt>Member since</dt>
            <dd>{new Date(customer.createdAt).toLocaleDateString()}</dd>
          </div>
        </dl>
      ) : (
        <form
          id={formId}
          className="auth-form account-form"
          onSubmit={onSubmit}
        >
          <label className="auth-field">
            <span>Full name</span>
            <input
              value={form.fullName}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  fullName: event.target.value,
                }))
              }
              required
              autoComplete="name"
            />
          </label>
          <label className="auth-field">
            <span>Email</span>
            <input value={customer.email} disabled readOnly />
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
              autoComplete="organization"
            />
          </label>
          <label className="auth-field">
            <span>Phone</span>
            <input
              value={form.phone}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  phone: event.target.value,
                }))
              }
              autoComplete="tel"
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
              autoComplete="off"
            />
          </label>

          {error && (
            <p className="field-error" role="alert">
              {error}
            </p>
          )}

          <div className="account-edit-actions">
            <button type="submit" className="cta-primary" disabled={pending}>
              {pending ? "Saving…" : "Save changes"}
            </button>
            <button
              type="button"
              className="cta-ghost"
              onClick={cancelEdit}
              disabled={pending}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {message && !editing && <p className="field-success">{message}</p>}
    </section>
  );
}
