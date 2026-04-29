'use client';

import { useEffect, useRef } from 'react';
import { trackEvent } from '@/lib/analytics/tracking';

interface CulturalWorldViewTrackerProps {
  location: string;
}

export default function CulturalWorldViewTracker({ location }: CulturalWorldViewTrackerProps) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    trackEvent('cultural_world_view', {
      page_path: window.location.pathname,
      location,
    });
  }, [location]);

  return null;
}
