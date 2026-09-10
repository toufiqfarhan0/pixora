/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
    };

    config.resolve.alias = {
      ...config.resolve.alias,
      '@farcaster/mini-app-solana': false,
      '@solana-program/memo': false,
      '@solana-program/compute-budget': false,
      '@solana-program/system': false,
      '@solana-program/token': false,
      '@solana/kit': false,
      permissionless: false,
      '@abstract-foundation/agw-client': false,
    };

    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    return config;
  },
  experimental: {
    serverComponentsExternalPackages: ['ws'],
  },
};

export default nextConfig;
