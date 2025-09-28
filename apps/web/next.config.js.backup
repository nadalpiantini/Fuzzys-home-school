import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: [
    '@fuzzy/adaptive-engine',
    '@fuzzy/creative-tools',
    '@fuzzy/external-games',
    '@fuzzy/game-engine',
    // '@fuzzy/h5p-adapter', // Temporarily disabled due to build issues
    '@fuzzy/quiz-generator',
    '@fuzzy/sandbox-connector',
    '@fuzzy/schemas',
    '@fuzzy/simulation-engine',
    '@fuzzy/vr-ar-adapter',
  ],
  images: {
    domains: ['localhost', 'supabase.co', 'fuzzyandfriends.com'],
    unoptimized: true, // For Cloudflare Pages
  },
  productionBrowserSourceMaps: true, // subir sourcemaps
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
  // PRO Pack: Security Headers - CONSOLIDATED
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Prevenir clickjacking
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          // Prevenir MIME type sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // Control de referrer
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Política de permisos
          {
            key: 'Permissions-Policy',
            value:
              'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
          },
          // Content Security Policy consolidada
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "img-src 'self' data: https: blob:",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com",
              "style-src 'self' 'unsafe-inline' https:",
              "connect-src 'self' https: wss: ws:",
              "font-src 'self' data: https:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
            ].join('; '),
          },
          // HSTS (HTTP Strict Transport Security)
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          // XSS Protection
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
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
        undici: false,
      };
    }

    return config;
  },
};

const baseConfig = nextConfig;

export default withSentryConfig(baseConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: true,
});
