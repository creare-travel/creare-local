import type { Metadata } from 'next';
import { TurkishLegalPage, turkishPrivacyContent } from '@/features/static-pages/legal';
import { buildTurkishStaticPageMetadata } from '@/features/static-pages/metadata';
import { localizePathname } from '@/lib/i18n/pathname';

export const metadata: Metadata = buildTurkishStaticPageMetadata({
  title: 'Gizlilik Politikası — Creare',
  description:
    'CREARE web sitesinde kişisel bilgilerin nasıl toplandığını, kullanıldığını ve korunduğunu açıklayan Gizlilik Politikası.',
  path: localizePathname('/privacy', 'tr'),
  imageAlt: 'CREARE Gizlilik Politikası',
});

export default function TrPrivacyPage() {
  return <TurkishLegalPage content={turkishPrivacyContent} />;
}
