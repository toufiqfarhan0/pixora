/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PRIVY_APP_ID?: string;
  readonly VITE_SOLANA_RPC_URL?: string;
  readonly VITE_MAGICBLOCK_ROUTER_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
