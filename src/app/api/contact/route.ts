import { NextRequest, NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

interface ContactPayload {
  name: string;
  email: string;
  message: string;
  intent?: string;
  experience_slug?: string;
}

/**
 * POST /api/contact
 * Accepts contact form submissions and sends transactional emails via SendGrid.
 */
export async function POST(request: NextRequest) {
  try {
    const body: ContactPayload = await request.json();

    const { name, email, message, intent, experience_slug } = body;

    // Validation
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json({ success: false, error: 'Name is required.' }, { status: 400 });
    }

    if (!email || typeof email !== 'string' || email.trim() === '') {
      return NextResponse.json({ success: false, error: 'Email is required.' }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json(
        { success: false, error: 'A valid email address is required.' },
        { status: 400 }
      );
    }

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return NextResponse.json({ success: false, error: 'Message is required.' }, { status: 400 });
    }

    const intentLine = intent ? `Intent: ${intent}\n` : '';
    const slugLine = experience_slug ? `Experience: ${experience_slug}\n` : '';

    const ownerText = `New inquiry received via CREARE.\n\nName: ${name.trim()}\nEmail: ${email.trim()}\n${intentLine}${slugLine}Message:\n${message.trim()}`;
    const userText = `${name.trim()},\n\nThank you.\n\nYour inquiry has been received and is being reviewed.\n\nWe will respond personally.\n\nCREARE`;

    const fromAddress = process.env.CONTACT_EMAIL as string;

    await Promise.all([
      sgMail.send({
        to: fromAddress,
        from: fromAddress,
        subject: 'New Inquiry — CREARE',
        text: ownerText,
      }),
      sgMail.send({
        to: email.trim(),
        from: fromAddress,
        subject: 'Your inquiry has been received — CREARE',
        text: userText,
      }),
    ]);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    if (err instanceof SyntaxError) {
      return NextResponse.json({ success: false, error: 'Invalid request.' }, { status: 400 });
    }

    const error = err as Error;
    console.error('[/api/contact] SendGrid error:', error);

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
