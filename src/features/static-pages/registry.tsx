import type { ReactNode } from 'react';
import ContactPageClient from '@/app/contact/ContactPageClient';
import {
  ChineseLegalPage,
  ChinesePhilosophyPage,
  chineseCookiesContent,
  chinesePrivacyContent,
  chineseTermsContent,
} from '@/features/static-pages/chinese';
import type { LocaleKey, SiteLocale } from '@/lib/i18n/config';

export type LocalizedStaticPagePath =
  | '/contact'
  | '/philosophy'
  | '/privacy'
  | '/cookies'
  | '/terms';

type StaticPageRenderer = (locale: LocaleKey) => ReactNode | Promise<ReactNode>;

// Locale-owned static content is registered here when its copy has been approved.
const GENERIC_STATIC_PAGE_RENDERERS: Partial<
  Record<LocaleKey, Partial<Record<LocalizedStaticPagePath, StaticPageRenderer>>>
> = {
  zh: {
    '/contact': () => <ContactPageClient locale="zh" successRedirectHref={null} />,
    '/philosophy': () => <ChinesePhilosophyPage />,
    '/privacy': () => <ChineseLegalPage content={chinesePrivacyContent} />,
    '/cookies': () => <ChineseLegalPage content={chineseCookiesContent} />,
    '/terms': () => <ChineseLegalPage content={chineseTermsContent} />,
  },
};

export function hasLocalizedStaticPageRenderer(
  locale: LocaleKey,
  path: string
): path is LocalizedStaticPagePath {
  return Boolean(GENERIC_STATIC_PAGE_RENDERERS[locale]?.[path as LocalizedStaticPagePath]);
}

export async function renderRegisteredStaticPage(
  locale: SiteLocale,
  path: LocalizedStaticPagePath
): Promise<ReactNode | null> {
  const renderer = GENERIC_STATIC_PAGE_RENDERERS[locale]?.[path];
  return renderer ? renderer(locale) : null;
}
