import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import LocaleRootShell, {
  localeRootMetadata,
  localeRootViewport,
} from '@/components/layout/LocaleRootShell';
import { getGenericRouteLocale, getLocaleDescriptor } from '@/lib/i18n/config';

export const metadata = localeRootMetadata;
export const viewport = localeRootViewport;

export default async function GenericLocaleRootLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeKey } = await params;
  const locale = getGenericRouteLocale(localeKey);
  if (!locale) notFound();

  const descriptor = getLocaleDescriptor(locale);

  return (
    <html
      lang={descriptor.htmlLang}
      dir={descriptor.direction}
      data-locale={descriptor.key}
      data-script={descriptor.htmlLang}
    >
      <LocaleRootShell locale={locale}>{children}</LocaleRootShell>
    </html>
  );
}
