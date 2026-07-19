"use client";

import { useId, useState } from "react";
import { useSignOut } from "@/lib/auth/signOut";

type SignOutButtonProps = {
  className?: string;
  /** Compact style for menus; default is a visible account control. */
  variant?: "button" | "menu";
  label?: string;
};

export function SignOutButton({
  className,
  variant = "button",
  label = "Sign out",
}: SignOutButtonProps) {
  const confirmId = useId();
  const { signOut, pending } = useSignOut();
  const [confirming, setConfirming] = useState(false);

  if (variant === "menu") {
    return (
      <button
        type="button"
        className={className || "hamburger-link hamburger-action"}
        disabled={pending}
        onClick={() => void signOut()}
      >
        {pending ? "Signing out…" : label}
      </button>
    );
  }

  if (confirming) {
    return (
      <div
        className="signout-confirm"
        role="group"
        aria-labelledby={confirmId}
      >
        <p id={confirmId} className="signout-confirm-copy">
          Sign out of Folio? You’ll need your password to return.
        </p>
        <div className="signout-confirm-actions">
          <button
            type="button"
            className="cta-primary"
            disabled={pending}
            onClick={() => void signOut()}
          >
            {pending ? "Signing out…" : "Yes, sign out"}
          </button>
          <button
            type="button"
            className="cta-ghost"
            disabled={pending}
            onClick={() => setConfirming(false)}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      className={className || "cta-secondary signout-button"}
      disabled={pending}
      onClick={() => setConfirming(true)}
    >
      {label}
    </button>
  );
}
