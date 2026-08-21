import type { Metadata } from 'next';
import { TurkishPhilosophyPage } from '@/features/static-pages/philosophy';
import { buildTurkishStaticPageMetadata } from '@/features/static-pages/metadata';
import { localizePathname } from '@/lib/i18n/pathname';

export const metadata: Metadata = buildTurkishStaticPageMetadata({
  title: 'Felsefemiz — Creare',
  description:
    'CREARE’ın deneyim tasarımına, özel erişime ve özenle kurgulanan karşılaşmalara yaklaşımı.',
  path: localizePathname('/philosophy', 'tr'),
  imageAlt: 'CREARE Felsefemiz — Deneyim Tasarımı Yaklaşımı',
});

export default function TrPhilosophyPage() {
  return <TurkishPhilosophyPage />;
}
