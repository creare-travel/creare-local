import { buildBreadcrumbListSchema } from './breadcrumbs';
import { buildImageObjectSchema } from './image';
import { buildOrganizationReference } from './organization';
import { buildPlaceSchema } from './place';
import type { SchemaNode, StrapiExperience, StrapiOntologyEntity } from './types';
import {
  buildCanonicalUrl,
  experienceIds,
  extractParagraphs,
  getPrimaryDescription,
  getSafeAdditionalTypeUrl,
  normalizeEnumValue,
  normalizeSameAs,
} from './utils';
import { buildWebPageSchema } from './webpage';

function getLocation(experience: StrapiExperience): string | undefined {
  return experience.destination?.name || experience.location_label || undefined;
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

function buildItineraryNode(
  experience: StrapiExperience,
  itineraryId: string
): SchemaNode | undefined {
  const programItems = extractParagraphs(experience.program);
  if (!programItems.length) return undefined;

  return {
    '@id': itineraryId,
    '@type': 'ItemList',
    name: `${experience.title} itinerary`,
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
  slug: string
): SchemaNode[] {
  const ids = experienceIds(slug);
  const title = experience.title || 'Experience';
  const description = getExperienceDescription(experience);
  const imageObject = buildImageObjectSchema(experience.cover_image, {
    id: ids.image,
    fallbackName: title,
    representativeOfPage: true,
  });
  const locationName = getLocation(experience);
  const destinationUrl = experience.destination?.slug
    ? buildCanonicalUrl(`/cultural-worlds/${experience.destination.slug}`)
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
  const itineraryNode = buildItineraryNode(experience, ids.itinerary);
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
          name: 'Wow Moment',
          value: normalizeOptionalText(experience.wow_moment),
        }
      : null,
    normalizeOptionalText(experience.differentiator)
      ? {
          '@type': 'PropertyValue',
          propertyID: 'differentiator',
          name: 'Differentiator',
          value: normalizeOptionalText(experience.differentiator),
        }
      : null,
  ].filter(Boolean) as SchemaNode[];

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
    additionalProperty: additionalProperties.length > 0 ? additionalProperties : undefined,
    itinerary: itineraryNode ? { '@id': ids.itinerary } : undefined,
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
  });

  const breadcrumbNode = buildBreadcrumbListSchema(
    [
      { name: 'Home', url: buildCanonicalUrl('/') },
      { name: 'Experiences', url: buildCanonicalUrl('/experiences') },
      { name: title, url: ids.canonical, slugFallback: slug },
    ],
    ids.breadcrumbs
  );

  return [breadcrumbNode, imageObject, placeNode, itineraryNode, serviceNode, webpageNode].filter(
    Boolean
  ) as SchemaNode[];
}
