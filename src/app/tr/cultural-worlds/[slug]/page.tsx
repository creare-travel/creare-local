import { renderCulturalWorldDetailPage } from '@/features/i18n-pages/cultural-world-detail';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function TurkishCulturalWorldDetailPage({ params }: Props) {
  const { slug } = await params;
  return renderCulturalWorldDetailPage(slug, 'tr');
}
