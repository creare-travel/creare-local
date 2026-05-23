import path from 'node:path';
import { loadEnvFromDotLocal } from './lib/auth';
import { readJsonFile } from './lib/state';

interface GtmCurrentState {
  container?: {
    accountId?: string;
    containerId?: string;
    publicId?: string;
    name?: string;
  };
  workspace?: {
    workspaceId?: string;
    name?: string;
    path?: string;
    description?: string;
  };
  variables?: Array<{ name?: string; type?: string }>;
  triggers?: Array<{ name?: string; type?: string }>;
  tags?: Array<{ name?: string; type?: string }>;
}

interface GtmPlan {
  variables: string[];
  triggers: string[];
  tags: string[];
}

interface Ga4CurrentState {
  property?: {
    propertyId?: string;
  };
  dataStreams?: Array<{ measurementId?: string; displayName?: string }>;
  customDimensions?: Array<{ parameterName?: string; displayName?: string }>;
  keyEvents?: Array<{ eventName?: string }>;
}

interface Ga4Plan {
  customDimensions: string[];
  keyEvents: string[];
  events: string[];
}

function uniqueStrings(values: Array<string | undefined>): string[] {
  return [...new Set(values.filter((value): value is string => Boolean(value)))].sort();
}

function diffNames(current: string[], desired: string[]) {
  const currentSet = new Set(current);
  const desiredSet = new Set(desired);

  return {
    missing: desired.filter((item) => !currentSet.has(item)),
    extra: current.filter((item) => !desiredSet.has(item)),
  };
}

function normalizeGtmVariableName(name?: string): string | undefined {
  if (!name) return undefined;
  return name.replace(/^CREARE - DLV - /, '').trim();
}

function normalizeGtmTriggerName(name?: string): string | undefined {
  if (!name) return undefined;
  return name.replace(/^CREARE - Trigger - /, '').trim();
}

function logSection(title: string): void {
  console.log(`\n=== ${title} ===`);
}

function main() {
  loadEnvFromDotLocal();

  const googleDir = path.join(process.cwd(), 'scripts/google');
  const stateDir = path.join(googleDir, 'state');

  const gtmCurrent = readJsonFile<GtmCurrentState>(path.join(stateDir, 'gtm-current.json'));
  const ga4Current = readJsonFile<Ga4CurrentState>(path.join(stateDir, 'ga4-current.json'));
  const gtmPlan = readJsonFile<GtmPlan>(path.join(googleDir, 'gtm-plan.json'));
  const ga4Plan = readJsonFile<Ga4Plan>(path.join(googleDir, 'ga4-plan.json'));

  logSection('GTM Diff');
  if (!gtmCurrent) {
    console.log('Missing scripts/google/state/gtm-current.json. Run npm run google:discover:gtm first.');
  } else if (!gtmPlan) {
    console.log('Missing scripts/google/gtm-plan.json.');
  } else {
    const currentVariableNames = uniqueStrings(
      (gtmCurrent.variables ?? []).map((item) => normalizeGtmVariableName(item.name)),
    );
    const currentTriggerNames = uniqueStrings(
      (gtmCurrent.triggers ?? []).map((item) => normalizeGtmTriggerName(item.name)),
    );
    const currentTagNames = uniqueStrings((gtmCurrent.tags ?? []).map((item) => item.name));

    console.log(
      JSON.stringify(
        {
          container: gtmCurrent.container,
          workspace: gtmCurrent.workspace,
          variables: diffNames(currentVariableNames, gtmPlan.variables),
          triggers: diffNames(currentTriggerNames, gtmPlan.triggers),
          tags: diffNames(currentTagNames, gtmPlan.tags),
        },
        null,
        2,
      ),
    );
  }

  logSection('GA4 Diff');
  if (!ga4Plan) {
    console.log('Missing scripts/google/ga4-plan.json.');
    return;
  }

  if (!ga4Current) {
    console.log(
      [
        'GA4 current state is unavailable.',
        'Run npm run google:discover:ga4 after setting GOOGLE_GA4_PROPERTY_ID in .env.local.',
      ].join('\n'),
    );
    return;
  }

  const currentMeasurementIds = uniqueStrings(
    (ga4Current.dataStreams ?? []).map((stream) => stream.measurementId),
  );
  const currentDimensionNames = uniqueStrings(
    (ga4Current.customDimensions ?? []).flatMap((item) => [item.parameterName, item.displayName]),
  );
  const currentKeyEvents = uniqueStrings((ga4Current.keyEvents ?? []).map((item) => item.eventName));

  console.log(
    JSON.stringify(
      {
        property: ga4Current.property,
        measurementIds: currentMeasurementIds,
        expectedEvents: ga4Plan.events,
        customDimensions: diffNames(currentDimensionNames, ga4Plan.customDimensions),
        keyEvents: diffNames(currentKeyEvents, ga4Plan.keyEvents),
      },
      null,
      2,
    ),
  );
}

main();
