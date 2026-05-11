import { buildBreadcrumbListSchema } from './breadcrumbs';
import { buildOrganizationReference } from './organization';
import type { SchemaNode } from './types';
import { WEBSITE_ID, buildCanonicalUrl } from './utils';

interface WebPageInput {
  id: string;
  url: string;
  name: string;
  description?: string;
  type?: 'WebPage' | 'CollectionPage' | 'ContactPage' | 'AboutPage';
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

const HOMEPAGE_ID = `${buildCanonicalUrl('/')}#webpage`;
const PHILOSOPHY_PAGE_ID = `${buildCanonicalUrl('/philosophy')}#webpage`;
const PHILOSOPHY_BREADCRUMB_ID = `${buildCanonicalUrl('/philosophy')}#breadcrumbs`;
const PHILOSOPHY_DOCTRINE_ID = `${buildCanonicalUrl('/philosophy')}#doctrine`;

function buildAuthorityPageReference(
  name: string,
  url: string,
  type: 'WebPage' | 'CollectionPage' | 'AboutPage' = 'WebPage',
  description?: string
): SchemaNode {
  return {
    '@type': type,
    name,
    url,
    description,
  };
}

export function buildHomepageWebPageGraph(): SchemaNode[] {
  const connectedPages = [
    buildAuthorityPageReference(
      'Signature Experiences',
      buildCanonicalUrl('/experiences/signature'),
      'CollectionPage',
      'Curated cultural experiences composed around access, place, and narrative.'
    ),
    buildAuthorityPageReference(
      'LAB Experiences',
      buildCanonicalUrl('/experiences/lab'),
      'CollectionPage',
      'Custom cultural experiences designed from scratch around a client brief.'
    ),
    buildAuthorityPageReference(
      'BLACK Experiences',
      buildCanonicalUrl('/experiences/black'),
      'CollectionPage',
      'Private-access cultural encounters available by invitation and introduction.'
    ),
    buildAuthorityPageReference(
      'Cultural Worlds',
      buildCanonicalUrl('/cultural-worlds'),
      'CollectionPage',
      'The contextual cultural worlds that give CREARE experiences meaning and place.'
    ),
    buildAuthorityPageReference(
      'Philosophy',
      buildCanonicalUrl('/philosophy'),
      'AboutPage',
      'The conceptual doctrine behind CREARE and its approach to experience design.'
    ),
    buildAuthorityPageReference(
      'Insights',
      buildCanonicalUrl('/insights'),
      'CollectionPage',
      'Editorial thinking on private cultural access, experience design, and context.'
    ),
  ];

  const homepage = {
    ...buildWebPageSchema({
      id: HOMEPAGE_ID,
      url: buildCanonicalUrl('/'),
      name: 'Creare — Experiences Composed as Art',
      description:
        'The primary gateway to CREARE, a cultural experience design studio composing private encounters through access, context, and narrative.',
      mainEntity: buildOrganizationReference(),
      about: [
        buildOrganizationReference(),
        {
          '@type': 'Thing',
          name: 'Cultural Experience Design',
          description:
            'A practice of designing private cultural encounters through place, narrative, and human context rather than package travel.',
        },
      ],
    }),
    significantLink: connectedPages.map((page) => page.url),
    hasPart: connectedPages,
    mentions: connectedPages,
  };

  return [homepage];
}

export function buildPhilosophyPageGraph(): SchemaNode[] {
  const connectedPages = [
    buildAuthorityPageReference(
      'Signature Experiences',
      buildCanonicalUrl('/experiences/signature')
    ),
    buildAuthorityPageReference('LAB Experiences', buildCanonicalUrl('/experiences/lab')),
    buildAuthorityPageReference('BLACK Experiences', buildCanonicalUrl('/experiences/black')),
    buildAuthorityPageReference('Insights', buildCanonicalUrl('/insights'), 'CollectionPage'),
    buildAuthorityPageReference(
      'Cultural Worlds',
      buildCanonicalUrl('/cultural-worlds'),
      'CollectionPage'
    ),
  ];

  const breadcrumb = buildBreadcrumbListSchema(
    [
      { name: 'Home', url: buildCanonicalUrl('/') },
      { name: 'Philosophy', url: buildCanonicalUrl('/philosophy') },
    ],
    PHILOSOPHY_BREADCRUMB_ID
  );

  const doctrine = {
    '@id': PHILOSOPHY_DOCTRINE_ID,
    '@type': 'CreativeWork',
    name: 'The Creare Philosophy',
    description:
      'The conceptual doctrine behind CREARE: experiences are composed through access, cultural intelligence, restraint, and human context rather than itinerary logic.',
    author: buildOrganizationReference(),
    publisher: buildOrganizationReference(),
    isPartOf: { '@id': WEBSITE_ID },
    about: [
      {
        '@type': 'Thing',
        name: 'Cultural Experience Design',
      },
      {
        '@type': 'Thing',
        name: 'Private Cultural Access',
      },
      {
        '@type': 'Thing',
        name: 'Editorial Experience Composition',
      },
    ],
  };

  const philosophyPage = {
    ...buildWebPageSchema({
      id: PHILOSOPHY_PAGE_ID,
      type: 'AboutPage',
      url: buildCanonicalUrl('/philosophy'),
      name: 'Philosophy',
      description:
        'The CREARE philosophy: a conceptual foundation for cultural experience design, private access, and composed encounters.',
      breadcrumbId: PHILOSOPHY_BREADCRUMB_ID,
      mainEntity: { '@id': PHILOSOPHY_DOCTRINE_ID },
      about: buildOrganizationReference(),
    }),
    significantLink: connectedPages.map((page) => page.url),
    mentions: connectedPages,
  };

  return [breadcrumb, doctrine, philosophyPage];
}
