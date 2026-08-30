import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';
import { fetchExperienceCategoryPages, getCmsImageUrl } from '@/lib/experiences/cms';
import { DEFAULT_SITE_LOCALE, type SiteLocale } from '@/lib/i18n/config';
import { getExperienceCategoryTarget } from '@/lib/i18n/static-routes';
import type { Dictionary } from '@/lib/i18n/types';

interface CollectionsSectionProps {
  dictionary: Dictionary;
  locale?: SiteLocale;
}

export default async function CollectionsSection({
  dictionary,
  locale = DEFAULT_SITE_LOCALE,
}: CollectionsSectionProps) {
  const pages = await fetchExperienceCategoryPages(locale);
  const features = pages.map((page) => {
    const image = getCmsImageUrl(page.card_image);
    if (!image) throw new Error(`Missing ${locale}:${page.key} homepage card image`);

    return {
      ...page,
      image,
      href: getExperienceCategoryTarget(`/experiences/${page.key}`, locale),
      cta: `${dictionary.common.enter} →`,
    };
  });

  return (
    <div className="w-full bg-neutral-50">
      <div className="mx-auto max-w-7xl px-6 pt-16 sm:px-10 sm:pt-18 lg:px-16 lg:pt-20">
        <p className="font-body text-[0.66rem] font-medium uppercase tracking-[0.18em] text-neutral-600">
          {dictionary.home.collections.eyebrow}
        </p>
      </div>

      {features.map((feature, index) => {
        const imageFirst = index === 1;
        return (
          <section
            key={feature.key}
            className={`mx-auto max-w-7xl px-6 sm:px-10 lg:px-16 ${
              index === 0
                ? 'pb-24 pt-10 sm:pt-12 md:pb-36 md:pt-16 lg:pt-18'
                : index === features.length - 1
                  ? 'border-t border-neutral-200/80 pb-36 pt-20 md:pb-56 md:pt-36'
                  : 'border-t border-neutral-200/80 pb-28 pt-16 md:pb-48 md:pt-20'
            }`}
            aria-label={`${feature.eyebrow} ${dictionary.experiences.title}`}
          >
            <div
              className={`flex flex-col gap-10 lg:items-center lg:gap-20 xl:gap-28 ${
                imageFirst ? 'lg:flex-row-reverse' : 'lg:flex-row'
              }`}
            >
              <div className="mb-2 lg:mb-0 lg:w-5/12 lg:flex-shrink-0 xl:w-4/12">
                <p className="mb-5 font-body text-[0.58rem] font-bold uppercase tracking-[0.26em] text-neutral-500 sm:mb-6 sm:text-[0.6rem] sm:tracking-[0.3em]">
                  {feature.eyebrow}
                </p>
                <p className="mb-8 font-display text-[clamp(1.55rem,7.3vw,2.4rem)] font-light leading-[1.18] text-neutral-900 sm:mb-10 sm:text-[clamp(1.7rem,2.8vw,2.4rem)] sm:leading-[1.1]">
                  {feature.card_title}
                </p>
                <p className="mb-10 max-w-sm font-body text-[0.95rem] leading-[1.9] text-neutral-500 sm:mb-12 sm:max-w-xs sm:text-sm sm:leading-relaxed">
                  {feature.card_description}
                </p>
                <Link
                  href={feature.href}
                  className="group/cta motion-link inline-flex min-h-11 items-center font-body text-[0.6rem] uppercase tracking-[0.22em] text-neutral-600 hover:text-neutral-900 sm:tracking-[0.28em]"
                  aria-label={`${feature.cta} ${feature.eyebrow}`}
                >
                  <span className="relative inline-block">
                    {feature.cta}
                    <span className="absolute -bottom-px left-0 h-px w-0 bg-neutral-800 transition-[width,opacity] duration-[var(--motion-standard)] ease-[var(--ease-luxury)] group-hover/cta:w-full" />
                  </span>
                </Link>
              </div>
              <div className="group overflow-hidden lg:w-7/12 xl:w-8/12">
                <AppImage
                  src={feature.image}
                  alt={feature.card_alt_text}
                  width={1200}
                  height={780}
                  deliveryProfile="hero"
                  className="motion-media-drift h-auto w-full object-cover"
                  sizes="(max-width: 1024px) 100vw, 66vw"
                />
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
