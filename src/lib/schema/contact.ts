import { buildBreadcrumbListSchema } from './breadcrumbs';
import { buildOrganizationReference } from './organization';
import { buildWebPageSchema } from './webpage';
import type { ContactPageInput, SchemaNode } from './types';
import { buildCanonicalUrl, contactIds } from './utils';

export function buildContactPageGraph(input: ContactPageInput): SchemaNode[] {
  const ids = contactIds();
  const breadcrumb = buildBreadcrumbListSchema(
    [
      { name: 'Home', url: buildCanonicalUrl('/') },
      { name: 'Contact', url: ids.canonical },
    ],
    ids.breadcrumbs
  );

  const page = buildWebPageSchema({
    id: ids.webpage,
    type: 'ContactPage',
    url: ids.canonical,
    name: input.title,
    description: input.description,
    breadcrumbId: ids.breadcrumbs,
    mainEntity: buildOrganizationReference(),
  });

  const contactPoint =
    input.email || input.telephone
      ? {
          '@type': 'ContactPoint',
          email: input.email,
          telephone: input.telephone,
          contactType: 'customer service',
        }
      : null;

  const contactPage = {
    ...page,
    contactPoint,
    about: buildOrganizationReference(),
  };

  return [breadcrumb, contactPage].filter(Boolean) as SchemaNode[];
}
