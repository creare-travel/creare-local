import { buildBreadcrumbListSchema } from './breadcrumbs';
import { buildImageObjectSchema } from './image';
import { buildCollectionPageSchema, buildItemListSchema } from './listing';
import { buildOrganizationReference } from './organization';
import { buildPlaceSchema } from './place';
import { buildWebPageSchema } from './webpage';
import type { ArticleInput, BreadcrumbItemInput, ListingItemInput, SchemaNode } from './types';
import { buildCanonicalUrl } from './utils';

interface InsightCollectionInput {
  pageId: string;
  itemListId: string;
  breadcrumbId: string;
  path: string;
  title: string;
  description?: string;
  items: ListingItemInput[];
  breadcrumbs: BreadcrumbItemInput[];
}

interface InsightDetailInput extends ArticleInput {
  pageId: string;
  articleId: string;
  imageId: string;
  breadcrumbId: string;
  path: string;
  breadcrumbs: BreadcrumbItemInput[];
}

export function buildInsightListingGraph(input: InsightCollectionInput): SchemaNode[] {
  const breadcrumb = buildBreadcrumbListSchema(input.breadcrumbs, input.breadcrumbId);
  const itemListElements = input.items
    .filter((item) => item.url && item.title)
    .map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: item.url,
      name: item.title,
      description: item.description,
      image: buildImageObjectSchema(item.image, {
        id: `${item.url}#image`,
        fallbackName: item.title || 'Insight',
      }),
    }));

  const itemList =
    itemListElements.length > 0
      ? buildItemListSchema({
          id: input.itemListId,
          name: `${input.title} list`,
          items: itemListElements,
        })
      : null;

  const collectionPage = buildCollectionPageSchema({
    id: input.pageId,
    url: input.path,
    name: input.title,
    description: input.description,
    breadcrumbId: input.breadcrumbId,
    mainEntityId: itemList ? input.itemListId : undefined,
  });

  return [breadcrumb, collectionPage, itemList].filter(Boolean) as SchemaNode[];
}

export function buildInsightDetailGraph(input: InsightDetailInput): SchemaNode[] {
  const breadcrumb = buildBreadcrumbListSchema(input.breadcrumbs, input.breadcrumbId);
  const imageObject = buildImageObjectSchema(input.image, {
    id: input.imageId,
    fallbackName: input.title || 'Insight',
    representativeOfPage: true,
  });
  const culturalWorldUrl = input.destinationSlug
    ? buildCanonicalUrl(`/cultural-worlds/${input.destinationSlug}`)
    : undefined;
  const culturalWorldPlace =
    input.destinationName && culturalWorldUrl
      ? buildPlaceSchema({
          id: `${culturalWorldUrl}#place`,
          name: input.destinationName,
          url: culturalWorldUrl,
          addressCountry: 'TR',
        })
      : undefined;

  const article = {
    '@id': input.articleId,
    '@type': 'Article',
    headline: input.title,
    name: input.title,
    description: input.description || input.excerpt,
    url: input.path,
    publisher: buildOrganizationReference(),
    image: imageObject ? { '@id': input.imageId } : undefined,
    datePublished: input.publishedAt,
    dateModified: input.updatedAt,
    inLanguage: input.inLanguage,
    about: culturalWorldPlace ? [{ '@id': `${culturalWorldUrl}#place` }] : undefined,
  };

  const webpage = buildWebPageSchema({
    id: input.pageId,
    type: 'WebPage',
    url: input.path,
    name: input.title || 'Insight',
    description: input.description || input.excerpt,
    image: imageObject ? { '@id': input.imageId } : undefined,
    breadcrumbId: input.breadcrumbId,
    mainEntity: { '@id': input.articleId },
    about: culturalWorldPlace ? [{ '@id': `${culturalWorldUrl}#place` }] : undefined,
    inLanguage: input.inLanguage || undefined,
  });

  return [breadcrumb, imageObject, culturalWorldPlace, article, webpage].filter(
    Boolean
  ) as SchemaNode[];
}
