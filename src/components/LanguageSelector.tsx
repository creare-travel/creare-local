'use client';
import React, { useState, useRef, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useLanguage, LOCALES } from '@/context/LanguageContext';
import type { SiteLocale } from '@/lib/i18n/config';
import { resolveLocaleSwitchTarget } from '@/lib/i18n/locale-switch';

export default function LanguageSelector() {
  const { locale, setLocale } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pendingLocale, setPendingLocale] = useState<SiteLocale | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const switchIdRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      abortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    switchIdRef.current += 1;
    setPendingLocale(null);
  }, [pathname]);

  const handleSelectLocale = async (code: SiteLocale) => {
    setOpen(false);

    if (code === locale) {
      return;
    }

    setLocale(code);

    abortRef.current?.abort();
    const abortController = new AbortController();
    abortRef.current = abortController;
    const switchId = switchIdRef.current + 1;
    switchIdRef.current = switchId;
    setPendingLocale(code);

    try {
      const resolution = await resolveLocaleSwitchTarget({
        hash: window.location.hash,
        origin: window.location.origin,
        pathname: pathname ?? '/',
        search: window.location.search,
        signal: abortController.signal,
        targetLocale: code,
      });

      if (
        !mountedRef.current ||
        abortController.signal.aborted ||
        switchIdRef.current !== switchId
      ) {
        return;
      }

      const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      if (resolution.targetPath !== currentPath) {
        router.push(resolution.targetPath);
      } else {
        setPendingLocale(null);
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return;
      }

      if (mountedRef.current && switchIdRef.current === switchId) {
        setPendingLocale(null);
      }
    }
  };

  return (
    <div
      ref={ref}
      className="relative"
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          setOpen(false);
        }
      }}
    >
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="font-body font-medium tracking-[0.18em] text-xs uppercase text-white/60 hover:text-white transition-colors duration-300 flex items-center gap-1.5"
        aria-label="Select language"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        {locale.toUpperCase()}
        <svg
          width="8"
          height="5"
          viewBox="0 0 8 5"
          fill="none"
          aria-hidden="true"
          className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        >
          <path
            d="M1 1L4 4L7 1"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Language options"
          className="absolute right-0 top-full mt-3 bg-black border border-white/10 min-w-[72px] py-1 z-50"
        >
          {LOCALES.map(({ code, label }) => (
            <li key={code} role="option" aria-selected={locale === code}>
              <button
                onClick={() => void handleSelectLocale(code)}
                disabled={pendingLocale !== null}
                className={`w-full text-left px-4 py-2 font-body text-xs tracking-[0.18em] uppercase transition-colors duration-200 ${
                  locale === code ? 'text-white' : 'text-white/50 hover:text-white/90'
                }`}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
