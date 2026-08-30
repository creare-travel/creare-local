import {
  generateExperienceCategoryMetadata,
  renderExperienceCategoryPage,
} from '@/features/i18n-pages/experience-category';

export const dynamic = 'force-dynamic';

export function generateMetadata() {
  return generateExperienceCategoryMetadata('signature', 'en');
}

export default function EnglishSignatureExperiencesPage() {
  return renderExperienceCategoryPage('signature', 'en');
}
