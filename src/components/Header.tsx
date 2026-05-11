'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LanguageSelector from '@/components/LanguageSelector';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [lightSurface, setLightSurface] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const heroExitThreshold = Math.max(window.innerHeight - 140, window.innerHeight * 0.82);

      setScrolled(y > 32);
      setLightSurface(y > heroExitThreshold);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
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

  const logoTone = lightSurface ? 'text-[#1f1b18]' : 'text-white/88';
  const navTone = lightSurface ? 'text-[#3a342f]' : 'text-white/68';
  const navHoverTone = lightSurface ? 'hover:text-[#1f1b18]' : 'hover:text-white/92';
  const mobileTone = lightSurface ? 'text-[#3a342f]' : 'text-white/82';
  const mobileLinkTone = lightSurface
    ? 'text-[#3a342f] hover:text-[#1f1b18]'
    : 'text-white/72 hover:text-white';
  const mobileBorderTone = lightSurface ? 'border-black/[0.06]' : 'border-white/[0.05]';
  const mobileOverlayTone = lightSurface
    ? 'bg-[rgba(18,16,14,0.18)] backdrop-blur-[1.5px]'
    : 'bg-[rgba(6,7,8,0.34)] backdrop-blur-[2px]';

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-50 border-b transition-[background-color,border-color,backdrop-filter] duration-[var(--motion-standard)] ease-[var(--ease-luxury)] ${
        lightSurface
          ? 'border-black/[0.05] bg-[rgba(245,241,234,0.68)] backdrop-blur-[6px]'
          : scrolled
            ? 'border-white/[0.035] bg-[rgba(11,11,12,0.03)] backdrop-blur-[2px]'
            : 'border-white/[0.025] bg-[rgba(11,11,12,0.012)] backdrop-blur-[0.8px]'
      }`}
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
              className={`font-body text-[0.7rem] font-medium uppercase tracking-[0.2em] transition-colors duration-[var(--motion-hover)] ease-[var(--ease-luxury)] ${navTone} ${navHoverTone}`}
              aria-label={item?.label}
            >
              {item?.label}
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
                <path d="M4 4L18 18" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M18 4L4 18" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </>
            ) : (
              <>
                <path d="M3 6h16" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M3 11h16" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M3 16h16" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
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
                ? 'border-black/[0.05] bg-[rgba(245,241,234,0.8)] backdrop-blur-[6px]'
                : 'border-white/[0.03] bg-[rgba(11,11,12,0.075)] backdrop-blur-[5px]'
            }`}
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
