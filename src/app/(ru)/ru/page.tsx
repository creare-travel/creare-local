import type { Metadata } from 'next';
import { renderHomePage } from '@/features/i18n-pages/home';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { buildLocaleOwnedMetadata } from '@/lib/seo';

const dictionary = getDictionary('ru');

export const revalidate = 300;

export const metadata: Metadata = buildLocaleOwnedMetadata({
  locale: 'ru',
  copyLocale: 'ru',
  route: {
    family: 'home',
    locale: 'ru',
  },
  title: dictionary.home.hero.eyebrow,
  description: dictionary.home.mainParagraph.paragraph1,
  robots: { index: true, follow: true },
});

export default function RussianHomePage() {
  return renderHomePage('ru');
}
