"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type CustomerSummary = {
  id: string;
  fullName: string;
  email: string;
};

export function AuthNav() {
  const router = useRouter();
  const [customer, setCustomer] = useState<CustomerSummary | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/auth/me")
      .then(async (response) => {
        if (!response.ok) {
          if (!cancelled) setCustomer(null);
          return;
        }
        const data = (await response.json()) as { customer: CustomerSummary };
        if (!cancelled) setCustomer(data.customer);
      })
      .catch(() => {
        if (!cancelled) setCustomer(null);
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function onLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setCustomer(null);
    router.push("/login");
    router.refresh();
  }

  if (!loaded) {
    return <span className="auth-nav-placeholder" aria-hidden="true" />;
  }

  if (!customer) {
    return (
      <Link href="/login" className="cta-ghost auth-nav-link">
        Sign in
      </Link>
    );
  }

  return (
    <div className="auth-nav">
      <Link href="/account" className="auth-nav-link">
        {customer.fullName}
      </Link>
      <button type="button" className="cta-ghost" onClick={() => void onLogout()}>
        Sign out
      </button>
    </div>
  );
}
