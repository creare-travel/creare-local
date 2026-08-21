import '../../styles/tailwind.css';
import type { Metadata, Viewport } from 'next';
import LocaleRootShell, {
  localeRootMetadata,
  localeRootViewport,
} from '@/components/layout/LocaleRootShell';
import { getLocaleDescriptor } from '@/lib/i18n/config';

export const viewport: Viewport = localeRootViewport;

export const metadata: Metadata = localeRootMetadata;

export default function EnglishRootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = getLocaleDescriptor('en');
  return (
    <html lang={locale.htmlLang} dir={locale.direction} data-locale={locale.key}>
      <head />
      <LocaleRootShell locale="en">{children}</LocaleRootShell>
    </html>
  );
}
