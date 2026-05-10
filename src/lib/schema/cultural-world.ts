import { buildBreadcrumbListSchema } from './breadcrumbs';
import { buildImageObjectSchema } from './image';
import { buildCollectionPageSchema, buildItemListSchema } from './listing';
import { buildPlaceSchema } from './place';
import type { ListingItemInput, SchemaNode, StrapiDestination } from './types';
import { buildCanonicalUrl, culturalWorldIds, extractParagraphs } from './utils';
import { buildWebPageSchema } from './webpage';

interface CulturalSectionInput {
  title?: string;
  body?: unknown;
}

interface CulturalWorldCollectionInput {
  items: Array<
    StrapiDestination & {
      title?: string;
      description?: string;
    }
  >;
}

interface CulturalWorldDetailInput {
  destination: StrapiDestination;
  slug: string;
  relatedExperiences: ListingItemInput[];
  relatedInsights?: Array<{ title?: string; url?: string }>;
  sections?: CulturalSectionInput[];
}

export function buildCulturalWorldCollectionGraph(
  input: CulturalWorldCollectionInput
): SchemaNode[] {
  const canonical = buildCanonicalUrl('/cultural-worlds');
  const breadcrumbId = `${canonical}#breadcrumbs`;
  const collectionId = `${canonical}#collection`;
  const itemListId = `${canonical}#itemlist`;

  const breadcrumb = buildBreadcrumbListSchema(
    [
      { name: 'Home', url: buildCanonicalUrl('/') },
      { name: 'Cultural Worlds', url: canonical },
    ],
    breadcrumbId
  );

  const itemListElements = input.items
    .filter((item) => item.slug && item.name)
    .map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: buildCanonicalUrl(`/cultural-worlds/${item.slug}`),
      name: item.name,
      description: item.highlight || item.short_description || item.description,
      image: buildImageObjectSchema(item.cover_image, {
        id: `${buildCanonicalUrl(`/cultural-worlds/${item.slug}`)}#image`,
        fallbackName: item.name || 'Cultural World',
      }),
    }));

  const itemList =
    itemListElements.length > 0
      ? buildItemListSchema({
          id: itemListId,
          name: 'Cultural Worlds list',
          items: itemListElements,
        })
      : null;

  const collectionPage = buildCollectionPageSchema({
    id: collectionId,
    url: canonical,
    name: 'Cultural Worlds',
    description:
      'Each destination is a world unto itself. Private cultural access shaped by history, ritual, and meaning.',
    breadcrumbId,
    mainEntityId: itemList ? itemListId : undefined,
  });

  return [breadcrumb, collectionPage, itemList].filter(Boolean) as SchemaNode[];
}

export function buildCulturalWorldDetailGraph(input: CulturalWorldDetailInput): SchemaNode[] {
  const ids = culturalWorldIds(input.slug);
  const title = input.destination.name || 'Cultural World';
  const description =
    input.destination.meta_description ||
    input.destination.highlight ||
    input.destination.short_description ||
    'A cultural world composed through private access, narrative depth, and related encounters.';

  const breadcrumb = buildBreadcrumbListSchema(
    [
      { name: 'Home', url: buildCanonicalUrl('/') },
      { name: 'Cultural Worlds', url: buildCanonicalUrl('/cultural-worlds') },
      { name: title, url: ids.canonical, slugFallback: input.slug },
    ],
    ids.breadcrumbs
  );

  const imageObject = buildImageObjectSchema(input.destination.cover_image, {
    id: `${ids.canonical}#image`,
    fallbackName: title,
    representativeOfPage: true,
  });

  const place = buildPlaceSchema({
    id: ids.place,
    name: title,
    url: ids.canonical,
    description,
    image: imageObject ? { '@id': `${ids.canonical}#image` } : undefined,
    addressCountry: 'TR',
  });

  const itemListElements = input.relatedExperiences
    .filter((item) => item.url && item.title)
    .map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: item.url,
      name: item.title,
      description: item.description,
      image: buildImageObjectSchema(item.image, {
        id: `${item.url}#image`,
        fallbackName: item.title || 'Experience',
      }),
    }));

  const itemList =
    itemListElements.length > 0
      ? buildItemListSchema({
          id: ids.itemList,
          name: `${title} related experiences`,
          items: itemListElements,
        })
      : null;

  const culturalReferences = (input.sections ?? [])
    .filter((section) => section.title)
    .map((section, index) => ({
      '@type': 'CreativeWork',
      '@id': `${ids.canonical}#reference-${index + 1}`,
      name: section.title,
      description: extractParagraphs(section.body)[0],
    }));

  const culturalReferenceLinks = culturalReferences.map((reference) => ({
    '@id': reference['@id'],
  }));

  const collectionPage = buildCollectionPageSchema({
    id: ids.collection,
    url: ids.canonical,
    name: `${title} Collection`,
    description,
    breadcrumbId: ids.breadcrumbs,
    mainEntityId: itemList ? ids.itemList : ids.place,
  });

  const webpage = buildWebPageSchema({
    id: ids.webpage,
    url: ids.canonical,
    name: title,
    description,
    image: imageObject ? { '@id': `${ids.canonical}#image` } : undefined,
    breadcrumbId: ids.breadcrumbs,
    mainEntity: { '@id': ids.place },
    about: culturalReferenceLinks.length > 0 ? culturalReferenceLinks : undefined,
  });

  const mentions = input.relatedInsights?.length
    ? input.relatedInsights
        .filter((item) => item.title && item.url)
        .map((item) => ({
          '@type': 'CreativeWork',
          name: item.title,
          url: item.url,
        }))
    : undefined;

  return [
    breadcrumb,
    imageObject,
    place,
    itemList,
    collectionPage,
    {
      ...webpage,
      mentions,
    },
    ...culturalReferences,
  ].filter(Boolean) as SchemaNode[];
}
