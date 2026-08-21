import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { renderHomePage } from '@/features/i18n-pages/home';
import { renderExperiencesPage } from '@/features/i18n-pages/experiences';
import {
  buildExperienceCategoryMetadata,
  renderExperienceCategoryPage,
  type ExperienceCategory,
} from '@/features/i18n-pages/experience-category';
import {
  generateExperienceDetailMetadata,
  renderExperienceDetailPage,
} from '@/features/i18n-pages/experience-detail';
import { renderCulturalWorldsPage } from '@/features/i18n-pages/cultural-worlds';
import {
  generateCulturalWorldDetailMetadata,
  renderCulturalWorldDetailPage,
} from '@/features/i18n-pages/cultural-world-detail';
import { renderInsightsPage } from '@/features/i18n-pages/insights';
import {
  generateInsightDetailMetadata,
  renderInsightDetailPage,
} from '@/features/i18n-pages/insight-detail';
import {
  hasLocalizedStaticPageRenderer,
  renderRegisteredStaticPage,
} from '@/features/static-pages/registry';
import { getGenericRouteLocale, type SiteLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { isStaticPathAvailableForLocale } from '@/lib/i18n/static-routes';
import { getAvailableStaticRouteLocales } from '@/lib/i18n/static-routes';
import { buildLocaleOwnedMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';

interface GenericLocalePageProps {
  params: Promise<{ locale: string; segments?: string[] }>;
}

const EXPERIENCE_CATEGORIES = new Set<ExperienceCategory>(['signature', 'lab', 'black']);

async function resolveParams(params: GenericLocalePageProps['params']) {
  const { locale: localeKey, segments = [] } = await params;
  const locale = getGenericRouteLocale(localeKey);
  if (!locale) notFound();
  return { locale, segments };
}

function buildListingMetadata(
  locale: SiteLocale,
  family: 'home' | 'experiences' | 'cultural-worlds' | 'insights'
): Metadata {
  const dictionary = getDictionary(locale);
  const path = family === 'home' ? '/' : `/${family}`;
  const availableLocales = getAvailableStaticRouteLocales(path);

  if (family === 'home') {
    return buildLocaleOwnedMetadata({
      locale,
      copyLocale: locale,
      route: { family, locale },
      title: dictionary.home.hero.eyebrow,
      description: dictionary.home.mainParagraph.paragraph1,
      robots: { index: true, follow: true },
      availableLocales,
    });
  }

  if (family === 'experiences') {
    return buildLocaleOwnedMetadata({
      locale,
      copyLocale: locale,
      route: { family, locale },
      title: dictionary.home.hero.eyebrow,
      description: dictionary.home.collections.eyebrow,
      robots: { index: true, follow: true },
      availableLocales,
    });
  }

  if (family === 'cultural-worlds') {
    return buildLocaleOwnedMetadata({
      locale,
      copyLocale: locale,
      route: { family, locale },
      title: dictionary.culturalWorlds.atlasTitle,
      description: dictionary.culturalWorlds.geography,
      robots: { index: true, follow: true },
      titleMode: 'absolute',
      availableLocales,
    });
  }

  return buildLocaleOwnedMetadata({
    locale,
    copyLocale: locale,
    route: { family, locale },
    title: dictionary.insights.title,
    description: dictionary.insights.subtitle,
    robots: { index: true, follow: true },
    availableLocales,
  });
}

function getStaticRoutePath(segments: readonly string[]): string | null {
  if (segments.length === 0) return '/';
  if (segments.length === 1) return `/${segments[0]}`;
  if (
    segments.length === 2 &&
    segments[0] === 'experiences' &&
    EXPERIENCE_CATEGORIES.has(segments[1] as ExperienceCategory)
  ) {
    return `/experiences/${segments[1]}`;
  }
  return null;
}

export async function generateMetadata({ params }: GenericLocalePageProps): Promise<Metadata> {
  const { locale, segments } = await resolveParams(params);
  const staticRoutePath = getStaticRoutePath(segments);
  if (staticRoutePath && !isStaticPathAvailableForLocale(staticRoutePath, locale)) notFound();
  const [family, slug, extra] = segments;
  if (extra) return { title: { absolute: '404' }, robots: { index: false, follow: false } };

  if (!family) return buildListingMetadata(locale, 'home');
  if (!slug && family === 'experiences') return buildListingMetadata(locale, 'experiences');
  if (!slug && family === 'cultural-worlds') return buildListingMetadata(locale, 'cultural-worlds');
  if (!slug && family === 'insights') return buildListingMetadata(locale, 'insights');

  if (family === 'experiences' && slug && EXPERIENCE_CATEGORIES.has(slug as ExperienceCategory)) {
    return buildExperienceCategoryMetadata(slug as ExperienceCategory, locale);
  }
  if (family === 'experiences' && slug) {
    return generateExperienceDetailMetadata({ locale, params: Promise.resolve({ slug }) });
  }
  if (family === 'cultural-worlds' && slug) {
    return generateCulturalWorldDetailMetadata({ locale, params: Promise.resolve({ slug }) });
  }
  if (family === 'insights' && slug) {
    return generateInsightDetailMetadata({ locale, params: Promise.resolve({ slug }) });
  }

  return { title: { absolute: '404' }, robots: { index: false, follow: false } };
}

export default async function GenericLocalizedPage({ params }: GenericLocalePageProps) {
  const { locale, segments } = await resolveParams(params);
  const staticRoutePath = getStaticRoutePath(segments);
  if (staticRoutePath && !isStaticPathAvailableForLocale(staticRoutePath, locale)) notFound();
  const [family, slug, extra] = segments;
  if (extra) notFound();

  if (!family) return renderHomePage(locale);
  if (!slug && family === 'experiences') return renderExperiencesPage(locale);
  if (!slug && family === 'cultural-worlds') return renderCulturalWorldsPage(locale);
  if (!slug && family === 'insights') return renderInsightsPage(locale);

  if (family === 'experiences' && slug && EXPERIENCE_CATEGORIES.has(slug as ExperienceCategory)) {
    return renderExperienceCategoryPage(slug as ExperienceCategory, locale);
  }
  if (family === 'experiences' && slug) return renderExperienceDetailPage(slug, locale);
  if (family === 'cultural-worlds' && slug) return renderCulturalWorldDetailPage(slug, locale);
  if (family === 'insights' && slug) return renderInsightDetailPage(slug, locale);

  const staticPath = `/${family}`;
  if (
    !slug &&
    isStaticPathAvailableForLocale(staticPath, locale) &&
    hasLocalizedStaticPageRenderer(locale, staticPath)
  ) {
    const page = await renderRegisteredStaticPage(locale, staticPath);
    if (page) return page;
  }

  notFound();
}
