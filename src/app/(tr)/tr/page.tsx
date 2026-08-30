import type { Metadata } from 'next';
import { renderHomePage } from '@/features/i18n-pages/home';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { buildLocaleOwnedMetadata } from '@/lib/seo';

const dictionary = getDictionary('tr');

export const dynamic = 'force-dynamic';

export const metadata: Metadata = buildLocaleOwnedMetadata({
  locale: 'tr',
  copyLocale: 'tr',
  route: {
    family: 'home',
    locale: 'tr',
  },
  title: dictionary.home.hero.eyebrow,
  description: dictionary.home.mainParagraph.paragraph1,
  robots: { index: true, follow: true },
});

export default function TurkishHomePage() {
  return renderHomePage('tr');
}
