import type { SchemaNode } from './types';

interface FAQItemInput {
  question: string;
  answer: string;
}

export function buildFAQPageSchema(items: FAQItemInput[], id?: string): SchemaNode | undefined {
  if (!items.length) return undefined;

  return {
    '@id': id,
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}
