import { imageHosts } from './image-hosts.config.mjs';

const isDevelopment = process.env.NODE_ENV !== 'production';

function originFromUrl(urlString) {
  if (!urlString) return null;

  try {
    return new URL(urlString).origin;
  } catch {
    return null;
  }
}

const configuredStrapiOrigin = originFromUrl(process.env.NEXT_PUBLIC_STRAPI_URL);

const connectSrc = [
  "'self'",
  'https://www.google-analytics.com',
  'https://www.googletagmanager.com',
  configuredStrapiOrigin,
  ...(isDevelopment
    ? ['http://localhost:1337', 'http://127.0.0.1:1337', 'ws://localhost:*', 'ws://127.0.0.1:*']
    : []),
].filter(Boolean);

const scriptSrc = [
  "'self'",
  "'unsafe-inline'",
  'https://www.googletagmanager.com',
  'https://www.google-analytics.com',
  ...(isDevelopment ? ["'unsafe-eval'"] : []),
];

const imageSrc = [
  "'self'",
  'data:',
  'blob:',
  'https://www.google-analytics.com',
  'https://www.googletagmanager.com',
  'https://images.unsplash.com',
  'https://images.pexels.com',
  'https://images.pixabay.com',
  'https://img.rocket.new',
  'https://res.cloudinary.com',
  'https://*.strapi.io',
  configuredStrapiOrigin,
  ...(isDevelopment ? ['http://localhost:1337', 'http://127.0.0.1:1337'] : []),
].filter(Boolean);

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src ${scriptSrc.join(' ')}`,
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data: https:",
  `img-src ${imageSrc.join(' ')}`,
  `connect-src ${connectSrc.join(' ')}`,
  "frame-src 'self' https://www.googletagmanager.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

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

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Content-Security-Policy',
            value: contentSecurityPolicy.replace(/\s{2,}/g, ' ').trim(),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
