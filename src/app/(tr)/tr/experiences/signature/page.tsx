import {
  generateExperienceCategoryMetadata,
  renderExperienceCategoryPage,
} from '@/features/i18n-pages/experience-category';

export const dynamic = 'force-dynamic';

export function generateMetadata() {
  return generateExperienceCategoryMetadata('signature', 'tr');
}

export default function TurkishSignatureExperiencesPage() {
  return renderExperienceCategoryPage('signature', 'tr');
}
