import {
  generateExperiencesMetadata,
  renderExperiencesPage,
} from '@/features/i18n-pages/experiences';

export const dynamic = 'force-dynamic';

export function generateMetadata() {
  return generateExperiencesMetadata('tr');
}

export default function TurkishExperiencesPage() {
  return renderExperiencesPage('tr');
}
