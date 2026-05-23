import {
  GOOGLE_SCOPES,
  createOAuthClient,
  getAccessToken,
  loadEnvFromDotLocal,
} from './lib/auth';

const EXPECTED_PROPERTY_ID = 'properties/526869943';
const EXPECTED_MEASUREMENT_ID = 'G-0ZCE6MFRJK';

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

interface Ga4LiveState {
  propertyId: string;
  dataStreams: Array<{
    name?: string;
    type?: string;
    displayName?: string;
    measurementId?: string;
    defaultUri?: string;
  }>;
  customDimensions: CustomDimension[];
}

interface PlannedDimension {
  displayName: string;
  parameterName: string;
  scope: 'EVENT';
}

function normalizePropertyPath(propertyId: string): string {
  return propertyId.startsWith('properties/') ? propertyId : `properties/${propertyId}`;
}

function logSection(title: string): void {
  console.log(`\n=== ${title} ===`);
}

function toArray<T>(value: T[] | undefined | null): T[] {
  return Array.isArray(value) ? value : [];
}

function assertExpectedEnv(): string {
  const propertyId = process.env.GOOGLE_GA4_PROPERTY_ID?.trim();
  if (!propertyId) {
    throw new Error('Missing GOOGLE_GA4_PROPERTY_ID in .env.local.');
  }

  const propertyPath = normalizePropertyPath(propertyId);
  if (propertyPath !== EXPECTED_PROPERTY_ID) {
    throw new Error(
      `GOOGLE_GA4_PROPERTY_ID mismatch. Expected ${EXPECTED_PROPERTY_ID}, received ${propertyPath}.`,
    );
  }

  return propertyPath;
}

const REQUIRED_DIMENSIONS: PlannedDimension[] = [
  {
    displayName: 'page_title',
    parameterName: 'page_title',
    scope: 'EVENT',
  },
  {
    displayName: 'page_location',
    parameterName: 'page_location',
    scope: 'EVENT',
  },
  {
    displayName: 'outbound_url',
    parameterName: 'outbound_url',
    scope: 'EVENT',
  },
  {
    displayName: 'outbound_domain',
    parameterName: 'outbound_domain',
    scope: 'EVENT',
  },
];

async function createAuthorizedFetcher(apply: boolean) {
  const scopes = [apply ? GOOGLE_SCOPES.ANALYTICS_EDIT : GOOGLE_SCOPES.ANALYTICS_READONLY];
  const oauthClient = createOAuthClient(scopes);
  const accessToken = await getAccessToken(oauthClient);

  return async function fetchJson<T>(url: string, init: RequestInit = {}): Promise<T> {
    const response = await fetch(url, {
      ...init,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        ...(init.headers ?? {}),
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        [`Google API request failed (${response.status}) for ${url}`, errorText].join('\n'),
      );
    }

    return (await response.json()) as T;
  };
}

async function readLiveState(
  fetchJson: <T>(url: string, init?: RequestInit) => Promise<T>,
  propertyPath: string,
): Promise<Ga4LiveState> {
  const [dataStreamResponse, customDimensionResponse] = await Promise.all([
    fetchJson<{ dataStreams?: DataStream[] }>(
      `https://analyticsadmin.googleapis.com/v1alpha/${propertyPath}/dataStreams`,
    ),
    fetchJson<{ customDimensions?: CustomDimension[] }>(
      `https://analyticsadmin.googleapis.com/v1alpha/${propertyPath}/customDimensions`,
    ),
  ]);

  return {
    propertyId: propertyPath,
    dataStreams: toArray(dataStreamResponse.dataStreams).map((stream) => ({
      name: stream.name,
      type: stream.type,
      displayName: stream.displayName,
      measurementId: stream.webStreamData?.measurementId,
      defaultUri: stream.webStreamData?.defaultUri,
    })),
    customDimensions: toArray(customDimensionResponse.customDimensions),
  };
}

function ensureLiveStateIsExpected(state: Ga4LiveState): void {
  if (state.propertyId !== EXPECTED_PROPERTY_ID) {
    throw new Error(`Live GA4 property mismatch. Expected ${EXPECTED_PROPERTY_ID}.`);
  }

  const measurementIds = state.dataStreams.map((stream) => stream.measurementId).filter(Boolean);
  if (!measurementIds.includes(EXPECTED_MEASUREMENT_ID)) {
    throw new Error(
      `Expected GA4 measurement ID ${EXPECTED_MEASUREMENT_ID} was not found in live data streams.`,
    );
  }
}

function buildPlan(state: Ga4LiveState): PlannedDimension[] {
  const currentParameterNames = new Set(
    state.customDimensions
      .flatMap((dimension) => [dimension.parameterName, dimension.displayName])
      .filter((value): value is string => Boolean(value)),
  );

  return REQUIRED_DIMENSIONS.filter(
    (dimension) =>
      !currentParameterNames.has(dimension.parameterName) &&
      !currentParameterNames.has(dimension.displayName),
  );
}

async function applyPlan(
  fetchJson: <T>(url: string, init?: RequestInit) => Promise<T>,
  propertyPath: string,
  dimensionsToCreate: PlannedDimension[],
): Promise<void> {
  for (const dimension of dimensionsToCreate) {
    await fetchJson(`https://analyticsadmin.googleapis.com/v1alpha/${propertyPath}/customDimensions`, {
      method: 'POST',
      body: JSON.stringify(dimension),
    });
  }
}

async function main() {
  loadEnvFromDotLocal();
  const propertyPath = assertExpectedEnv();
  const apply = process.argv.includes('--apply');
  const fetchJson = await createAuthorizedFetcher(apply);
  const liveState = await readLiveState(fetchJson, propertyPath);

  ensureLiveStateIsExpected(liveState);

  const dimensionsToCreate = buildPlan(liveState);

  logSection('Mode');
  console.log(apply ? 'apply' : 'dry-run');

  logSection('Safety Checks');
  console.log(
    JSON.stringify(
      {
        expectedPropertyId: EXPECTED_PROPERTY_ID,
        livePropertyId: liveState.propertyId,
        expectedMeasurementId: EXPECTED_MEASUREMENT_ID,
        liveMeasurementIds: liveState.dataStreams.map((stream) => stream.measurementId).filter(Boolean),
      },
      null,
      2,
    ),
  );

  logSection('Planned Changes');
  console.log(
    JSON.stringify(
      {
        dimensionsToCreate,
        estimatedMutations: dimensionsToCreate.length,
        readyForControlledApply: true,
      },
      null,
      2,
    ),
  );

  if (!apply) {
    logSection('Dry Run Result');
    console.log('No live GA4 changes were made.');
    return;
  }

  await applyPlan(fetchJson, propertyPath, dimensionsToCreate);

  logSection('Apply Result');
  console.log('Live GA4 custom dimension mutations completed.');
}

main().catch((error) => {
  console.error('GA4 custom dimensions controlled apply script failed.');
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
