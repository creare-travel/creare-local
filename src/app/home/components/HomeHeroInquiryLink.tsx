'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { trackCtaClick } from '@/lib/analytics/tracking';

export default function HomeHeroInquiryLink() {
  const pathname = usePathname();

  return (
    <Link
      href="/contact"
      prefetch={false}
      onClick={() =>
        trackCtaClick({
          label: 'ÖZEL OLARAK İLETİŞİME GEÇ',
          page_path: pathname,
          source: 'home_hero',
          cta_position: 'hero',
        })
      }
      className="hero-cta group/cta motion-link inline-flex min-h-11 items-center font-body text-[0.62rem] uppercase tracking-[0.24em] text-white/74 hover:text-white/92 sm:tracking-[0.3em]"
      aria-label="CREARE deneyimleri hakkında özel olarak iletişime geç"
    >
      <span className="relative inline-block">
        Özel Olarak İletişime Geç →
        <span className="absolute -bottom-px left-0 h-px w-0 bg-white/60 transition-[width,opacity] duration-[var(--motion-standard)] ease-[var(--ease-luxury)] group-hover/cta:w-full" />
      </span>
    </Link>
  );
}
