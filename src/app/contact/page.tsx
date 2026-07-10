import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import { buildContactPageGraph } from '@/lib/schema-builder';
import { buildMetadataAlternates } from '@/lib/seo';
import ContactPageClient from './ContactPageClient';

const SITE_URL = 'https://crearetravel.com';
const OG_IMAGE = `${SITE_URL}/og/default.jpg`;

export const metadata: Metadata = {
  title: 'İletişim — Özel Talepler',
  description:
    'Özel komisyonlar, gizli iş birlikleri ve özenli talepler için. CREARE her mesaja kişisel olarak yanıt verir.',
  alternates: buildMetadataAlternates('/contact'),
  robots: { index: true, follow: true },
  openGraph: {
    title: 'İletişim — Özel Talepler — Creare',
    description: 'Özel komisyonlar, gizli iş birlikleri ve özenli talepler için.',
    url: `${SITE_URL}/contact`,
    siteName: 'Creare',
    type: 'website',
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: 'Creare İletişim — Özel Talepler' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'İletişim — Özel Talepler — Creare',
    description: 'Özel komisyonlar, gizli iş birlikleri ve özenli talepler için.',
    images: [OG_IMAGE],
  },
};

export default function ContactPage() {
  const contactSchema = buildContactPageGraph({
    title: 'İletişim — Özel Talepler',
    description:
      'Özel komisyonlar, gizli iş birlikleri ve özenli talepler için. CREARE her mesaja kişisel olarak yanıt verir.',
    path: '/contact',
    email: 'direct@crearetravel.com',
    telephone: '+90-541-220-3000',
  });

  return (
    <>
      <JsonLd id="contact-page-jsonld" schema={contactSchema} />
      <ContactPageClient />
    </>
  );
}
