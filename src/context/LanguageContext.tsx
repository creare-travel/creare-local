'use client';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { PUBLIC_SITE_LANG, PUBLIC_UI_LOCALE } from '@/lib/public-content';

export type Locale = 'en' | 'tr' | 'ru' | 'zh';

export const LOCALES: { code: Locale; label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'tr', label: 'TR' },
  { code: 'ru', label: 'RU' },
  { code: 'zh', label: 'ZH' },
];

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
  const [locale, setLocaleState] = useState<Locale>(PUBLIC_UI_LOCALE as Locale);
  const [translations, setTranslations] = useState<TranslationDict>({});

  useEffect(() => {
    const stored = localStorage.getItem('creare_locale') as Locale | null;
    if (stored === PUBLIC_UI_LOCALE) {
      setLocaleState(stored);
    }
  }, []);

  useEffect(() => {
    import(`../locales/${locale}.json`)
      .then((mod) => setTranslations(mod.default as TranslationDict))
      .catch(() => setTranslations({}));
  }, [locale]);

  const setLocale = useCallback((newLocale: Locale) => {
    const nextLocale = newLocale === 'tr' ? newLocale : (PUBLIC_UI_LOCALE as Locale);
    setLocaleState(nextLocale);
    localStorage.setItem('creare_locale', nextLocale);
    document.documentElement.lang = PUBLIC_SITE_LANG;
    document.documentElement.dir = 'ltr';
  }, []);

  useEffect(() => {
    document.documentElement.lang = PUBLIC_SITE_LANG;
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
