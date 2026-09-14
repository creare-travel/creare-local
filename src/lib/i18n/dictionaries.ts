import enDictionary from '@/locales/en.json';
import trDictionary from '@/locales/tr.json';
import zhDictionary from '@/locales/zh.json';
import ruDictionary from '@/locales/ru.json';
import type { LocaleKey } from './config';
import type { Dictionary } from './types';

const dictionaries = {
  en: enDictionary,
  tr: trDictionary satisfies Dictionary,
  zh: zhDictionary satisfies Dictionary,
  ru: ruDictionary satisfies Dictionary,
} as const satisfies Record<LocaleKey, Dictionary>;

export function getDictionary(locale: LocaleKey): Dictionary {
  return dictionaries[locale];
}
