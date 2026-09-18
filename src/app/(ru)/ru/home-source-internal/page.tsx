import HomePage from '../page';
import HomeShellTemplates from '@/components/HomeShellTemplates';
export { metadata } from '../page';
export const revalidate = 300;
export default function SourcePage() {
  return (
    <>
      <HomePage />
      <HomeShellTemplates />
    </>
  );
}
