import type { Metadata } from 'next';
import { TurkishLegalPage, turkishTermsContent } from '@/features/static-pages/legal';
import { buildTurkishStaticPageMetadata } from '@/features/static-pages/metadata';

export const metadata: Metadata = buildTurkishStaticPageMetadata({
  title: 'Kullanım Koşulları — Creare',
  description: 'CREARE web sitesinin ve hizmetlerinin kullanımına ilişkin koşullar.',
  path: '/tr/terms',
  imageAlt: 'CREARE Kullanım Koşulları',
});

export default function TrTermsPage() {
  return <TurkishLegalPage content={turkishTermsContent} />;
}
