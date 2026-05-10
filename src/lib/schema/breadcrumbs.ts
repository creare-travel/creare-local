import type { BreadcrumbItemInput, SchemaNode } from './types';
import { normalizeBreadcrumbName } from './utils';

export function buildBreadcrumbListSchema(items: BreadcrumbItemInput[], id?: string): SchemaNode {
  return {
    '@id': id,
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: normalizeBreadcrumbName(item),
      item: item.url,
    })),
  };
}
