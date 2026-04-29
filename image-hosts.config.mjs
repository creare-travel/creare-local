const isDevelopment = process.env.NODE_ENV !== 'production';

function parseRemotePattern(urlString) {
  if (!urlString) return null;

  try {
    const url = new URL(urlString);
    return {
      protocol: url.protocol.replace(':', ''),
      hostname: url.hostname,
      ...(url.port ? { port: url.port } : {}),
    };
  } catch {
    return null;
  }
}

const configuredStrapiHost = parseRemotePattern(process.env.NEXT_PUBLIC_STRAPI_URL);

export const imageHosts = [
  {
    protocol: 'https',
    hostname: 'images.unsplash.com',
  },
  {
    protocol: 'https',
    hostname: 'images.pexels.com',
  },
  {
    protocol: 'https',
    hostname: 'images.pixabay.com',
  },
  {
    protocol: 'https',
    hostname: 'img.rocket.new',
  },
  {
    protocol: 'https',
    hostname: '*.strapi.io',
  },
  ...(configuredStrapiHost ? [configuredStrapiHost] : []),
  ...(isDevelopment
    ? [
        {
          protocol: 'http',
          hostname: 'localhost',
          port: '1337',
        },
        {
          protocol: 'http',
          hostname: '127.0.0.1',
          port: '1337',
        },
      ]
    : []),
];
