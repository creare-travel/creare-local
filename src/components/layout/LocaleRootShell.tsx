import React from 'react';
import { Suspense } from 'react';
import type { Metadata, Viewport } from 'next';
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
import { DEFAULT_METADATA, DEFAULT_OG_IMAGE, DEFAULT_OG_IMAGE_ALT } from '@/lib/seo';
import type { SiteLocale } from '@/lib/i18n/config';

const isMaintenanceMode = process.env.NEXT_PUBLIC_SITE_MODE === 'maintenance';

export const localeRootViewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const localeRootMetadata: Metadata = {
  metadataBase: DEFAULT_METADATA.metadataBase,
  title: {
    default: isMaintenanceMode ? 'CREARE — Under Construction' : DEFAULT_METADATA.defaultTitle,
    template: DEFAULT_METADATA.titleTemplate,
  },
  description: isMaintenanceMode
    ? 'CREARE is finalizing a private portfolio of experiences designed for a limited circle of clients.'
    : DEFAULT_METADATA.defaultDescription,
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
    title: isMaintenanceMode ? 'CREARE — Under Construction' : DEFAULT_METADATA.defaultTitle,
    description: isMaintenanceMode
      ? 'CREARE is finalizing a private portfolio of experiences designed for a limited circle of clients.'
      : 'Private cultural access. Thoughtfully designed encounters.',
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
    title: isMaintenanceMode ? 'CREARE — Under Construction' : DEFAULT_METADATA.defaultTitle,
    description: isMaintenanceMode
      ? 'CREARE is finalizing a private portfolio of experiences designed for a limited circle of clients.'
      : 'Private cultural access. Thoughtfully designed encounters.',
    images: [DEFAULT_OG_IMAGE],
  },
};

interface LocaleRootShellProps {
  children: React.ReactNode;
  locale: SiteLocale;
}

export default function LocaleRootShell({ children, locale }: LocaleRootShellProps) {
  const globalSchemaGraph = [buildOrganizationSchema(), buildBrandSchema(), buildWebSiteSchema()];

  return (
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
      <LanguageProvider initialLocale={locale}>
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
  );
}
