import {
  GOOGLE_SCOPES,
  createAuthorizedJsonFetcher,
  loadEnvFromDotLocal,
} from './lib/auth';
import { writeJsonFile } from './lib/state';

interface GtmAccount {
  accountId?: string;
  name?: string;
  path?: string;
  shareData?: boolean;
}

interface GtmContainer {
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
  description?: string;
}

interface GtmEntity {
  name?: string;
  path?: string;
  type?: string;
  variableId?: string;
  triggerId?: string;
  tagId?: string;
}

interface GtmCurrentState {
  generatedAt: string;
  accountSummary: Array<{
    accountId?: string;
    name?: string;
    path?: string;
    shareData?: boolean;
  }>;
  containerSummary: Array<{
    accountId?: string;
    accountName?: string;
    containers: Array<{
      containerId?: string;
      publicId?: string;
      name?: string;
      path?: string;
      usageContext?: string[];
    }>;
  }>;
  container?: {
    accountId?: string;
    containerId?: string;
    publicId?: string;
    name?: string;
    path?: string;
    usageContext?: string[];
  };
  workspace?: {
    workspaceId?: string;
    name?: string;
    path?: string;
    description?: string;
  };
  variables?: Array<{
    variableId?: string;
    name?: string;
    type?: string;
    path?: string;
  }>;
  triggers?: Array<{
    triggerId?: string;
    name?: string;
    type?: string;
    path?: string;
  }>;
  tags?: Array<{
    tagId?: string;
    name?: string;
    type?: string;
    path?: string;
  }>;
}

function logSection(title: string): void {
  console.log(`\n=== ${title} ===`);
}

function toArray<T>(value: T[] | undefined | null): T[] {
  return Array.isArray(value) ? value : [];
}

function normalizeAccountPath(accountId: string): string {
  return `accounts/${accountId}`;
}

function normalizeContainerPath(accountId: string, containerId: string): string {
  return `${normalizeAccountPath(accountId)}/containers/${containerId}`;
}

function normalizeWorkspacePath(accountId: string, containerId: string, workspaceId: string): string {
  return `${normalizeContainerPath(accountId, containerId)}/workspaces/${workspaceId}`;
}

async function main() {
  loadEnvFromDotLocal();

  const fetchJson = await createAuthorizedJsonFetcher([GOOGLE_SCOPES.GTM_READONLY]);

  logSection('GTM Accounts');
  const accountResponse = await fetchJson<{ account?: GtmAccount[] }>(
    'https://tagmanager.googleapis.com/tagmanager/v2/accounts',
  );
  const accounts = toArray(accountResponse.account);
  const state: GtmCurrentState = {
    generatedAt: new Date().toISOString(),
    accountSummary: accounts.map((account) => ({
      accountId: account.accountId,
      name: account.name,
      path: account.path,
      shareData: account.shareData,
    })),
    containerSummary: [],
  };

  if (accounts.length === 0) {
    console.log('No accessible GTM accounts were returned for this OAuth principal.');
    return;
  }

  for (const account of accounts) {
    console.log(
      JSON.stringify(
        {
          accountId: account.accountId,
          name: account.name,
          path: account.path,
          shareData: account.shareData,
        },
        null,
        2,
      ),
    );
  }

  logSection('GTM Containers');
  for (const account of accounts) {
    if (!account.accountId) continue;

    const containerResponse = await fetchJson<{ container?: GtmContainer[] }>(
      `https://tagmanager.googleapis.com/tagmanager/v2/${normalizeAccountPath(account.accountId)}/containers`,
    );
    const containers = toArray(containerResponse.container);
    state.containerSummary.push({
      accountId: account.accountId,
      accountName: account.name,
      containers: containers.map((container) => ({
        containerId: container.containerId,
        publicId: container.publicId,
        name: container.name,
        path: container.path,
        usageContext: container.usageContext,
      })),
    });

    console.log(`Account ${account.accountId} (${account.name ?? 'Unnamed Account'})`);
    if (containers.length === 0) {
      console.log('  No containers found.');
      continue;
    }

    for (const container of containers) {
      console.log(
        JSON.stringify(
          {
            containerId: container.containerId,
            publicId: container.publicId,
            name: container.name,
            path: container.path,
            usageContext: container.usageContext,
          },
          null,
          2,
        ),
      );
    }
  }

  const selectedAccountId = process.env.GOOGLE_GTM_ACCOUNT_ID?.trim();
  const selectedContainerId = process.env.GOOGLE_GTM_CONTAINER_ID?.trim();
  const selectedWorkspaceId = process.env.GOOGLE_GTM_WORKSPACE_ID?.trim();

  if (!selectedAccountId || !selectedContainerId) {
    writeJsonFile('scripts/google/state/gtm-current.json', state);
    logSection('Workspace Discovery');
    console.log(
      'Set GOOGLE_GTM_ACCOUNT_ID and GOOGLE_GTM_CONTAINER_ID in .env.local to list workspaces and deep inventory.',
    );
    console.log('\nSaved read-only GTM inventory to scripts/google/state/gtm-current.json');
    return;
  }

  logSection('GTM Workspaces');
  const workspaceResponse = await fetchJson<{ workspace?: GtmWorkspace[] }>(
    `https://tagmanager.googleapis.com/tagmanager/v2/${normalizeContainerPath(selectedAccountId, selectedContainerId)}/workspaces`,
  );
  const workspaces = toArray(workspaceResponse.workspace);

  if (workspaces.length === 0) {
    console.log('No workspaces found for the selected GTM container.');
    return;
  }

  const selectedContainer = state.containerSummary
    .find((entry) => entry.accountId === selectedAccountId)
    ?.containers.find((container) => container.containerId === selectedContainerId);

  if (selectedContainer) {
    state.container = {
      accountId: selectedAccountId,
      ...selectedContainer,
    };
  }

  for (const workspace of workspaces) {
    console.log(
      JSON.stringify(
        {
          workspaceId: workspace.workspaceId,
          name: workspace.name,
          path: workspace.path,
          description: workspace.description,
        },
        null,
        2,
      ),
    );
  }

  if (!selectedWorkspaceId) {
    writeJsonFile('scripts/google/state/gtm-current.json', state);
    logSection('Selected Workspace Inventory');
    console.log(
      'Set GOOGLE_GTM_WORKSPACE_ID in .env.local to list variables, triggers, and tags for a single workspace.',
    );
    console.log('\nSaved read-only GTM inventory to scripts/google/state/gtm-current.json');
    return;
  }

  const workspacePath = normalizeWorkspacePath(
    selectedAccountId,
    selectedContainerId,
    selectedWorkspaceId,
  );
  const selectedWorkspace = workspaces.find((workspace) => workspace.workspaceId === selectedWorkspaceId);
  if (selectedWorkspace) {
    state.workspace = {
      workspaceId: selectedWorkspace.workspaceId,
      name: selectedWorkspace.name,
      path: selectedWorkspace.path,
      description: selectedWorkspace.description,
    };
  }

  logSection('GTM Variables');
  const variableResponse = await fetchJson<{ variable?: GtmEntity[] }>(
    `https://tagmanager.googleapis.com/tagmanager/v2/${workspacePath}/variables`,
  );
  const variables = toArray(variableResponse.variable).map((variable) => ({
    variableId: variable.variableId,
    name: variable.name,
    type: variable.type,
    path: variable.path,
  }));
  state.variables = variables;
  for (const variable of variables) {
    console.log(
      JSON.stringify(
        variable,
        null,
        2,
      ),
    );
  }

  logSection('GTM Triggers');
  const triggerResponse = await fetchJson<{ trigger?: GtmEntity[] }>(
    `https://tagmanager.googleapis.com/tagmanager/v2/${workspacePath}/triggers`,
  );
  const triggers = toArray(triggerResponse.trigger).map((trigger) => ({
    triggerId: trigger.triggerId,
    name: trigger.name,
    type: trigger.type,
    path: trigger.path,
  }));
  state.triggers = triggers;
  for (const trigger of triggers) {
    console.log(
      JSON.stringify(
        trigger,
        null,
        2,
      ),
    );
  }

  logSection('GTM Tags');
  const tagResponse = await fetchJson<{ tag?: GtmEntity[] }>(
    `https://tagmanager.googleapis.com/tagmanager/v2/${workspacePath}/tags`,
  );
  const tags = toArray(tagResponse.tag).map((tag) => ({
    tagId: tag.tagId,
    name: tag.name,
    type: tag.type,
    path: tag.path,
  }));
  state.tags = tags;
  for (const tag of tags) {
    console.log(
      JSON.stringify(
        tag,
        null,
        2,
      ),
    );
  }

  writeJsonFile('scripts/google/state/gtm-current.json', state);
  console.log('\nSaved read-only GTM inventory to scripts/google/state/gtm-current.json');
}

main().catch((error) => {
  console.error('\nGTM read-only discovery failed.');
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
