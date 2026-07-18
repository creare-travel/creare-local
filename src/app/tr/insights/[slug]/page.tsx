import {
  generateInsightDetailMetadata,
  renderInsightDetailPage,
} from '@/features/i18n-pages/insight-detail';

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Props) {
  return generateInsightDetailMetadata({ locale: 'tr', params });
}

export default async function TurkishInsightArticlePage({ params }: Props) {
  const { slug } = await params;
  return renderInsightDetailPage(slug, 'tr');
}
