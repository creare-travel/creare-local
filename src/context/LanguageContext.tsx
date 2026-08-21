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

type TranslationDict = Record<string, unknown>;

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

function getNestedValue(obj: TranslationDict, key: string): string {
  const parts = key.split('.');
  let current: unknown = obj;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in (current as Record<string, unknown>)) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return key;
    }
  }
  return typeof current === 'string' ? current : key;
}

interface LanguageProviderProps {
  children: React.ReactNode;
  initialLocale?: Locale;
}

export function LanguageProvider({ children, initialLocale }: LanguageProviderProps) {
  const pathname = usePathname();
  const pathnameLocale = getLocaleFromPathname(pathname ?? '/');
  const [locale, setLocaleState] = useState<Locale>(initialLocale ?? pathnameLocale);
  const [translations, setTranslations] = useState<TranslationDict>({});

  useEffect(() => {
    setLocaleState(pathnameLocale);
  }, [pathnameLocale]);

  useEffect(() => {
    import(`../locales/${locale}.json`)
      .then((mod) => setTranslations(mod.default as TranslationDict))
      .catch(() => setTranslations({}));
  }, [locale]);

  const setLocale = useCallback(
    (newLocale: Locale) => {
      localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);

      if (newLocale === pathnameLocale) {
        setLocaleState(newLocale);
      }
    },
    [pathnameLocale]
  );

  const t = useCallback(
    (key: string): string => {
      if (!translations || Object.keys(translations).length === 0) return key;
      const val = getNestedValue(translations, key);
      return val && val !== key ? val : key;
    },
    [translations]
  );

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
