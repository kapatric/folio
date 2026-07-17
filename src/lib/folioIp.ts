import { type Address } from "viem";
import { base } from "wagmi/chains";

export const folioIpAbi = [
  {
    type: "function",
    name: "mintIP",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "contentHash", type: "bytes32" },
      { name: "certificateId", type: "string" },
      { name: "tokenURI_", type: "string" },
    ],
    outputs: [{ name: "tokenId", type: "uint256" }],
  },
  {
    type: "function",
    name: "tokenByContentHash",
    stateMutability: "view",
    inputs: [{ name: "contentHash", type: "bytes32" }],
    outputs: [{ name: "tokenId", type: "uint256" }],
  },
  {
    type: "function",
    name: "getIPAsset",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "contentHash", type: "bytes32" },
          { name: "certificateId", type: "string" },
          { name: "creator", type: "address" },
          { name: "mintedAt", type: "uint64" },
        ],
      },
    ],
  },
  {
    type: "event",
    name: "IPMinted",
    inputs: [
      { name: "tokenId", type: "uint256", indexed: true },
      { name: "to", type: "address", indexed: true },
      { name: "creator", type: "address", indexed: true },
      { name: "contentHash", type: "bytes32", indexed: false },
      { name: "certificateId", type: "string", indexed: false },
      { name: "tokenURI", type: "string", indexed: false },
    ],
  },
] as const;

const configuredAddress = process.env.NEXT_PUBLIC_FOLIO_IP_ADDRESS?.trim() as
  | Address
  | undefined;

export const folioIpAddress: Address | undefined =
  configuredAddress && configuredAddress.startsWith("0x")
    ? configuredAddress
    : undefined;

export function explorerTokenUrl(chainId: number, tokenId: string) {
  const baseUrl =
    chainId === base.id
      ? "https://basescan.org"
      : "https://sepolia.basescan.org";
  if (!folioIpAddress) return baseUrl;
  return `${baseUrl}/token/${folioIpAddress}?a=${tokenId}`;
}
