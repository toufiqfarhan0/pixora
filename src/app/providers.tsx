'use client';

import React from 'react';
import { PrivyProvider } from '@privy-io/react-auth';

const PRIVY_APP_ID =
  process.env.NEXT_PUBLIC_PRIVY_APP_ID ||
  'cmtvfvjwh03p70bl3nzvog9ju';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={PRIVY_APP_ID}
      config={{
        appearance: {
          theme: 'light',
          accentColor: '#FF4D26',
          showWalletLoginFirst: true,
          walletList: ['metamask'],
        },
        embeddedWallets: {
          ethereum: { createOnLogin: 'off' },
        },
        loginMethods: ['wallet'],
      }}
    >
      {children}
    </PrivyProvider>
  );
}
