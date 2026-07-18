import type { Metadata } from 'next';
import NotFoundClient from './NotFoundClient';

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
  return <NotFoundClient />;
}
