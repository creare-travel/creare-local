const DEFAULT_DEV_STRAPI_BASE = 'http://localhost:1337';
const IS_DEVELOPMENT = process.env.NODE_ENV !== 'production';

export const STRAPI_BASE = (
  process.env.NEXT_PUBLIC_STRAPI_URL || (IS_DEVELOPMENT ? DEFAULT_DEV_STRAPI_BASE : '')
).replace(/\/+$/, '');

function getStrapiBase() {
  if (STRAPI_BASE) return STRAPI_BASE;

  throw new Error(
    'NEXT_PUBLIC_STRAPI_URL is required in production for Strapi API and media access.'
  );
}

export function strapiUrl(path: string) {
  if (/^https?:\/\//.test(path)) return path;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${getStrapiBase()}${normalizedPath}`;
}

export function mediaUrl(url?: string) {
  if (!url) return '';
  return strapiUrl(url);
}

export function isLocalAssetUrl(url?: string) {
  if (!url) return false;

  try {
    const parsed = new URL(url);
    return parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';
  } catch {
    return false;
  }
}

export async function fetchStrapi(path: string) {
  const url = strapiUrl(path);

  try {
    const res = await fetch(url, {
      cache: 'no-store',
    });

    if (!res.ok) {
      const responseText = await res.text().catch(() => '');
      const details = responseText ? ` Response: ${responseText.slice(0, 300)}` : '';
      throw new Error(
        `Strapi request failed (${res.status} ${res.statusText}) for ${url}.${details}`
      );
    }

    return await res.json();
  } catch (error) {
    console.error('STRAPI FETCH FAILED:', { path, url, error });
    throw error;
  }
}
