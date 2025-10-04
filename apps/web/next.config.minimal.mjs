/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: false },
  eslint: { ignoreDuringBuilds: false },
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
    '@fuzzy/vr-ar-adapter',
  ],
  images: {
    domains: ['localhost', 'supabase.co', 'fuzzyandfriends.com'],
    unoptimized: false,
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    workerThreads: false,
    cpus: 1,
  },
};

export default nextConfig;
