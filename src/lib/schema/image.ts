import type { SchemaNode, StrapiImage, StrapiImageFormat } from './types';
import { absoluteUrl, getPrimaryDescription } from './utils';

interface BuildImageObjectOptions {
  id?: string;
  fallbackName: string;
  representativeOfPage?: boolean;
}

interface ResolvedImageAsset {
  url: string;
  width?: number;
  height?: number;
  mime?: string;
}

function getPreferredImageFormat(image?: StrapiImage | null): StrapiImageFormat | undefined {
  return image?.formats?.large ?? image?.formats?.medium ?? image?.formats?.small;
}

export function resolveImageAsset(image?: StrapiImage | null): ResolvedImageAsset | undefined {
  if (!image) return undefined;

  const preferred = getPreferredImageFormat(image);
  const rawUrl = preferred?.url ?? image.url;
  const url = absoluteUrl(rawUrl);

  if (!url) return undefined;

  return {
    url,
    width: preferred?.width ?? image.width,
    height: preferred?.height ?? image.height,
    mime: preferred?.mime ?? image.mime,
  };
}

export function buildImageObjectSchema(
  image: StrapiImage | null | undefined,
  options: BuildImageObjectOptions
): SchemaNode | undefined {
  const asset = resolveImageAsset(image);
  if (!asset) return undefined;

  const alternativeText = getPrimaryDescription(image?.alternativeText, image?.alt);
  const caption = getPrimaryDescription(image?.caption);

  return {
    '@id': options.id,
    '@type': 'ImageObject',
    url: asset.url,
    contentUrl: asset.url,
    name: `${options.fallbackName} cover image`,
    description: alternativeText,
    caption,
    width: asset.width,
    height: asset.height,
    encodingFormat: asset.mime,
    representativeOfPage: options.representativeOfPage ? true : undefined,
  };
}
