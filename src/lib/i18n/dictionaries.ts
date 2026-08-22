import enDictionary from '@/locales/en.json';
import trDictionary from '@/locales/tr.json';
import zhDictionary from '@/locales/zh.json';
import type { SiteLocale } from './config';
import type { Dictionary } from './types';

const dictionaries = {
  en: enDictionary,
  tr: trDictionary satisfies Dictionary,
  zh: zhDictionary satisfies Dictionary,
} as const satisfies Record<SiteLocale, Dictionary>;

export function getDictionary(locale: SiteLocale): Dictionary {
  return dictionaries[locale];
}
