export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID?.trim() ?? '';

export type GTMInitialEventName =
  | 'page_view'
  | 'experience_view'
  | 'inquiry_click'
  | 'contact_submit'
  | 'outbound_click';

export type GTMLegacyEventName =
  | 'form_start'
  | 'form_submit'
  | 'form_success'
  | 'form_error'
  | 'cultural_world_view';

export type GTMEventName = GTMInitialEventName | GTMLegacyEventName;

interface GTMEventBase {
  event: GTMEventName;
  page_path?: string;
}

export interface GTMPageViewEvent extends GTMEventBase {
  event: 'page_view';
  page_path: string;
}

export interface GTMExperienceViewEvent extends GTMEventBase {
  event: 'experience_view';
  experience_slug: string;
  experience_title?: string;
  experience_category?: string;
  source?: string;
  intent_level?: 'low' | 'medium' | 'high';
  experience_type?: 'signature' | 'lab' | 'black';
  session_origin?: 'experience_entry' | 'direct';
  content_context?: 'luxury' | 'cultural_depth' | 'experimental';
}

export interface GTMInquiryClickEvent extends GTMEventBase {
  event: 'inquiry_click';
  label: string;
  experience_slug?: string;
  source?: string;
  intent_level?: 'low' | 'medium' | 'high';
  experience_type?: 'signature' | 'lab' | 'black';
  session_origin?: 'experience_entry' | 'direct';
  cta_position?: 'hero' | 'inline' | 'footer';
  content_context?: 'luxury' | 'cultural_depth' | 'experimental';
}

export interface GTMContactSubmitEvent extends GTMEventBase {
  event: 'contact_submit';
  experience_slug?: string;
  source?: string;
  form_id?: string;
  intent_level?: 'low' | 'medium' | 'high';
  experience_type?: 'signature' | 'lab' | 'black';
  session_origin?: 'experience_entry' | 'direct';
  content_context?: 'luxury' | 'cultural_depth' | 'experimental';
}

export interface GTMOutboundClickEvent extends GTMEventBase {
  event: 'outbound_click';
  destination_url: string;
  label?: string;
  source?: string;
}

export interface GTMLegacyEvent extends GTMEventBase {
  event: GTMLegacyEventName;
  [key: string]: unknown;
}

export type GTMEvent =
  | GTMPageViewEvent
  | GTMExperienceViewEvent
  | GTMInquiryClickEvent
  | GTMContactSubmitEvent
  | GTMOutboundClickEvent
  | GTMLegacyEvent;

declare global {
  interface Window {
    dataLayer: GTMEvent[];
  }
}

export function isGtmEnabled() {
  return process.env.NODE_ENV === 'production' && Boolean(GTM_ID);
}

export function ensureDataLayer() {
  if (typeof window === 'undefined') return null;

  window.dataLayer = window.dataLayer || [];
  return window.dataLayer;
}

export function pushDataLayerEvent<T extends GTMEvent>(event: T) {
  if (typeof window === 'undefined' || !isGtmEnabled()) return;

  const dataLayer = ensureDataLayer();
  if (!dataLayer) return;

  dataLayer.push(event);
}

export function buildGtmScript(id: string) {
  return `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${id}');`;
}
