# Folio

IP tokenization app — connect a Web3 wallet, upload a copyright certificate, and mint it as a unique ERC-721 on Base.

## Getting started

This project requires Node.js `>= 20.9.0` to run correctly with Next.js 16.

```bash
npm install
npm run setup   # creates .env.local with auth/document secrets if missing
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

`npm run dev` / `npm run build` also run setup automatically (`predev` / `prebuild`).

### Troubleshooting: `Missing CUSTOMER_DATA_KEY`

Auth and document encryption need secrets in `.env.local`. Generate them with:

```bash
npm run setup
```

Then restart the dev server. Do not commit `.env.local`.

### Troubleshooting: `Invalid email or password`

Accounts live in local `.data/customers.json` (not in git). A cloud-created account will not exist on your laptop until you seed or register locally:

```bash
npm run setup
npm run seed:account
npm run dev
```

Default seeded login:

- Email: `iampatrickhris@gmail.com`
- Password: `FolioTest2026!`

Override with `SEED_EMAIL`, `SEED_PHONE`, `SEED_PASSWORD`, or `SEED_NAME` if needed.

### Troubleshooting: `lightningcss.darwin-arm64.node`

If `npm run dev` fails with `Cannot find module '../lightningcss.darwin-arm64.node'`, your `node_modules` is missing the Apple Silicon native binding (often after installing on another machine or skipping optional deps). Reinstall locally:

```bash
npm run reinstall
npm run dev
```

### Optional env

`.env.local` is created by `npm run setup` (or automatically on `npm install` / `npm run dev`).

Optional overrides:

- `NEXT_PUBLIC_WC_PROJECT_ID` — WalletConnect Cloud project id (enables Rainbow, Trust, Ledger, OKX, etc. via QR). MetaMask, Coinbase Wallet, and injected browser wallets work without it.
- `NEXT_PUBLIC_APP_URL` — optional app URL used in wallet connection metadata
- `NEXT_PUBLIC_FOLIO_IP_ADDRESS` — deployed `FolioIP` contract on Base or Base Sepolia
- `CUSTOMER_DATA_KEY` — AES-256-GCM customer profile key (auto-generated if empty)
- `SESSION_SECRET` — signed login cookie secret (auto-generated if empty)
- `EMAIL_INDEX_SECRET` — optional HMAC secret for email lookup (defaults to `CUSTOMER_DATA_KEY`)
- `DOCUMENT_ENCRYPTION_KEY` — document vault key (auto-generated if empty; otherwise falls back to `CUSTOMER_DATA_KEY`)

### Login & encrypted customer data

- `/login` — create an account or sign in (redirects to `/account` after success)
- `/account` — redirects into the account tabs (Account information by default)
- `/account/profile` — Account information tab: view and edit encrypted customer details
- `/account/documents` — Uploaded documents tab: upload workflow and vault list
- Profiles are stored under `.data/customers.json` with **AES-256-GCM** encryption at rest
- Passwords are **scrypt**-hashed (never stored in plaintext)
- Email is looked up via HMAC index so the address itself stays inside the encrypted blob

### Secure document backend (signed-in only)

- Document upload lives on `/account/documents` after login (not on the public home page)
- Frontend talks to the Next.js API through `src/lib/api/client.ts` (session cookies, same-origin)
- `POST /api/upload` requires a session; encrypts and stores files under `.data/documents/`
- Supported types: copyright certificate, contract, identity, supporting, other
- Accepted files: PDF, PNG, JPEG, WebP, TXT, DOC, DOCX (max 12 MB)
- Filenames and file bytes are encrypted at rest; SHA-256 content hash kept for integrity
- List via `GET /api/documents`, download via `GET /api/documents/:id` (owner session only)
- After upload, the vault list refreshes; connecting a wallet can sync the address to your encrypted profile

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
- Encrypted document vault (`/api/upload`, `/api/documents`) as a post-login internal workflow
