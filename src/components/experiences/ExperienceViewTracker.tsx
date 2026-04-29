'use client';

import { useEffect, useRef } from 'react';
import { trackExperienceView } from '@/lib/analytics/tracking';

interface ExperienceViewTrackerProps {
  slug: string;
  title: string;
  category: string;
}

/**
 * Fires experience_view once per mount.
 * Includes page_path and source so the event is fully attributed in GA4.
 */
export default function ExperienceViewTracker({
  slug,
  title,
  category,
}: ExperienceViewTrackerProps) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return; // prevent duplicate firing on StrictMode double-invoke
    fired.current = true;
    trackExperienceView({
      experience_slug: slug,
      experience_title: title,
      experience_category: category,
      source: 'experience_page',
    });
  }, [slug, title, category]);

  return null;
}
