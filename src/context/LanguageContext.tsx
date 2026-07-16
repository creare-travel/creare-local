'use client';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  DEFAULT_SITE_LOCALE,
  LOCALE_OPTIONS,
  LOCALE_STORAGE_KEY,
  isSiteLocale,
  type SiteLocale,
} from '@/lib/i18n/config';

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

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_SITE_LOCALE);
  const [translations, setTranslations] = useState<TranslationDict>({});

  useEffect(() => {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (isSiteLocale(stored)) {
      setLocaleState(stored);
    }
  }, []);

  useEffect(() => {
    import(`../locales/${locale}.json`)
      .then((mod) => setTranslations(mod.default as TranslationDict))
      .catch(() => setTranslations({}));
  }, [locale]);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
    document.documentElement.lang = newLocale;
    document.documentElement.dir = 'ltr';
  }, []);

  const t = useCallback(
    (key: string): string => {
      if (!translations || Object.keys(translations).length === 0) return key;
      const val = getNestedValue(translations, key);
      return val && val !== key ? val : key;
    },
    [translations]
  );

  const dir: 'ltr' | 'rtl' = 'ltr';

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
