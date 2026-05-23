import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import JsonLd from '@/components/JsonLd';
import { fetchStrapi } from '@/lib/strapi';
import { buildCanonicalUrl, buildExperienceListingGraph } from '@/lib/schema-builder';
import {
  buildMetadataAlternates,
  buildOpenGraph,
  buildTwitterCard,
  DEFAULT_OG_IMAGE,
  DEFAULT_OG_IMAGE_ALT,
  SITE_NAME,
} from '@/lib/seo';

const experiencesTitle = `Experiences — ${SITE_NAME}`;
const experiencesDescription =
  'CREARE structures its experience system through three distinct paths: Signature for curated cultural encounters, LAB for co-created commissions, and BLACK for discreet invitation-only access.';

export const metadata: Metadata = {
  title: experiencesTitle,
  description: experiencesDescription,
  alternates: buildMetadataAlternates('/experiences'),
  robots: { index: true, follow: true },
  openGraph: buildOpenGraph({
    title: experiencesTitle,
    description: experiencesDescription,
    path: '/experiences',
    image: DEFAULT_OG_IMAGE,
    imageAlt: DEFAULT_OG_IMAGE_ALT,
  }),
  twitter: buildTwitterCard({
    title: experiencesTitle,
    description: experiencesDescription,
    image: DEFAULT_OG_IMAGE,
    imageAlt: DEFAULT_OG_IMAGE_ALT,
  }),
};

interface CollectionFeature {
  label: string;
  title: string;
  description: string;
  distinction: string;
  href: '/experiences/signature' | '/experiences/lab' | '/experiences/black';
  image: string;
  alt: string;
}

const collectionFeatures: CollectionFeature[] = [
  {
    label: 'Signature',
    title: 'Curated cultural experiences.',
    description:
      'Composed, tested, and ready to be lived. Signature experiences are CREARE encounters already resolved into a clear cultural form.',
    distinction: 'For guests seeking editorial precision and cultural clarity.',
    href: '/experiences/signature',
    image: 'https://images.unsplash.com/photo-1574624779046-a3839ec6a1a0',
    alt: 'Golden light over ancient stone ruins and sculpted landscape',
  },
  {
    label: 'LAB',
    title: 'Co-created from the brief.',
    description:
      'LAB is the custom design layer. The experience is not selected from a catalogue; it is developed through conversation, context, and intent.',
    distinction: 'For guests who need a cultural composition built specifically for them.',
    href: '/experiences/lab',
    image: 'https://images.unsplash.com/photo-1709070602367-6abc862c0bdb',
    alt: 'Abstract architectural composition in black and white with sculptural geometry',
  },
  {
    label: 'BLACK',
    title: 'Discreet invitation-only access.',
    description:
      'BLACK is reserved for private arrangements that rely on trust, discretion, and relationships not intended for open circulation.',
    distinction: 'For situations where access itself must remain controlled.',
    href: '/experiences/black',
    image: 'https://img.rocket.new/generatedImages/rocket_gen_img_1af98daa8-1774703433034.png',
    alt: 'Dark dramatic landscape under a starlit night sky',
  },
];

interface StrapiExperience {
  id: number;
  documentId?: string;
  title: string;
  short_description?: string;
  slug?: string;
}

async function fetchPublishedExperiences(): Promise<StrapiExperience[]> {
  try {
    const json = await fetchStrapi(
      '/api/experiences?fields[0]=title&fields[1]=slug&fields[2]=short_description&pagination[pageSize]=12'
    );
    return Array.isArray(json?.data) ? json.data : [];
  } catch {
    return [];
  }
}

export default async function ExperiencesPage() {
  const publishedExperiences = await fetchPublishedExperiences();
  const experiencesSchema = buildExperienceListingGraph({
    pageId: `${buildCanonicalUrl('/experiences')}#collection`,
    itemListId: `${buildCanonicalUrl('/experiences')}#itemlist`,
    breadcrumbId: `${buildCanonicalUrl('/experiences')}#breadcrumbs`,
    path: buildCanonicalUrl('/experiences'),
    title: 'Experiences',
    description: experiencesDescription,
    breadcrumbs: [
      { name: 'Home', url: buildCanonicalUrl('/') },
      { name: 'Experiences', url: buildCanonicalUrl('/experiences') },
    ],
    items: collectionFeatures.map((feature) => ({
      title: feature.label,
      url: buildCanonicalUrl(feature.href),
      description: feature.description,
      category: feature.label,
    })),
  });

  return (
    <main className="min-h-screen bg-black text-white">
      <JsonLd id="experiences-collection-jsonld" schema={experiencesSchema} />

      <section className="relative flex min-h-[72vh] items-end overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1537323822027-a25caf00a917"
            alt="Winding coastal road passing through a mountainous landscape at golden hour"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/20" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-20 pt-36 sm:px-10 lg:px-16">
          <p className="mb-6 font-body text-[0.6rem] uppercase tracking-[0.32em] text-white/32">
            CREARE Experience Architecture
          </p>
          <h1
            className="max-w-4xl font-display font-light leading-[1.05] text-white"
            style={{ fontSize: 'clamp(2.8rem, 6vw, 5.8rem)' }}
          >
            Experiences
          </h1>
          <p className="mt-8 max-w-2xl font-body text-sm leading-relaxed text-white/58 sm:text-[0.95rem]">
            CREARE does not treat experience as a single product type. The system is structured
            through three distinct paths: curated cultural encounters, co-created commissions, and
            discreet access reserved for the right context.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 sm:px-10 md:py-24 lg:px-16">
        <div className="grid gap-10 border-t border-white/10 pt-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          <div>
            <p className="mb-6 font-body text-[0.6rem] uppercase tracking-[0.28em] text-white/32">
              The Parent Collection
            </p>
            <p
              className="max-w-2xl font-display font-light leading-relaxed text-white/88"
              style={{ fontSize: 'clamp(1.2rem, 2vw, 1.6rem)' }}
            >
              Each path reflects a different relationship between guest, place, and access.
              Signature begins with a composed encounter. LAB begins with a brief. BLACK begins
              where publication ends.
            </p>
          </div>

          <div className="space-y-5">
            <p className="font-body text-sm leading-relaxed text-white/56">
              This page is the parent taxonomy node for the CREARE experience system. It exists to
              clarify the logic of the collection rather than flatten it into a single commercial
              category.
            </p>
            <p className="font-body text-sm leading-relaxed text-white/40">
              The distinction matters for Google, for AI retrieval systems, and for clients trying
              to understand whether they are choosing a finished encounter, shaping a new one, or
              entering a more private tier of access.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-28 sm:px-10 lg:px-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {collectionFeatures.map((feature) => (
            <article key={feature.label} className="flex flex-col">
              <Link
                href={feature.href}
                className="group block"
                aria-label={`Explore ${feature.label}`}
              >
                <div className="relative aspect-[3/4] overflow-hidden">
                  <Image
                    src={feature.image}
                    alt={feature.alt}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/24 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-8">
                    <p className="mb-3 font-body text-[0.58rem] uppercase tracking-[0.28em] text-white/34">
                      {feature.label}
                    </p>
                    <h2 className="mb-3 font-display text-[1.8rem] font-light leading-tight text-white">
                      {feature.title}
                    </h2>
                    <p className="font-body text-sm leading-relaxed text-white/62">
                      {feature.description}
                    </p>
                    <span className="mt-6 inline-block font-body text-[0.62rem] uppercase tracking-[0.24em] text-white/48 transition-colors group-hover:text-white/82">
                      Enter →
                    </span>
                  </div>
                </div>
              </Link>
              <p className="mt-4 px-1 font-body text-xs leading-relaxed text-white/34">
                {feature.distinction}
              </p>
            </article>
          ))}
        </div>
      </section>

      {publishedExperiences.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 pb-32 sm:px-10 lg:px-16">
          <div className="border-t border-white/10 pt-14">
            <p className="mb-3 font-body text-[0.6rem] uppercase tracking-[0.28em] text-white/30">
              Published Experience Detail Pages
            </p>
            <h2 className="mb-10 font-display text-3xl font-light text-white">
              From the Collection
            </h2>
          </div>

          <ul className="divide-y divide-white/10">
            {publishedExperiences.map((item) => {
              const href = item.slug
                ? `/experiences/${item.slug}`
                : `/experiences/${item.documentId ?? item.id}`;

              return (
                <li key={item.id}>
                  <Link
                    href={href}
                    className="group flex flex-col justify-between gap-4 px-2 py-8 transition-colors hover:bg-white/[0.02] sm:flex-row sm:items-center -mx-2"
                  >
                    <div className="flex-1">
                      <h3 className="mb-2 font-display text-lg font-light text-white transition-colors group-hover:text-white/78">
                        {item.title}
                      </h3>
                      {item.short_description && (
                        <p className="max-w-2xl font-body text-sm leading-relaxed text-white/42">
                          {item.short_description}
                        </p>
                      )}
                    </div>
                    <span className="shrink-0 font-body text-[0.62rem] uppercase tracking-[0.22em] text-white/30 transition-colors group-hover:text-white/62">
                      View →
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </main>
  );
}
