import type { Metadata } from 'next';
import { TurkishPhilosophyPage } from '@/features/static-pages/philosophy';
import { buildTurkishStaticPageMetadata } from '@/features/static-pages/metadata';

export const metadata: Metadata = buildTurkishStaticPageMetadata({
  title: 'Felsefemiz — Creare',
  description:
    'CREARE’ın deneyim tasarımına, özel erişime ve özenle kurgulanan karşılaşmalara yaklaşımı.',
  path: '/tr/philosophy',
  imageAlt: 'CREARE Felsefemiz — Deneyim Tasarımı Yaklaşımı',
});

export default function TrPhilosophyPage() {
  return <TurkishPhilosophyPage />;
}
