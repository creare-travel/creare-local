import { notFound, redirect } from 'next/navigation';

interface Props {
  params: Promise<{ slug: string }>;
}

const LEGACY_CULTURAL_WORLD_SLUGS = new Set(['istanbul', 'bodrum', 'cappadocia']);

export default async function LegacyDestinationPage({ params }: Props) {
  const { slug } = await params;

  if (!LEGACY_CULTURAL_WORLD_SLUGS.has(slug)) {
    notFound();
  }

  redirect(`/cultural-worlds/${slug}`);
}
