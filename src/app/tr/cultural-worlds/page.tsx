import type { Metadata } from 'next';
import { renderCulturalWorldsPage } from '@/features/i18n-pages/cultural-worlds';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { buildLocaleOwnedMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';

const dictionary = getDictionary('tr');

export const metadata: Metadata = buildLocaleOwnedMetadata({
  locale: 'tr',
  copyLocale: 'tr',
  route: {
    family: 'cultural-worlds',
    locale: 'tr',
  },
  title: dictionary.culturalWorlds.atlasTitle,
  description: dictionary.culturalWorlds.geography,
  robots: { index: true, follow: true },
  titleMode: 'absolute',
});

export default function TurkishCulturalWorldsPage() {
  return renderCulturalWorldsPage('tr');
}
