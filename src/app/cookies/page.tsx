import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { buildMetadataAlternates } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'CREARE cookie policy — how we use cookies and similar tracking technologies.',
  alternates: buildMetadataAlternates('/cookies'),
};

interface PolicySection {
  number: number;
  heading: string;
  body: React.ReactNode;
}

const cookieSections: PolicySection[] = [
  {
    number: 1,
    heading: 'What Are Cookies',
    body: 'Cookies are small text files that are placed on your device when you visit our website. They help us provide you with a better experience by remembering your preferences and understanding how you interact with our services.',
  },
  {
    number: 2,
    heading: 'How We Use Cookies',
    body: 'CREARE uses cookies to understand how visitors navigate our website, to remember your language preferences, and to analyze website traffic. We use both session cookies (which expire when you close your browser) and persistent cookies (which remain on your device until deleted or expired).',
  },
  {
    number: 3,
    heading: 'Types of Cookies We Use',
    body: (
      <>
        <span className="block mb-3">
          <strong>Essential Cookies:</strong> These cookies are necessary for the website to
          function properly. They enable core functionality such as security and network management.
        </span>
        <span className="block mb-3">
          <strong>Analytics Cookies:</strong> We use these cookies to understand how visitors
          interact with our website, helping us improve our services and user experience.
        </span>
        <span className="block">
          <strong>Preference Cookies:</strong> These cookies allow our website to remember
          information that changes the way the site behaves or looks, such as your preferred
          language.
        </span>
      </>
    ),
  },
  {
    number: 4,
    heading: 'Managing Cookies',
    body: 'You can control and manage cookies in various ways. Please note that removing or blocking cookies may impact your user experience and some functionality may no longer be available. Most browsers automatically accept cookies, but you can usually modify your browser settings to decline cookies if you prefer.',
  },
  {
    number: 5,
    heading: 'Changes to This Policy',
    body: 'We may update this Cookie Policy from time to time to reflect changes in technology, legislation, or our business operations. We encourage you to review this page periodically for the latest information on our cookie practices.',
  },
];

export default function CookiesPage() {
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
            COOKIES
          </span>
        </nav>

        {/* Cookie Sections */}
        <div className="flex flex-col gap-12">
          {cookieSections.map((section) => (
            <div key={section.number}>
              <h2 className="text-lg font-bold text-black mb-4 leading-snug">
                {section.number}. {section.heading}
              </h2>
              <div className="text-sm text-gray-800 leading-relaxed max-w-[680px]">
                {section.body}
              </div>
            </div>
          ))}
        </div>

        {/* Last Updated */}
        <p className="mt-16 text-xs text-gray-500 tracking-wide">Last Updated: March 4, 2026</p>
      </div>
    </main>
  );
}
