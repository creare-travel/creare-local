import { imageHosts } from './image-hosts.config.mjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: true,
  distDir: process.env.DIST_DIR || '.next',

  images: {
    remotePatterns: imageHosts,
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },

  async redirects() {
    return [
      {
        source: '/experiences',
        destination: '/experiences/signature',
        permanent: true,
      },
      {
        source: '/experience/:slug',
        destination: '/experiences/:slug',
        permanent: true,
      },
      {
        source: '/signature',
        destination: '/experiences/signature',
        permanent: true,
      },
      {
        source: '/experiences/signature-experiences',
        destination: '/experiences/signature',
        permanent: true,
      },
      {
        source: '/experiences/open-studio-istanbul',
        destination: '/experiences/the-studio-session',
        permanent: true,
      },
      {
        source: '/experiences/masterchef-bodrum-culinary-competition',
        destination: '/experiences/culinary-arena-bodrum',
        permanent: true,
      },
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
      {
        source: '/sitemap-page',
        destination: '/',
        permanent: true,
      },
      {
        source: '/destinations',
        destination: '/cultural-worlds',
        permanent: true,
      },
      {
        source: '/destinations/bodrum',
        destination: '/cultural-worlds/bodrum',
        permanent: true,
      },
      {
        source: '/destinations/istanbul',
        destination: '/cultural-worlds/istanbul',
        permanent: true,
      },
      {
        source: '/destinations/international',
        destination: '/cultural-worlds',
        permanent: true,
      },
      {
        source: '/destinations/:path*',
        destination: '/cultural-worlds/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
