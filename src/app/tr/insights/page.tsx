import type { Metadata } from 'next';
import { renderInsightsPage } from '@/features/i18n-pages/insights';
import { buildRouteCanonicalAlternates } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  alternates: buildRouteCanonicalAlternates({
    family: 'insights',
    locale: 'tr',
  }),
};

export default function TurkishInsightsPage() {
  return renderInsightsPage('tr');
}
