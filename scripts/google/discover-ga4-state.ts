import {
  GOOGLE_SCOPES,
  createAuthorizedJsonFetcher,
  loadEnvFromDotLocal,
} from './lib/auth';
import { writeJsonFile } from './lib/state';

interface DataStream {
  name?: string;
  type?: string;
  displayName?: string;
  webStreamData?: {
    measurementId?: string;
    defaultUri?: string;
  };
}

interface CustomDimension {
  name?: string;
  parameterName?: string;
  displayName?: string;
  scope?: string;
  description?: string;
}

interface KeyEvent {
  name?: string;
  eventName?: string;
  countingMethod?: string;
  custom?: boolean;
}

interface Ga4CurrentState {
  generatedAt: string;
  property: {
    propertyId: string;
  };
  dataStreams: Array<{
    name?: string;
    type?: string;
    displayName?: string;
    measurementId?: string;
    defaultUri?: string;
  }>;
  customDimensions: Array<{
    name?: string;
    parameterName?: string;
    displayName?: string;
    scope?: string;
    description?: string;
  }>;
  keyEvents: Array<{
    name?: string;
    eventName?: string;
    countingMethod?: string;
    custom?: boolean;
  }>;
}

function logSection(title: string): void {
  console.log(`\n=== ${title} ===`);
}

function toArray<T>(value: T[] | undefined | null): T[] {
  return Array.isArray(value) ? value : [];
}

function normalizePropertyPath(propertyId: string): string {
  return propertyId.startsWith('properties/') ? propertyId : `properties/${propertyId}`;
}

async function main() {
  loadEnvFromDotLocal();

  const propertyId = process.env.GOOGLE_GA4_PROPERTY_ID?.trim();
  if (!propertyId) {
    console.log(
      [
        'GOOGLE_GA4_PROPERTY_ID is missing.',
        'Set it in .env.local to run GA4 read-only discovery.',
      ].join('\n'),
    );
    return;
  }

  const propertyPath = normalizePropertyPath(propertyId);
  const fetchJson = await createAuthorizedJsonFetcher([GOOGLE_SCOPES.ANALYTICS_READONLY]);
  const state: Ga4CurrentState = {
    generatedAt: new Date().toISOString(),
    property: {
      propertyId: propertyPath,
    },
    dataStreams: [],
    customDimensions: [],
    keyEvents: [],
  };

  logSection('GA4 Data Streams');
  const dataStreamResponse = await fetchJson<{ dataStreams?: DataStream[] }>(
    `https://analyticsadmin.googleapis.com/v1alpha/${propertyPath}/dataStreams`,
  );
  const dataStreams = toArray(dataStreamResponse.dataStreams).map((stream) => ({
    name: stream.name,
    type: stream.type,
    displayName: stream.displayName,
    measurementId: stream.webStreamData?.measurementId,
    defaultUri: stream.webStreamData?.defaultUri,
  }));
  state.dataStreams = dataStreams;
  for (const stream of dataStreams) {
    console.log(
      JSON.stringify(
        stream,
        null,
        2,
      ),
    );
  }

  logSection('GA4 Custom Dimensions');
  const customDimensionResponse = await fetchJson<{ customDimensions?: CustomDimension[] }>(
    `https://analyticsadmin.googleapis.com/v1alpha/${propertyPath}/customDimensions`,
  );
  const customDimensions = toArray(customDimensionResponse.customDimensions).map((dimension) => ({
    name: dimension.name,
    parameterName: dimension.parameterName,
    displayName: dimension.displayName,
    scope: dimension.scope,
    description: dimension.description,
  }));
  state.customDimensions = customDimensions;
  for (const dimension of customDimensions) {
    console.log(
      JSON.stringify(
        dimension,
        null,
        2,
      ),
    );
  }

  logSection('GA4 Key Events');
  const keyEventResponse = await fetchJson<{ keyEvents?: KeyEvent[] }>(
    `https://analyticsadmin.googleapis.com/v1alpha/${propertyPath}/keyEvents`,
  );
  const keyEvents = toArray(keyEventResponse.keyEvents).map((keyEvent) => ({
    name: keyEvent.name,
    eventName: keyEvent.eventName,
    countingMethod: keyEvent.countingMethod,
    custom: keyEvent.custom,
  }));
  state.keyEvents = keyEvents;
  for (const keyEvent of keyEvents) {
    console.log(
      JSON.stringify(
        keyEvent,
        null,
        2,
      ),
    );
  }

  writeJsonFile('scripts/google/state/ga4-current.json', state);
  console.log('\nSaved read-only GA4 inventory to scripts/google/state/ga4-current.json');
}

main().catch((error) => {
  console.error('\nGA4 read-only discovery failed.');
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
