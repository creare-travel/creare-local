export const V45_GA4_MEASUREMENT_ID = 'G-0ZCE6MFRJK';
export const V45_INVITATION_EVENT_NAME = 'private_invitation_direction_click';

const GA4_MEASUREMENT_PROTOCOL_ENDPOINT = 'https://www.google-analytics.com/mp/collect';
const ANALYTICS_TIMEOUT_MS = 800;

export type V45InvitationDestination = 'padel' | 'preparty' | 'main';

export interface V45InvitationDirection {
  destination: V45InvitationDestination;
  destinationName: string;
  mapsUrl: string;
}

export const V45_INVITATION_DIRECTIONS: Record<V45InvitationDestination, V45InvitationDirection> = {
  padel: {
    destination: 'padel',
    destinationName: 'Nano Padel Club, Lucca Beach',
    mapsUrl: 'https://maps.app.goo.gl/buMrThFWZoxJZqTn7?g_st=ic',
  },
  preparty: {
    destination: 'preparty',
    destinationName: 'Loft Bodrum Hotel',
    mapsUrl: 'https://maps.app.goo.gl/ioY1SCxrgDJhA3219?g_st=ic',
  },
  main: {
    destination: 'main',
    destinationName: 'Ruins Hotel, Bodrum',
    mapsUrl: 'https://maps.app.goo.gl/anUWhMQsoj3aAyZJA?g_st=ipc',
  },
};

type FetchLike = typeof fetch;

export interface InvitationAnalyticsResult {
  attempted: boolean;
  sent: boolean;
  status?: number;
  reason?: 'missing_api_secret' | 'request_failed';
}

export function getV45InvitationDirection(
  destination: string | string[] | undefined
): V45InvitationDirection | null {
  if (typeof destination !== 'string') return null;

  return V45_INVITATION_DIRECTIONS[destination as V45InvitationDestination] ?? null;
}

export function buildV45InvitationAnalyticsPayload(direction: V45InvitationDirection) {
  return {
    client_id: crypto.randomUUID(),
    non_personalized_ads: true,
    events: [
      {
        name: V45_INVITATION_EVENT_NAME,
        params: {
          campaign_id: 'vladimir45_2026',
          campaign_type: 'private_event_invitation',
          source: 'pdf_invitation',
          medium: 'pdf',
          destination: direction.destination,
          destination_name: direction.destinationName,
        },
      },
    ],
  };
}

export async function sendV45InvitationDirectionAnalytics(
  direction: V45InvitationDirection,
  fetchImpl: FetchLike = fetch
): Promise<InvitationAnalyticsResult> {
  const apiSecret = process.env.GA4_API_SECRET?.trim();

  if (!apiSecret) {
    return {
      attempted: false,
      sent: false,
      reason: 'missing_api_secret',
    };
  }

  const endpoint = new URL(GA4_MEASUREMENT_PROTOCOL_ENDPOINT);
  endpoint.searchParams.set('measurement_id', V45_GA4_MEASUREMENT_ID);
  endpoint.searchParams.set('api_secret', apiSecret);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ANALYTICS_TIMEOUT_MS);

  try {
    const response = await fetchImpl(endpoint.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(buildV45InvitationAnalyticsPayload(direction)),
      cache: 'no-store',
      signal: controller.signal,
    });

    return {
      attempted: true,
      sent: response.ok,
      status: response.status,
    };
  } catch {
    return {
      attempted: true,
      sent: false,
      reason: 'request_failed',
    };
  } finally {
    clearTimeout(timeout);
  }
}
