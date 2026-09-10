import React from 'react';
import type { Metadata } from 'next';
import { Space_Grotesk, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import { Providers } from './providers';
import '../index.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Pixora | Massively Shared Onchain Canvas on Solana ER',
  description:
    'Collaborative real-time canvas running on Solana & MagicBlock Ephemeral Rollups with sub-10ms execution, zero gas, and state root L1 settlement.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      style={{ backgroundColor: '#FBFBFA' }}
      className={`${spaceGrotesk.variable} ${plusJakartaSans.variable} ${jetbrainsMono.variable}`}
    >
      <body
        style={{ backgroundColor: '#FBFBFA' }}
        className="antialiased overflow-hidden bg-[var(--bg-page)] text-[var(--text-primary)]"
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
