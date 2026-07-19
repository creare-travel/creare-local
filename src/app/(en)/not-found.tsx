import type { Metadata } from 'next';
import NotFoundClient from '@/app/NotFoundClient';
import { getDictionary } from '@/lib/i18n/dictionaries';

export const metadata: Metadata = {
  title: { absolute: '404' },
  description: '404',
  robots: { index: false },
  openGraph: {
    title: '404',
    description: '404',
    siteName: 'Creare',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '404',
    description: '404',
  },
};

export default function NotFound() {
  return <NotFoundClient copy={getDictionary('en').notFound} homeHref="/" />;
}
