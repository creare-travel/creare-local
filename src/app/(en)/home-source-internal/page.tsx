import type { Metadata } from 'next';
import HomePage, { metadata as homeMetadata } from '@/features/i18n-pages/home';

export const revalidate = 300;

export const metadata: Metadata = {
  ...homeMetadata,
  title: { absolute: 'Creare — Experiences Composed as Art' },
};

export default HomePage;
