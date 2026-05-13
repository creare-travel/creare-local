import { NextRequest, NextResponse } from 'next/server';
import {
  normalizeInquiryIntent,
  type InquirySubmissionInput,
  validateInquirySubmission,
} from '@/lib/inquiry';
import { submitInquiry } from '@/lib/email/submitInquiry';

interface InquiryPayload extends InquirySubmissionInput {
  intents?: string[];
}

/**
 * POST /api/inquiry
 * Accepts private inquiry submissions and sends transactional emails via SendGrid.
 */
export async function POST(request: NextRequest) {
  try {
    const body: InquiryPayload = await request.json();
    const inquiryData: InquirySubmissionInput = {
      name: body.name,
      email: body.email,
      message: body.message,
      intent: normalizeInquiryIntent(body.intents ?? body.intent),
      experience_slug: body.experience_slug,
    };
    const validationError = validateInquirySubmission(inquiryData);
    if (validationError) {
      return NextResponse.json({ success: false, error: validationError }, { status: 400 });
    }

    await submitInquiry(inquiryData);

    return NextResponse.json(
      { success: true, message: 'Inquiry received. We will be in touch shortly.' },
      { status: 200 }
    );
  } catch (err) {
    const isValidationError = err instanceof SyntaxError;

    if (isValidationError) {
      return NextResponse.json({ success: false, error: 'Invalid request.' }, { status: 400 });
    }

    console.error('[/api/inquiry] Failed to process inquiry request.', err);

    if (err instanceof Error && err.message.startsWith('Mail service is not configured.')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Inquiry service is temporarily unavailable. Please try again later.',
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'An error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
