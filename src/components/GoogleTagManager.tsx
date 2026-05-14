'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { GTM_ID, buildGtmScript, isGtmEnabled, pushDataLayerEvent } from '@/lib/analytics/gtm';

function RouteChangeTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTracked = useRef<string>('');

  useEffect(() => {
    if (!isGtmEnabled()) return;

    const qs = searchParams?.toString();
    const url = pathname + (qs ? `?${qs}` : '');
    if (url === lastTracked.current) return;

    lastTracked.current = url;
    pushDataLayerEvent({
      event: 'page_view',
      page_path: url,
    });
  }, [pathname, searchParams]);

  return null;
}

export default function GoogleTagManager() {
  if (!isGtmEnabled()) return null;

  return (
    <>
      <Script id="gtm-init" strategy="afterInteractive">
        {buildGtmScript(GTM_ID)}
      </Script>
      <RouteChangeTracker />
    </>
  );
}
