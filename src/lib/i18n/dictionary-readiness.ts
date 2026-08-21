import type { LocaleKey } from './config';

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };
export type DictionaryJson = { [key: string]: JsonValue };
type JsonObject = DictionaryJson;

const OPTIONAL_EMPTY_KEYS = new Set([
  'contact.form.email',
  'contact.form.message',
  'contact.form.name',
  'contact.form.submit',
  'contact.subtitle',
  'contact.title',
  'footer.tagline_1',
  'footer.tagline_2',
  'footer.tagline_3',
  'philosophy.hero.line1',
  'philosophy.hero.line2',
  'philosophy.section1.title',
  'philosophy.section2.title',
  'philosophy.section3.title',
  'philosophy.section4.title',
]);

function isObject(value: JsonValue): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function flattenValues(value: JsonValue, prefix = ''): Map<string, JsonValue> {
  if (!isObject(value)) {
    return new Map(prefix ? [[prefix, value]] : []);
  }

  return new Map(
    Object.entries(value).flatMap(([key, child]) => {
      const path = prefix ? `${prefix}.${key}` : key;
      return [...flattenValues(child, path)];
    })
  );
}

export function getDictionaryActivationIssues(
  locale: LocaleKey,
  reference: JsonObject,
  candidate: JsonObject
): string[] {
  const referenceValues = flattenValues(reference);
  const candidateValues = flattenValues(candidate);
  const issues: string[] = [];

  for (const key of referenceValues.keys()) {
    if (!candidateValues.has(key)) issues.push(`${locale}: missing key ${key}`);
  }
  for (const key of candidateValues.keys()) {
    if (!referenceValues.has(key)) issues.push(`${locale}: unexpected key ${key}`);
  }

  for (const [key, referenceValue] of referenceValues) {
    if (OPTIONAL_EMPTY_KEYS.has(key)) continue;
    const candidateValue = candidateValues.get(key);

    if (typeof referenceValue === 'string') {
      if (referenceValue.trim() === '') continue;
      if (typeof candidateValue !== 'string' || candidateValue.trim() === '') {
        issues.push(`${locale}: required value is empty ${key}`);
      }
      continue;
    }

    if (typeof candidateValue !== typeof referenceValue) {
      issues.push(`${locale}: value type mismatch ${key}`);
    }
  }

  return issues;
}

export function assertDictionaryActivationReady(
  locale: LocaleKey,
  reference: JsonObject,
  candidate: JsonObject
): void {
  const issues = getDictionaryActivationIssues(locale, reference, candidate);
  if (issues.length > 0) {
    throw new Error(`Dictionary activation blocked:\n${issues.join('\n')}`);
  }
}
