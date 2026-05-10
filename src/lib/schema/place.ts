import type { SchemaNode } from './types';

interface PlaceInput {
  id?: string;
  name: string;
  url?: string;
  description?: string;
  image?: SchemaNode;
  addressCountry?: string;
}

export function buildPostalAddressCountryOnly(addressCountry: string = 'TR'): SchemaNode {
  return {
    '@type': 'PostalAddress',
    addressCountry,
  };
}

export function buildPlaceSchema(input: PlaceInput): SchemaNode {
  return {
    '@id': input.id,
    '@type': 'Place',
    name: input.name,
    url: input.url,
    description: input.description,
    image: input.image,
    address: buildPostalAddressCountryOnly(input.addressCountry),
  };
}

export function buildAreaServedPlace(input: PlaceInput): SchemaNode {
  return buildPlaceSchema(input);
}
