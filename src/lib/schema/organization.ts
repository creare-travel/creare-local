import type { SchemaNode } from './types';
import { BRAND_ID, ORGANIZATION_ID, SITE_URL, WEBSITE_ID } from './utils';

const LOGO_URL =
  'https://img.rocket.new/generatedImages/rocket_gen_img_167773a44-1775598260952.png';

export function buildOrganizationReference(): SchemaNode {
  return { '@id': ORGANIZATION_ID };
}

export function buildOrganizationSchema(): SchemaNode {
  return {
    '@id': ORGANIZATION_ID,
    '@type': ['Organization', 'ProfessionalService'],
    name: 'CREARE',
    legalName: 'CREARE Travel Consultancy Limited Co.',
    description: 'Experience design studio creating private cultural encounters.',
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      '@id': `${ORGANIZATION_ID}-logo`,
      url: LOGO_URL,
      contentUrl: LOGO_URL,
      name: 'CREARE logo',
    },
    brand: { '@id': BRAND_ID },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+90-541-220-3000',
      email: 'direct@crearetravel.com',
      contactType: 'customer service',
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Ferko Signature Plaza, Buyukdere Cd. No.175',
      addressLocality: 'Şişli',
      addressRegion: 'İstanbul',
      addressCountry: 'TR',
    },
    areaServed: {
      '@type': 'Place',
      name: 'Turkey',
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'TR',
      },
    },
    serviceType: 'Private Cultural Experience Design',
  };
}

export function buildBrandSchema(): SchemaNode {
  return {
    '@id': BRAND_ID,
    '@type': 'Brand',
    name: 'CREARE',
    description: 'Privately composed cultural encounters for a limited circle of clients.',
    url: SITE_URL,
    logo: LOGO_URL,
    isPartOf: { '@id': ORGANIZATION_ID },
  };
}

export function buildWebSiteSchema(): SchemaNode {
  return {
    '@id': WEBSITE_ID,
    '@type': 'WebSite',
    name: 'Creare',
    url: SITE_URL,
    description: 'Private cultural access. Thoughtfully designed encounters.',
    publisher: { '@id': ORGANIZATION_ID },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/experiences`,
    },
  };
}
