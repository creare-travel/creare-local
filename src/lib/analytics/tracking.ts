import { pushDataLayerEvent, type GTMLegacyEventName } from './gtm';

type IntentLevel = 'low' | 'medium' | 'high';
type ExperienceType = 'signature' | 'lab' | 'black';
type SessionOrigin = 'experience_entry' | 'direct';
type CtaPosition = 'hero' | 'inline' | 'footer';
type ContentContext = 'luxury' | 'cultural_depth' | 'experimental';

function getExperienceType(slug: string | null | undefined): ExperienceType | undefined {
  if (slug === 'signature' || slug === 'lab' || slug === 'black') return slug;
  return undefined;
}

function getSessionOrigin(): SessionOrigin {
  if (typeof window === 'undefined') return 'direct';
  const parts = window.location.pathname.split('/');
  return parts[1] === 'experiences' && parts[2] ? 'experience_entry' : 'direct';
}

function buildIntelligenceParams(opts: {
  intent_level?: IntentLevel;
  slug?: string | null;
  cta_position?: CtaPosition;
  content_context?: ContentContext;
}) {
  const result: Record<string, unknown> = {
    session_origin: getSessionOrigin(),
  };

  if (opts.intent_level) result.intent_level = opts.intent_level;

  const experienceType = getExperienceType(opts.slug);
  if (experienceType) result.experience_type = experienceType;

  if (opts.cta_position) result.cta_position = opts.cta_position;
  if (opts.content_context) result.content_context = opts.content_context;

  return result;
}

export function getExperienceSlug(): string {
  if (typeof window === 'undefined') return 'direct';

  const params = new URLSearchParams(window.location.search);
  const exp = params.get('exp');
  if (exp) return exp;

  const parts = window.location.pathname.split('/');
  return parts[1] === 'experiences' && parts[2] ? parts[2] : 'direct';
}

export function trackEvent(eventName: GTMLegacyEventName, params: Record<string, unknown> = {}) {
  const pagePath =
    params.page_path ?? (typeof window !== 'undefined' ? window.location.pathname : undefined);

  pushDataLayerEvent({
    event: eventName,
    ...(pagePath ? { page_path: String(pagePath) } : {}),
    ...params,
  });
}

export function trackPageView(url: string) {
  pushDataLayerEvent({
    event: 'page_view',
    page_path: url,
  });
}

export interface ExperienceViewParams {
  experience_slug: string;
  experience_title?: string;
  experience_category?: string;
  source?: string;
  content_context?: ContentContext;
}

export function trackExperienceView(params: ExperienceViewParams) {
  pushDataLayerEvent({
    event: 'experience_view',
    page_path: typeof window !== 'undefined' ? window.location.pathname : undefined,
    experience_slug: params.experience_slug,
    experience_title: params.experience_title ?? '',
    experience_category: params.experience_category ?? '',
    source: params.source ?? 'experience_page',
    ...buildIntelligenceParams({
      intent_level: 'medium',
      slug: params.experience_slug,
      content_context: params.content_context,
    }),
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

export function trackCtaClick(params: CtaClickParams) {
  const resolvedPath =
    params.page_path ?? (typeof window !== 'undefined' ? window.location.pathname : '');
  const resolvedSlug =
    params.experience_slug !== undefined ? params.experience_slug : getExperienceSlug();

  pushDataLayerEvent({
    event: 'inquiry_click',
    page_path: resolvedPath,
    label: params.label,
    experience_slug: resolvedSlug,
    source: params.source ?? 'unknown',
    ...buildIntelligenceParams({
      intent_level: 'medium',
      slug: resolvedSlug,
      cta_position: params.cta_position,
      content_context: params.content_context,
    }),
  });
}

export interface FormEventParams {
  page_path?: string;
  experience_slug?: string;
  source?: string;
  form_id?: string;
  content_context?: ContentContext;
}

export function trackFormStart(params: FormEventParams = {}) {
  const resolvedSlug =
    params.experience_slug !== undefined ? params.experience_slug : getExperienceSlug();

  trackEvent('form_start', {
    page_path: params.page_path ?? (typeof window !== 'undefined' ? window.location.pathname : ''),
    experience_slug: resolvedSlug,
    source: params.source ?? 'contact_page',
    form_id: params.form_id ?? 'inquiry_form',
    ...buildIntelligenceParams({
      intent_level: 'medium',
      slug: resolvedSlug,
      content_context: params.content_context,
    }),
  });
}

export function trackFormSubmit(params: FormEventParams = {}) {
  const resolvedSlug =
    params.experience_slug !== undefined ? params.experience_slug : getExperienceSlug();

  trackEvent('form_submit', {
    page_path: params.page_path ?? (typeof window !== 'undefined' ? window.location.pathname : ''),
    experience_slug: resolvedSlug,
    source: params.source ?? 'contact_page',
    form_id: params.form_id ?? 'inquiry_form',
    ...buildIntelligenceParams({
      intent_level: 'high',
      slug: resolvedSlug,
      content_context: params.content_context,
    }),
  });
}

export function trackFormSuccess(params: FormEventParams = {}) {
  const resolvedPath =
    params.page_path ?? (typeof window !== 'undefined' ? window.location.pathname : '');
  const resolvedSlug =
    params.experience_slug !== undefined ? params.experience_slug : getExperienceSlug();
  const intelligence = buildIntelligenceParams({
    intent_level: 'high',
    slug: resolvedSlug,
    content_context: params.content_context,
  });

  pushDataLayerEvent({
    event: 'contact_submit',
    page_path: resolvedPath,
    experience_slug: resolvedSlug,
    source: params.source ?? 'contact_page',
    form_id: params.form_id ?? 'inquiry_form',
    ...intelligence,
  });

  trackEvent('form_success', {
    page_path: resolvedPath,
    experience_slug: resolvedSlug,
    source: params.source ?? 'contact_page',
    form_id: params.form_id ?? 'inquiry_form',
    ...intelligence,
  });
}

export function trackFormError(params: FormEventParams & { error_message?: string } = {}) {
  const resolvedSlug =
    params.experience_slug !== undefined ? params.experience_slug : getExperienceSlug();

  trackEvent('form_error', {
    page_path: params.page_path ?? (typeof window !== 'undefined' ? window.location.pathname : ''),
    experience_slug: resolvedSlug,
    source: params.source ?? 'contact_page',
    form_id: params.form_id ?? 'inquiry_form',
    error_message: params.error_message ?? 'unknown_error',
  });
}

export interface OutboundClickParams {
  destination_url: string;
  label?: string;
  source?: string;
  page_path?: string;
}

export function trackOutboundClick(params: OutboundClickParams) {
  pushDataLayerEvent({
    event: 'outbound_click',
    page_path: params.page_path ?? (typeof window !== 'undefined' ? window.location.pathname : ''),
    destination_url: params.destination_url,
    label: params.label,
    source: params.source,
  });
}
