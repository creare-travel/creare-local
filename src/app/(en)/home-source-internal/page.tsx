import HomePage from '@/features/i18n-pages/home';
import HomeShellTemplates from '@/components/HomeShellTemplates';
import { metadata as homeMetadata } from '@/features/i18n-pages/home';
export const metadata = {
  ...homeMetadata,
  title: { absolute: 'Creare — Experiences Composed as Art' },
};
export const revalidate = 300;
export default function SourcePage() {
  return (
    <>
      <HomePage />
      <HomeShellTemplates />
    </>
  );
}
