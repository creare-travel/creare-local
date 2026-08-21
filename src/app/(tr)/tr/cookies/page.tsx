import type { Metadata } from 'next';
import { TurkishLegalPage, turkishCookiesContent } from '@/features/static-pages/legal';
import { buildTurkishStaticPageMetadata } from '@/features/static-pages/metadata';
import { localizePathname } from '@/lib/i18n/pathname';

export const metadata: Metadata = buildTurkishStaticPageMetadata({
  title: 'Çerez Politikası — Creare',
  description:
    'CREARE web sitesinde kullanılan çerezler ve tercihlerinizi nasıl yönetebileceğiniz hakkında bilgi.',
  path: localizePathname('/cookies', 'tr'),
  imageAlt: 'CREARE Çerez Politikası',
});

export default function TrCookiesPage() {
  return <TurkishLegalPage content={turkishCookiesContent} />;
}
