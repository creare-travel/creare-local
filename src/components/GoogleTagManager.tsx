'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import {
  GTM_ID,
  buildGtmScript,
  ensureDataLayer,
  isGtmEnabled,
  pushDataLayerEvent,
} from '@/lib/analytics/gtm';

const GTM_FALLBACK_DELAY_MS = 5000;
let gtmLoadRequested = false;

function requestGtmLoad() {
  if (gtmLoadRequested || typeof window === 'undefined' || !isGtmEnabled()) return;

  gtmLoadRequested = true;
  ensureDataLayer();

  const bootstrap = document.createElement('script');
  bootstrap.id = 'gtm-init';
  bootstrap.text = buildGtmScript(GTM_ID);
  document.head.appendChild(bootstrap);
}

function DeferredGtmLoader() {
  useEffect(() => {
    if (!isGtmEnabled()) return;

    // Keep analytics events queued immediately, while moving third-party JS
    // out of the critical rendering window. Engagement loads GTM sooner.
    ensureDataLayer();

    const interactionEvents: Array<keyof WindowEventMap> = [
      'pointerdown',
      'touchstart',
      'keydown',
      'scroll',
    ];

    const load = () => requestGtmLoad();
    const timer = window.setTimeout(load, GTM_FALLBACK_DELAY_MS);

    interactionEvents.forEach((eventName) => {
      window.addEventListener(eventName, load, { once: true, passive: true });
    });

    return () => {
      window.clearTimeout(timer);
      interactionEvents.forEach((eventName) => {
        window.removeEventListener(eventName, load);
      });
    };
  }, []);

  return null;
}

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
      <DeferredGtmLoader />
      <RouteChangeTracker />
    </>
  );
}
