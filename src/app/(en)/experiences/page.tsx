import {
  generateExperiencesMetadata,
  renderExperiencesPage,
} from '@/features/i18n-pages/experiences';

export const dynamic = 'force-dynamic';

export function generateMetadata() {
  return generateExperiencesMetadata('en');
}

export default function EnglishExperiencesPage() {
  return renderExperiencesPage('en');
}
