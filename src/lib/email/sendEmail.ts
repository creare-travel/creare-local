import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

interface InquiryData {
  name: string;
  email: string;
  message: string;
  intents?: string[];
}

export async function sendOwnerNotification(data: InquiryData): Promise<void> {
  const { name, email, message, intents } = data;

  const intentLine = intents && intents.length > 0 ? `Intent: ${intents.join(', ')}\n` : '';

  const text = `New inquiry received via CREARE.\n\nName: ${name}\nEmail: ${email}\n${intentLine}Message:\n${message}`;

  await sgMail.send({
    to: process.env.CONTACT_EMAIL as string,
    from: process.env.CONTACT_EMAIL as string,
    subject: 'New Inquiry — CREARE',
    text,
  });
}

export async function sendUserConfirmation(data: InquiryData): Promise<void> {
  const { name, email } = data;

  const text = `${name},\n\nThank you.\n\nYour inquiry has been received and is being reviewed.\n\nWe will respond personally.\n\nCREARE`;

  await sgMail.send({
    to: email,
    from: process.env.CONTACT_EMAIL as string,
    subject: 'Your inquiry has been received — CREARE',
    text,
  });
}

export async function sendEmail(data: InquiryData): Promise<void> {
  await Promise.all([sendOwnerNotification(data), sendUserConfirmation(data)]);
}
