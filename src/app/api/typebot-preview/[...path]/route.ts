import type { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const TYPEBOT_ID = 'cmufapz3700000agmskmdsvaz';
const TYPEBOT_ORIGIN = 'https://app.typebot.com';

function notFound() {
  return new Response('Not found', {
    status: 404,
    headers: { 'Cache-Control': 'no-store' },
  });
}

function isAllowedPath(path: string) {
  if (path === `api/v1/typebots/${TYPEBOT_ID}/preview/startChat`) return true;
  return /^api\/v1\/sessions\/[A-Za-z0-9_-]+\/continueChat$/.test(path);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  if (process.env.VERCEL_ENV === 'production') return notFound();

  const token = process.env.TYPEBOT_API_TOKEN;
  if (!token) {
    return Response.json(
      { success: false, error: 'Preview bridge is unavailable.' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const { path } = await params;
  const upstreamPath = path.join('/');
  if (!isAllowedPath(upstreamPath)) return notFound();

  try {
    const body = await request.arrayBuffer();
    const contentType = request.headers.get('content-type') || 'application/json';

    const upstream = await fetch(`${TYPEBOT_ORIGIN}/${upstreamPath}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': contentType,
        Accept: 'application/json',
      },
      body,
      cache: 'no-store',
      signal: AbortSignal.timeout(45_000),
    });

    return new Response(upstream.body, {
      status: upstream.status,
      headers: {
        'Content-Type': upstream.headers.get('content-type') || 'application/json',
        'Cache-Control': 'no-store',
      },
    });
  } catch {
    return Response.json(
      { success: false, error: 'Preview bridge is temporarily unavailable.' },
      { status: 502, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
