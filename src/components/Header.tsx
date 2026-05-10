'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LanguageSelector from '@/components/LanguageSelector';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
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

  return (
    <header
      className={`glass-level-1 fixed left-0 right-0 top-0 z-50 border-b transition-[background-color,border-color,backdrop-filter] duration-[var(--motion-standard)] ease-[var(--ease-luxury)] ${
        scrolled ? 'border-white/[0.05] bg-white/[0.045]' : 'border-white/[0.04] bg-white/[0.02]'
      }`}
    >
      <nav
        className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 h-16 flex items-center justify-between"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center group flex-shrink-0"
          aria-label="CREARE — Return to homepage"
        >
          <span className="font-body text-sm font-semibold uppercase tracking-[0.24em] text-white/90 transition-colors duration-[var(--motion-hover)] ease-[var(--ease-luxury)] group-hover:text-white">
            CREARE
          </span>
        </Link>

        {/* Desktop navigation */}
        <div className="hidden items-center gap-9 lg:flex">
          {navLinks?.map((item) => (
            <Link
              key={item?.label}
              href={item?.href}
              className="font-body text-[0.7rem] font-medium uppercase tracking-[0.2em] text-white/68 transition-colors duration-[var(--motion-hover)] ease-[var(--ease-luxury)] hover:text-white/92"
              aria-label={item?.label}
            >
              {item?.label}
            </Link>
          ))}
          <LanguageSelector />
        </div>

        {/* Mobile hamburger */}
        <button
          className="p-2 text-white/82 transition-colors duration-[var(--motion-hover)] ease-[var(--ease-luxury)] hover:text-white lg:hidden"
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
      {/* Mobile Menu */}
      {mobileOpen && (
        <div
          className="glass-level-2 border-t border-white/[0.05] px-6 py-6 lg:hidden sm:px-10"
          role="navigation"
          aria-label="Mobile navigation"
        >
          {navLinks?.map((item) => (
            <Link
              key={item?.label}
              href={item?.href}
              className="block border-b border-white/[0.05] py-3 font-body text-[0.7rem] uppercase tracking-[0.18em] text-white/72 transition-colors duration-[var(--motion-hover)] ease-[var(--ease-luxury)] hover:text-white"
              onClick={() => setMobileOpen(false)}
              aria-label={item?.label}
            >
              {item?.label}
            </Link>
          ))}
          <div className="pt-4">
            <LanguageSelector />
          </div>
        </div>
      )}
    </header>
  );
}
