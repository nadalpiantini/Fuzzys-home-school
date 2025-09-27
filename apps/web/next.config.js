/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: ['@fuzzys/ui', '@fuzzys/schemas', '@fuzzys/game-engine'],
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