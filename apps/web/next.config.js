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
    config.resolve.alias = {
      ...config.resolve.alias,
      '@fuzzy/adaptive-engine': require.resolve('@fuzzy/adaptive-engine'),
      '@fuzzy/creative-tools': require.resolve('@fuzzy/creative-tools'),
      '@fuzzy/external-games': require.resolve('@fuzzy/external-games'),
      '@fuzzy/game-engine': require.resolve('@fuzzy/game-engine'),
      '@fuzzy/h5p-adapter': require.resolve('@fuzzy/h5p-adapter'),
      '@fuzzy/quiz-generator': require.resolve('@fuzzy/quiz-generator'),
      '@fuzzy/sandbox-connector': require.resolve('@fuzzy/sandbox-connector'),
      '@fuzzy/simulation-engine': require.resolve('@fuzzy/simulation-engine'),
      '@fuzzy/vr-ar-adapter': require.resolve('@fuzzy/vr-ar-adapter'),
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