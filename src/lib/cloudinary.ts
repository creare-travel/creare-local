import type { ImageLoaderProps } from 'next/image';

export type CloudinaryDeliveryProfile =
  | 'default'
  | 'hero'
  | 'card'
  | 'cardPortrait'
  | 'editorial'
  | 'editorialWide'
  | 'square';

type CloudinaryFormat = 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
type CloudinaryCrop = 'fill' | 'limit' | 'fit' | 'crop' | 'scale';
type CloudinaryGravity = 'auto' | 'center' | 'face' | 'faces' | 'subject';
type CloudinaryDpr = 'auto' | number;
type CloudinaryQualityPreset = 'auto' | `auto:${string}` | number;

interface CloudinaryAssetInfo {
  src: string;
  isCloudinary: boolean;
  cloudName?: string | null;
  publicId?: string | null;
  profile: CloudinaryDeliveryProfile;
  quality: CloudinaryQualityPreset;
}

interface CloudinaryTransformOptions {
  profile?: CloudinaryDeliveryProfile;
  width?: number;
  height?: number;
  quality?: CloudinaryQualityPreset;
  dpr?: CloudinaryDpr;
  format?: CloudinaryFormat;
  crop?: CloudinaryCrop;
  gravity?: CloudinaryGravity;
  aspectRatio?: string;
}

interface CloudinaryPreset {
  quality: CloudinaryQualityPreset;
  crop: CloudinaryCrop;
  gravity: CloudinaryGravity;
  aspectRatio?: string;
}

const CLOUDINARY_HOSTNAME = 'res.cloudinary.com';
const CLOUDINARY_UPLOAD_SEGMENT = '/image/upload/';
const DEFAULT_CLOUDINARY_CLOUD_NAME = 'djr97wm0n';

const PROFILE_ALIASES: Record<CloudinaryDeliveryProfile, CloudinaryDeliveryProfile> = {
  default: 'default',
  hero: 'hero',
  card: 'card',
  cardPortrait: 'cardPortrait',
  editorial: 'editorial',
  editorialWide: 'editorialWide',
  square: 'square',
};

export const CLOUDINARY_PRESETS: Record<CloudinaryDeliveryProfile, CloudinaryPreset> = {
  default: {
    quality: 'auto',
    crop: 'fill',
    gravity: 'auto',
  },
  hero: {
    quality: 'auto:good',
    crop: 'fill',
    gravity: 'auto',
    aspectRatio: '16:9',
  },
  cardPortrait: {
    quality: 'auto:eco',
    crop: 'fill',
    gravity: 'auto',
    aspectRatio: '3:4',
  },
  card: {
    quality: 'auto:eco',
    crop: 'fill',
    gravity: 'auto',
  },
  editorial: {
    quality: 'auto:good',
    crop: 'fill',
    gravity: 'auto',
  },
  editorialWide: {
    quality: 'auto:good',
    crop: 'fill',
    gravity: 'auto',
    aspectRatio: '21:9',
  },
  square: {
    quality: 'auto:good',
    crop: 'fill',
    gravity: 'auto',
    aspectRatio: '1:1',
  },
};

function normalizeProfile(profile: CloudinaryDeliveryProfile = 'default') {
  return PROFILE_ALIASES[profile] ?? 'default';
}

function normalizeQualityValue(quality: CloudinaryQualityPreset) {
  return `q_${quality}`;
}

function normalizeCropValue(crop: CloudinaryCrop) {
  return `c_${crop}`;
}

function normalizeGravityValue(gravity: CloudinaryGravity) {
  return `g_${gravity}`;
}

function normalizeAspectRatioValue(aspectRatio?: string) {
  return aspectRatio ? `ar_${aspectRatio}` : null;
}

function isCloudinaryHostname(hostname: string) {
  return hostname === CLOUDINARY_HOSTNAME || hostname.endsWith(`.${CLOUDINARY_HOSTNAME}`);
}

function getCloudinaryCloudName() {
  const publicCloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim();
  if (publicCloudName) return publicCloudName;

  const serverCloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  if (serverCloudName) return serverCloudName;

  return DEFAULT_CLOUDINARY_CLOUD_NAME;
}

function roundDimension(value?: number) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
    ? Math.round(value)
    : null;
}

function getPreset(profile: CloudinaryDeliveryProfile = 'default') {
  return CLOUDINARY_PRESETS[normalizeProfile(profile) as keyof typeof CLOUDINARY_PRESETS];
}

function getCloudNameFromUrl(src: string) {
  if (!isCloudinaryUrl(src)) return null;

  try {
    const parsed = new URL(src);
    const parts = parsed.pathname.split('/').filter(Boolean);
    return parts[0] || null;
  } catch {
    return null;
  }
}

export function isCloudinaryUrl(src?: string) {
  if (!src) return false;

  try {
    return isCloudinaryHostname(new URL(src).hostname);
  } catch {
    return false;
  }
}

export function getCloudinaryPublicId(src?: string) {
  if (!src || !isCloudinaryUrl(src)) return null;

  try {
    const parsed = new URL(src);
    const uploadIndex = parsed.pathname.indexOf(CLOUDINARY_UPLOAD_SEGMENT);

    if (uploadIndex === -1) return null;

    const suffix = parsed.pathname
      .slice(uploadIndex + CLOUDINARY_UPLOAD_SEGMENT.length)
      .replace(/^\/+/, '');

    const publicId = suffix.replace(/\.[a-z0-9]+$/i, '');

    return publicId || null;
  } catch {
    return null;
  }
}

export function buildCloudinaryUrl(
  publicIdOrSrc: string,
  options: CloudinaryTransformOptions = {}
) {
  if (!publicIdOrSrc) return publicIdOrSrc;

  if (isCloudinaryUrl(publicIdOrSrc)) {
    return createOptimizedImageUrl(publicIdOrSrc, options);
  }

  const cloudName = getCloudinaryCloudName();

  if (!cloudName) return publicIdOrSrc;

  const profile = normalizeProfile(options.profile);
  const preset = getPreset(profile);
  const width = roundDimension(options.width);
  const height = roundDimension(options.height);
  const quality = options.quality ?? preset.quality;
  const crop = options.crop ?? preset.crop;
  const gravity = options.gravity ?? preset.gravity;
  const aspectRatio = options.aspectRatio ?? preset.aspectRatio;
  const transforms = [
    `f_${options.format ?? 'auto'}`,
    normalizeQualityValue(quality),
    options.dpr === undefined || options.dpr === 'auto' ? 'dpr_auto' : `dpr_${options.dpr}`,
    normalizeCropValue(crop),
    normalizeGravityValue(gravity),
    normalizeAspectRatioValue(aspectRatio),
    width ? `w_${width}` : null,
    height ? `h_${height}` : null,
  ].filter(Boolean);

  return `https://${CLOUDINARY_HOSTNAME}/${cloudName}/image/upload/${transforms.join(',')}/${publicIdOrSrc.replace(/^\/+/, '')}`;
}

export function createOptimizedImageUrl(src: string, options: CloudinaryTransformOptions = {}) {
  if (!isCloudinaryUrl(src)) return src;

  try {
    const parsed = new URL(src);
    const uploadIndex = parsed.pathname.indexOf(CLOUDINARY_UPLOAD_SEGMENT);

    if (uploadIndex === -1) return src;

    const profile = normalizeProfile(options.profile);
    const preset = getPreset(profile);
    const quality = options.quality ?? preset.quality;
    const crop = options.crop ?? preset.crop;
    const gravity = options.gravity ?? preset.gravity;
    const aspectRatio = options.aspectRatio ?? preset.aspectRatio;
    const width = roundDimension(options.width);
    const height = roundDimension(options.height);

    const prefix = parsed.pathname.slice(0, uploadIndex + CLOUDINARY_UPLOAD_SEGMENT.length);
    const suffix = parsed.pathname
      .slice(uploadIndex + CLOUDINARY_UPLOAD_SEGMENT.length)
      .replace(/^\/+/, '');

    const transforms = [
      `f_${options.format ?? 'auto'}`,
      normalizeQualityValue(quality),
      options.dpr === undefined || options.dpr === 'auto' ? 'dpr_auto' : `dpr_${options.dpr}`,
      normalizeCropValue(crop),
      normalizeGravityValue(gravity),
      normalizeAspectRatioValue(aspectRatio),
      width ? `w_${width}` : null,
      height ? `h_${height}` : null,
    ].filter(Boolean);

    parsed.pathname = `${prefix}${transforms.join(',')}/${suffix}`;
    return parsed.toString();
  } catch {
    return src;
  }
}

export function normalizeCloudinaryAsset(
  src: string,
  options: Pick<CloudinaryTransformOptions, 'profile' | 'quality'> = {}
): CloudinaryAssetInfo {
  const profile = normalizeProfile(options.profile);
  const preset = getPreset(profile);

  return {
    src,
    isCloudinary: isCloudinaryUrl(src),
    cloudName: getCloudNameFromUrl(src) ?? getCloudinaryCloudName(),
    publicId: getCloudinaryPublicId(src),
    profile,
    quality: options.quality ?? preset.quality,
  };
}

export function cloudinaryLoader(
  { src, width, quality }: ImageLoaderProps,
  options: Pick<CloudinaryTransformOptions, 'profile'> = {}
) {
  return createOptimizedImageUrl(src, {
    width,
    quality: quality ?? getPreset(options.profile).quality,
    profile: options.profile ?? 'default',
  });
}
