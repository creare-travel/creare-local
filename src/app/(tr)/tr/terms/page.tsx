import type { Metadata } from 'next';
import { TurkishLegalPage, turkishTermsContent } from '@/features/static-pages/legal';
import { buildTurkishStaticPageMetadata } from '@/features/static-pages/metadata';
import { localizePathname } from '@/lib/i18n/pathname';

export const metadata: Metadata = buildTurkishStaticPageMetadata({
  title: 'Kullanım Koşulları — Creare',
  description: 'CREARE web sitesinin ve hizmetlerinin kullanımına ilişkin koşullar.',
  path: localizePathname('/terms', 'tr'),
  imageAlt: 'CREARE Kullanım Koşulları',
});

export default function TrTermsPage() {
  return <TurkishLegalPage content={turkishTermsContent} />;
}
