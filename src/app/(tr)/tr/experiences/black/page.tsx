import {
  generateExperienceCategoryMetadata,
  renderExperienceCategoryPage,
} from '@/features/i18n-pages/experience-category';

export const dynamic = 'force-dynamic';

export function generateMetadata() {
  return generateExperienceCategoryMetadata('black', 'tr');
}

export default function TurkishBlackExperiencesPage() {
  return renderExperienceCategoryPage('black', 'tr');
}
