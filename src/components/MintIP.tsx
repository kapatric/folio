"use client";

import { useMemo } from "react";
import {
  useAccount,
  useChainId,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { base, baseSepolia } from "wagmi/chains";
import { explorerTokenUrl, folioIpAbi, folioIpAddress } from "@/lib/folioIp";

function chainFromId(chainId: number) {
  if (chainId === base.id) return base;
  if (chainId === baseSepolia.id) return baseSepolia;
  return baseSepolia;
}

type MintIPProps = {
  contentHash: `0x${string}`;
  certificateId: string;
  originalName: string;
};

const TRANSFER_TOPIC =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

function buildTokenURI(params: {
  certificateId: string;
  originalName: string;
  contentHash: `0x${string}`;
  wallet: string;
}) {
  const metadata = {
    name: `Folio IP — ${params.originalName}`,
    description:
      "Unique digital asset representing a copyright certificate tokenized with Folio on Base.",
    attributes: [
      { trait_type: "Certificate ID", value: params.certificateId },
      { trait_type: "Content Hash", value: params.contentHash },
      { trait_type: "Creator", value: params.wallet },
      { trait_type: "Network", value: "Base" },
    ],
  };

  return `data:application/json;base64,${btoa(
    unescape(encodeURIComponent(JSON.stringify(metadata))),
  )}`;
}

function tokenIdFromReceipt(
  logs: { topics: readonly `0x${string}`[] }[] | undefined,
) {
  if (!logs) return null;
  const transfer = logs.find((log) => log.topics[0] === TRANSFER_TOPIC);
  if (!transfer?.topics[3]) return null;
  return BigInt(transfer.topics[3]).toString();
}

export function MintIP({
  contentHash,
  certificateId,
  originalName,
}: MintIPProps) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const {
    writeContract,
    data: txHash,
    error,
    isPending,
    reset,
  } = useWriteContract();
  const {
    data: receipt,
    isLoading: isConfirming,
    isSuccess,
  } = useWaitForTransactionReceipt({ hash: txHash });

  const tokenId = useMemo(
    () => tokenIdFromReceipt(receipt?.logs),
    [receipt],
  );

  const onBase = chainId === base.id || chainId === baseSepolia.id;

  function onMint() {
    if (!address || !folioIpAddress) return;
    reset();

    const tokenURI = buildTokenURI({
      certificateId,
      originalName,
      contentHash,
      wallet: address,
    });

    writeContract({
      address: folioIpAddress,
      abi: folioIpAbi,
      functionName: "mintIP",
      args: [address, contentHash, certificateId, tokenURI],
      chain: chainFromId(chainId),
      account: address,
    });
  }

  if (!folioIpAddress) {
    return (
      <div className="mint-panel">
        <p className="mint-title">Mint on Base</p>
        <p className="mint-copy">
          Deploy <code>FolioIP</code> and set{" "}
          <code>NEXT_PUBLIC_FOLIO_IP_ADDRESS</code> to mint this certificate as
          an ERC-721.
        </p>
      </div>
    );
  }

  if (!isConnected || !address) {
    return (
      <div className="mint-panel">
        <p className="mint-copy">Connect your wallet to mint on Base.</p>
      </div>
    );
  }

  return (
    <div className="mint-panel">
      <p className="mint-title">Mint as Folio IP</p>
      <p className="mint-copy">
        Anchor this certificate as a unique ERC-721 on Base. The content hash
        ensures the same file cannot be minted twice.
      </p>

      <p className="mint-hash">
        Hash{" "}
        <code>{`${contentHash.slice(0, 10)}…${contentHash.slice(-8)}`}</code>
      </p>

      {!onBase ? (
        <button
          type="button"
          className="cta-primary"
          disabled={isSwitching}
          onClick={() => switchChain({ chainId: baseSepolia.id })}
        >
          {isSwitching ? "Switching…" : "Switch to Base Sepolia"}
        </button>
      ) : isSuccess && txHash ? (
        <div className="mint-success">
          <p className="upload-success-title">Minted on Base</p>
          {tokenId && <p className="upload-id">Token #{tokenId}</p>}
          <a
            className="cta-secondary"
            href={
              tokenId
                ? explorerTokenUrl(chainId, tokenId)
                : `${
                    chainId === base.id
                      ? "https://basescan.org"
                      : "https://sepolia.basescan.org"
                  }/tx/${txHash}`
            }
            target="_blank"
            rel="noopener noreferrer"
          >
            View on Basescan
          </a>
        </div>
      ) : (
        <button
          type="button"
          className="cta-primary"
          disabled={isPending || isConfirming}
          onClick={onMint}
        >
          {isPending || isConfirming ? "Minting…" : "Mint IP NFT"}
        </button>
      )}

      {error && (
        <p className="field-error" role="alert">
          {error.message || "Mint failed."}
        </p>
      )}
    </div>
  );
}
