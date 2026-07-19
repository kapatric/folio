/**
 * Verifies wagmi connector peer SDKs are installed.
 * Wagmi v3 treats these as optional peers; Folio requires them for Link wallet.
 */
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

const REQUIRED = [
  "@coinbase/wallet-sdk",
  "@metamask/connect-evm",
  "@walletconnect/ethereum-provider",
];

/** @type {string[]} */
const missing = [];

for (const pkg of REQUIRED) {
  try {
    require.resolve(pkg);
  } catch {
    missing.push(pkg);
  }
}

if (missing.length === 0) {
  process.exit(0);
}

console.error(`
[folio] Missing wallet SDK package(s): ${missing.join(", ")}

Wagmi connectors need these dependencies for MetaMask, Coinbase Wallet,
and WalletConnect. Fix by installing them on this machine:

  npm install @coinbase/wallet-sdk @metamask/connect-evm @walletconnect/ethereum-provider

Or reinstall everything:

  npm run reinstall
`);
process.exit(1);
