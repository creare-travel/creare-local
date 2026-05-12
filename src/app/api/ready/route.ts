import { NextResponse } from 'next/server';

export function GET() {
  return NextResponse.json(
    {
      status: 'ready',
    },
    {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    }
  );
}
