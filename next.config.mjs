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

    // Suppress harmless dynamic import expression warnings from ox / viem
    config.module = {
      ...config.module,
      exprContextCritical: false,
    };

    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      { module: /ox\/_esm\/tempo/ },
      { message: /Critical dependency: the request of a dependency is an expression/ },
    ];

    return config;
  },
  experimental: {
    serverComponentsExternalPackages: ['ws'],
  },
};

export default nextConfig;
