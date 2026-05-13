import { NextRequest, NextResponse } from 'next/server';
import { type InquirySubmissionInput, validateInquirySubmission } from '@/lib/inquiry';
import { submitInquiry } from '@/lib/email/submitInquiry';

/**
 * POST /api/contact
 * Accepts contact form submissions and sends transactional emails via SendGrid.
 */
export async function POST(request: NextRequest) {
  try {
    const body: InquirySubmissionInput = await request.json();
    const validationError = validateInquirySubmission(body);
    if (validationError) {
      return NextResponse.json({ success: false, error: validationError }, { status: 400 });
    }

    await submitInquiry(body);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    if (err instanceof SyntaxError) {
      return NextResponse.json({ success: false, error: 'Invalid request.' }, { status: 400 });
    }

    const error = err as Error;
    console.error('[/api/contact] Inquiry processing error:', error);

    if (error.message.startsWith('Mail service is not configured.')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Contact form is temporarily unavailable. Please try again later.',
        },
        { status: 503 }
      );
    }

    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          stack: error.stack,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'An error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
