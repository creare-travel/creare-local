import {
  GOOGLE_SCOPES,
  createOAuthClient,
  getAccessToken,
  loadEnvFromDotLocal,
} from './lib/auth';

const EXPECTED_ACCOUNT_ID = '6342296430';
const EXPECTED_CONTAINER_ID = '245237069';
const EXPECTED_WORKSPACE_ID = '8';
const GTM_EDIT_SCOPE = 'https://www.googleapis.com/auth/tagmanager.edit.containers';

interface GtmParameter {
  type?: string;
  key?: string;
  value?: string;
  list?: GtmParameterListItem[];
  map?: GtmParameter[];
}

interface GtmParameterListItem {
  type?: string;
  map?: GtmParameter[];
}

interface GtmVariable {
  path?: string;
  accountId?: string;
  containerId?: string;
  workspaceId?: string;
  variableId?: string;
  name?: string;
  type?: string;
  parameter?: GtmParameter[];
  fingerprint?: string;
}

interface GtmTrigger {
  path?: string;
  accountId?: string;
  containerId?: string;
  workspaceId?: string;
  triggerId?: string;
  name?: string;
  type?: string;
  customEventFilter?: Array<{
    type?: string;
    parameter?: GtmParameter[];
  }>;
  fingerprint?: string;
}

interface GtmTag {
  path?: string;
  accountId?: string;
  containerId?: string;
  workspaceId?: string;
  tagId?: string;
  name?: string;
  type?: string;
  parameter?: GtmParameter[];
  firingTriggerId?: string[];
  tagFiringOption?: string;
  fingerprint?: string;
  monitoringMetadata?: { type?: string };
  consentSettings?: { consentStatus?: string };
}

interface GtmContainer {
  accountId?: string;
  containerId?: string;
  publicId?: string;
  name?: string;
  path?: string;
  usageContext?: string[];
}

interface GtmWorkspace {
  workspaceId?: string;
  name?: string;
  path?: string;
}

interface GtmMutationPlan {
  variablesToCreate: GtmVariable[];
  triggersToCreate: GtmTrigger[];
  tagsToCreate: GtmTag[];
  tagsToUpdate: Array<{
    name: string;
    tagId?: string;
    parametersToAdd: Array<{ parameter: string; variable: string }>;
    body: GtmTag;
  }>;
}

function logSection(title: string): void {
  console.log(`\n=== ${title} ===`);
}

function workspacePath(): string {
  return `accounts/${EXPECTED_ACCOUNT_ID}/containers/${EXPECTED_CONTAINER_ID}/workspaces/${EXPECTED_WORKSPACE_ID}`;
}

function workspaceUrl(pathSuffix: string): string {
  return `https://tagmanager.googleapis.com/tagmanager/v2/${workspacePath()}${pathSuffix}`;
}

function assertExpectedEnv(): void {
  const accountId = process.env.GOOGLE_GTM_ACCOUNT_ID?.trim();
  const containerId = process.env.GOOGLE_GTM_CONTAINER_ID?.trim();
  const workspaceId = process.env.GOOGLE_GTM_WORKSPACE_ID?.trim();

  if (accountId !== EXPECTED_ACCOUNT_ID) {
    throw new Error(
      `GOOGLE_GTM_ACCOUNT_ID mismatch. Expected ${EXPECTED_ACCOUNT_ID}, received ${accountId ?? '(missing)'}.`,
    );
  }

  if (containerId !== EXPECTED_CONTAINER_ID) {
    throw new Error(
      `GOOGLE_GTM_CONTAINER_ID mismatch. Expected ${EXPECTED_CONTAINER_ID}, received ${containerId ?? '(missing)'}.`,
    );
  }

  if (workspaceId !== EXPECTED_WORKSPACE_ID) {
    throw new Error(
      `GOOGLE_GTM_WORKSPACE_ID mismatch. Expected ${EXPECTED_WORKSPACE_ID}, received ${workspaceId ?? '(missing)'}.`,
    );
  }
}

function toArray<T>(value: T[] | undefined | null): T[] {
  return Array.isArray(value) ? value : [];
}

function buildDataLayerVariable(name: string, dataLayerVariableName: string): GtmVariable {
  return {
    name,
    type: 'v',
    parameter: [
      {
        type: 'integer',
        key: 'dataLayerVersion',
        value: '2',
      },
      {
        type: 'boolean',
        key: 'setDefaultValue',
        value: 'false',
      },
      {
        type: 'template',
        key: 'name',
        value: dataLayerVariableName,
      },
    ],
  };
}

function buildCustomEventTrigger(name: string, eventName: string): GtmTrigger {
  return {
    name,
    type: 'customEvent',
    customEventFilter: [
      {
        type: 'equals',
        parameter: [
          {
            type: 'template',
            key: 'arg0',
            value: '{{_event}}',
          },
          {
            type: 'template',
            key: 'arg1',
            value: eventName,
          },
        ],
      },
    ],
  };
}

function buildEventSettingsParameter(
  mappings: Array<{ parameter: string; variable: string }>,
): GtmParameter {
  return {
    type: 'list',
    key: 'eventSettingsTable',
    list: mappings.map((mapping) => ({
      type: 'map',
      map: [
        {
          type: 'template',
          key: 'parameter',
          value: mapping.parameter,
        },
        {
          type: 'template',
          key: 'parameterValue',
          value: mapping.variable,
        },
      ],
    })),
  };
}

function buildGa4EventTag(args: {
  name: string;
  eventName: string;
  triggerId: string;
  parameters: Array<{ parameter: string; variable: string }>;
}): GtmTag {
  return {
    name: args.name,
    type: 'gaawe',
    parameter: [
      {
        type: 'boolean',
        key: 'sendEcommerceData',
        value: 'false',
      },
      buildEventSettingsParameter(args.parameters),
      {
        type: 'template',
        key: 'eventName',
        value: args.eventName,
      },
      {
        type: 'template',
        key: 'measurementIdOverride',
        value: 'G-0ZCE6MFRJK',
      },
    ],
    firingTriggerId: [args.triggerId],
    tagFiringOption: 'oncePerEvent',
    monitoringMetadata: { type: 'map' },
    consentSettings: { consentStatus: 'notSet' },
  };
}

function getEventSettingsTable(tag: GtmTag): GtmParameterListItem[] {
  const eventSettings = toArray(tag.parameter).find((parameter) => parameter.key === 'eventSettingsTable');
  return toArray(eventSettings?.list);
}

function hasEventSetting(tag: GtmTag, parameterName: string): boolean {
  return getEventSettingsTable(tag).some((item) =>
    toArray(item.map).some(
      (entry) => entry.key === 'parameter' && entry.value === parameterName,
    ),
  );
}

function appendEventSettings(
  tag: GtmTag,
  mappings: Array<{ parameter: string; variable: string }>,
): GtmTag {
  const parameters = [...toArray(tag.parameter)];
  const eventSettingsIndex = parameters.findIndex((parameter) => parameter.key === 'eventSettingsTable');

  const existingList =
    eventSettingsIndex >= 0 ? [...toArray(parameters[eventSettingsIndex]?.list)] : [];

  for (const mapping of mappings) {
    existingList.push({
      type: 'map',
      map: [
        {
          type: 'template',
          key: 'parameter',
          value: mapping.parameter,
        },
        {
          type: 'template',
          key: 'parameterValue',
          value: mapping.variable,
        },
      ],
    });
  }

  if (eventSettingsIndex >= 0) {
    parameters[eventSettingsIndex] = {
      ...parameters[eventSettingsIndex],
      type: 'list',
      key: 'eventSettingsTable',
      list: existingList,
    };
  } else {
    parameters.push(
      buildEventSettingsParameter(
        mappings.map((mapping) => ({
          parameter: mapping.parameter,
          variable: mapping.variable,
        })),
      ),
    );
  }

  return {
    ...tag,
    parameter: parameters,
  };
}

async function createAuthorizedFetcher(apply: boolean) {
  const scopes = [apply ? GTM_EDIT_SCOPE : GOOGLE_SCOPES.GTM_READONLY];
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

async function readLiveState(fetchJson: <T>(url: string, init?: RequestInit) => Promise<T>) {
  const [container, workspace, variablesResponse, triggersResponse, tagsResponse] = await Promise.all([
    fetchJson<GtmContainer>(
      `https://tagmanager.googleapis.com/tagmanager/v2/accounts/${EXPECTED_ACCOUNT_ID}/containers/${EXPECTED_CONTAINER_ID}`,
    ),
    fetchJson<GtmWorkspace>(`https://tagmanager.googleapis.com/tagmanager/v2/${workspacePath()}`),
    fetchJson<{ variable?: GtmVariable[] }>(workspaceUrl('/variables')),
    fetchJson<{ trigger?: GtmTrigger[] }>(workspaceUrl('/triggers')),
    fetchJson<{ tag?: GtmTag[] }>(workspaceUrl('/tags')),
  ]);

  return {
    container,
    workspace,
    variables: toArray(variablesResponse.variable),
    triggers: toArray(triggersResponse.trigger),
    tags: toArray(tagsResponse.tag),
  };
}

function ensureLiveStateIsExpected(state: Awaited<ReturnType<typeof readLiveState>>): void {
  if (state.container.accountId !== EXPECTED_ACCOUNT_ID) {
    throw new Error(`Live GTM account mismatch. Expected ${EXPECTED_ACCOUNT_ID}.`);
  }

  if (state.container.containerId !== EXPECTED_CONTAINER_ID) {
    throw new Error(`Live GTM container mismatch. Expected ${EXPECTED_CONTAINER_ID}.`);
  }

  if (state.workspace.workspaceId !== EXPECTED_WORKSPACE_ID) {
    throw new Error(`Live GTM workspace mismatch. Expected ${EXPECTED_WORKSPACE_ID}.`);
  }
}

function findTagByName(tags: GtmTag[], name: string): GtmTag | undefined {
  return tags.find((tag) => tag.name === name);
}

function buildPlan(state: Awaited<ReturnType<typeof readLiveState>>): GtmMutationPlan {
  const requiredGa4ConfigTag = findTagByName(state.tags, 'CREARE - GA4 - Config');
  if (!requiredGa4ConfigTag) {
    throw new Error('Required GTM tag missing: CREARE - GA4 - Config');
  }

  const variableDefs = [
    ['CREARE - DLV - page_title', 'page_title'],
    ['CREARE - DLV - page_location', 'page_location'],
    ['CREARE - DLV - outbound_url', 'outbound_url'],
    ['CREARE - DLV - outbound_domain', 'outbound_domain'],
  ] as const;

  const triggerName = 'CREARE - Trigger - outbound_click';
  const requiredExistingTagNames = [
    'CREARE - GA4 - Event - page_view',
    'CREARE - GA4 - Event - experience_view',
    'CREARE - GA4 - Event - inquiry_click',
    'CREARE - GA4 - Event - contact_submit',
  ] as const;

  for (const tagName of requiredExistingTagNames) {
    if (!findTagByName(state.tags, tagName)) {
      throw new Error(`Required GTM tag missing: ${tagName}`);
    }
  }

  const variablesToCreate = variableDefs
    .filter(([name]) => !state.variables.some((variable) => variable.name === name))
    .map(([name, dataLayerVariableName]) => buildDataLayerVariable(name, dataLayerVariableName));

  const outboundTrigger = state.triggers.find((trigger) => trigger.name === triggerName);
  const triggersToCreate = outboundTrigger ? [] : [buildCustomEventTrigger(triggerName, 'outbound_click')];

  const resolvedTriggerId = outboundTrigger?.triggerId ?? '__PENDING_TRIGGER_CREATE__';
  const outboundTagName = 'CREARE - GA4 - Event - outbound_click';
  const outboundMappings = [
    { parameter: 'page_path', variable: '{{CREARE - DLV - page_path}}' },
    { parameter: 'page_title', variable: '{{CREARE - DLV - page_title}}' },
    { parameter: 'page_location', variable: '{{CREARE - DLV - page_location}}' },
    { parameter: 'outbound_url', variable: '{{CREARE - DLV - outbound_url}}' },
    { parameter: 'outbound_domain', variable: '{{CREARE - DLV - outbound_domain}}' },
  ];

  const existingOutboundTag = findTagByName(state.tags, outboundTagName);
  const tagsToCreate =
    existingOutboundTag || resolvedTriggerId === '__PENDING_TRIGGER_CREATE__'
      ? existingOutboundTag
        ? []
        : [buildGa4EventTag({
            name: outboundTagName,
            eventName: 'outbound_click',
            triggerId: resolvedTriggerId,
            parameters: outboundMappings,
          })]
      : [
          buildGa4EventTag({
            name: outboundTagName,
            eventName: 'outbound_click',
            triggerId: resolvedTriggerId,
            parameters: outboundMappings,
          }),
        ];

  const tagsToUpdate = requiredExistingTagNames
    .map((tagName) => {
      const tag = findTagByName(state.tags, tagName)!;
      const parametersToAdd = [
        { parameter: 'page_title', variable: '{{CREARE - DLV - page_title}}' },
        { parameter: 'page_location', variable: '{{CREARE - DLV - page_location}}' },
      ].filter((mapping) => !hasEventSetting(tag, mapping.parameter));

      if (parametersToAdd.length === 0) return null;

      return {
        name: tag.name ?? tagName,
        tagId: tag.tagId,
        parametersToAdd,
        body: appendEventSettings(tag, parametersToAdd),
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  if (existingOutboundTag) {
    const missingOutboundMappings = outboundMappings.filter(
      (mapping) => !hasEventSetting(existingOutboundTag, mapping.parameter),
    );
    if (missingOutboundMappings.length > 0) {
      tagsToUpdate.push({
        name: existingOutboundTag.name ?? outboundTagName,
        tagId: existingOutboundTag.tagId,
        parametersToAdd: missingOutboundMappings,
        body: appendEventSettings(existingOutboundTag, missingOutboundMappings),
      });
    }
  }

  return {
    variablesToCreate,
    triggersToCreate,
    tagsToCreate,
    tagsToUpdate,
  };
}

function estimatedMutations(plan: GtmMutationPlan): number {
  return (
    plan.variablesToCreate.length +
    plan.triggersToCreate.length +
    plan.tagsToCreate.length +
    plan.tagsToUpdate.length
  );
}

async function applyPlan(
  fetchJson: <T>(url: string, init?: RequestInit) => Promise<T>,
  plan: GtmMutationPlan,
): Promise<void> {
  const createdTriggerIds = new Map<string, string>();

  for (const variable of plan.variablesToCreate) {
    await fetchJson(workspaceUrl('/variables'), {
      method: 'POST',
      body: JSON.stringify(variable),
    });
  }

  for (const trigger of plan.triggersToCreate) {
    const created = await fetchJson<GtmTrigger>(workspaceUrl('/triggers'), {
      method: 'POST',
      body: JSON.stringify(trigger),
    });
    if (created.name && created.triggerId) {
      createdTriggerIds.set(created.name, created.triggerId);
    }
  }

  for (const tag of plan.tagsToCreate) {
    const triggerName = 'CREARE - Trigger - outbound_click';
    const triggerId = createdTriggerIds.get(triggerName);
    const body =
      triggerId && tag.name === 'CREARE - GA4 - Event - outbound_click'
        ? { ...tag, firingTriggerId: [triggerId] }
        : tag;

    await fetchJson(workspaceUrl('/tags'), {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  for (const tag of plan.tagsToUpdate) {
    if (!tag.tagId) {
      throw new Error(`Cannot update tag without tagId: ${tag.name}`);
    }

    await fetchJson(`${workspaceUrl('/tags')}/${tag.tagId}`, {
      method: 'PUT',
      body: JSON.stringify(tag.body),
    });
  }
}

async function main() {
  loadEnvFromDotLocal();
  assertExpectedEnv();

  const apply = process.argv.includes('--apply');
  const fetchJson = await createAuthorizedFetcher(apply);
  const liveState = await readLiveState(fetchJson);

  ensureLiveStateIsExpected(liveState);

  const plan = buildPlan(liveState);

  logSection('Mode');
  console.log(apply ? 'apply' : 'dry-run');

  logSection('Safety Checks');
  console.log(
    JSON.stringify(
      {
        expectedAccountId: EXPECTED_ACCOUNT_ID,
        expectedContainerId: EXPECTED_CONTAINER_ID,
        expectedWorkspaceId: EXPECTED_WORKSPACE_ID,
        liveAccountId: liveState.container.accountId,
        liveContainerId: liveState.container.containerId,
        liveWorkspaceId: liveState.workspace.workspaceId,
        requiredGa4ConfigTagPresent: Boolean(findTagByName(liveState.tags, 'CREARE - GA4 - Config')),
        requiredExistingTagsPresent: true,
      },
      null,
      2,
    ),
  );

  logSection('Planned Changes');
  console.log(
    JSON.stringify(
      {
        variablesToCreate: plan.variablesToCreate.map((item) => item.name),
        triggersToCreate: plan.triggersToCreate.map((item) => item.name),
        tagsToCreate: plan.tagsToCreate.map((item) => item.name),
        tagsToUpdate: plan.tagsToUpdate.map((item) => ({
          name: item.name,
          parametersToAdd: item.parametersToAdd,
        })),
        estimatedMutations: estimatedMutations(plan),
      },
      null,
      2,
    ),
  );

  if (!apply) {
    logSection('Dry Run Result');
    console.log('No live GTM changes were made.');
    return;
  }

  await applyPlan(fetchJson, plan);

  logSection('Apply Result');
  console.log('Live GTM workspace mutations completed. No version was created and nothing was published.');
}

main().catch((error) => {
  console.error('GTM outbound controlled apply script failed.');
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
