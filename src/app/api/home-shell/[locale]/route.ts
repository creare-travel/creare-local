import type { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const SOURCE_PATHS = {
  en: '/home-source-internal',
  tr: '/tr/home-source-internal',
  zh: '/zh/home-source-internal',
  ru: '/ru/home-source-internal',
} as const;

type HomeLocale = keyof typeof SOURCE_PATHS;

function isHomeLocale(value: string): value is HomeLocale {
  return value in SOURCE_PATHS;
}

function stripNextHydration(html: string) {
  return html
    .replace(/<link[^>]+rel="preload"[^>]+as="script"[^>]*>/g, '')
    .replace(/<script[^>]+src="\/_next\/[^"]+\.js"[^>]*><\/script>/g, '')
    .replace(/<script>\s*self\.__next_f\.push\([\s\S]*?<\/script>/g, '')
    .replace('</body>', '<script src="/home-shell.js" defer></script></body>');
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ locale: string }> }
) {
  const { locale } = await params;
  if (!isHomeLocale(locale)) {
    return new Response('Not found', { status: 404 });
  }

  const sourceUrl = new URL(SOURCE_PATHS[locale], request.url);
  const sourceHeaders = new Headers({
    'x-creare-home-shell-source': '1',
  });

  const cookie = request.headers.get('cookie');
  if (cookie) sourceHeaders.set('cookie', cookie);
  const bypass = request.headers.get('x-vercel-protection-bypass');
  if (bypass) sourceHeaders.set('x-vercel-protection-bypass', bypass);

  const upstream = await fetch(sourceUrl, {
    headers: sourceHeaders,
    cache: 'no-store',
  });

  const contentType = upstream.headers.get('content-type') ?? '';
  if (!upstream.ok || !contentType.includes('text/html')) {
    return new Response('Homepage source unavailable', { status: 502 });
  }

  const transformed = stripNextHydration(await upstream.text());
  if (!transformed.includes(`data-locale="${locale}"`)) {
    return new Response('Homepage source validation failed', { status: 502 });
  }

  return new Response(transformed, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=0, must-revalidate',
      'CDN-Cache-Control': 's-maxage=300, stale-while-revalidate=86400',
      'Vercel-CDN-Cache-Control': 's-maxage=300, stale-while-revalidate=86400',
      'X-Creare-Home-Shell': '1',
    },
  });
}