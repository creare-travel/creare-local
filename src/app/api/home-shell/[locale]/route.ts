import type { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const SOURCE_PATHS = {
  en: '/home-source-internal',
  tr: '/tr/home-source-internal',
  zh: '/zh/home-source-internal',
  ru: '/ru/home-source-internal',
} as const;

function failure(message: string, status = 502) {
  return new Response(message, { status, headers: { 'Cache-Control': 'no-store' } });
}

function attribute(tag: string, name: string) {
  const match = tag.match(
    new RegExp('\\s' + name + '\\s*=\\s*(?:"([^"]*)"|\'([^\']*)\'|([^\\s>]+))', 'i')
  );
  return match?.[1] ?? match?.[2] ?? match?.[3] ?? '';
}

function isNextScript(src: string) {
  return /^\/_next\/[^?#]+\.js(?:[?#]|$)/.test(src);
}

function stripNextHydration(html: string) {
  return html
    .replace(/<link\b[^>]*>/gi, (tag) => {
      const rel = attribute(tag, 'rel').toLowerCase();
      return isNextScript(attribute(tag, 'href')) &&
        (rel === 'modulepreload' || (rel === 'preload' && attribute(tag, 'as') === 'script'))
        ? ''
        : tag;
    })
    .replace(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi, (tag, attrs: string, body: string) => {
      if (attribute('<script ' + attrs + '>', 'type') === 'application/ld+json') return tag;
      return isNextScript(attribute('<script ' + attrs + '>', 'src')) ||
        /^\s*(?:\(self\.__next_f\s*=|self\.__next_f\.push\()/.test(body)
        ? ''
        : tag;
    })
    .replace(
      '</body>',
      '<script src="/home-shell.js" defer></script><script src="/assistant-shell.js" defer></script></body>'
    );
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ locale: string }> }
) {
  const { locale } = await params;
  if (!Object.prototype.hasOwnProperty.call(SOURCE_PATHS, locale)) return failure('Not found', 404);
  if (request.headers.has('rsc')) return failure('Document requests only', 400);

  // Never send credentials to an origin derived from an incoming Host header.
  const deploymentHost = process.env.VERCEL_URL;
  const localUrl = new URL(request.url);
  let origin: string;
  const isProduction = process.env.VERCEL_ENV === 'production';
  if (isProduction) {
    // Generated deployment URLs stay protected even when production domains are public.
    origin = 'https://crearetravel.com';
  } else if (deploymentHost && /^[a-zA-Z0-9.-]+\.vercel\.app$/.test(deploymentHost)) {
    origin = 'https://' + deploymentHost;
  } else if (
    !process.env.VERCEL &&
    ['localhost', '127.0.0.1', '[::1]'].includes(localUrl.hostname)
  ) {
    origin = localUrl.origin;
  } else {
    return failure('Homepage origin unavailable');
  }

  const headers = new Headers({ 'x-creare-home-shell-source': '1' });
  // Preview credentials are sent only to that deployment, never to the public origin.
  if (!isProduction && deploymentHost) {
    const accessCookie = request.cookies.get('_vercel_jwt')?.value;
    if (accessCookie) headers.set('cookie', '_vercel_jwt=' + accessCookie);
    const bypass = request.headers.get('x-vercel-protection-bypass');
    if (bypass) headers.set('x-vercel-protection-bypass', bypass);
  }

  try {
    const upstream = await fetch(
      new URL(SOURCE_PATHS[locale as keyof typeof SOURCE_PATHS], origin),
      {
        headers,
        cache: 'no-store',
        redirect: 'manual',
        signal: AbortSignal.timeout(10000),
      }
    );
    if (!upstream.ok || !upstream.headers.get('content-type')?.includes('text/html')) {
      return failure('Homepage source unavailable');
    }
    const html = await upstream.text();
    if (!html.includes(`data-locale="${locale}"`) || !html.includes('global-schema-jsonld')) {
      return failure('Homepage source validation failed');
    }
    const transformed = stripNextHydration(html);
    return new Response(transformed, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=0, must-revalidate',
        'CDN-Cache-Control': 's-maxage=300, stale-while-revalidate=300',
        'Vercel-CDN-Cache-Control': 's-maxage=300, stale-while-revalidate=300',
        'X-Creare-Home-Shell': '1',
        Vary: 'RSC',
      },
    });
  } catch {
    return failure('Homepage source unavailable');
  }
}
