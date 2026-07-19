import {
  generateExperienceDetailMetadata,
  renderExperienceDetailPage,
} from '@/features/i18n-pages/experience-detail';

interface PageProps {
  params: Promise<{ slug: string | string[] }>;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: PageProps) {
  return generateExperienceDetailMetadata({ locale: 'tr', params });
}

export default async function TurkishExperienceDetailPage({ params }: PageProps) {
  const { slug } = await params;
  return renderExperienceDetailPage(slug, 'tr');
}
