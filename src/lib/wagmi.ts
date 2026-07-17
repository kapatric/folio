import { http, createConfig, createStorage, cookieStorage } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { coinbaseWallet, injected, walletConnect } from "@wagmi/connectors";

const walletConnectProjectId =
  process.env.NEXT_PUBLIC_WC_PROJECT_ID?.trim() || "";

const connectors = [
  injected({ shimDisconnect: true }),
  coinbaseWallet({ appName: "Folio" }),
  ...(walletConnectProjectId
    ? [
        walletConnect({
          projectId: walletConnectProjectId,
          metadata: {
            name: "Folio",
            description: "IP tokenization — upload copyright certificates on-chain",
            url: "https://folio.app",
            icons: [],
          },
        }),
      ]
    : []),
];

export const config = createConfig({
  chains: [mainnet, sepolia],
  connectors,
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
