import { buildBreadcrumbListSchema } from './breadcrumbs';
import { buildImageObjectSchema } from './image';
import type { BreadcrumbItemInput, ListingItemInput, SchemaNode } from './types';

interface CollectionPageInput {
  id: string;
  url: string;
  name: string;
  description?: string;
  breadcrumbId?: string;
  mainEntityId?: string;
}

interface ItemListInput {
  id: string;
  name: string;
  items: SchemaNode[];
}

interface ExperienceListingGraphInput {
  pageId: string;
  itemListId: string;
  breadcrumbId: string;
  path: string;
  title: string;
  description?: string;
  items: ListingItemInput[];
  breadcrumbs: BreadcrumbItemInput[];
}

export function buildCollectionPageSchema(input: CollectionPageInput): SchemaNode {
  return {
    '@id': input.id,
    '@type': 'CollectionPage',
    name: input.name,
    description: input.description,
    url: input.url,
    breadcrumb: input.breadcrumbId ? { '@id': input.breadcrumbId } : undefined,
    mainEntity: input.mainEntityId ? { '@id': input.mainEntityId } : undefined,
  };
}

export function buildItemListSchema(input: ItemListInput): SchemaNode {
  return {
    '@id': input.id,
    '@type': 'ItemList',
    name: input.name,
    itemListElement: input.items,
  };
}

export function buildListItemForExperience(
  item: ListingItemInput,
  position: number
): SchemaNode | null {
  const url = item.url;
  const name = item.title;
  if (!url || !name) return null;

  const imageObject = buildImageObjectSchema(item.image, {
    id: `${url}#image`,
    fallbackName: name,
  });

  const additionalProperty = [
    item.category
      ? {
          '@type': 'PropertyValue',
          propertyID: 'category',
          name: 'Category',
          value: item.category,
        }
      : null,
    item.series
      ? {
          '@type': 'PropertyValue',
          propertyID: 'series',
          name: 'Series',
          value: item.series,
        }
      : null,
  ].filter(Boolean);

  return {
    '@type': 'ListItem',
    position,
    url,
    name,
    description: item.description,
    image: imageObject,
    additionalProperty: additionalProperty.length > 0 ? additionalProperty : undefined,
  };
}

export function buildExperienceListingGraph(input: ExperienceListingGraphInput): SchemaNode[] {
  const breadcrumb = buildBreadcrumbListSchema(input.breadcrumbs, input.breadcrumbId);
  const listItems = input.items
    .map((item, index) => buildListItemForExperience(item, index + 1))
    .filter(Boolean) as SchemaNode[];
  const itemList =
    listItems.length > 0
      ? buildItemListSchema({
          id: input.itemListId,
          name: `${input.title} list`,
          items: listItems,
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
