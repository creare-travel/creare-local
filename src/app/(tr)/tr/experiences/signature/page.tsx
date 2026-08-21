import {
  buildExperienceCategoryMetadata,
  renderExperienceCategoryPage,
} from '@/features/i18n-pages/experience-category';

export const dynamic = 'force-dynamic';
export const metadata = buildExperienceCategoryMetadata('signature', 'tr');

export default function TurkishSignatureExperiencesPage() {
  return renderExperienceCategoryPage('signature', 'tr');
}
