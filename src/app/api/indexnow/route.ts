import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const SITE_URL = 'https://crearetravel.com';
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';
const INDEXNOW_KEY = '4737597bd33d59dd78c30ce805e44bb1';
const INDEXNOW_KEY_LOCATION = `${SITE_URL}/${INDEXNOW_KEY}.txt`;
const MAX_URLS = 10_000;

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  return Boolean(secret && request.headers.get('authorization') === `Bearer ${secret}`);
}

function extractCanonicalUrls(sitemap: string): string[] {
  const matches = sitemap.matchAll(/<loc>([^<]+)<\/loc>/g);
  const urls = Array.from(matches, ([, value]) => value.trim());

  return Array.from(new Set(urls))
    .filter((value) => {
      try {
        return new URL(value).origin === SITE_URL;
      } catch {
        return false;
      }
    })
    .slice(0, MAX_URLS);
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sitemapResponse = await fetch(`${SITE_URL}/sitemap.xml`, { cache: 'no-store' });
  if (!sitemapResponse.ok) {
    return NextResponse.json({ error: 'Sitemap unavailable' }, { status: 502 });
  }

  const urlList = extractCanonicalUrls(await sitemapResponse.text());
  if (urlList.length === 0) {
    return NextResponse.json({ error: 'Sitemap contained no canonical URLs' }, { status: 502 });
  }

  const indexNowResponse = await fetch(INDEXNOW_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host: 'crearetravel.com',
      key: INDEXNOW_KEY,
      keyLocation: INDEXNOW_KEY_LOCATION,
      urlList,
    }),
  });

  if (!indexNowResponse.ok) {
    return NextResponse.json(
      { error: 'IndexNow submission failed', status: indexNowResponse.status },
      { status: 502 }
    );
  }

  return NextResponse.json(
    { submitted: urlList.length, indexNowStatus: indexNowResponse.status },
    { headers: { 'Cache-Control': 'no-store, max-age=0' } }
  );
}
