import '../styles/tailwind.css';
import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Suspense } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import GoogleTagManager from '@/components/GoogleTagManager';
import UnderConstruction from '@/components/UnderConstruction';
import { LanguageProvider } from '@/context/LanguageContext';
import JsonLd from '@/components/JsonLd';
import { GTM_ID, isGtmEnabled } from '@/lib/analytics/gtm';
import {
  buildBrandSchema,
  buildOrganizationSchema,
  buildWebSiteSchema,
} from '@/lib/schema-builder';
import { DEFAULT_OG_IMAGE, DEFAULT_OG_IMAGE_ALT } from '@/lib/seo';
import { PUBLIC_SITE_LANG } from '@/lib/public-content';

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
      : 'Creare — Kültürel Karşılaşmalar Bir Sanat Eseri Gibi Tasarlanır',
    template: '%s — Creare',
  },
  description: isMaintenanceMode
    ? 'CREARE is finalizing a private portfolio of experiences designed for a limited circle of clients.'
    : 'Creare, Türkiye ve ötesinde özel kültürel karşılaşmaları erişim, anlatı ve kürasyon aracılığıyla tasarlar.',
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
      : 'Creare — Kültürel Karşılaşmalar Bir Sanat Eseri Gibi Tasarlanır',
    description: isMaintenanceMode
      ? 'CREARE is finalizing a private portfolio of experiences designed for a limited circle of clients.'
      : 'Özel kültürel erişim. Dikkatle tasarlanmış karşılaşmalar.',
    url: 'https://crearetravel.com',
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: DEFAULT_OG_IMAGE_ALT,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: isMaintenanceMode
      ? 'CREARE — Under Construction'
      : 'Creare — Kültürel Karşılaşmalar Bir Sanat Eseri Gibi Tasarlanır',
    description: isMaintenanceMode
      ? 'CREARE is finalizing a private portfolio of experiences designed for a limited circle of clients.'
      : 'Özel kültürel erişim. Dikkatle tasarlanmış karşılaşmalar.',
    images: [DEFAULT_OG_IMAGE],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const globalSchemaGraph = [buildOrganizationSchema(), buildBrandSchema(), buildWebSiteSchema()];

  return (
    <html lang={PUBLIC_SITE_LANG}>
      <head />
      <body className="bg-black text-white antialiased">
        {isGtmEnabled() ? (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        ) : null}
        <Suspense fallback={null}>
          <GoogleTagManager />
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
