import type { Metadata } from 'next';
import { renderInsightsPage } from '@/features/i18n-pages/insights';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { buildLocaleOwnedMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';

const dictionary = getDictionary('tr');

export const metadata: Metadata = buildLocaleOwnedMetadata({
  locale: 'tr',
  copyLocale: 'tr',
  route: {
    family: 'insights',
    locale: 'tr',
  },
  title: dictionary.insights.title,
  description: dictionary.insights.subtitle,
  robots: { index: true, follow: true },
});

export default function TurkishInsightsPage() {
  return renderInsightsPage('tr');
}
