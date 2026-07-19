"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { logoutRequest } from "@/lib/api/client";

export const SIGNED_OUT_QUERY = "signedOut=1";

export type SignOutOptions = {
  /** Where to send the user after logout. Defaults to login with a notice. */
  redirectTo?: string;
  /** Disconnect the linked wallet as part of sign-out. Defaults to true. */
  disconnectWallet?: boolean;
};

/**
 * Shared Folio sign-out workflow:
 * 1) clear the httpOnly session cookie via /api/auth/logout
 * 2) disconnect the browser wallet when connected
 * 3) route to the login page with a signed-out notice
 */
export function useSignOut() {
  const router = useRouter();
  const { isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [pending, setPending] = useState(false);

  const signOut = useCallback(
    async (options: SignOutOptions = {}) => {
      const {
        redirectTo = `/login?${SIGNED_OUT_QUERY}`,
        disconnectWallet = true,
      } = options;

      setPending(true);
      try {
        await logoutRequest();
      } catch {
        // Continue local sign-out even if the network request fails.
      }

      if (disconnectWallet && isConnected) {
        try {
          disconnect();
        } catch {
          // Wallet disconnect is best-effort.
        }
      }

      router.replace(redirectTo);
      router.refresh();
    },
    [disconnect, isConnected, router],
  );

  return { signOut, pending };
}
