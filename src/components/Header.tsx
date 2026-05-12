'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LanguageSelector from '@/components/LanguageSelector';

export default function Header() {
  const [scrollDensity, setScrollDensity] = useState(0);
  const [headerState, setHeaderState] = useState<'hero' | 'light'>('hero');
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;

      ticking = true;
      window.requestAnimationFrame(() => {
        const y = window.scrollY;
        const threshold = window.innerHeight * 0.75;
        const density = Math.min(y / 80, 1);

        setScrollDensity(density);
        setHeaderState(y < threshold ? 'hero' : 'light');
        ticking = false;
      });
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const navLinks = [
    { label: 'Destinations', href: '/cultural-worlds' },
    { label: 'Insights', href: '/insights' },
    { label: 'Philosophy', href: '/philosophy' },
    { label: 'Contact', href: '/contact' },
  ];

  const lightSurface = headerState === 'light';
  const logoTone = lightSurface ? 'text-[#1f1b18]' : 'text-white/88';
  const navTone = lightSurface ? 'text-[#2c2825]/90' : 'text-white/85';
  const navHoverTone = lightSurface ? 'hover:text-[#1a1714]' : 'hover:text-white';
  const navUnderlineTone = lightSurface ? 'bg-[#2c2825]/60' : 'bg-white/70';
  const mobileTone = lightSurface ? 'text-[#1a1714]' : 'text-white';
  const mobileLinkTone = lightSurface
    ? 'text-[#3a342f] hover:text-[#1f1b18]'
    : 'text-white/72 hover:text-white';
  const mobileBorderTone = lightSurface ? 'border-black/[0.06]' : 'border-white/[0.05]';
  const mobileMenuBg = lightSurface ? 'rgba(247,246,244,0.92)' : 'rgba(0,0,0,0.055)';
  const mobileMenuBorder = lightSurface ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.03)';
  const mobileOverlayTone = lightSurface
    ? 'bg-[rgba(18,16,14,0.18)] backdrop-blur-[1.5px]'
    : 'bg-[rgba(6,7,8,0.34)] backdrop-blur-[2px]';

  const headerStyle = lightSurface
    ? {
        backgroundColor: `rgba(247,246,244,${(scrollDensity * 0.18).toFixed(3)})`,
        backdropFilter: `blur(${(scrollDensity * 3).toFixed(2)}px)`,
        boxShadow: `0 10px 34px rgba(0,0,0,${(scrollDensity * 0.04).toFixed(3)})`,
        transition:
          'background-color 600ms cubic-bezier(0.16,1,0.3,1), box-shadow 600ms cubic-bezier(0.16,1,0.3,1), color 400ms ease',
      }
    : {
        backgroundColor: `rgba(0,0,0,${(0.012 + scrollDensity * 0.032).toFixed(3)})`,
        backdropFilter: `blur(${(0.5 + scrollDensity * 3.5).toFixed(2)}px)`,
        boxShadow: 'none',
        transition:
          'background-color 600ms cubic-bezier(0.16,1,0.3,1), box-shadow 600ms cubic-bezier(0.16,1,0.3,1), color 400ms ease',
      };

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-50 border-b transition-[background-color,border-color,backdrop-filter] duration-[var(--motion-standard)] ease-[var(--ease-luxury)] ${
        lightSurface ? 'border-black/[0.05]' : 'border-white/[0.025]'
      }`}
      style={headerStyle}
    >
      <nav
        className="max-w-7xl mx-auto flex h-16 items-center justify-between px-6 pt-[max(env(safe-area-inset-top),0px)] sm:px-10 lg:px-16"
        aria-label="Main navigation"
      >
        <Link
          href="/"
          className="group flex flex-shrink-0 items-center"
          aria-label="CREARE — Return to homepage"
        >
          <span
            className={`font-body text-sm font-semibold uppercase tracking-[0.24em] transition-colors duration-[var(--motion-hover)] ease-[var(--ease-luxury)] ${
              lightSurface ? 'group-hover:text-[#1a1714]' : 'group-hover:text-white'
            } ${logoTone}`}
          >
            CREARE
          </span>
        </Link>

        <div className="hidden items-center gap-9 lg:flex">
          {navLinks?.map((item) => (
            <Link
              key={item?.label}
              href={item?.href}
              className={`group/nav relative font-body text-[0.7rem] font-medium uppercase tracking-[0.2em] transition-colors duration-500 ${navTone} ${navHoverTone}`}
              aria-label={item?.label}
            >
              {item?.label}
              <span
                className={`absolute left-0 -bottom-px h-px w-0 transition-all duration-[400ms] ease-out group-hover/nav:w-full ${navUnderlineTone}`}
              />
            </Link>
          ))}
          <LanguageSelector />
        </div>

        <button
          className={`p-2 transition-[color,opacity] duration-[var(--motion-hover)] ease-[var(--ease-luxury)] active:opacity-75 lg:hidden ${
            lightSurface ? 'hover:text-[#1f1b18]' : 'hover:text-white'
          } ${mobileTone}`}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileOpen}
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
            {mobileOpen ? (
              <>
                <path
                  d="M4 4L18 18"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  d="M18 4L4 18"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </>
            ) : (
              <>
                <path d="M3 6h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M3 11h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M3 16h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </>
            )}
          </svg>
        </button>
      </nav>
      {mobileOpen && (
        <>
          <button
            type="button"
            className={`fixed inset-0 z-0 transition-[background-color,backdrop-filter,opacity] duration-[var(--motion-standard)] ease-[var(--ease-luxury)] lg:hidden ${mobileOverlayTone}`}
            aria-label="Close navigation menu overlay"
            onClick={() => setMobileOpen(false)}
          />
          <div
            className={`relative z-10 border-t px-6 py-6 transition-[background-color,border-color,backdrop-filter,opacity] duration-[var(--motion-standard)] ease-[var(--ease-luxury)] lg:hidden sm:px-10 ${
              lightSurface
                ? 'border-black/[0.05] backdrop-blur-[6px]'
                : 'border-white/[0.03] backdrop-blur-[5px]'
            }`}
            style={{
              backgroundColor: mobileMenuBg,
              borderTopColor: mobileMenuBorder,
            }}
            role="navigation"
            aria-label="Mobile navigation"
          >
            {navLinks?.map((item) => (
              <Link
                key={item?.label}
                href={item?.href}
                className={`block border-b py-3.5 font-body text-[0.68rem] uppercase tracking-[0.16em] transition-[color,opacity,border-color] duration-[var(--motion-hover)] ease-[var(--ease-luxury)] active:opacity-70 ${mobileLinkTone} ${mobileBorderTone}`}
                onClick={() => setMobileOpen(false)}
                aria-label={item?.label}
              >
                {item?.label}
              </Link>
            ))}
            <div className="pt-5">
              <LanguageSelector />
            </div>
          </div>
        </>
      )}
    </header>
  );
}
