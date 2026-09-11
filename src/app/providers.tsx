'use client';

import React from 'react';
import { PrivyProvider } from '@privy-io/react-auth';
import { toSolanaWalletConnectors } from '@privy-io/react-auth/solana';

const PRIVY_APP_ID =
  process.env.NEXT_PUBLIC_PRIVY_APP_ID || '';
const solanaConnectors = toSolanaWalletConnectors();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={PRIVY_APP_ID}
      config={{
        appearance: {
          theme: 'light',
          accentColor: '#FF4D26',
          showWalletLoginFirst: false,
          walletChainType: 'solana-only',
          walletList: ['metamask'],
        },
        externalWallets: {
          solana: {
            connectors: solanaConnectors as any,
          },
        },
        embeddedWallets: {
          solana: { createOnLogin: 'off' },
        },
        loginMethods: ['email', 'google', 'wallet'],
      }}
    >
      {children}
    </PrivyProvider>
  );
}
