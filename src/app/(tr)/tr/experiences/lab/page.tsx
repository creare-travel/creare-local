import {
  generateExperienceCategoryMetadata,
  renderExperienceCategoryPage,
} from '@/features/i18n-pages/experience-category';

export const dynamic = 'force-dynamic';

export function generateMetadata() {
  return generateExperienceCategoryMetadata('lab', 'tr');
}

export default function TurkishLabExperiencesPage() {
  return renderExperienceCategoryPage('lab', 'tr');
}
