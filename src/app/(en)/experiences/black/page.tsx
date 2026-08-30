import {
  generateExperienceCategoryMetadata,
  renderExperienceCategoryPage,
} from '@/features/i18n-pages/experience-category';

export const dynamic = 'force-dynamic';

export function generateMetadata() {
  return generateExperienceCategoryMetadata('black', 'en');
}

export default function EnglishBlackExperiencesPage() {
  return renderExperienceCategoryPage('black', 'en');
}
