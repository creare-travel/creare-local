import {
  buildExperienceCategoryMetadata,
  renderExperienceCategoryPage,
} from '@/features/i18n-pages/experience-category';

export const dynamic = 'force-dynamic';
export const metadata = buildExperienceCategoryMetadata('lab', 'tr');

export default function TurkishLabExperiencesPage() {
  return renderExperienceCategoryPage('lab', 'tr');
}
