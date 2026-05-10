import '../styles/tailwind.css';
import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Suspense } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import UnderConstruction from '@/components/UnderConstruction';
import { LanguageProvider } from '@/context/LanguageContext';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import JsonLd from '@/components/JsonLd';
import {
  buildBrandSchema,
  buildOrganizationSchema,
  buildWebSiteSchema,
} from '@/lib/schema-builder';

const isMaintenanceMode = process.env.NEXT_PUBLIC_SITE_MODE === 'maintenance';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://crearetravel.com'),
  title: {
    default: isMaintenanceMode
      ? 'CREARE — Under Construction'
      : 'Creare — Experiences Composed as Art',
    template: '%s — Creare',
  },
  description: isMaintenanceMode
    ? 'CREARE is finalizing a private portfolio of experiences designed for a limited circle of clients.'
    : 'Creare curates private cultural encounters across Turkey and beyond — monastery access, atelier visits, and extraordinary moments for discerning clients.',
  alternates: {
    canonical: 'https://crearetravel.com',
  },
  robots: {
    index: !isMaintenanceMode,
    follow: !isMaintenanceMode,
    googleBot: {
      index: !isMaintenanceMode,
      follow: !isMaintenanceMode,
    },
  },
  icons: {
    icon: [{ url: '/favicon.ico', type: 'image/x-icon' }],
    shortcut: '/favicon.ico',
  },
  openGraph: {
    type: 'website',
    siteName: 'Creare',
    title: isMaintenanceMode
      ? 'CREARE — Under Construction'
      : 'Creare — Experiences Composed as Art',
    description: isMaintenanceMode
      ? 'CREARE is finalizing a private portfolio of experiences designed for a limited circle of clients.'
      : 'Private cultural access. Thoughtfully designed encounters.',
    url: 'https://crearetravel.com',
    images: [
      {
        url: 'https://img.rocket.new/generatedImages/rocket_gen_img_167773a44-1775598260952.png',
        width: 1200,
        height: 630,
        alt: 'Creare — Private Cultural Experiences Composed as Art',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: isMaintenanceMode
      ? 'CREARE — Under Construction'
      : 'Creare — Experiences Composed as Art',
    description: isMaintenanceMode
      ? 'CREARE is finalizing a private portfolio of experiences designed for a limited circle of clients.'
      : 'Private cultural access. Thoughtfully designed encounters.',
    images: ['https://crearetravel.com/og/default.jpg'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const globalSchemaGraph = [buildOrganizationSchema(), buildBrandSchema(), buildWebSiteSchema()];

  return (
    <html lang="en">
      <head>
        {/* Preconnect to external image CDNs for faster LCP */}
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://img.rocket.new" />
      </head>
      <body className="bg-black text-white antialiased">
        <Suspense fallback={null}>
          <GoogleAnalytics />
        </Suspense>
        <JsonLd id="global-schema-jsonld" schema={globalSchemaGraph} />
        <LanguageProvider>
          {isMaintenanceMode ? (
            <UnderConstruction />
          ) : (
            <>
              <Header />
              {children}
              <Footer />
            </>
          )}
        </LanguageProvider>
      </body>
    </html>
  );
}
