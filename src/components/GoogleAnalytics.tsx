'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { trackPageView } from '@/lib/analytics/tracking';

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

/**
 * Inner component that reads searchParams — must be wrapped in <Suspense>.
 * Fires a page_view on every App Router route change (pathname or query change).
 * De-duplicated via lastTracked ref so it never fires twice for the same URL.
 */
function RouteChangeTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTracked = useRef<string>('');

  useEffect(() => {
    const qs = searchParams?.toString();
    const url = pathname + (qs ? `?${qs}` : '');
    if (url === lastTracked?.current) return; // prevent duplicate firing
    lastTracked.current = url;
    trackPageView(url);
  }, [pathname, searchParams]);

  return null;
}

export default function GoogleAnalytics() {
  if (!GA_ID) return null;

  return (
    <>
      {/* Load the GA4 script */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />

      {/* Initialize GA4 — page_path set to current pathname at load time */}
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', {
            page_path: window.location.pathname,
            send_page_view: false
          });
        `}
      </Script>

      {/* Route-change tracker — Suspense required by Next.js App Router */}
      <RouteChangeTracker />
    </>
  );
}
