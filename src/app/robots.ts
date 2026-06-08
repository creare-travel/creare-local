import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://crearetravel.com';
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/experiences/black'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
