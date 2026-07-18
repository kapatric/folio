# Folio

IP tokenization app — connect a Web3 wallet, upload a copyright certificate, and mint it as a unique ERC-721 on Base.

## Getting started

This project requires Node.js `>= 20.9.0` to run correctly with Next.js 16.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Troubleshooting: `lightningcss.darwin-arm64.node`

If `npm run dev` fails with `Cannot find module '../lightningcss.darwin-arm64.node'`, your `node_modules` is missing the Apple Silicon native binding (often after installing on another machine or skipping optional deps). Reinstall locally:

```bash
npm run reinstall
npm run dev
```

### Optional env

Copy `.env.example` → `.env.local`:

- `NEXT_PUBLIC_WC_PROJECT_ID` — WalletConnect (MetaMask/Coinbase work without it)
- `NEXT_PUBLIC_FOLIO_IP_ADDRESS` — deployed `FolioIP` contract on Base or Base Sepolia
- `CUSTOMER_DATA_KEY` — 32-byte hex key for AES-256-GCM customer profile encryption (`openssl rand -hex 32`)
- `SESSION_SECRET` — secret for signed login cookies (`openssl rand -hex 32`)
- `EMAIL_INDEX_SECRET` — optional HMAC secret for email lookup (defaults to `CUSTOMER_DATA_KEY`)

### Login & encrypted customer data

- `/login` — create an account or sign in
- `/account` — view/update your profile (decrypted only for your session)
- Profiles are stored under `.data/customers.json` with **AES-256-GCM** encryption at rest
- Passwords are **scrypt**-hashed (never stored in plaintext)
- Email is looked up via HMAC index so the address itself stays inside the encrypted blob

## Smart contract (Base)

```bash
cd contracts
forge test -vv
```

Deploy to Base Sepolia:

```bash
cd contracts
forge script script/DeployFolioIP.s.sol:DeployFolioIP \
  --rpc-url $BASE_SEPOLIA_RPC_URL \
  --broadcast \
  --private-key $PRIVATE_KEY
```

See [`contracts/README.md`](contracts/README.md) for Base mainnet and verification.

## Stack

- Next.js App Router + TypeScript + Tailwind CSS
- wagmi + viem (Base / Base Sepolia)
- Foundry `FolioIP` ERC-721 — unique mint per certificate content hash
- Encrypted customer accounts (AES-256-GCM + scrypt + signed session cookies)
- `/api/upload` validates certificate uploads bound to a wallet address
