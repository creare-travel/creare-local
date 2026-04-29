'use client';
/**
 * i18n Provider — re-exports LanguageProvider for clean architecture.
 * The actual implementation lives in @/context/LanguageContext.
 *
 * Usage:
 *   import { I18nProvider } from '@/lib/i18n/provider';
 *   <I18nProvider>{children}</I18nProvider>
 */
export { LanguageProvider as I18nProvider } from '@/context/LanguageContext';
