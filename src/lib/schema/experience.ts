import { buildBreadcrumbListSchema } from './breadcrumbs';
import { buildImageObjectSchema } from './image';
import { buildOrganizationReference } from './organization';
import { buildPlaceSchema } from './place';
import type { SchemaNode, StrapiExperience, StrapiOntologyEntity } from './types';
import {
  buildCanonicalUrl,
  extractParagraphs,
  getPrimaryDescription,
  getSafeAdditionalTypeUrl,
  normalizeEnumValue,
  normalizeSameAs,
} from './utils';
import { buildWebPageSchema } from './webpage';
import { DEFAULT_SITE_LOCALE, LOCALE_REGISTRY, type SiteLocale } from '@/lib/i18n/config';
import { localizePathname } from '@/lib/i18n/pathname';

interface RelatedInsightReference {
  slug?: string;
  title?: string;
  excerpt?: string;
}

interface ExperienceDetailGraphOptions {
  locale?: SiteLocale;
  heroAltText?: string;
  labels?: {
    home: string;
    experiences: string;
    programme?: string;
    wowMoment?: string;
    differentiator?: string;
  };
}

function buildLocalizedExperienceIds(slug: string, locale: SiteLocale) {
  const canonical = buildCanonicalUrl(localizePathname(`/experiences/${slug}`, locale));
  return {
    canonical,
    webpage: `${canonical}#webpage`,
    service: `${canonical}#service`,
    image: `${canonical}#image`,
    sequence: `${canonical}#encounter-sequence`,
    place: `${canonical}#place`,
    breadcrumbs: `${canonical}#breadcrumbs`,
  };
}

function getLocation(experience: StrapiExperience): string | undefined {
  return (
    experience.location || experience.destination?.name || experience.location_label || undefined
  );
}

function normalizeOptionalText(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed || undefined;
}

function normalizeAudienceLabel(value?: string | null): string | undefined {
  const normalized = normalizeOptionalText(value)?.toLowerCase();
  if (!normalized) return undefined;

  const labelMap: Record<string, string> = {
    corporate: 'Corporate Groups',
    private_group: 'Private Groups',
    leadership: 'Leadership Teams',
    luxury_brand: 'Luxury Brand Audiences',
  };

  return labelMap[normalized] ?? normalizeEnumValue(value);
}

function getOntologyName(entity?: StrapiOntologyEntity | null, fallback?: string | null) {
  return entity?.name || normalizeEnumValue(fallback);
}

function buildOntologyThing(
  propertyId: string,
  entity?: StrapiOntologyEntity | null,
  fallback?: string | null
): SchemaNode | null {
  const name = getOntologyName(entity, fallback);
  if (!name) return null;

  const sameAs = normalizeSameAs(entity?.same_as ?? entity?.sameAs);

  return {
    '@type': 'Thing',
    '@id': entity?.slug ? `${buildCanonicalUrl(`/schema/${entity.slug}`)}` : undefined,
    identifier: propertyId,
    name,
    description: entity?.description,
    sameAs,
  };
}

function buildAboutThings(experience: StrapiExperience): SchemaNode[] {
  const things = [
    buildOntologyThing('mood', experience.mood_entity, experience.mood),
    buildOntologyThing(
      'experience_type',
      experience.experience_type_entity,
      experience.experience_type || experience.geo_experience_type
    ),
    buildOntologyThing('geo_experience_type', undefined, experience.geo_experience_type),
    buildOntologyThing('audience_segment', experience.audience_entity, experience.audience_segment),
    buildOntologyThing('intensity', experience.intensity_entity, experience.intensity),
  ].filter(Boolean) as SchemaNode[];

  const seen = new Set<string>();
  return things.filter((thing) => {
    const name = typeof thing.name === 'string' ? thing.name.toLowerCase() : '';
    if (!name || seen.has(name)) return false;
    seen.add(name);
    return true;
  });
}

function buildPropertyValue(
  propertyID: string,
  name: string,
  value?: string | null,
  entity?: StrapiOntologyEntity | null
): SchemaNode | null {
  const normalizedValue = getOntologyName(entity, value);
  if (!normalizedValue) return null;

  const sameAs = normalizeSameAs(entity?.same_as ?? entity?.sameAs);

  return {
    '@type': 'PropertyValue',
    propertyID: entity ? `${propertyID}_entity` : propertyID,
    name,
    value: normalizedValue,
    description: entity?.description,
    sameAs,
  };
}

function buildAudienceSchema(experience: StrapiExperience): SchemaNode | undefined {
  const audienceName = getOntologyName(
    experience.audience_entity,
    normalizeAudienceLabel(experience.audience_segment)
  );
  const audienceParagraphs = extractParagraphs(experience.audience);
  if (!audienceName && audienceParagraphs.length === 0) return undefined;

  return {
    '@type': 'Audience',
    name: audienceName,
    audienceType: audienceName || audienceParagraphs.join(', '),
    description: experience.audience_entity?.description,
    geographicArea: 'Global',
  };
}

function buildEncounterSequenceNode(
  experience: StrapiExperience,
  sequenceId: string,
  programmeLabel = 'Program structure'
): SchemaNode | undefined {
  const programItems = extractParagraphs(experience.program);
  if (!programItems.length) return undefined;

  return {
    '@id': sequenceId,
    '@type': 'ItemList',
    name: `${experience.title} — ${programmeLabel}`,
    itemListElement: programItems.map((step, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: step,
    })),
  };
}

function getExperienceDescription(experience: StrapiExperience): string {
  const firstParagraph = extractParagraphs(experience.description)[0];
  return (
    getPrimaryDescription(
      experience.seo_description,
      experience.short_description,
      firstParagraph
    ) || ''
  );
}

export function buildExperienceDetailGraph(
  experience: StrapiExperience,
  slug: string,
  relatedInsights: RelatedInsightReference[] = [],
  options: ExperienceDetailGraphOptions = {}
): SchemaNode[] {
  const locale = options.locale ?? DEFAULT_SITE_LOCALE;
  const ids = buildLocalizedExperienceIds(slug, locale);
  const title = experience.title || 'Experience';
  const description = getExperienceDescription(experience);
  const baseImageObject = buildImageObjectSchema(experience.cover_image, {
    id: ids.image,
    fallbackName: title,
    representativeOfPage: true,
  });
  const imageObject = baseImageObject
    ? { ...baseImageObject, description: options.heroAltText ?? baseImageObject.description }
    : undefined;
  const locationName = getLocation(experience);
  const destinationUrl = experience.destination?.slug
    ? buildCanonicalUrl(localizePathname(`/cultural-worlds/${experience.destination.slug}`, locale))
    : undefined;
  const placeNode = locationName
    ? buildPlaceSchema({
        id: ids.place,
        name: locationName,
        url: destinationUrl,
        description: experience.destination?.highlight,
        addressCountry: 'TR',
      })
    : undefined;
  const encounterSequenceNode = buildEncounterSequenceNode(
    experience,
    ids.sequence,
    options.labels?.programme
  );
  const aboutThings = buildAboutThings(experience);
  const additionalProperties = [
    buildPropertyValue(
      'geo_experience_type',
      'Geo Experience Type',
      experience.geo_experience_type,
      experience.experience_type_entity
    ),
    buildPropertyValue('mood', 'Mood', experience.mood, experience.mood_entity),
    buildPropertyValue(
      'audience_segment',
      'Audience Segment',
      experience.audience_segment,
      experience.audience_entity
    ),
    buildPropertyValue('intensity', 'Intensity', experience.intensity, experience.intensity_entity),
    normalizeOptionalText(experience.wow_moment)
      ? {
          '@type': 'PropertyValue',
          propertyID: 'wow_moment',
          name: options.labels?.wowMoment ?? 'Wow Moment',
          value: normalizeOptionalText(experience.wow_moment),
        }
      : null,
    normalizeOptionalText(experience.differentiator)
      ? {
          '@type': 'PropertyValue',
          propertyID: 'differentiator',
          name: options.labels?.differentiator ?? 'Differentiator',
          value: normalizeOptionalText(experience.differentiator),
        }
      : null,
  ].filter(Boolean) as SchemaNode[];
  const relatedInsightMentions = relatedInsights
    .filter((insight) => insight.slug && insight.title)
    .map((insight) => {
      const canonical = buildCanonicalUrl(
        localizePathname(`/insights/${insight.slug as string}`, locale)
      );
      return {
        '@type': 'Article',
        '@id': `${canonical}#article`,
        url: canonical,
        name: insight.title,
        description: insight.excerpt,
      };
    });

  const serviceType =
    normalizeOptionalText(experience.experience_type) ||
    getOntologyName(
      experience.experience_type_entity,
      experience.geo_experience_type || experience.category || null
    );

  const serviceNode = {
    '@id': ids.service,
    '@type': 'Service',
    name: title,
    description,
    provider: buildOrganizationReference(),
    organizer: buildOrganizationReference(),
    image: imageObject ? { '@id': ids.image } : undefined,
    serviceType,
    additionalType: getSafeAdditionalTypeUrl(
      experience.experience_type_entity?.same_as ?? experience.experience_type_entity?.sameAs
    ),
    areaServed: placeNode ? { '@id': ids.place } : undefined,
    subjectOf: destinationUrl
      ? {
          '@type': 'WebPage',
          name: experience.destination?.name,
          url: destinationUrl,
        }
      : undefined,
    audience: buildAudienceSchema(experience),
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/InStock',
      priceSpecification: {
        '@type': 'PriceSpecification',
        priceCurrency: 'EUR',
        price: 'OnRequest',
      },
    },
    about: aboutThings.length > 0 ? aboutThings : undefined,
    mentions: relatedInsightMentions.length > 0 ? relatedInsightMentions : undefined,
    additionalProperty: additionalProperties.length > 0 ? additionalProperties : undefined,
    hasPart: encounterSequenceNode ? [{ '@id': ids.sequence }] : undefined,
    inLanguage: LOCALE_REGISTRY[locale].jsonLdLanguage,
  };

  const webpageNode = buildWebPageSchema({
    id: ids.webpage,
    url: ids.canonical,
    name: title,
    description,
    image: imageObject ? { '@id': ids.image } : undefined,
    breadcrumbId: ids.breadcrumbs,
    mainEntity: { '@id': ids.service },
    about: aboutThings.length > 0 ? aboutThings : undefined,
    inLanguage: LOCALE_REGISTRY[locale].jsonLdLanguage,
  });

  if (destinationUrl) {
    webpageNode.mentions = [
      {
        '@type': 'WebPage',
        name: experience.destination?.name,
        url: destinationUrl,
      },
      ...relatedInsightMentions,
    ];
  } else if (relatedInsightMentions.length > 0) {
    webpageNode.mentions = relatedInsightMentions;
  }

  const breadcrumbNode = buildBreadcrumbListSchema(
    [
      {
        name: options.labels?.home ?? 'Home',
        url: buildCanonicalUrl(localizePathname('/', locale)),
      },
      {
        name: options.labels?.experiences ?? 'Experiences',
        url: buildCanonicalUrl(localizePathname('/experiences', locale)),
      },
      { name: title, url: ids.canonical, slugFallback: slug },
    ],
    ids.breadcrumbs
  );

  return [
    breadcrumbNode,
    imageObject,
    placeNode,
    encounterSequenceNode,
    serviceNode,
    webpageNode,
  ].filter(Boolean) as SchemaNode[];
}
