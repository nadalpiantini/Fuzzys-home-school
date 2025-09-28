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
    '@fuzzy/schemas',
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

    // Package resolution is handled by transpilePackages above

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