/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: ['@fuzzys/ui', '@fuzzys/schemas', '@fuzzys/game-engine'],
  experimental: {
    serverActions: true,
  },
  images: {
    domains: ['localhost', 'supabase.co'],
  },
  i18n: {
    locales: ['es', 'en'],
    defaultLocale: 'es',
    localeDetection: true,
  },
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
      net: false,
      tls: false
    };
    return config;
  },
}

module.exports = nextConfig