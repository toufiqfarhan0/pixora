import React from 'react';
import ReactDOM from 'react-dom/client';
import { PrivyProvider } from '@privy-io/react-auth';
import { toSolanaWalletConnectors } from '@privy-io/react-auth/solana';
import { App } from './App';
import './index.css';

const PRIVY_APP_ID = import.meta.env.VITE_PRIVY_APP_ID || 'cmtvfvjwh03p70bl3nzvog9ju';
const solanaConnectors = toSolanaWalletConnectors();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PrivyProvider
      appId={PRIVY_APP_ID}
      config={{
        appearance: {
          theme: 'light',
          accentColor: '#10b981',
          showWalletLoginFirst: true,
          walletChainType: 'ethereum-and-solana',
          walletList: ['detected_wallets', 'metamask', 'phantom'],
        },
        externalWallets: {
          solana: { connectors: solanaConnectors },
        },
        embeddedWallets: {
          solana: { createOnLogin: 'off' },
          ethereum: { createOnLogin: 'off' },
        },
        loginMethods: ['wallet'],
      }}
    >
      <App />
    </PrivyProvider>
  </React.StrictMode>
);
