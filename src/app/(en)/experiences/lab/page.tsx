import {
  generateExperienceCategoryMetadata,
  renderExperienceCategoryPage,
} from '@/features/i18n-pages/experience-category';

export const dynamic = 'force-dynamic';

export function generateMetadata() {
  return generateExperienceCategoryMetadata('lab', 'en');
}

export default function EnglishLabExperiencesPage() {
  return renderExperienceCategoryPage('lab', 'en');
}
