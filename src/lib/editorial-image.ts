export interface EditorialImageLike {
  id?: number | string | null;
  name?: string | null;
  url?: string | null;
}

const CREARE_PLACEHOLDER_MEDIA_ID = 59;
const CREARE_PLACEHOLDER_FILENAME = 'creare-image-placeholder.jpg';
const CREARE_PLACEHOLDER_CLOUDINARY_FILENAME = 'creare_image_placeholder_3c5059c819.jpg';

function getUrlFilename(url: string): string {
  try {
    const pathname = new URL(url, 'https://creare.invalid').pathname;
    return decodeURIComponent(pathname.split('/').pop() ?? '').toLowerCase();
  } catch {
    return url.split(/[/?#]/).filter(Boolean).pop()?.toLowerCase() ?? '';
  }
}

export function isKnownEditorialImageSentinel(image?: EditorialImageLike | null): boolean {
  if (!image) return false;

  if (Number(image.id) === CREARE_PLACEHOLDER_MEDIA_ID) return true;
  if (image.name?.trim().toLowerCase() === CREARE_PLACEHOLDER_FILENAME) return true;

  const filename = image.url ? getUrlFilename(image.url) : '';
  return (
    filename === CREARE_PLACEHOLDER_FILENAME || filename === CREARE_PLACEHOLDER_CLOUDINARY_FILENAME
  );
}

export function isRenderableEditorialImage<T extends EditorialImageLike>(
  image?: T | null
): image is T & { url: string } {
  return Boolean(image?.url?.trim()) && !isKnownEditorialImageSentinel(image);
}
