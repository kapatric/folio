# FolioIP — ERC-721 for IP tokenization on Base

Mints copyright certificates as unique NFTs. Uniqueness is enforced by the keccak-256 content hash of the certificate file.

## Setup

```bash
cd contracts
forge install
```

## Test

```bash
forge test -vv
```

## Deploy (Base Sepolia)

```bash
export BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
export BASESCAN_API_KEY=your_basescan_key   # optional, for verify
export FOLIO_OWNER=0xYourAddress            # optional, defaults to deployer

forge script script/DeployFolioIP.s.sol:DeployFolioIP \
  --rpc-url base_sepolia \
  --broadcast \
  --verify \
  --private-key $PRIVATE_KEY
```

## Deploy (Base mainnet)

```bash
export BASE_RPC_URL=https://mainnet.base.org

forge script script/DeployFolioIP.s.sol:DeployFolioIP \
  --rpc-url base \
  --broadcast \
  --verify \
  --private-key $PRIVATE_KEY
```

After deploy, set `NEXT_PUBLIC_FOLIO_IP_ADDRESS` in the app `.env.local` to the contract address.
