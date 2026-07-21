import type { Metadata } from 'next';
import {
  DEFAULT_METADATA,
  DEFAULT_OG_IMAGE,
  SITE_NAME,
  buildOpenGraph,
  buildTwitterCard,
  canonicalUrl,
} from '@/lib/seo';

interface StaticPageMetadataOptions {
  title: string;
  description: string;
  path: string;
  imageAlt: string;
}

export function buildTurkishStaticPageMetadata({
  title,
  description,
  path,
  imageAlt,
}: StaticPageMetadataOptions): Metadata {
  const canonical = canonicalUrl(path);

  return {
    metadataBase: DEFAULT_METADATA.metadataBase,
    title: { absolute: title },
    description,
    alternates: {
      canonical,
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      ...buildOpenGraph({
        title,
        description,
        path,
        image: DEFAULT_OG_IMAGE,
        imageAlt,
        locale: 'tr',
        type: 'website',
      }),
      siteName: SITE_NAME,
    },
    twitter: buildTwitterCard({
      title,
      description,
      image: DEFAULT_OG_IMAGE,
      imageAlt,
    }),
  };
}
