import type { Metadata } from 'next';
import {
  DEFAULT_METADATA,
  DEFAULT_OG_IMAGE,
  SITE_NAME,
  buildOpenGraph,
  buildMetadataAlternates,
  buildTwitterCard,
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
  return {
    metadataBase: DEFAULT_METADATA.metadataBase,
    title: { absolute: title },
    description,
    alternates: buildMetadataAlternates(path),
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
