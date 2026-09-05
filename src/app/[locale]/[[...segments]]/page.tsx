import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { renderHomePage } from '@/features/i18n-pages/home';
import {
  generateExperiencesMetadata,
  renderExperiencesPage,
} from '@/features/i18n-pages/experiences';
import {
  generateExperienceCategoryMetadata,
  renderExperienceCategoryPage,
  type ExperienceCategory,
} from '@/features/i18n-pages/experience-category';
import {
  generateExperienceDetailMetadata,
  renderExperienceDetailPage,
} from '@/features/i18n-pages/experience-detail';
import {
  generateCulturalWorldsMetadata,
  renderCulturalWorldsPage,
} from '@/features/i18n-pages/cultural-worlds';
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
import { localizePathname } from '@/lib/i18n/pathname';
import { buildLocaleOwnedMetadata } from '@/lib/seo';
import { buildLocalizedStaticPageMetadata } from '@/features/static-pages/metadata';

export const dynamic = 'force-dynamic';

interface GenericLocalePageProps {
  params: Promise<{ locale: string; segments?: string[] }>;
}

const EXPERIENCE_CATEGORIES = new Set<ExperienceCategory>(['signature', 'lab', 'black']);

const ZH_STATIC_METADATA = {
  '/philosophy': {
    title: '理念',
    description: '我们相信，最非凡的体验无法被购买，只能被精心构筑。',
  },
  '/contact': {
    title: '私享咨询',
    description: '面向战略合作、私人委托与保密协作。我们将亲自回复。',
  },
  '/privacy': {
    title: '隐私政策',
    description: '了解 CREARE 如何收集、使用并保护您提供的个人信息。',
  },
  '/cookies': {
    title: 'Cookie 政策',
    description: '了解 CREARE 如何使用 Cookie 以支持网站功能并改善访问体验。',
  },
  '/terms': {
    title: '使用条款',
    description: '了解适用于 CREARE 网站、沟通渠道与合作服务的使用条款。',
  },
} as const;

async function resolveParams(params: GenericLocalePageProps['params']) {
  const { locale: localeKey, segments = [] } = await params;
  const locale = getGenericRouteLocale(localeKey);
  if (!locale) notFound();
  return { locale, segments };
}

function buildListingMetadata(
  locale: SiteLocale,
  family: 'home' | 'experiences' | 'insights'
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
  if (!slug && family === 'experiences') return generateExperiencesMetadata(locale);
  if (!slug && family === 'cultural-worlds') return generateCulturalWorldsMetadata(locale);
  if (!slug && family === 'insights') return buildListingMetadata(locale, 'insights');

  if (family === 'experiences' && slug && EXPERIENCE_CATEGORIES.has(slug as ExperienceCategory)) {
    return generateExperienceCategoryMetadata(slug as ExperienceCategory, locale);
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

  if (!slug && locale === 'zh') {
    const staticMetadata = ZH_STATIC_METADATA[`/${family}` as keyof typeof ZH_STATIC_METADATA];
    if (staticMetadata) {
      return buildLocalizedStaticPageMetadata({
        locale,
        path: localizePathname(`/${family}`, locale),
        title: staticMetadata.title,
        description: staticMetadata.description,
        imageAlt: `${staticMetadata.title} — CREARE`,
      });
    }
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
