import { getMailConfig, type MailConfig } from '@/lib/email/config';
import { INQUIRY_INTENT_LABELS, type InquirySubmissionInput } from '@/lib/inquiry';

interface EmailMessage {
  from: string;
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
}

export type EmailSender = (message: EmailMessage, timeoutMs: number) => Promise<{ id: string }>;

export interface SubmitInquiryContext {
  referenceId: string;
  timestamp: string;
}

export interface SubmitInquiryResult {
  ownerMessageId: string;
  acknowledgement: 'accepted' | 'failed';
  acknowledgementMessageId?: string;
}

export function createResendEmailSender(
  apiKey: string,
  fetchImplementation: typeof fetch = fetch
): EmailSender {
  return async (message, timeoutMs) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetchImplementation('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: message.from,
          to: [message.to],
          subject: message.subject,
          text: message.text,
          ...(message.replyTo ? { reply_to: message.replyTo } : {}),
        }),
        signal: controller.signal,
      });

      if (!response.ok) throw new Error(`Resend request failed with status ${response.status}.`);

      const result = (await response.json()) as { id?: unknown };
      if (typeof result.id !== 'string' || !result.id) {
        throw new Error('Resend response did not include a message ID.');
      }

      return { id: result.id };
    } finally {
      clearTimeout(timeout);
    }
  };
}

function buildOwnerText(input: InquirySubmissionInput, context: SubmitInquiryContext): string {
  const intentLabels = input.intent.map((intent) => INQUIRY_INTENT_LABELS[input.locale][intent]);

  return [
    'New inquiry received via CREARE.',
    '',
    `Reference: ${context.referenceId}`,
    `Name: ${input.name}`,
    `Email: ${input.email}`,
    `Intent: ${intentLabels.join(', ') || 'Not selected'}`,
    `Message:\n${input.message}`,
    `Locale: ${input.locale}`,
    `Path: ${input.page_path}`,
    `Experience: ${input.experience_slug || 'Not specified'}`,
    `Timestamp: ${context.timestamp}`,
  ].join('\n');
}

function buildAcknowledgementText(
  input: InquirySubmissionInput,
  context: SubmitInquiryContext
): { subject: string; text: string } {
  if (input.locale === 'tr') {
    return {
      subject: `Talebiniz alındı — ${context.referenceId}`,
      text: `${input.name},\n\nTalebinizi aldık.\n\nReferans: ${context.referenceId}\n\nCREARE`,
    };
  }
  if (input.locale === 'zh') {
    return {
      subject: `我们已收到您的咨询 — ${context.referenceId}`,
      text: `${input.name}：\n\n我们已收到您的咨询。\n\n参考编号：${context.referenceId}\n\nCREARE`,
    };
  }

  return {
    subject: `Your inquiry has been received — ${context.referenceId}`,
    text: `${input.name},\n\nWe have received your inquiry.\n\nReference: ${context.referenceId}\n\nCREARE`,
  };
}

export async function submitInquiry(
  input: InquirySubmissionInput,
  context: SubmitInquiryContext,
  dependencies?: { config?: MailConfig; sendEmail?: EmailSender }
): Promise<SubmitInquiryResult> {
  const config = dependencies?.config ?? getMailConfig();
  const sendEmail = dependencies?.sendEmail ?? createResendEmailSender(config.apiKey);
  const from = `CREARE <${config.fromEmail}>`;

  const owner = await sendEmail(
    {
      to: config.toEmail,
      from,
      replyTo: input.email,
      subject: `New Inquiry — ${context.referenceId}`,
      text: buildOwnerText(input, context),
    },
    6000
  );

  const acknowledgement = buildAcknowledgementText(input, context);
  try {
    const visitor = await sendEmail(
      {
        to: input.email,
        from,
        subject: acknowledgement.subject,
        text: acknowledgement.text,
      },
      2500
    );
    return {
      ownerMessageId: owner.id,
      acknowledgement: 'accepted',
      acknowledgementMessageId: visitor.id,
    };
  } catch {
    return { ownerMessageId: owner.id, acknowledgement: 'failed' };
  }
}
