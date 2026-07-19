import { http, createConfig, createStorage, cookieStorage } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";
import {
  coinbaseWallet,
  injected,
  metaMask,
  walletConnect,
} from "@wagmi/connectors";

const walletConnectProjectId =
  process.env.NEXT_PUBLIC_WC_PROJECT_ID?.trim() || "";

const appUrl =
  process.env.NEXT_PUBLIC_APP_URL?.trim() || "https://folio.app";

const folioMetadata = {
  name: "Folio",
  description: "IP tokenization — mint copyright certificates on Base",
  url: appUrl,
  icons: [`${appUrl.replace(/\/$/, "")}/favicon.ico`],
};

/**
 * Curated connectors for popular wallets.
 * WalletConnect (Rainbow, Trust, Ledger Live, etc.) needs NEXT_PUBLIC_WC_PROJECT_ID.
 */
export const connectors = [
  metaMask({
    dapp: {
      name: folioMetadata.name,
      url: folioMetadata.url,
      iconUrl: folioMetadata.icons[0],
    },
  }),
  coinbaseWallet({
    appName: folioMetadata.name,
    appLogoUrl: folioMetadata.icons[0],
    preference: {
      options: "all",
    },
  }),
  injected({
    shimDisconnect: true,
  }),
  ...(walletConnectProjectId
    ? [
        walletConnect({
          projectId: walletConnectProjectId,
          metadata: folioMetadata,
          showQrModal: true,
          qrModalOptions: {
            themeMode: "light",
            explorerRecommendedWalletIds: [
              // Rainbow, Trust, Ledger Live, OKX
              "1ae92b26df02f0abca6304df07debccd182bea6daad6ab7bddb6f0db28c19295",
              "4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0",
              "19177a98252e07ddfc9af2083ba8e07ef627cb6103467ffebb3fa7c508e7f0e0",
              "971e689d0a5be527bac79629b4ee9b925e82208e5168b72df1fa0a4b04863f2a",
            ],
          },
        }),
      ]
    : []),
];

export const hasWalletConnect = Boolean(walletConnectProjectId);

export const config = createConfig({
  chains: [baseSepolia, base],
  connectors,
  multiInjectedProviderDiscovery: false,
  transports: {
    [baseSepolia.id]: http(),
    [base.id]: http(),
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
