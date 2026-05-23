import { NextRequest, NextResponse } from 'next/server';

const CANONICAL_HOST = 'crearetravel.com';
const WWW_HOST = 'www.crearetravel.com';

export function middleware(request: NextRequest) {
  if (request.nextUrl.hostname !== WWW_HOST) {
    return NextResponse.next();
  }

  const canonicalUrl = request.nextUrl.clone();
  canonicalUrl.hostname = CANONICAL_HOST;
  canonicalUrl.protocol = 'https';

  return NextResponse.redirect(canonicalUrl, 308);
}

export const config = {
  matcher: '/:path*',
};
