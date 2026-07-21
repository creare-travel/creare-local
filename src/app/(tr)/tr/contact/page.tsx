import type { Metadata } from 'next';
import ContactPageClient from '@/app/contact/ContactPageClient';
import { buildTurkishStaticPageMetadata } from '@/features/static-pages/metadata';

export const metadata: Metadata = buildTurkishStaticPageMetadata({
  title: 'Özel Talepler — Creare',
  description:
    'Özel deneyim tasarımı, stratejik çalışmalar ve gizlilik gerektiren iş birlikleri için CREARE ile iletişime geçin.',
  path: '/tr/contact',
  imageAlt: 'CREARE Özel Talepler — İletişim',
});

export default function TrContactPage() {
  return <ContactPageClient locale="tr" successRedirectHref={null} />;
}
