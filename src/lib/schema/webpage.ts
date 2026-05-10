import type { SchemaNode } from './types';
import { WEBSITE_ID } from './utils';

interface WebPageInput {
  id: string;
  url: string;
  name: string;
  description?: string;
  type?: 'WebPage' | 'CollectionPage' | 'ContactPage';
  image?: SchemaNode;
  breadcrumbId?: string;
  mainEntity?: SchemaNode;
  about?: SchemaNode | SchemaNode[];
  inLanguage?: string;
}

export function buildWebPageSchema(input: WebPageInput): SchemaNode {
  return {
    '@id': input.id,
    '@type': input.type ?? 'WebPage',
    name: input.name,
    description: input.description,
    url: input.url,
    isPartOf: { '@id': WEBSITE_ID },
    image: input.image,
    breadcrumb: input.breadcrumbId ? { '@id': input.breadcrumbId } : undefined,
    mainEntity: input.mainEntity,
    about: input.about,
    inLanguage: input.inLanguage,
  };
}
