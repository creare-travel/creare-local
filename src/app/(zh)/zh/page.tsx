import type { Metadata } from 'next';
import { renderHomePage } from '@/features/i18n-pages/home';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { buildLocaleOwnedMetadata } from '@/lib/seo';

const dictionary = getDictionary('zh');

export const revalidate = 300;

export const metadata: Metadata = buildLocaleOwnedMetadata({
  locale: 'zh',
  copyLocale: 'zh',
  route: {
    family: 'home',
    locale: 'zh',
  },
  title: dictionary.home.hero.eyebrow,
  description: dictionary.home.mainParagraph.paragraph1,
  robots: { index: true, follow: true },
});

export default function ChineseHomePage() {
  return renderHomePage('zh');
}
