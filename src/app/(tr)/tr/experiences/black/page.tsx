import {
  buildExperienceCategoryMetadata,
  renderExperienceCategoryPage,
} from '@/features/i18n-pages/experience-category';

export const dynamic = 'force-dynamic';
export const metadata = buildExperienceCategoryMetadata('black', 'tr');

export default function TurkishBlackExperiencesPage() {
  return renderExperienceCategoryPage('black', 'tr');
}
