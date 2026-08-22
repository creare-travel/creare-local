import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/contact/route';
import {
  buildWhatsAppHref,
  CONTACT_EMAIL,
  CONTACT_PHONE_HREF,
  getGoogleAppointmentUrl,
  getWeChatConfig,
} from '@/lib/contact/channels';
import { submitInquiry, type EmailSender } from '@/lib/email/submitInquiry';
import {
  generateInquiryReference,
  INQUIRY_LIMITS,
  parseInquirySubmission,
  type InquirySubmissionInput,
} from '@/lib/inquiry';

async function run() {
  const root = process.cwd();
  const restoreEnv = (key: string, value: string | undefined) => {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  };
  const validInput: InquirySubmissionInput = {
    name: 'Ada Example',
    email: 'ada@example.com',
    message: 'A private inquiry.',
    intent: ['private_travel'],
    locale: 'en',
    page_path: '/contact',
    experience_slug: 'sample-experience',
  };
  const context = {
    referenceId: 'CRQ-20260822-TEST',
    timestamp: '2026-08-22T09:00:00.000Z',
  };
  const config = {
    apiKey: 'test-key',
    fromEmail: 'direct@crearetravel.com',
    toEmail: 'owner@crearetravel.com',
  };

  assert.equal(parseInquirySubmission(validInput).ok, true, 'valid inquiry must pass');
  assert.equal(
    parseInquirySubmission({ ...validInput, intent: ['unknown'] }).ok,
    false,
    'unknown intent must fail'
  );
  assert.deepEqual(
    parseInquirySubmission({ ...validInput, website: 'spam.example' }),
    { ok: false, error: 'Invalid request.', honeypot: true },
    'honeypot must reject before email delivery'
  );
  assert.equal(
    parseInquirySubmission({ ...validInput, message: 'x'.repeat(INQUIRY_LIMITS.message + 1) }).ok,
    false,
    'oversized message must fail'
  );
  assert.equal(
    generateInquiryReference(new Date('2026-08-22T09:00:00.000Z'), 'a1b2'),
    'CRQ-20260822-A1B2',
    'reference format must remain stable'
  );

  const sentMessages: Parameters<EmailSender>[0][] = [];
  const successfulSender: EmailSender = async (message) => {
    sentMessages.push(message);
    return { id: `message-${sentMessages.length}` };
  };
  const successfulResult = await submitInquiry(validInput, context, {
    config,
    sendEmail: successfulSender,
  });
  assert.equal(sentMessages.length, 2, 'one owner and one acknowledgement attempt are required');
  assert.equal(sentMessages[0].replyTo, validInput.email, 'owner reply-to must be the visitor');
  assert.equal(sentMessages[0].from, 'CREARE <direct@crearetravel.com>');
  assert.equal(sentMessages[0].text.includes(validInput.message), true);
  assert.equal(sentMessages[0].text.includes(context.referenceId), true);
  assert.equal(successfulResult.ownerMessageId, 'message-1');
  assert.equal(successfulResult.acknowledgement, 'accepted');

  let acknowledgementAttempts = 0;
  const acknowledgementFailureSender: EmailSender = async () => {
    acknowledgementAttempts += 1;
    if (acknowledgementAttempts === 2) throw new Error('acknowledgement rejected');
    return { id: 'owner-accepted' };
  };
  const acknowledgementFailure = await submitInquiry(validInput, context, {
    config,
    sendEmail: acknowledgementFailureSender,
  });
  assert.deepEqual(acknowledgementFailure, {
    ownerMessageId: 'owner-accepted',
    acknowledgement: 'failed',
  });

  let ownerFailureAttempts = 0;
  const ownerFailureSender: EmailSender = async () => {
    ownerFailureAttempts += 1;
    throw new Error('owner rejected');
  };
  await assert.rejects(
    submitInquiry(validInput, context, { config, sendEmail: ownerFailureSender }),
    /owner rejected/
  );
  assert.equal(ownerFailureAttempts, 1, 'visitor acknowledgement must not run after owner failure');

  assert.equal(buildWhatsAppHref('en').startsWith('https://wa.me/905412203000?text='), true);
  assert.equal(decodeURIComponent(buildWhatsAppHref('tr')).includes('özel bir talepte'), true);
  assert.equal(decodeURIComponent(buildWhatsAppHref('zh')).includes('私享咨询'), true);
  assert.equal(CONTACT_PHONE_HREF, 'tel:+905412203000');
  assert.equal(CONTACT_EMAIL, 'direct@crearetravel.com');

  const publicEnv = {
    calendar: process.env.NEXT_PUBLIC_GOOGLE_APPOINTMENT_URL,
    wechatId: process.env.NEXT_PUBLIC_WECHAT_ID,
    wechatQr: process.env.NEXT_PUBLIC_WECHAT_QR_URL,
  };
  delete process.env.NEXT_PUBLIC_GOOGLE_APPOINTMENT_URL;
  delete process.env.NEXT_PUBLIC_WECHAT_ID;
  delete process.env.NEXT_PUBLIC_WECHAT_QR_URL;
  assert.equal(getGoogleAppointmentUrl(), null, 'calendar must be hidden without configuration');
  assert.equal(getWeChatConfig(), null, 'WeChat must be non-interactive without configuration');
  process.env.NEXT_PUBLIC_GOOGLE_APPOINTMENT_URL = 'https://calendar.app.google/example';
  process.env.NEXT_PUBLIC_WECHAT_ID = 'creare-example';
  process.env.NEXT_PUBLIC_WECHAT_QR_URL = 'https://res.cloudinary.com/example/wechat.png';
  assert.equal(getGoogleAppointmentUrl(), 'https://calendar.app.google/example');
  assert.deepEqual(getWeChatConfig(), {
    id: 'creare-example',
    qrUrl: 'https://res.cloudinary.com/example/wechat.png',
  });
  restoreEnv('NEXT_PUBLIC_GOOGLE_APPOINTMENT_URL', publicEnv.calendar);
  restoreEnv('NEXT_PUBLIC_WECHAT_ID', publicEnv.wechatId);
  restoreEnv('NEXT_PUBLIC_WECHAT_QR_URL', publicEnv.wechatQr);

  const mailEnv = {
    apiKey: process.env.RESEND_API_KEY,
    from: process.env.CONTACT_FROM_EMAIL,
    to: process.env.CONTACT_TO_EMAIL,
  };
  const originalFetch = globalThis.fetch;
  const originalInfo = console.info;
  const originalWarn = console.warn;
  const originalError = console.error;
  const routeLogs: unknown[][] = [];
  let resendAttempts = 0;
  process.env.RESEND_API_KEY = 'test-route-key';
  process.env.CONTACT_FROM_EMAIL = 'direct@crearetravel.com';
  process.env.CONTACT_TO_EMAIL = 'owner@crearetravel.com';
  globalThis.fetch = async () => {
    resendAttempts += 1;
    return new Response(JSON.stringify({ id: `resend-${resendAttempts}` }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  };
  console.info = (...args: unknown[]) => routeLogs.push(args);
  console.warn = (...args: unknown[]) => routeLogs.push(args);
  console.error = (...args: unknown[]) => routeLogs.push(args);

  try {
    const response = await POST(
      new NextRequest('http://localhost/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validInput),
      })
    );
    const responseBody = (await response.json()) as { referenceId?: unknown };
    assert.equal(response.status, 200);
    assert.match(String(responseBody.referenceId), /^CRQ-\d{8}-[A-Z0-9]{4}$/);
    assert.equal(resendAttempts, 2, 'API must attempt one owner and one acknowledgement email');

    const honeypotResponse = await POST(
      new NextRequest('http://localhost/api/contact', {
        method: 'POST',
        body: JSON.stringify({ ...validInput, website: 'spam.example' }),
      })
    );
    assert.equal(honeypotResponse.status, 400);
    assert.equal(resendAttempts, 2, 'honeypot must not make an email attempt');

    const malformedResponse = await POST(
      new NextRequest('http://localhost/api/contact', { method: 'POST', body: '{' })
    );
    assert.equal(malformedResponse.status, 400);

    const oversizedResponse = await POST(
      new NextRequest('http://localhost/api/contact', {
        method: 'POST',
        headers: { 'Content-Length': '20000' },
        body: JSON.stringify(validInput),
      })
    );
    assert.equal(oversizedResponse.status, 413);
  } finally {
    globalThis.fetch = originalFetch;
    console.info = originalInfo;
    console.warn = originalWarn;
    console.error = originalError;
    restoreEnv('RESEND_API_KEY', mailEnv.apiKey);
    restoreEnv('CONTACT_FROM_EMAIL', mailEnv.from);
    restoreEnv('CONTACT_TO_EMAIL', mailEnv.to);
  }

  const serializedLogs = JSON.stringify(routeLogs);
  assert.equal(
    serializedLogs.includes(validInput.name),
    false,
    'logs must not include visitor name'
  );
  assert.equal(
    serializedLogs.includes(validInput.email),
    false,
    'logs must not include visitor email'
  );
  assert.equal(
    serializedLogs.includes(validInput.message),
    false,
    'logs must not include message body'
  );

  assert.equal(
    existsSync(resolve(root, 'src/app/api/inquiry/route.ts')),
    false,
    'unused duplicate inquiry endpoint must remain removed'
  );
  const emailRuntime = readFileSync(resolve(root, 'src/lib/email/submitInquiry.ts'), 'utf8');
  assert.equal(
    emailRuntime.includes('@sendgrid/mail'),
    false,
    'SendGrid runtime import must stay removed'
  );
  assert.equal(emailRuntime.includes('https://api.resend.com/emails'), true);

  const contactSource = readFileSync(
    resolve(root, 'src/app/contact/ContactPageClient.tsx'),
    'utf8'
  );
  assert.equal(
    contactSource.includes('lg:grid-cols-[45%_55%]'),
    false,
    'unsafe desktop grid must stay removed'
  );
  assert.equal(contactSource.includes('trackContactSubmit'), true);
  assert.equal(contactSource.includes('maxLength={INQUIRY_LIMITS.message}'), true);
  assert.equal(contactSource.includes('href={CONTACT_PHONE_HREF}'), true);
  assert.equal(contactSource.includes('href={`mailto:${CONTACT_EMAIL}`}'), true);

  const contactRoute = readFileSync(resolve(root, 'src/app/api/contact/route.ts'), 'utf8');
  assert.equal(contactRoute.includes('MAX_REQUEST_BYTES'), true);
  assert.equal(contactRoute.includes('JSON.parse(rawBody)'), true);

  console.info('Contact assertions passed.');
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
