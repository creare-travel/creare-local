'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useLanguage, LOCALES, Locale } from '@/context/LanguageContext';

export default function LanguageSelector() {
  const { locale, setLocale } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
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
                onClick={() => {
                  setLocale(code as Locale);
                  setOpen(false);
                }}
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
