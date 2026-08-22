import { NextResponse } from 'next/server';
import { getMailConfig } from '@/lib/email/config';

function getCommitSha() {
  return (
    process.env.VERCEL_GIT_COMMIT_SHA?.trim() ||
    process.env.COMMIT_SHA?.trim() ||
    process.env.GIT_COMMIT_SHA?.trim() ||
    null
  );
}

export function GET() {
  const strapiConfigured = Boolean(process.env.NEXT_PUBLIC_STRAPI_URL?.trim());
  let resendConfigured = false;
  try {
    getMailConfig();
    resendConfigured = true;
  } catch {
    resendConfigured = false;
  }

  return NextResponse.json(
    {
      status: 'ok',
      app: 'creare-local',
      environment: process.env.NODE_ENV ?? 'development',
      timestamp: new Date().toISOString(),
      commitSha: getCommitSha(),
      strapiConfigured,
      resendConfigured,
    },
    {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    }
  );
}
