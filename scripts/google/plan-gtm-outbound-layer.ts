import path from 'node:path';
import { loadEnvFromDotLocal } from './lib/auth';
import { readJsonFile } from './lib/state';

interface GtmCurrentState {
  container?: {
    accountId?: string;
    containerId?: string;
    publicId?: string;
    name?: string;
    path?: string;
  };
  workspace?: {
    workspaceId?: string;
    name?: string;
    path?: string;
  };
  variables?: Array<{ name?: string; type?: string; path?: string }>;
  triggers?: Array<{ name?: string; type?: string; path?: string }>;
  tags?: Array<{ name?: string; type?: string; path?: string }>;
}

interface DryRunVariablePlan {
  name: string;
  type: 'Data Layer Variable';
  dataLayerVariableName: string;
  dataLayerVersion: 2;
}

interface DryRunTriggerPlan {
  name: string;
  type: 'Custom Event';
  eventName: string;
}

interface DryRunTagPlan {
  name: string;
  type: 'GA4 Event';
  eventName: string;
  trigger: string;
  parameters: Array<{
    parameter: string;
    variable: string;
  }>;
}

interface DryRunTagUpdatePlan {
  name: string;
  action: 'add_parameters';
  parametersToAdd: Array<{
    parameter: string;
    variable: string;
  }>;
}

function normalizeVariableName(name?: string): string | undefined {
  if (!name) return undefined;
  return name.replace(/^CREARE - DLV - /, '').trim();
}

function normalizeTriggerName(name?: string): string | undefined {
  if (!name) return undefined;
  return name.replace(/^CREARE - Trigger - /, '').trim();
}

function unique(values: Array<string | undefined>): string[] {
  return [...new Set(values.filter((value): value is string => Boolean(value)))].sort();
}

function logSection(title: string): void {
  console.log(`\n=== ${title} ===`);
}

const REQUIRED_VARIABLES: DryRunVariablePlan[] = [
  {
    name: 'CREARE - DLV - page_title',
    type: 'Data Layer Variable',
    dataLayerVariableName: 'page_title',
    dataLayerVersion: 2,
  },
  {
    name: 'CREARE - DLV - page_location',
    type: 'Data Layer Variable',
    dataLayerVariableName: 'page_location',
    dataLayerVersion: 2,
  },
  {
    name: 'CREARE - DLV - outbound_url',
    type: 'Data Layer Variable',
    dataLayerVariableName: 'outbound_url',
    dataLayerVersion: 2,
  },
  {
    name: 'CREARE - DLV - outbound_domain',
    type: 'Data Layer Variable',
    dataLayerVariableName: 'outbound_domain',
    dataLayerVersion: 2,
  },
];

const REQUIRED_TRIGGER: DryRunTriggerPlan = {
  name: 'CREARE - Trigger - outbound_click',
  type: 'Custom Event',
  eventName: 'outbound_click',
};

const REQUIRED_OUTBOUND_TAG: DryRunTagPlan = {
  name: 'CREARE - GA4 - Event - outbound_click',
  type: 'GA4 Event',
  eventName: 'outbound_click',
  trigger: 'CREARE - Trigger - outbound_click',
  parameters: [
    { parameter: 'page_path', variable: '{{CREARE - DLV - page_path}}' },
    { parameter: 'page_title', variable: '{{CREARE - DLV - page_title}}' },
    { parameter: 'page_location', variable: '{{CREARE - DLV - page_location}}' },
    { parameter: 'outbound_url', variable: '{{CREARE - DLV - outbound_url}}' },
    { parameter: 'outbound_domain', variable: '{{CREARE - DLV - outbound_domain}}' },
  ],
};

const EXISTING_TAG_ENRICHMENTS: DryRunTagUpdatePlan[] = [
  {
    name: 'CREARE - GA4 - Event - page_view',
    action: 'add_parameters',
    parametersToAdd: [
      { parameter: 'page_title', variable: '{{CREARE - DLV - page_title}}' },
      { parameter: 'page_location', variable: '{{CREARE - DLV - page_location}}' },
    ],
  },
  {
    name: 'CREARE - GA4 - Event - experience_view',
    action: 'add_parameters',
    parametersToAdd: [
      { parameter: 'page_title', variable: '{{CREARE - DLV - page_title}}' },
      { parameter: 'page_location', variable: '{{CREARE - DLV - page_location}}' },
    ],
  },
  {
    name: 'CREARE - GA4 - Event - inquiry_click',
    action: 'add_parameters',
    parametersToAdd: [
      { parameter: 'page_title', variable: '{{CREARE - DLV - page_title}}' },
      { parameter: 'page_location', variable: '{{CREARE - DLV - page_location}}' },
    ],
  },
  {
    name: 'CREARE - GA4 - Event - contact_submit',
    action: 'add_parameters',
    parametersToAdd: [
      { parameter: 'page_title', variable: '{{CREARE - DLV - page_title}}' },
      { parameter: 'page_location', variable: '{{CREARE - DLV - page_location}}' },
    ],
  },
];

function main() {
  loadEnvFromDotLocal();

  const statePath = path.join(process.cwd(), 'scripts/google/state/gtm-current.json');
  const current = readJsonFile<GtmCurrentState>(statePath);

  if (!current) {
    console.error(
      'Missing scripts/google/state/gtm-current.json. Run npm run google:discover:gtm first.',
    );
    process.exitCode = 1;
    return;
  }

  const currentVariableNames = unique(
    (current.variables ?? []).map((item) => normalizeVariableName(item.name)),
  );
  const currentTriggerNames = unique(
    (current.triggers ?? []).map((item) => normalizeTriggerName(item.name)),
  );
  const currentTagNames = unique((current.tags ?? []).map((item) => item.name));

  const variablesToCreate = REQUIRED_VARIABLES.filter(
    (item) => !currentVariableNames.includes(item.dataLayerVariableName),
  );
  const triggersToCreate = currentTriggerNames.includes(REQUIRED_TRIGGER.eventName)
    ? []
    : [REQUIRED_TRIGGER];
  const tagsToCreate = currentTagNames.includes(REQUIRED_OUTBOUND_TAG.name) ? [] : [REQUIRED_OUTBOUND_TAG];
  const tagsToUpdate = EXISTING_TAG_ENRICHMENTS.filter((item) => currentTagNames.includes(item.name));
  const missingExistingTags = EXISTING_TAG_ENRICHMENTS.filter(
    (item) => !currentTagNames.includes(item.name),
  ).map((item) => item.name);

  const estimatedMutations =
    variablesToCreate.length + triggersToCreate.length + tagsToCreate.length + tagsToUpdate.length;

  logSection('GTM Workspace Context');
  console.log(
    JSON.stringify(
      {
        container: current.container,
        workspace: current.workspace,
        mode: 'dry-run-only',
      },
      null,
      2,
    ),
  );

  logSection('Entities To Create');
  console.log(
    JSON.stringify(
      {
        variables: variablesToCreate,
        triggers: triggersToCreate,
        tags: tagsToCreate,
      },
      null,
      2,
    ),
  );

  logSection('Entities To Update');
  console.log(
    JSON.stringify(
      {
        tags: tagsToUpdate,
      },
      null,
      2,
    ),
  );

  logSection('Plan Summary');
  console.log(
    JSON.stringify(
      {
        estimatedMutations,
        createCount: {
          variables: variablesToCreate.length,
          triggers: triggersToCreate.length,
          tags: tagsToCreate.length,
        },
        updateCount: {
          tags: tagsToUpdate.length,
        },
        missingExistingTags,
        readyForControlledApply:
          missingExistingTags.length === 0 &&
          Boolean(current.container?.accountId) &&
          Boolean(current.container?.containerId) &&
          Boolean(current.workspace?.workspaceId),
      },
      null,
      2,
    ),
  );
}

main();
