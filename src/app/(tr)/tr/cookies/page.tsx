import type { Metadata } from 'next';
import { TurkishLegalPage, turkishCookiesContent } from '@/features/static-pages/legal';
import { buildTurkishStaticPageMetadata } from '@/features/static-pages/metadata';

export const metadata: Metadata = buildTurkishStaticPageMetadata({
  title: 'Çerez Politikası — Creare',
  description:
    'CREARE web sitesinde kullanılan çerezler ve tercihlerinizi nasıl yönetebileceğiniz hakkında bilgi.',
  path: '/tr/cookies',
  imageAlt: 'CREARE Çerez Politikası',
});

export default function TrCookiesPage() {
  return <TurkishLegalPage content={turkishCookiesContent} />;
}
