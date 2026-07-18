import type { Metadata } from 'next';
import { renderHomePage } from '@/features/i18n-pages/home';
import { buildRouteCanonicalAlternates } from '@/lib/seo';

export const metadata: Metadata = {
  alternates: buildRouteCanonicalAlternates({
    family: 'home',
    locale: 'tr',
  }),
};

export default function TurkishHomePage() {
  return renderHomePage('tr');
}
