import { NextRequest, NextResponse } from 'next/server';
import { MailConfigurationError } from '@/lib/email/config';
import { submitInquiry } from '@/lib/email/submitInquiry';
import { generateInquiryReference, parseInquirySubmission } from '@/lib/inquiry';

const MAX_REQUEST_BYTES = 16_384;

export async function POST(request: NextRequest) {
  const referenceId = generateInquiryReference();

  try {
    const contentLength = Number(request.headers.get('content-length') || '0');
    if (contentLength > MAX_REQUEST_BYTES) {
      return NextResponse.json({ success: false, error: 'Request is too large.' }, { status: 413 });
    }

    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).byteLength > MAX_REQUEST_BYTES) {
      return NextResponse.json({ success: false, error: 'Request is too large.' }, { status: 413 });
    }

    let body: unknown;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid request.' }, { status: 400 });
    }

    const validation = parseInquirySubmission(body);
    if (!validation.ok) {
      console.warn('[contact] rejected', {
        referenceId,
        reason: validation.honeypot ? 'honeypot' : 'validation',
      });
      return NextResponse.json({ success: false, error: 'Invalid request.' }, { status: 400 });
    }

    const result = await submitInquiry(validation.data, {
      referenceId,
      timestamp: new Date().toISOString(),
    });

    console.info('[contact] owner accepted', {
      referenceId,
      provider: 'resend',
      providerMessageId: result.ownerMessageId,
      acknowledgement: result.acknowledgement,
      acknowledgementMessageId: result.acknowledgementMessageId,
    });

    return NextResponse.json({ success: true, referenceId }, { status: 200 });
  } catch (error) {
    const configurationFailure = error instanceof MailConfigurationError;
    console.error('[contact] owner delivery failed', {
      referenceId,
      provider: 'resend',
      status: configurationFailure ? 'configuration_error' : 'request_failed',
    });

    return NextResponse.json(
      { success: false, error: 'Contact form is temporarily unavailable.' },
      { status: configurationFailure ? 503 : 502 }
    );
  }
}
