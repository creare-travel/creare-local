'use client';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import {
  LOCALE_OPTIONS,
  LOCALE_STORAGE_KEY,
  getLocaleDescriptor,
  type SiteLocale,
} from '@/lib/i18n/config';
import { getLocaleFromPathname } from '@/lib/i18n/pathname';

export type Locale = SiteLocale;

export const LOCALES = LOCALE_OPTIONS;

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
}

const LanguageContext = createContext<LanguageContextValue>({
  locale: 'en',
  setLocale: () => {},
  t: (key) => key,
  dir: 'ltr',
});

interface LanguageProviderProps {
  children: React.ReactNode;
  initialLocale?: Locale;
}

export function LanguageProvider({ children, initialLocale }: LanguageProviderProps) {
  const pathname = usePathname();
  const pathnameLocale = getLocaleFromPathname(pathname ?? '/');
  const [locale, setLocaleState] = useState<Locale>(initialLocale ?? pathnameLocale);

  useEffect(() => {
    setLocaleState(pathnameLocale);
  }, [pathnameLocale]);


  const setLocale = useCallback(
    (newLocale: Locale) => {
      localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);

      if (newLocale === pathnameLocale) {
        setLocaleState(newLocale);
      }
    },
    [pathnameLocale]
  );

  const t = useCallback((key: string) => key, []);

  const dir = getLocaleDescriptor(locale).direction;

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
