import { renderInsightDetailPage } from '@/features/i18n-pages/insight-detail';

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamic = 'force-dynamic';

export default async function TurkishInsightArticlePage({ params }: Props) {
  const { slug } = await params;
  return renderInsightDetailPage(slug, 'tr');
}
