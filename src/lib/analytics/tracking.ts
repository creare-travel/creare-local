/**
 * Creare — Centralized GA4 Analytics Utility
 * All custom events are typed and reusable across the application.
 * No duplicate firing: each helper is idempotent and guards against SSR.
 *
 * ─── INTELLIGENCE LAYER ──────────────────────────────────────────────────────
 *
 * intent_level     — signals user intent depth:
 *   'low'    → page_view (passive browsing)
 *   'medium' → cta_click, experience_view (active engagement)
 *   'high'   → form_submit, form_success (conversion intent)
 *
 * experience_type  — derived from slug:
 *   'signature' | 'lab' | 'black' | undefined
 *
 * session_origin   — how the user arrived:
 *   'experience_entry' → came via /experiences/[slug]
 *   'direct'           → all other entry points
 *
 * cta_position     — where the CTA lives in the page layout:
 *   'hero' | 'inline' | 'footer' (passed from CTASection)
 *
 * content_context  — maps page type to content category:
 *   experiences → 'luxury' *   cultural    →'cultural_depth' *   lab         →'experimental'
 *
 * ─── CONVERSION EVENT MAP ────────────────────────────────────────────────────
 *
 * | Event Name       | Type             | Trigger Location          | Parameters                                                      |
 * |------------------|------------------|---------------------------|-----------------------------------------------------------------|
 * | form_success     | PRIMARY CONV.    | ContactPageClient.tsx     | page_path, source, form_id, experience_slug + intelligence      |
 * | cta_click        | MICRO CONVERSION | CTASection.tsx            | page_path, label, source, experience_slug + intelligence        |
 * | experience_view  | Engagement       | ExperienceViewTracker.tsx | page_path, experience_slug, experience_title, experience_category, source + intelligence |
 * | form_start       | Engagement       | ContactPageClient.tsx     | page_path, source, form_id, experience_slug + intelligence      |
 * | form_submit      | Engagement       | ContactPageClient.tsx     | page_path, source, form_id, experience_slug + intelligence      |
 * | form_error       | Diagnostic       | ContactPageClient.tsx     | page_path, source, form_id, experience_slug, error_message      |
 * | page_view        | Navigation       | GoogleAnalytics.tsx       | page_path                                                       |
 *
 * ─── CONVERSION CLASSIFICATION ───────────────────────────────────────────────
 *
 * PRIMARY CONVERSION  → form_success
 *   Mark as a conversion in GA4 > Admin > Events > Mark as conversion
 *   Google Ads: Map to a "Lead" conversion action
 *   Meta Pixel: Maps to Lead standard event
 *
 * MICRO CONVERSION    → cta_click
 *   Mark as a conversion in GA4 > Admin > Events > Mark as conversion
 *   Google Ads: Map to a "Page engagement" conversion action
 *   Meta Pixel: Maps to ViewContent standard event
 *
 * ─── FUTURE-READY: GOOGLE ADS & META PIXEL ───────────────────────────────────
 *
 * Google Ads (gTag):
 *   When a Google Ads conversion ID is available, add to GoogleAnalytics.tsx:
 *     gtag('config', 'AW-CONVERSION_ID');
 *   Then fire conversion events via:
 *     gtag('event', 'conversion', { send_to: 'AW-CONVERSION_ID/CONVERSION_LABEL' });
 *   The helpers below call `notifyThirdParty` which is the extension point for this.
 *
 * Meta Pixel:
 *   Load fbq snippet in GoogleAnalytics.tsx when NEXT_PUBLIC_META_PIXEL_ID is set.
 *   The helpers below call `notifyThirdParty` which routes to fbq standard events.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

// ─── Guard ────────────────────────────────────────────────────────────────────

function isGtagReady(): boolean {
  return typeof window !== 'undefined' && typeof window.gtag === 'function';
}

// ─── Experience Slug Helper ───────────────────────────────────────────────────

/**
 * Extracts the experience slug from the current URL.
 * Priority 1: ?exp= query parameter (set when navigating from an experience page to /contact).
 * Priority 2: pathname /experiences/[slug] → "slug". * Fallback:"direct" — ensures experience_slug is never null/undefined in GA4.
 */
export function getExperienceSlug(): string {
  if (typeof window === 'undefined') return 'direct';
  const params = new URLSearchParams(window.location.search);
  const exp = params.get('exp');
  if (exp) return exp;
  const parts = window.location.pathname.split('/');
  return parts[1] === 'experiences' && parts[2] ? parts[2] : 'direct';
}

// ─── Intelligence Layer Helpers ───────────────────────────────────────────────

type IntentLevel = 'low' | 'medium' | 'high';
type ExperienceType = 'signature' | 'lab' | 'black';
type SessionOrigin = 'experience_entry' | 'direct';
type CtaPosition = 'hero' | 'inline' | 'footer';
type ContentContext = 'luxury' | 'cultural_depth' | 'experimental';

/**
 * Derives experience_type from a slug.
 * Only returns a value for known types; undefined otherwise.
 */
function getExperienceType(slug: string | null | undefined): ExperienceType | undefined {
  if (slug === 'signature' || slug === 'lab' || slug === 'black') return slug;
  return undefined;
}

/**
 * Determines session_origin based on whether the user entered via an experience page.
 * 'experience_entry' if pathname starts with /experiences/[slug], 'direct' otherwise.
 */
function getSessionOrigin(): SessionOrigin {
  if (typeof window === 'undefined') return 'direct';
  const parts = window.location.pathname.split('/');
  return parts[1] === 'experiences' && parts[2] ? 'experience_entry' : 'direct';
}

/**
 * Builds an intelligence params object, omitting any undefined values.
 * All fields are optional — only defined values are included in the event payload.
 */
function buildIntelligenceParams(opts: {
  intent_level?: IntentLevel;
  slug?: string | null;
  cta_position?: CtaPosition;
  content_context?: ContentContext;
}): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  if (opts.intent_level !== undefined) result.intent_level = opts.intent_level;
  const expType = getExperienceType(opts.slug);
  if (expType !== undefined) result.experience_type = expType;
  const origin = getSessionOrigin();
  result.session_origin = origin;
  if (opts.cta_position !== undefined) result.cta_position = opts.cta_position;
  if (opts.content_context !== undefined) result.content_context = opts.content_context;
  return result;
}

// ─── Third-Party Notification (Future-Ready) ──────────────────────────────────

/**
 * Private sentinel — only trackFormSuccess holds a reference to this symbol.
 * Any call to notifyThirdParty without it is blocked at runtime.
 */
const _FORM_SUCCESS_TOKEN = Symbol('form_success_token');

/**
 * Extension point for Google Ads and Meta Pixel.
 *
 * HARD GUARDS (both must pass):
 *   1. conversionType === 'primary'  — blocks micro/other conversion types
 *   2. _token === _FORM_SUCCESS_TOKEN — blocks any call outside trackFormSuccess
 *
 * A dev-only console.warn is emitted if either guard fails.
 * A dev-only console.log with stack trace is emitted on every valid call.
 */
function notifyThirdParty(
  conversionType: 'primary' | 'micro',
  params: Record<string, unknown> = {},
  _token?: symbol
): void {
  // ── HARD KILL SWITCH — ads_conversion globally disabled ───────────────────
  // Remove this block ONLY when Google Ads conversion ID is confirmed and tested.
  if (typeof window !== 'undefined') {
    console.info('ads_conversion disabled');
    return;
  }

  if (typeof window === 'undefined') return;

  // Dev-mode entry log — fires before any guard so every call attempt is visible
  if (process.env.NODE_ENV === 'development') {
    console.info(
      '[notifyThirdParty] called — conversionType:',
      conversionType,
      '| token valid:',
      _token === _FORM_SUCCESS_TOKEN,
      '| params:',
      params
    );
    // Log caller stack to identify rogue call sites
    console.info('[notifyThirdParty] caller stack', new Error().stack);
  }

  // Guard 1: block non-primary conversion types
  if (conversionType !== 'primary') {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        '[ads_conversion] BLOCKED — notifyThirdParty called with non-primary conversionType:',
        conversionType
      );
    }
    return;
  }

  // Guard 2: block calls from outside trackFormSuccess
  if (_token !== _FORM_SUCCESS_TOKEN) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        '[ads_conversion] BLOCKED — notifyThirdParty called outside trackFormSuccess. ' +
          'ads_conversion must ONLY fire on confirmed form submission success.'
      );
    }
    return;
  }

  // ── Both guards passed — this is a legitimate form_success conversion ────────
  if (process.env.NODE_ENV === 'development') {
    console.info(
      '[ads_conversion] ALLOWED — firing conversion event. ' +
        'Triggered by trackFormSuccess after confirmed API success.'
    );
  }

  // ── Google Ads ──────────────────────────────────────────────────────────────
  // Uncomment and configure when Google Ads conversion ID is available:
  // const ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
  // const PRIMARY_LABEL = process.env.NEXT_PUBLIC_GOOGLE_ADS_PRIMARY_LABEL;
  // if (ADS_ID && isGtagReady() && PRIMARY_LABEL) {
  //   window.gtag('event', 'conversion', { send_to: `${ADS_ID}/${PRIMARY_LABEL}`, ...params });
  // }

  // ── Meta Pixel ──────────────────────────────────────────────────────────────
  // Uncomment when Meta Pixel ID is configured:
  // if (typeof window.fbq === 'function') {
  //   window.fbq('track', 'Lead', params);
  // }

  // ── Suppress unused-variable warnings until ads integrations are activated ──
  void conversionType;
  void params;
}

// ─── Base Event ───────────────────────────────────────────────────────────────

export function trackEvent(eventName: string, params: Record<string, unknown> = {}): void {
  if (!isGtagReady()) return;
  window.gtag('event', eventName, {
    page_path: typeof window !== 'undefined' ? window.location.pathname : undefined,
    ...params,
  });
}

// ─── Page View ────────────────────────────────────────────────────────────────

/**
 * Fired by GoogleAnalytics component on every route change.
 * Uses gtag('event', 'page_view') instead of gtag('config') to avoid
 * re-triggering GA4's conversion evaluation on every navigation.
 * Should not be called manually — handled automatically by GoogleAnalytics.tsx.
 */
export function trackPageView(url: string): void {
  if (!isGtagReady()) return;
  const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (!GA_ID) return;
  // IMPORTANT: Use gtag('event', 'page_view') NOT gtag('config', ...) for route changes.
  // Calling gtag('config', ...) after init re-evaluates GA4 conversion events and can
  // incorrectly trigger ads_conversion on every page navigation.
  window.gtag('event', 'page_view', { page_path: url });
}

// ─── Custom Events ────────────────────────────────────────────────────────────

export interface ExperienceViewParams {
  experience_slug: string;
  experience_title?: string;
  experience_category?: string;
  source?: string;
  content_context?: ContentContext;
}

/**
 * Fired when a user opens an experience detail page.
 * Intelligence: intent_level=medium, experience_type derived from slug, session_origin auto-resolved.
 */
export function trackExperienceView(params: ExperienceViewParams): void {
  if (!isGtagReady()) return;
  const intelligence = buildIntelligenceParams({
    intent_level: 'medium',
    slug: params.experience_slug,
    content_context: params.content_context,
  });
  trackEvent('experience_view', {
    page_path: typeof window !== 'undefined' ? window.location.pathname : undefined,
    experience_slug: params.experience_slug,
    experience_title: params.experience_title ?? '',
    experience_category: params.experience_category ?? '',
    source: params.source ?? 'experience_page',
    ...intelligence,
  });
}

export interface CtaClickParams {
  label: string;
  page_path?: string;
  experience_slug?: string;
  source?: string;
  cta_position?: CtaPosition;
  content_context?: ContentContext;
}

/**
 * MICRO CONVERSION — cta_click
 * Intelligence: intent_level=medium, experience_type + session_origin auto-resolved.
 * NOTE: notifyThirdParty is intentionally NOT called here.
 */
export function trackCtaClick(params: CtaClickParams): void {
  if (!isGtagReady()) return;
  const resolvedPath =
    params.page_path ?? (typeof window !== 'undefined' ? window.location.pathname : '');
  const resolvedSlug =
    params.experience_slug !== undefined ? params.experience_slug : getExperienceSlug();
  const intelligence = buildIntelligenceParams({
    intent_level: 'medium',
    slug: resolvedSlug,
    cta_position: params.cta_position,
    content_context: params.content_context,
  });
  trackEvent('cta_click', {
    page_path: resolvedPath,
    label: params.label,
    experience_slug: resolvedSlug,
    source: params.source ?? 'unknown',
    ...intelligence,
  });
}

export interface FormEventParams {
  page_path?: string;
  experience_slug?: string;
  source?: string;
  form_id?: string;
  content_context?: ContentContext;
}

/**
 * Fired when the user first focuses any field in the contact form.
 * Intelligence: intent_level=medium (engagement signal).
 */
export function trackFormStart(params: FormEventParams = {}): void {
  if (!isGtagReady()) return;
  const resolvedSlug =
    params.experience_slug !== undefined ? params.experience_slug : getExperienceSlug();
  const intelligence = buildIntelligenceParams({
    intent_level: 'medium',
    slug: resolvedSlug,
    content_context: params.content_context,
  });
  trackEvent('form_start', {
    page_path: params.page_path ?? (typeof window !== 'undefined' ? window.location.pathname : ''),
    experience_slug: resolvedSlug ?? 'direct',
    source: params.source ?? 'contact_page',
    form_id: params.form_id ?? 'inquiry_form',
    ...intelligence,
  });
}

/**
 * Fired when the form submit button is clicked (after validation passes).
 * Intelligence: intent_level=high (strong conversion signal).
 */
export function trackFormSubmit(params: FormEventParams = {}): void {
  if (!isGtagReady()) return;
  const resolvedSlug =
    params.experience_slug !== undefined ? params.experience_slug : getExperienceSlug();
  const intelligence = buildIntelligenceParams({
    intent_level: 'high',
    slug: resolvedSlug,
    content_context: params.content_context,
  });
  trackEvent('form_submit', {
    page_path: params.page_path ?? (typeof window !== 'undefined' ? window.location.pathname : ''),
    experience_slug: resolvedSlug ?? 'direct',
    source: params.source ?? 'contact_page',
    form_id: params.form_id ?? 'inquiry_form',
    ...intelligence,
  });
}

/**
 * PRIMARY CONVERSION — form_success
 * Intelligence: intent_level=high (confirmed conversion).
 * This is the ONLY function that calls notifyThirdParty.
 * notifyThirdParty receives _FORM_SUCCESS_TOKEN — any call without it is blocked.
 *
 * ─── GA4 CONVERSION SETUP ────────────────────────────────────────────────────
 * To mark form_success as a GA4 conversion:
 *   GA4 Admin → Events → find "form_success" → toggle "Mark as conversion"
 * This event fires ONLY after a confirmed successful API response (response.ok).
 * ─────────────────────────────────────────────────────────────────────────────
 */
export function trackFormSuccess(params: FormEventParams = {}): void {
  if (!isGtagReady()) return;
  const resolvedPath =
    params.page_path ?? (typeof window !== 'undefined' ? window.location.pathname : '');
  const resolvedSlug =
    params.experience_slug !== undefined ? params.experience_slug : getExperienceSlug();
  const intelligence = buildIntelligenceParams({
    intent_level: 'high',
    slug: resolvedSlug,
    content_context: params.content_context,
  });
  // Derive context: experience_entry if slug is not "direct", otherwise "direct"
  const context = resolvedSlug !== 'direct' ? 'experience_entry' : 'direct';
  trackEvent('form_success', {
    page_path: resolvedPath,
    experience_slug: resolvedSlug ?? 'direct',
    intent_level: 'high',
    context,
    source: params.source ?? 'contact_page',
    form_id: params.form_id ?? 'inquiry_form',
    ...intelligence,
  });
  notifyThirdParty(
    'primary',
    {
      page_path: resolvedPath,
      experience_slug: resolvedSlug ?? 'direct',
      intent_level: 'high',
      context,
      source: params.source ?? 'contact_page',
      form_id: params.form_id ?? 'inquiry_form',
      ...intelligence,
    },
    _FORM_SUCCESS_TOKEN
  );
}

/**
 * Fired when the form submission fails (API error or network error).
 */
export function trackFormError(params: FormEventParams & { error_message?: string } = {}): void {
  if (!isGtagReady()) return;
  const resolvedSlug =
    params.experience_slug !== undefined ? params.experience_slug : getExperienceSlug();
  trackEvent('form_error', {
    page_path: params.page_path ?? (typeof window !== 'undefined' ? window.location.pathname : ''),
    experience_slug: resolvedSlug ?? 'direct',
    source: params.source ?? 'contact_page',
    form_id: params.form_id ?? 'inquiry_form',
    error_message: params.error_message ?? 'unknown_error',
  });
}
