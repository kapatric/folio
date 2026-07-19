"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useChainId,
  useSwitchChain,
  type Connector,
} from "wagmi";
import { base, baseSepolia } from "wagmi/chains";
import { updateProfileRequest } from "@/lib/api/client";
import { hasWalletConnect } from "@/lib/wagmi";

function shortenAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

function normalizeAddress(address: string | null | undefined) {
  return address?.trim().toLowerCase() || "";
}

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

type WalletOption = {
  key: string;
  connector: Connector;
  label: string;
  hint: string;
};

function describeConnector(connector: Connector): {
  label: string;
  hint: string;
  rank: number;
} {
  const id = connector.id.toLowerCase();
  const name = connector.name.toLowerCase();

  if (id.includes("metamask") || name.includes("metamask")) {
    return {
      label: "MetaMask",
      hint: "Browser extension or MetaMask mobile",
      rank: 0,
    };
  }
  if (id.includes("coinbase") || name.includes("coinbase")) {
    return {
      label: "Coinbase Wallet",
      hint: "Coinbase app or browser extension",
      rank: 1,
    };
  }
  if (id.includes("walletconnect") || name.includes("walletconnect")) {
    return {
      label: "WalletConnect",
      hint: "Rainbow, Trust, Ledger, OKX, and more",
      rank: 2,
    };
  }
  if (id.includes("brave") || name.includes("brave")) {
    return {
      label: "Brave Wallet",
      hint: "Built into the Brave browser",
      rank: 3,
    };
  }
  return {
    label: connector.name || "Browser wallet",
    hint: "Rabby, Frame, or another injected wallet",
    rank: 4,
  };
}

function buildWalletOptions(connectors: readonly Connector[]): WalletOption[] {
  const seen = new Set<string>();
  const options: WalletOption[] = [];

  for (const connector of connectors) {
    const meta = describeConnector(connector);
    const dedupeKey =
      meta.rank <= 2 ? meta.label : `${meta.label}:${connector.uid}`;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);
    options.push({
      key: connector.uid,
      connector,
      label: meta.label,
      hint: meta.hint,
    });
  }

  return options.sort(
    (a, b) =>
      describeConnector(a.connector).rank -
      describeConnector(b.connector).rank,
  );
}

type WalletConnectProps = {
  /** When true, push the connected address into the Folio profile API. */
  syncProfile?: boolean;
  onProfileSynced?: () => void;
  /** Address already saved on the Folio profile (enables Relink). */
  savedWalletAddress?: string;
  /** Override the disconnected-state button label. */
  label?: string;
};

export function WalletConnect({
  syncProfile = false,
  onProfileSynced,
  savedWalletAddress = "",
  label,
}: WalletConnectProps) {
  const isClient = useIsClient();
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const { address, isConnected, isConnecting } = useAccount();
  const { connect, connectors, isPending, error, reset } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const [menuOpen, setMenuOpen] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [unlinking, setUnlinking] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const lastSynced = useRef<string | null>(null);

  const saved = normalizeAddress(savedWalletAddress);
  const canRelink = Boolean(saved) && !(isConnected && address);
  const actionLabel =
    label || (canRelink ? "Relink wallet" : "Link wallet");

  const walletOptions = useMemo(
    () => buildWalletOptions(connectors),
    [connectors],
  );

  useEffect(() => {
    if (!syncProfile || !isConnected || !address) return;
    if (lastSynced.current === address.toLowerCase()) return;

    let cancelled = false;
    void updateProfileRequest({ walletAddress: address })
      .then(() => {
        if (cancelled) return;
        lastSynced.current = address.toLowerCase();
        setSyncMessage(
          saved && saved !== address.toLowerCase()
            ? "Wallet relinked on your encrypted profile."
            : "Wallet linked to your encrypted profile.",
        );
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
  }, [syncProfile, isConnected, address, onProfileSynced, saved]);

  useEffect(() => {
    if (!menuOpen) return;

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  async function unlinkWallet() {
    setUnlinking(true);
    setSyncMessage(null);
    lastSynced.current = null;

    try {
      if (syncProfile) {
        await updateProfileRequest({ walletAddress: "" });
        onProfileSynced?.();
      }
    } catch {
      setSyncMessage("Disconnected wallet. Profile unlink skipped.");
    }

    try {
      disconnect();
    } catch {
      // Best-effort browser disconnect.
    } finally {
      setUnlinking(false);
    }
  }

  if (!isClient) {
    return (
      <button type="button" className="cta-primary" disabled>
        {actionLabel}
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
    const matchesSaved = !saved || saved === address.toLowerCase();

    return (
      <div className="wallet-connected">
        <div className="wallet-status" aria-live="polite">
          <span className="wallet-dot" aria-hidden="true" />
          <span className="wallet-address">{shortenAddress(address)}</span>
          <span className="wallet-chain">{chainLabel}</span>
        </div>
        {!matchesSaved && (
          <p className="upload-hint">
            Connected address differs from the saved profile wallet{" "}
            {shortenAddress(savedWalletAddress)}. Syncing updates your Folio
            profile.
          </p>
        )}
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
            disabled={unlinking}
            onClick={() => void unlinkWallet()}
          >
            {unlinking ? "Unlinking…" : "Unlink wallet"}
          </button>
        </div>
        {syncMessage && <p className="upload-hint">{syncMessage}</p>}
      </div>
    );
  }

  return (
    <div className="wallet-connect" ref={rootRef}>
      {canRelink && (
        <p className="wallet-relink-hint">
          Previously linked {shortenAddress(savedWalletAddress)}. Relink to
          reconnect that wallet (or choose another).
        </p>
      )}
      <button
        type="button"
        className="cta-primary"
        aria-expanded={menuOpen}
        aria-controls={menuId}
        aria-haspopup="listbox"
        disabled={isConnecting || isPending}
        onClick={() => {
          reset();
          setMenuOpen((open) => !open);
        }}
      >
        {isPending || isConnecting ? "Connecting…" : actionLabel}
      </button>

      {menuOpen && (
        <ul
          id={menuId}
          className="wallet-menu"
          role="listbox"
          aria-label="Popular crypto wallets"
        >
          {walletOptions.map((option) => {
            const busy = pendingId === option.connector.uid && isPending;
            return (
              <li key={option.key}>
                <button
                  type="button"
                  role="option"
                  aria-selected={false}
                  className="wallet-option"
                  disabled={isPending}
                  onClick={() => {
                    setPendingId(option.connector.uid);
                    connect(
                      { connector: option.connector },
                      {
                        onSettled: () => {
                          setPendingId(null);
                          setMenuOpen(false);
                        },
                      },
                    );
                  }}
                >
                  <span className="wallet-option-label">
                    {busy ? `Connecting ${option.label}…` : option.label}
                  </span>
                  <span className="wallet-option-hint">{option.hint}</span>
                </button>
              </li>
            );
          })}
          {!hasWalletConnect && (
            <li className="wallet-menu-note">
              Add <code>NEXT_PUBLIC_WC_PROJECT_ID</code> to enable WalletConnect
              (Rainbow, Trust, Ledger, and more).
            </li>
          )}
        </ul>
      )}

      {error && (
        <p className="field-error" role="alert">
          {error.message}
        </p>
      )}
      {syncMessage && !isConnected && (
        <p className="upload-hint">{syncMessage}</p>
      )}
    </div>
  );
}
