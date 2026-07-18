import type { Metadata } from 'next';
import { renderCulturalWorldsPage } from '@/features/i18n-pages/cultural-worlds';
import { buildRouteCanonicalAlternates } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  alternates: buildRouteCanonicalAlternates({
    family: 'cultural-worlds',
    locale: 'tr',
  }),
};

export default function TurkishCulturalWorldsPage() {
  return renderCulturalWorldsPage('tr');
}
