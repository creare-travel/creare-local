export interface StrapiRichTextNode {
  type: string;
  children?: StrapiRichTextNode[];
  text?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
}

export interface StrapiImageFormat {
  url?: string;
  width?: number;
  height?: number;
  mime?: string;
}

export interface StrapiImage {
  url?: string;
  name?: string;
  alternativeText?: string;
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
  mime?: string;
  formats?: {
    large?: StrapiImageFormat;
    medium?: StrapiImageFormat;
    small?: StrapiImageFormat;
  };
}

export interface StrapiDestination {
  id?: number;
  name?: string;
  slug?: string;
  highlight?: string;
  short_description?: string;
  intro_text?: string;
  meta_title?: string;
  meta_description?: string;
  visibility_status?: string;
  cover_image?: StrapiImage | null;
}

export interface StrapiVenue {
  name?: string;
  description?: string;
  address?: string;
}

export interface StrapiOntologyEntity {
  name?: string;
  slug?: string;
  description?: string;
  same_as?: string[];
  sameAs?: string[];
  semantic_tags?: string[];
  external_reference_url?: string;
  confidence_score?: number;
}

export interface StrapiExperience {
  id?: number;
  documentId?: string;
  title?: string;
  slug?: string;
  short_description?: string;
  description?: StrapiRichTextNode[] | string;
  wow_moment?: string;
  differentiator?: string;
  experience_type?: string | null;
  intent_level?: string;
  seo_title?: string;
  seo_description?: string;
  category?: string;
  tier?: string;
  series?: string | null;
  location_label?: string;
  destination?: StrapiDestination | null;
  duration?: string;
  max_guests?: string | number;
  group_size?: string;
  program?: StrapiRichTextNode[] | string;
  audience?: StrapiRichTextNode[] | string;
  cta_enabled?: boolean;
  cta_text?: string;
  geo_experience_type?: string | null;
  mood?: string | null;
  audience_segment?: string | null;
  intensity?: string | null;
  mood_entity?: StrapiOntologyEntity | null;
  audience_entity?: StrapiOntologyEntity | null;
  experience_type_entity?: StrapiOntologyEntity | null;
  intensity_entity?: StrapiOntologyEntity | null;
  cover_image?: StrapiImage | null;
  gallery?: StrapiImage[];
  order?: number;
  order_index?: number;
}

export interface BreadcrumbItemInput {
  name?: string;
  url: string;
  slugFallback?: string;
}

export interface ListingItemInput {
  title?: string;
  slug?: string;
  url?: string;
  description?: string;
  image?: StrapiImage | null;
  category?: string;
  series?: string | null;
  destinationName?: string | null;
}

export interface ArticleInput {
  title?: string;
  slug?: string;
  description?: string;
  excerpt?: string;
  content?: StrapiRichTextNode[] | string | unknown;
  image?: StrapiImage | null;
  destinationName?: string | null;
  destinationSlug?: string | null;
  publishedAt?: string | null;
  updatedAt?: string | null;
  inLanguage?: string | null;
}

export interface ContactPageInput {
  title: string;
  description: string;
  path: string;
  email?: string;
  telephone?: string;
}

export interface SchemaNode {
  [key: string]: unknown;
}
