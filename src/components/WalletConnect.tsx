"use client";

import { useState, useSyncExternalStore, useEffect, useRef } from "react";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useChainId,
  useSwitchChain,
} from "wagmi";
import { base, baseSepolia } from "wagmi/chains";
import { updateProfileRequest } from "@/lib/api/client";

function shortenAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

type WalletConnectProps = {
  /** When true, push the connected address into the Folio profile API. */
  syncProfile?: boolean;
  onProfileSynced?: () => void;
};

export function WalletConnect({
  syncProfile = false,
  onProfileSynced,
}: WalletConnectProps) {
  const isClient = useIsClient();
  const { address, isConnected, isConnecting } = useAccount();
  const { connect, connectors, isPending, error } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const [menuOpen, setMenuOpen] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const lastSynced = useRef<string | null>(null);

  useEffect(() => {
    if (!syncProfile || !isConnected || !address) return;
    if (lastSynced.current === address.toLowerCase()) return;

    let cancelled = false;
    void updateProfileRequest({ walletAddress: address })
      .then(() => {
        if (cancelled) return;
        lastSynced.current = address.toLowerCase();
        setSyncMessage("Wallet saved to encrypted profile.");
        onProfileSynced?.();
      })
      .catch(() => {
        if (!cancelled) {
          setSyncMessage("Wallet connected. Profile sync skipped.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [syncProfile, isConnected, address, onProfileSynced]);

  if (!isClient) {
    return (
      <button type="button" className="cta-primary" disabled>
        Connect wallet
      </button>
    );
  }

  if (isConnected && address) {
    const chainLabel =
      chainId === baseSepolia.id
        ? "Base Sepolia"
        : chainId === base.id
          ? "Base"
          : `Chain ${chainId}`;

    return (
      <div className="wallet-connected">
        <div className="wallet-status" aria-live="polite">
          <span className="wallet-dot" aria-hidden="true" />
          <span className="wallet-address">{shortenAddress(address)}</span>
          <span className="wallet-chain">{chainLabel}</span>
        </div>
        <div className="wallet-actions">
          {chainId !== baseSepolia.id && chainId !== base.id && (
            <button
              type="button"
              className="cta-ghost"
              onClick={() => switchChain({ chainId: baseSepolia.id })}
            >
              Use Base Sepolia
            </button>
          )}
          <button
            type="button"
            className="cta-ghost"
            onClick={() => {
              lastSynced.current = null;
              setSyncMessage(null);
              disconnect();
            }}
          >
            Disconnect
          </button>
        </div>
        {syncMessage && <p className="upload-hint">{syncMessage}</p>}
      </div>
    );
  }

  return (
    <div className="wallet-connect">
      <button
        type="button"
        className="cta-primary"
        aria-expanded={menuOpen}
        aria-haspopup="listbox"
        disabled={isConnecting || isPending}
        onClick={() => setMenuOpen((open) => !open)}
      >
        {isPending || isConnecting ? "Connecting…" : "Connect wallet"}
      </button>

      {menuOpen && (
        <ul className="wallet-menu" role="listbox" aria-label="Choose a wallet">
          {connectors.map((connector) => (
            <li key={connector.uid}>
              <button
                type="button"
                role="option"
                aria-selected={false}
                className="wallet-option"
                onClick={() => {
                  connect({ connector });
                  setMenuOpen(false);
                }}
              >
                {connector.name}
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p className="field-error" role="alert">
          {error.message}
        </p>
      )}
    </div>
  );
}
