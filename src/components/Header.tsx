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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'bg-black/95 backdrop-blur-md' : 'bg-black'
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
          <span className="text-white font-body font-semibold tracking-[0.22em] text-sm uppercase">
            CREARE
          </span>
        </Link>

        {/* Desktop navigation */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks?.map((item) => (
            <Link
              key={item?.label}
              href={item?.href}
              className="font-body font-medium tracking-[0.18em] text-xs uppercase text-white/80 hover:text-white transition-colors duration-300"
              aria-label={item?.label}
            >
              {item?.label}
            </Link>
          ))}
          <LanguageSelector />
        </div>

        {/* Mobile hamburger */}
        <button
          className="lg:hidden text-white p-2"
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
          className="lg:hidden bg-black border-t border-white/10 px-6 sm:px-10 py-6"
          role="navigation"
          aria-label="Mobile navigation"
        >
          {navLinks?.map((item) => (
            <Link
              key={item?.label}
              href={item?.href}
              className="block py-3 font-body text-xs tracking-[0.15em] uppercase text-white/80 hover:text-white transition-colors border-b border-white/5"
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
