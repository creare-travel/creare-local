import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://crearetravel.com';
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/_next/', '/admin/', '/experiences/black'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
