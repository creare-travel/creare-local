import type { Metadata } from 'next';
import { renderExperiencesPage } from '@/features/i18n-pages/experiences';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { buildLocaleOwnedMetadata } from '@/lib/seo';

const dictionary = getDictionary('tr');

export const metadata: Metadata = buildLocaleOwnedMetadata({
  locale: 'tr',
  copyLocale: 'tr',
  route: {
    family: 'experiences',
    locale: 'tr',
  },
  title: dictionary.home.hero.eyebrow,
  description: dictionary.home.collections.eyebrow,
  robots: { index: true, follow: true },
});

export default function TurkishExperiencesPage() {
  return renderExperiencesPage('tr');
}
