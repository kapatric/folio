"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useSignOut } from "@/lib/auth/signOut";

export function SignOutPageClient() {
  const { signOut, pending } = useSignOut();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void signOut();
  }, [signOut]);

  return (
    <div className="auth-panel">
      <div className="auth-panel-intro">
        <h2>{pending ? "Signing out…" : "Redirecting…"}</h2>
        <p>
          Folio is ending this session. If you are not redirected, continue to
          sign in.
        </p>
      </div>
      <Link href="/login?signedOut=1" className="cta-secondary">
        Go to sign in
      </Link>
    </div>
  );
}
