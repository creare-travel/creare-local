import type { ReactNode } from 'react';
import type { LocaleKey, SiteLocale } from '@/lib/i18n/config';

export type LocalizedStaticPagePath =
  | '/contact'
  | '/philosophy'
  | '/privacy'
  | '/cookies'
  | '/terms';

type StaticPageRenderer = (locale: SiteLocale) => ReactNode | Promise<ReactNode>;

// Locale-owned static content is registered here when its copy has been approved.
const GENERIC_STATIC_PAGE_RENDERERS: Partial<
  Record<LocaleKey, Partial<Record<LocalizedStaticPagePath, StaticPageRenderer>>>
> = {};

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
