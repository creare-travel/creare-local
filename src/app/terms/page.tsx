import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Use',
  description:
    'CREARE terms of use — the terms and conditions governing use of our website and services.',
  alternates: { canonical: 'https://crearetravel.com/terms' },
};

interface PolicySection {
  number: number;
  heading: string;
  body: string;
}

const termsSections: PolicySection[] = [
  {
    number: 1,
    heading: 'Acceptance of Terms',
    body: 'By accessing and using the CREARE website and services, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to these terms, please do not use our services.',
  },
  {
    number: 2,
    heading: 'Use of Services',
    body: 'CREARE provides experience design, event management, and luxury concierge services to select clients. Our services are provided on an invitation or inquiry basis. We reserve the right to refuse service to anyone for any reason at any time.',
  },
  {
    number: 3,
    heading: 'Intellectual Property',
    body: 'All content on this website, including text, graphics, logos, images, and software, is the property of CREARE and is protected by international copyright and trademark laws. You may not reproduce, distribute, or create derivative works from our content without explicit written permission.',
  },
  {
    number: 4,
    heading: 'Confidentiality',
    body: 'CREARE operates with the highest standards of discretion. All client information, inquiries, and service details are treated as strictly confidential. We expect the same level of discretion from our clients regarding our proprietary methods and business practices.',
  },
  {
    number: 5,
    heading: 'Limitation of Liability',
    body: 'CREARE shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use or inability to use our services. Our total liability to you for any claim arising from your use of our services shall not exceed the amount you paid for those services.',
  },
  {
    number: 6,
    heading: 'Modifications to Terms',
    body: 'We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting to this page. Your continued use of our services after any such changes constitutes your acceptance of the new terms.',
  },
  {
    number: 7,
    heading: 'Governing Law',
    body: 'These terms shall be governed by and construed in accordance with applicable international laws. Any disputes arising from these terms or your use of our services shall be resolved through binding arbitration in accordance with international arbitration rules.',
  },
  {
    number: 8,
    heading: 'Contact Information',
    body: 'For any questions regarding these Terms of Use, please contact us through our official contact channels. We are committed to addressing your concerns promptly and professionally.',
  },
];

export default function TermsPage() {
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
            TERMS
          </span>
        </nav>

        {/* Terms Sections */}
        <div className="flex flex-col gap-12">
          {termsSections.map((section) => (
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
