# Folio

IP tokenization app — Next.js front-end for connecting a Web3 wallet and uploading a copyright certificate.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Optional

Set `NEXT_PUBLIC_WC_PROJECT_ID` to enable WalletConnect (get a project id from [WalletConnect Cloud](https://cloud.walletconnect.com/)). Injected wallets (e.g. MetaMask) and Coinbase Wallet work without it.

## Stack

- Next.js App Router + TypeScript + Tailwind CSS
- wagmi + viem for wallet connection
- `/api/upload` validates certificate uploads bound to a wallet address
