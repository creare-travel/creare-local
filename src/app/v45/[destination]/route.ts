import { after, NextResponse } from 'next/server';
import {
  getV45InvitationDirection,
  sendV45InvitationDirectionAnalytics,
} from '@/lib/analytics/privateInvitationDirections';

interface RouteContext {
  params: Promise<{
    destination?: string | string[];
  }>;
}

export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: RouteContext) {
  const { destination } = await params;
  const direction = getV45InvitationDirection(destination);

  if (!direction) {
    return new NextResponse('Not found', {
      status: 404,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
        'X-Robots-Tag': 'noindex',
      },
    });
  }

  after(async () => {
    await sendV45InvitationDirectionAnalytics(direction);
  });

  const response = NextResponse.redirect(direction.mapsUrl, 302);
  response.headers.set('Cache-Control', 'no-store, max-age=0');

  return response;
}
