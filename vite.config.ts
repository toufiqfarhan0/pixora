import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': {},
  },
  server: {
    port: 5173,
    strictPort: true,
    host: true,
  },
  optimizeDeps: {
    exclude: ['@privy-io/react-auth'],
  },
  build: {
    rollupOptions: {
      external: [
        /^@solana-program\//,
        '@solana/kit',
        /^@farcaster\//,
        /^permissionless/,
        /^@base-ui\//,
        /^valtio/,
        /^react-aria/,
        /^react-stately/,
        /^@phosphor-icons\//,
        /^@stripe\//,
        '@stripe/stripe-js',
      ],
    },
  },
});
