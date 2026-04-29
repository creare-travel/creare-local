'use client';
/**
 * useTranslation — thin wrapper around the LanguageContext.
 * Import from here for cleaner component imports.
 *
 * Usage:
 *   import { useTranslation } from '@/lib/i18n/useTranslation';
 *   const { t, locale } = useTranslation();
 */
export { useLanguage as useTranslation } from '@/context/LanguageContext';
