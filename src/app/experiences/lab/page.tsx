import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import JsonLd from '@/components/JsonLd';
import AppImage from '@/components/ui/AppImage';
import { filterPublicExperiences } from '@/lib/canonical-gates';
import { buildCanonicalUrl, buildExperienceListingGraph, listingIds } from '@/lib/schema-builder';
import { buildExperienceInquiryHref } from '@/lib/inquiry';
import { buildMetadataAlternates } from '@/lib/seo';
import { fetchPublicStrapi, isLocalAssetUrl, mediaUrl } from '@/lib/strapi';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'LAB™ — Tasarlanmış Komisyonlar',
  description:
    'Birlikte şekillenen, dinamik ve keşif odaklı. CREARE LAB™ kültürel deneyimlerin sohbetle başladığı yerdir.',
  alternates: buildMetadataAlternates('/experiences/lab'),
  robots: { index: true, follow: true },
  openGraph: {
    title: 'CREARE LAB™ — Tasarlanmış Komisyonlar',
    description: 'Birlikte şekillenen, dinamik ve keşif odaklı. Talebiniz etrafında biçimlenir.',
    url: 'https://crearetravel.com/experiences/lab',
  },
};

interface StrapiCoverImage {
  url?: string;
  alternativeText?: string;
  formats?: {
    medium?: { url?: string };
    small?: { url?: string };
  };
}

interface StrapiExperience {
  id: number;
  documentId?: string;
  title: string;
  slug: string;
  short_description?: string;
  category?: string;
  geo_experience_type?: string | null;
  mood?: string | null;
  intensity?: string | null;
  location_label?: string;
  duration?: string;
  destination?: {
    name?: string;
    slug?: string;
  };
  cover_image?: StrapiCoverImage | null;
  visibility_status?: string;
  publishedAt?: string | null;
}

function normalizeValue(value?: string | null) {
  return value?.trim().toLowerCase() ?? '';
}

function toTitleCase(value?: string | null) {
  if (!value) return '';

  return value
    .trim()
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

function formatIntensity(value?: string | null) {
  const normalized = normalizeValue(value);
  if (!normalized) return '';

  const intensityMap: Record<string, string> = {
    low: 'Düşük Yoğunluk',
    medium: 'Orta Yoğunluk',
    high: 'Yüksek Yoğunluk',
  };

  return intensityMap[normalized] ?? `${toTitleCase(value)} Yoğunluk`;
}

function getGeoMetadataLine(exp: StrapiExperience) {
  return [
    toTitleCase(exp.geo_experience_type),
    formatIntensity(exp.intensity),
    toTitleCase(exp.mood),
  ]
    .filter(Boolean)
    .join(' · ');
}

async function fetchLabExperiences(): Promise<StrapiExperience[]> {
  try {
    const json = await fetchPublicStrapi('/api/experiences?filters[category][$eqi]=lab&populate=*');
    const items: StrapiExperience[] = Array.isArray(json?.data) ? json.data : [];
    return filterPublicExperiences(items);
  } catch (error) {
    console.error('Failed to fetch LAB experiences from Strapi.', error);
    return [];
  }
}

export default async function LabPage() {
  const labExperiences = await fetchLabExperiences();
  const ids = listingIds('/experiences/lab');
  const labSchemaGraph = buildExperienceListingGraph({
    pageId: ids.collection,
    itemListId: ids.itemList,
    breadcrumbId: ids.breadcrumbs,
    path: ids.canonical,
    title: 'LAB Deneyimleri',
    description:
      'Birlikte şekillenen, dinamik ve keşif odaklı. CREARE LAB, kültürel deneyimlerin niyet etrafında sıfırdan tasarlandığı alandır.',
    breadcrumbs: [
      { name: 'Ana Sayfa', url: buildCanonicalUrl('/') },
      { name: 'Deneyimler', url: buildCanonicalUrl('/experiences') },
      { name: 'LAB Deneyimleri', url: ids.canonical },
    ],
    items: labExperiences.map((exp) => ({
      title: exp.title,
      slug: exp.slug,
      url: exp.slug ? buildCanonicalUrl(`/experiences/${exp.slug}`) : undefined,
      description: exp.short_description,
      image: exp.cover_image ?? undefined,
      category: exp.category,
      destinationName: exp.destination?.name ?? exp.location_label ?? null,
    })),
  });

  return (
    <>
      <JsonLd id="lab-collection-jsonld" schema={labSchemaGraph} />
      <main>
        {/* ── HERO — Split Layout ── */}
        <section
          className="relative w-full min-h-screen flex flex-col lg:flex-row"
          aria-label="CREARE LAB™ hero"
        >
          {/* Left — Content */}
          <div className="relative z-10 flex flex-col justify-center bg-[#EDEAE4] w-full lg:w-1/2 px-8 sm:px-12 lg:px-16 xl:px-20 py-24 lg:py-0 min-h-[60vh] lg:min-h-screen">
            <p className="font-body text-[0.6rem] tracking-[0.35em] text-neutral-500 uppercase mb-8">
              CREARE LAB™
            </p>
            <h1
              className="font-display font-light text-neutral-900 leading-tight mb-10"
              style={{ fontSize: 'clamp(2.2rem, 4vw, 3.8rem)' }}
            >
              Her deneyim
              <br />
              bir soruyla
              <br />
              başlar.
            </h1>
            <div className="flex flex-col gap-0 mb-12 max-w-sm">
              <p className="font-body font-light text-neutral-700 text-sm leading-loose">
                LAB™ bir katalog değildir. Bir komisyondur.
              </p>
              <p className="font-body font-light text-neutral-600 text-sm leading-loose">
                Niyetiniz etrafında kurulur. Sohbet içinde şekillenir.
              </p>
              <p className="font-body font-light text-neutral-500 text-sm leading-loose">
                Hazır rotalar yoktur. Yalnızca var olması gereken şey.
              </p>
            </div>
            <div className="flex flex-col items-start gap-6">
              <Link
                href={buildExperienceInquiryHref('lab')}
                className="font-body text-[0.65rem] tracking-[0.3em] text-neutral-900 uppercase border border-neutral-900 px-8 py-4 hover:bg-neutral-900 hover:text-white transition-all duration-300"
              >
                BİR GÖRÜŞME BAŞLATIN
              </Link>
              <div className="flex flex-col items-center gap-2 mt-4">
                <span className="font-body text-[0.55rem] tracking-[0.3em] text-neutral-400 uppercase">
                  KEŞFET ↓
                </span>
              </div>
            </div>
          </div>

          {/* Right — Full-bleed image */}
          <div className="relative w-full lg:w-1/2 min-h-[50vh] lg:min-h-screen overflow-hidden">
            <Image
              src="https://img.rocket.new/generatedImages/rocket_gen_img_137ddd9e4-1772074857584.png"
              alt="Creative studio workspace with natural light and collaborative surfaces representing the LAB experimental approach"
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </section>

        {/* ── BREADCRUMB + INTRO ── */}
        <section className="bg-[#EDEAE4] py-20 md:py-28" aria-label="Introduction">
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
            <nav className="mb-14" aria-label="Breadcrumb">
              <ol className="flex items-center gap-2">
                <li>
                  <Link
                    href="/"
                    className="font-body text-[0.6rem] tracking-[0.22em] text-neutral-500 uppercase hover:text-neutral-800 transition-colors"
                  >
                    ← ANA SAYFA
                  </Link>
                </li>
                <li aria-hidden="true">
                  <span className="font-body text-[0.6rem] text-neutral-400 mx-1">/</span>
                </li>
                <li>
                  <span className="font-body text-[0.6rem] tracking-[0.22em] text-neutral-800 uppercase">
                    LAB™
                  </span>
                </li>
              </ol>
            </nav>

            <div className="max-w-2xl mx-auto text-center">
              <p
                className="font-display font-light text-neutral-800 leading-relaxed"
                style={{ fontSize: 'clamp(1.15rem, 2.2vw, 1.5rem)' }}
              >
                LAB™ bir katalog değildir. Niyetle başlar; sonra yer, erişim ve kültürel dikkat
                aracılığıyla biçim kazanır. Doğru misafir için kurulana kadar var olmayan
                karşılaşmaları sıfırdan kurgularız.
              </p>
              <p className="font-body font-light text-neutral-500 text-sm leading-relaxed mt-6">
                Bu çalışma biçimi{' '}
                <Link
                  href="/cultural-worlds/istanbul"
                  className="underline underline-offset-2 hover:text-neutral-700 transition-colors"
                >
                  İstanbul
                </Link>
                ,{' '}
                <Link
                  href="/cultural-worlds/bodrum"
                  className="underline underline-offset-2 hover:text-neutral-700 transition-colors"
                >
                  Bodrum
                </Link>
                , and{' '}
                <Link
                  href="/cultural-worlds/cappadocia"
                  className="underline underline-offset-2 hover:text-neutral-700 transition-colors"
                >
                  Kapadokya
                </Link>{' '}
                kültürel dünyaları arasında ilerler; her kompozisyon kendi yerinin karakteriyle
                şekillenir.
              </p>
            </div>
          </div>
        </section>

        {/* ── OUR APPROACH — 3 Columns ── */}
        <section className="bg-white py-24 md:py-36" aria-label="Yaklaşımımız">
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
            <div className="text-center mb-20">
              <p className="font-body text-[0.6rem] tracking-[0.3em] text-neutral-400 uppercase mb-4">
                YAKLAŞIM
              </p>
              <h2
                className="font-display font-light text-neutral-900"
                style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)' }}
              >
                Çalışma Biçimimiz
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-16 lg:gap-24">
              {[
                {
                  label: 'Açıklık',
                  body: 'Biçim vermeden önce anlamak.',
                },
                {
                  label: 'Yapı',
                  body: 'Soyut olana biçim kazandırmak.',
                },
                {
                  label: 'Kontrol',
                  body: 'Katılığa düşmeden hassasiyet.',
                },
              ].map((item) => (
                <div key={item.label} className="flex flex-col">
                  <p className="font-body text-[0.6rem] tracking-[0.3em] text-neutral-400 uppercase mb-5">
                    {item.label}
                  </p>
                  <div className="w-8 h-px bg-neutral-300 mb-8" />
                  <p
                    className="font-display font-light text-neutral-700 leading-relaxed"
                    style={{ fontSize: 'clamp(1rem, 1.5vw, 1.15rem)' }}
                  >
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── COLLABORATIONS — Split ── */}
        <section className="bg-[#EDEAE4] py-20 md:py-28" aria-label="For Brands">
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <div>
                <p className="font-body text-[0.6rem] tracking-[0.3em] text-neutral-400 uppercase mb-6">
                  MARKALAR İÇİN CREARE LAB™
                </p>
                <h2
                  className="font-display font-light text-neutral-900 leading-tight mb-10"
                  style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)' }}
                >
                  Markalar için
                </h2>
                <p className="font-body text-sm text-neutral-600 leading-relaxed mb-6">
                  LAB™ markalarla, ortak bir niyet etrafında kurulan kültürel deneyimler tasarlamak
                  için çalışır; liderlik buluşmalarından ürün lansmanlarına, ekip immersiyonlarından
                  misafir karşılaşmalarına kadar.
                </p>
                <p className="font-body text-sm text-neutral-500 leading-relaxed mb-12">
                  Her komisyon ekibinizle birlikte şekillenir. CREARE kültürel bağlamı, yaratıcı
                  yönü ve kompozisyon zekâsını getirir. Siz anlatıyı getirirsiniz.
                </p>
                <Link
                  href={buildExperienceInquiryHref('lab')}
                  className="font-body text-[0.65rem] tracking-[0.3em] text-neutral-900 uppercase border-b border-neutral-400 pb-1 hover:border-neutral-900 transition-colors duration-300"
                >
                  BİR GÖRÜŞME BAŞLATIN →
                </Link>
              </div>

              <div className="relative w-full aspect-[4/3] overflow-hidden">
                <Image
                  src="https://img.rocket.new/generatedImages/rocket_gen_img_1c4822a6f-1775494720024.png"
                  alt="Corporate team engaged in a structured creative workshop in a contemporary cultural space"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── EMOTIONAL PAUSE ── */}
        <section className="bg-white py-20 md:py-28" aria-label="Emotional pause">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <p
              className="font-display font-light text-neutral-500 tracking-widest"
              style={{ fontSize: 'clamp(0.9rem, 1.5vw, 1.1rem)', letterSpacing: '0.18em' }}
            >
              Hiçbir şey hazır seçilmez. Her şey özenle kurgulanır.
            </p>
          </div>
        </section>

        {labExperiences.length > 0 && (
          <section
            className="bg-white py-24 md:py-32"
            aria-label="LAB experiences from the collection"
          >
            <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
              <div className="text-center mb-20">
                <p className="font-body text-[0.6rem] tracking-[0.3em] text-neutral-400 uppercase mb-4">
                  KOLEKSİYONDAN
                </p>
                <h2
                  className="font-display font-light text-neutral-900"
                  style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)' }}
                >
                  LAB Deneyimleri
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-20 lg:gap-x-14 lg:gap-y-16">
                {labExperiences.map((exp) => {
                  const rawUrl =
                    exp.cover_image?.formats?.medium?.url ??
                    exp.cover_image?.formats?.small?.url ??
                    exp.cover_image?.url ??
                    null;
                  const coverUrl = rawUrl ? mediaUrl(rawUrl) : null;
                  const coverAlt = exp.cover_image?.alternativeText ?? exp.title;
                  const location = exp.destination?.name ?? exp.location_label;
                  const geoMetadata = getGeoMetadataLine(exp);
                  const href = exp.slug ? `/experiences/${exp.slug}` : null;

                  const card = (
                    <>
                      <div className="relative w-full overflow-hidden rounded-2xl aspect-[4/3] mb-5 lg:mb-1 lg:aspect-[61/50]">
                        {coverUrl ? (
                          <AppImage
                            src={coverUrl}
                            alt={coverAlt}
                            fill
                            atmosphere="light"
                            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            unoptimized={isLocalAssetUrl(coverUrl)}
                          />
                        ) : (
                          <div className="w-full h-full bg-[linear-gradient(135deg,rgba(245,241,234,0.98),rgba(225,217,206,0.94))]" />
                        )}
                      </div>

                      <p className="font-body text-[0.55rem] tracking-[0.28em] text-neutral-400 uppercase mb-2">
                        {exp.category ?? 'LAB'}
                      </p>
                      <h3
                        className="font-display font-light text-neutral-900 leading-snug mb-2 group-hover:opacity-70 transition-opacity duration-300"
                        style={{ fontSize: 'clamp(1rem, 1.8vw, 1.2rem)' }}
                      >
                        {exp.title}
                      </h3>

                      {geoMetadata && (
                        <p className="font-body text-[0.68rem] text-neutral-500/80 mb-2">
                          {geoMetadata}
                        </p>
                      )}

                      {location && (
                        <p className="font-body text-[0.7rem] text-neutral-500 mb-2">{location}</p>
                      )}

                      {exp.short_description && (
                        <p className="font-body text-sm text-neutral-500 leading-relaxed">
                          {exp.short_description}
                        </p>
                      )}

                      {exp.duration && (
                        <p className="mt-3 font-body text-xs tracking-wide text-neutral-500 uppercase">
                          {exp.duration}
                        </p>
                      )}
                    </>
                  );

                  return href ? (
                    <Link
                      key={exp.id}
                      href={href}
                      className="group block"
                      aria-label={`${exp.title} deneyimini görüntüle`}
                    >
                      {card}
                    </Link>
                  ) : (
                    <div key={exp.id} className="group block" aria-label={exp.title}>
                      {card}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ── PROCESS — 4 Steps ── */}
        <section className="bg-[#EDEAE4] py-28 md:py-44" aria-label="LAB nasıl ilerler">
          <div className="max-w-5xl mx-auto px-6 sm:px-10 lg:px-16">
            <div className="text-center mb-24">
              <p className="font-body text-[0.6rem] tracking-[0.3em] text-neutral-400 uppercase mb-4">
                AKIŞ
              </p>
              <h2
                className="font-display font-light text-neutral-900"
                style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)' }}
              >
                LAB Nasıl İlerler
              </h2>
            </div>

            {/* Steps — horizontal on large, vertical on small */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-0">
              {[
                {
                  step: '01',
                  label: 'NİYET',
                  body: 'Niyetle başlarız. Herhangi bir kompozisyon başlamadan önce bağlam ve arzu anlaşılır.',
                },
                {
                  step: '02',
                  label: 'TASARIM',
                  body: 'Fikirler sohbet içinde belirir; anlatı, mekân ve deneyim katmanları açıklıkla biçim kazanır.',
                },
                {
                  step: '03',
                  label: 'KOMPOZİSYON',
                  body: 'Her maddi unsur hassasiyetle bir araya getirilir; ortaklar, ortamlar, akışlar ve duyusal ayrıntılar.',
                },
                {
                  step: '04',
                  label: 'UYGULAMA',
                  body: 'Her ayrıntı özenle hayata geçirilir. Her aşamada tam dikkat vardır. Hiçbir şey şansa bırakılmaz.',
                },
              ].map((item, index, arr) => (
                <div key={item.label} className="relative flex flex-col md:flex-row">
                  {/* Step content */}
                  <div className="flex flex-col px-0 md:px-10 pb-20 md:pb-0 first:pl-0 last:pr-0">
                    <span className="font-body text-[0.55rem] tracking-[0.3em] text-neutral-300 uppercase mb-6">
                      {item.step}
                    </span>
                    <p className="font-body text-[0.65rem] tracking-[0.3em] text-neutral-900 uppercase mb-6">
                      {item.label}
                    </p>
                    <div className="w-6 h-px bg-neutral-200 mb-8" />
                    <p className="font-body text-xs text-neutral-500 leading-loose">{item.body}</p>
                  </div>

                  {/* Divider between steps */}
                  {index < arr.length - 1 && (
                    <>
                      {/* Vertical divider on md+ */}
                      <div className="hidden md:block absolute right-0 top-0 bottom-0 w-px bg-neutral-200" />
                      {/* Horizontal divider on mobile */}
                      <div className="md:hidden w-full h-px bg-neutral-100 mb-20" />
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CLOSING CTA ── */}
        <section className="bg-[#EDEAE4] py-28 md:py-40" aria-label="Bir görüşme başlat">
          <div className="max-w-3xl mx-auto px-6 sm:px-10 lg:px-16 text-center">
            <p
              className="font-display font-light text-neutral-900 leading-snug mb-6"
              style={{ fontSize: 'clamp(1.3rem, 2.5vw, 1.9rem)' }}
            >
              Kusursuz görünen her deneyimin ardında dikkatli bir emek vardır.
            </p>
            <p
              className="font-display font-light text-neutral-600 leading-snug mb-16"
              style={{ fontSize: 'clamp(1rem, 2vw, 1.4rem)' }}
            >
              Ve o emeğin ardında, sizin etrafınızda şekillenen bir kompozisyon bulunur.
            </p>

            <Link
              href={buildExperienceInquiryHref('lab')}
              className="inline-block font-body text-[0.65rem] tracking-[0.3em] text-white uppercase bg-neutral-900 px-10 py-5 hover:bg-neutral-700 transition-colors duration-300 mb-10"
            >
              BİR GÖRÜŞME BAŞLATIN
            </Link>

            <p className="font-body text-[0.55rem] tracking-[0.3em] text-neutral-400 uppercase">
              SESSİZ HASSASİYET. SESSİZCE KURGULANIR.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
