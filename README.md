# Folio

IP tokenization app — connect a Web3 wallet, upload a copyright certificate, and mint it as a unique ERC-721 on Base.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Optional env

Copy `.env.example` → `.env.local`:

- `NEXT_PUBLIC_WC_PROJECT_ID` — WalletConnect (MetaMask/Coinbase work without it)
- `NEXT_PUBLIC_FOLIO_IP_ADDRESS` — deployed `FolioIP` contract on Base or Base Sepolia

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
- `/api/upload` validates certificate uploads bound to a wallet address
