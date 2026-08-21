import type { Metadata } from 'next';
import NotFoundClient from '@/app/NotFoundClient';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { getOpenGraphLocale } from '@/lib/seo';
import { localizePathname } from '@/lib/i18n/pathname';

export const metadata: Metadata = {
  title: { absolute: '404' },
  description: '404',
  robots: { index: false },
  openGraph: {
    title: '404',
    description: '404',
    siteName: 'Creare',
    type: 'website',
    locale: getOpenGraphLocale('tr'),
  },
  twitter: {
    card: 'summary',
    title: '404',
    description: '404',
  },
};

export default function TurkishNotFound() {
  return (
    <NotFoundClient copy={getDictionary('tr').notFound} homeHref={localizePathname('/', 'tr')} />
  );
}
