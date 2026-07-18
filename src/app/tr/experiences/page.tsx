import type { Metadata } from 'next';
import { renderExperiencesPage } from '@/features/i18n-pages/experiences';
import { buildRouteCanonicalAlternates } from '@/lib/seo';

export const metadata: Metadata = {
  alternates: buildRouteCanonicalAlternates({
    family: 'experiences',
    locale: 'tr',
  }),
};

export default function TurkishExperiencesPage() {
  return renderExperiencesPage('tr');
}
