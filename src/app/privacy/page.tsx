import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { buildMetadataAlternates } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'CREARE privacy policy — how we collect, use, and protect your personal information.',
  alternates: buildMetadataAlternates('/privacy'),
};

interface PolicySection {
  number: number;
  heading: string;
  body: string;
}

const policySections: PolicySection[] = [
  {
    number: 1,
    heading: 'Information We Collect',
    body: 'CREARE collects information that you provide directly to us when you inquire about our services, register for events, or communicate with our team. This may include your name, email address, phone number, company name, and any other information you choose to provide.',
  },
  {
    number: 2,
    heading: 'How We Use Your Information',
    body: 'We use the information we collect to provide, maintain, and improve our services, to communicate with you about your inquiries and our offerings, and to understand how our services are used. We do not sell or share your personal information with third parties for their marketing purposes.',
  },
  {
    number: 3,
    heading: 'Data Security',
    body: 'We implement appropriate technical and organizational measures to protect the security of your personal information. However, please note that no method of transmission over the internet or method of electronic storage is completely secure.',
  },
  {
    number: 4,
    heading: 'Your Rights',
    body: 'You have the right to access, update, or delete your personal information at any time. If you wish to exercise these rights, please contact us directly. We will respond to your request within a reasonable timeframe.',
  },
  {
    number: 5,
    heading: 'Changes to This Policy',
    body: 'We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.',
  },
  {
    number: 6,
    heading: 'Contact Us',
    body: 'If you have any questions about this Privacy Policy, please contact us through our contact page or by email. We are committed to resolving any concerns you may have about your privacy.',
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="px-6 sm:px-10 lg:px-16 pt-28 pb-24 max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 mb-12">
          <Link
            href="/"
            className="flex items-center gap-1 text-xs tracking-widest text-gray-500 hover:text-black transition-colors uppercase"
          >
            <span aria-hidden="true">←</span>
            <span>HOME</span>
          </Link>
          <span className="text-xs text-gray-400" aria-hidden="true">
            /
          </span>
          <span className="text-xs tracking-widest text-black uppercase" aria-current="page">
            PRIVACY
          </span>
        </nav>

        {/* Policy Sections */}
        <div className="flex flex-col gap-12">
          {policySections.map((section) => (
            <div key={section.number}>
              <h2 className="text-lg font-bold text-black mb-4 leading-snug">
                {section.number}. {section.heading}
              </h2>
              <p className="text-sm text-gray-800 leading-relaxed max-w-[680px]">{section.body}</p>
            </div>
          ))}
        </div>

        {/* Last Updated */}
        <p className="mt-16 text-xs text-gray-500 tracking-wide">Last Updated: March 4, 2026</p>
      </div>
    </main>
  );
}
