import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import { buildContactPageGraph } from '@/lib/schema-builder';
import ContactPageClient from './ContactPageClient';

const SITE_URL = 'https://crearetravel.com';
const OG_IMAGE = `${SITE_URL}/og/default.jpg`;

export const metadata: Metadata = {
  title: 'Contact — Private Inquiries',
  description:
    'For strategic engagements, private commissions, and confidential collaborations. CREARE responds personally to all inquiries.',
  alternates: {
    canonical: `${SITE_URL}/contact`,
    languages: {
      en: `${SITE_URL}/contact`,
      tr: `${SITE_URL}/contact`,
      ru: `${SITE_URL}/contact`,
      zh: `${SITE_URL}/contact`,
      'x-default': `${SITE_URL}/contact`,
    },
  },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Contact — Private Inquiries — Creare',
    description: 'For strategic engagements, private commissions, and confidential collaborations.',
    url: `${SITE_URL}/contact`,
    siteName: 'Creare',
    type: 'website',
    images: [
      { url: OG_IMAGE, width: 1200, height: 630, alt: 'Contact Creare — Private Inquiries' },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact — Private Inquiries — Creare',
    description: 'For strategic engagements, private commissions, and confidential collaborations.',
    images: [OG_IMAGE],
  },
};

export default function ContactPage() {
  const contactSchema = buildContactPageGraph({
    title: 'Contact — Private Inquiries',
    description:
      'For strategic engagements, private commissions, and confidential collaborations. CREARE responds personally to all inquiries.',
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
