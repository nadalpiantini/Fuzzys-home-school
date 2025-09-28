/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: [
    '@fuzzy/adaptive-engine',
    '@fuzzy/creative-tools', 
    '@fuzzy/external-games',
    '@fuzzy/game-engine',
    '@fuzzy/h5p-adapter',
    '@fuzzy/quiz-generator',
    '@fuzzy/sandbox-connector',
    '@fuzzy/simulation-engine',
    '@fuzzy/vr-ar-adapter'
  ],
  images: {
    domains: ['localhost', 'supabase.co', 'fuzzyandfriends.com'],
    unoptimized: true, // For Cloudflare Pages
  },
  i18n: {
    locales: ['es', 'en'],
    defaultLocale: 'es',
    localeDetection: false,
  },
  // Cloudflare Pages optimization
  output: 'standalone',
  experimental: {
    // Enable edge runtime for better Cloudflare Pages compatibility
    // runtime: 'edge', // Removed as it's not supported in this Next.js version
  },
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      fs: false,
      net: false,
      tls: false,
      crypto: false,
      buffer: false,
      stream: false,
    };

    // Add module resolution for workspace packages
    const path = require('path');
    config.resolve.alias = {
      ...config.resolve.alias,
      '@fuzzy/adaptive-engine': path.resolve(__dirname, '../../packages/adaptive-engine/dist'),
      '@fuzzy/creative-tools': path.resolve(__dirname, '../../packages/creative-tools/dist'),
      '@fuzzy/external-games': path.resolve(__dirname, '../../packages/external-games/dist'),
      '@fuzzy/game-engine': path.resolve(__dirname, '../../packages/game-engine/dist'),
      '@fuzzy/h5p-adapter': path.resolve(__dirname, '../../packages/h5p-adapter/dist'),
      '@fuzzy/quiz-generator': path.resolve(__dirname, '../../packages/quiz-generator/dist'),
      '@fuzzy/sandbox-connector': path.resolve(__dirname, '../../packages/sandbox-connector/dist'),
      '@fuzzy/simulation-engine': path.resolve(__dirname, '../../packages/simulation-engine/dist'),
      '@fuzzy/vr-ar-adapter': path.resolve(__dirname, '../../packages/vr-ar-adapter/dist'),
    };

    // Optimize for Cloudflare Pages
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'undici': false,
      };
    }

    return config;
  },
}

module.exports = nextConfig