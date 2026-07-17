"use client";

import { useState, useSyncExternalStore } from "react";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useChainId,
  useSwitchChain,
} from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";

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

export function WalletConnect() {
  const isClient = useIsClient();
  const { address, isConnected, isConnecting } = useAccount();
  const { connect, connectors, isPending, error } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const [menuOpen, setMenuOpen] = useState(false);

  if (!isClient) {
    return (
      <button type="button" className="cta-primary" disabled>
        Connect wallet
      </button>
    );
  }

  if (isConnected && address) {
    const chainLabel =
      chainId === sepolia.id
        ? "Sepolia"
        : chainId === mainnet.id
          ? "Ethereum"
          : `Chain ${chainId}`;

    return (
      <div className="wallet-connected">
        <div className="wallet-status" aria-live="polite">
          <span className="wallet-dot" aria-hidden="true" />
          <span className="wallet-address">{shortenAddress(address)}</span>
          <span className="wallet-chain">{chainLabel}</span>
        </div>
        <div className="wallet-actions">
          {chainId !== sepolia.id && (
            <button
              type="button"
              className="cta-ghost"
              onClick={() => switchChain({ chainId: sepolia.id })}
            >
              Use Sepolia
            </button>
          )}
          <button
            type="button"
            className="cta-ghost"
            onClick={() => disconnect()}
          >
            Disconnect
          </button>
        </div>
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
