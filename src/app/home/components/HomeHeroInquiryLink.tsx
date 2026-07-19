'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { SiteLocale } from '@/lib/i18n/config';
import { DEFAULT_SITE_LOCALE } from '@/lib/i18n/config';
import { getPrivateInquiryHref } from '@/lib/i18n/static-routes';
import { trackCtaClick } from '@/lib/analytics/tracking';

interface HomeHeroInquiryLinkProps {
  label?: string;
  labelWithArrow?: string;
  locale?: SiteLocale;
}

export default function HomeHeroInquiryLink({
  label = 'INQUIRE PRIVATELY',
  labelWithArrow = 'Inquire Privately →',
  locale = DEFAULT_SITE_LOCALE,
}: HomeHeroInquiryLinkProps) {
  const pathname = usePathname();
  const href = getPrivateInquiryHref(locale);

  if (!href) return null;

  return (
    <Link
      href={href}
      prefetch={false}
      onClick={() =>
        trackCtaClick({
          label,
          page_path: pathname,
          source: 'home_hero',
          cta_position: 'hero',
        })
      }
      className="hero-cta group/cta motion-link inline-flex min-h-11 items-center font-body text-[0.62rem] uppercase tracking-[0.24em] text-white/74 hover:text-white/92 sm:tracking-[0.3em]"
      aria-label="Inquire privately about CREARE experiences"
    >
      <span className="relative inline-block">
        {labelWithArrow}
        <span className="absolute -bottom-px left-0 h-px w-0 bg-white/60 transition-[width,opacity] duration-[var(--motion-standard)] ease-[var(--ease-luxury)] group-hover/cta:w-full" />
      </span>
    </Link>
  );
}
