import { buildCloudinaryUrl } from '@/lib/cloudinary';
import { buildCinematicBlurDataUrl } from '@/lib/lqip';
import HomeHeroInquiryLink from '@/app/home/components/HomeHeroInquiryLink';

const HOMEPAGE_HERO_PUBLIC_ID = 'creare-hero-image.jpg';
const HOMEPAGE_HERO_IMAGE = buildCloudinaryUrl(HOMEPAGE_HERO_PUBLIC_ID, {
  profile: 'hero',
  format: 'auto',
  quality: 'auto:good',
  dpr: 'auto',
});
const HOMEPAGE_HERO_ALT =
  'Library of Celsus and the Gate of Augustus at sunset with warm architectural light';
const HOMEPAGE_HERO_DESKTOP_WIDTHS = [1080, 1440, 1920] as const;
const HOMEPAGE_HERO_MOBILE_COMPACT_WIDTH = 475;
const HOMEPAGE_HERO_MOBILE_TALL_WIDTH = 524;

export default function HeroSection() {
  const heroBlurDataUrl = buildCinematicBlurDataUrl(HOMEPAGE_HERO_IMAGE, {
    atmosphere: 'dark',
    profile: 'hero',
  });
  const heroSrc = buildCloudinaryUrl(HOMEPAGE_HERO_PUBLIC_ID, {
    profile: 'hero',
    width: 1440,
    quality: 'auto:good',
    format: 'auto',
    dpr: 'auto',
  });
  const heroMobileCompactSrc = buildCloudinaryUrl(HOMEPAGE_HERO_PUBLIC_ID, {
    profile: 'hero',
    width: HOMEPAGE_HERO_MOBILE_COMPACT_WIDTH,
    quality: 'auto:good',
    format: 'auto',
    gravity: 'center',
    aspectRatio: '9:16',
    dpr: 'auto',
  });
  const heroMobileTallSrc = buildCloudinaryUrl(HOMEPAGE_HERO_PUBLIC_ID, {
    profile: 'hero',
    width: HOMEPAGE_HERO_MOBILE_TALL_WIDTH,
    quality: 'auto:good',
    format: 'auto',
    gravity: 'center',
    aspectRatio: '9:16',
    dpr: 'auto',
  });
  const heroDesktopSrcSet = HOMEPAGE_HERO_DESKTOP_WIDTHS.map(
    (width) =>
      `${buildCloudinaryUrl(HOMEPAGE_HERO_PUBLIC_ID, {
        profile: 'hero',
        width,
        quality: 'auto:good',
        format: 'auto',
        dpr: 'auto',
      })} ${width}w`
  ).join(', ');

  return (
    <section
      className="relative flex h-screen min-h-[600px] w-full items-end overflow-hidden"
      aria-label="Hero — Experiences Composed as Art"
    >
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center blur-2xl"
          style={{ backgroundImage: `url("${heroBlurDataUrl}")` }}
          aria-hidden="true"
        />
        <picture>
          <source
            media="(max-width: 409px) and (orientation: portrait)"
            srcSet={heroMobileCompactSrc}
          />
          <source
            media="(min-width: 410px) and (max-width: 767px) and (orientation: portrait)"
            srcSet={heroMobileTallSrc}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroSrc}
            srcSet={heroDesktopSrcSet}
            sizes="100vw"
            alt={HOMEPAGE_HERO_ALT}
            fetchPriority="high"
            loading="eager"
            decoding="async"
            className="hero-img-zoom h-full w-full object-cover"
          />
        </picture>

        <div
          className="absolute inset-0 z-10 bg-gradient-to-t from-black/84 via-black/48 to-black/16"
          aria-hidden="true"
        />

        <div
          className="absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_center,transparent_46%,rgba(0,0,0,0.3)_100%)]"
          aria-hidden="true"
        />
      </div>

      <div className="relative z-30 mx-auto flex w-full max-w-7xl items-end px-6 pb-20 pt-28 sm:px-10 sm:pb-16 sm:pt-32 md:pb-20 lg:px-16">
        <div className="max-w-[21.5rem] sm:max-w-xl">
          <p className="hero-label mb-8 font-body text-[0.56rem] font-light uppercase tracking-[0.34em] text-white/48 sm:mb-7 sm:text-[0.58rem] sm:tracking-[0.38em]">
            Curated Cultural Experiences
          </p>

          <h1 className="hero-title-lg mb-3 font-display text-[clamp(2.45rem,10.4vw,5.5rem)] font-light leading-[1.11] tracking-[-0.018em] text-white sm:mb-2 sm:text-[clamp(2.8rem,6vw,5.5rem)] sm:leading-[1.06] sm:tracking-tight">
            Experiences.
          </h1>

          <p
            className="hero-subtitle mb-14 font-display text-[clamp(2.45rem,10.4vw,5.5rem)] font-light leading-[1.11] tracking-[-0.018em] text-white/58 sm:mb-12 sm:text-[clamp(2.8rem,6vw,5.5rem)] sm:leading-[1.06] sm:tracking-tight sm:text-white/55"
            aria-hidden="true"
          >
            Composed as Art.
          </p>

          <HomeHeroInquiryLink />
        </div>
      </div>
    </section>
  );
}
