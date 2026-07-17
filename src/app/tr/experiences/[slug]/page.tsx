import { renderExperienceDetailPage } from '@/features/i18n-pages/experience-detail';

interface PageProps {
  params: Promise<{ slug: string | string[] }>;
}

export const dynamic = 'force-dynamic';

export default async function TurkishExperienceDetailPage({ params }: PageProps) {
  const { slug } = await params;
  return renderExperienceDetailPage(slug, 'tr');
}
