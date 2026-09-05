import {
  generateCulturalWorldsMetadata,
  renderCulturalWorldsPage,
} from '@/features/i18n-pages/cultural-worlds';

export const dynamic = 'force-dynamic';

export function generateMetadata() {
  return generateCulturalWorldsMetadata('tr');
}

export default function TurkishCulturalWorldsPage() {
  return renderCulturalWorldsPage('tr');
}
