import { NextRequest, NextResponse } from 'next/server';
import { sendOwnerNotification, sendUserConfirmation } from '@/lib/email/sendEmail';

interface InquiryPayload {
  name: string;
  email: string;
  message?: string;
  intents?: string[];
}

/**
 * POST /api/inquiry
 * Accepts private inquiry submissions and sends transactional emails via SendGrid.
 */
export async function POST(request: NextRequest) {
  try {
    const body: InquiryPayload = await request.json();

    const { name, email, message, intents } = body;

    // Validation
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json({ success: false, error: 'Name is required.' }, { status: 400 });
    }

    if (!email || typeof email !== 'string' || email.trim() === '') {
      return NextResponse.json({ success: false, error: 'Email is required.' }, { status: 400 });
    }

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return NextResponse.json({ success: false, error: 'Message is required.' }, { status: 400 });
    }

    const inquiryData = {
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
      intents,
    };

    // Send both emails concurrently
    await Promise.all([sendOwnerNotification(inquiryData), sendUserConfirmation(inquiryData)]);

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

    return NextResponse.json(
      { success: false, error: 'An error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
