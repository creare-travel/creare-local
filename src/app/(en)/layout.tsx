import '../../styles/tailwind.css';
import type { Metadata, Viewport } from 'next';
import LocaleRootShell, {
  localeRootMetadata,
  localeRootViewport,
} from '@/components/layout/LocaleRootShell';

export const viewport: Viewport = localeRootViewport;

export const metadata: Metadata = localeRootMetadata;

export default function EnglishRootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head />
      <LocaleRootShell locale="en">{children}</LocaleRootShell>
    </html>
  );
}
