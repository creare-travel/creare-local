import fs from 'node:fs';
import path from 'node:path';

export const GOOGLE_SCOPES = {
  GTM_READONLY: 'https://www.googleapis.com/auth/tagmanager.readonly',
  GTM_EDIT_CONTAINERS: 'https://www.googleapis.com/auth/tagmanager.edit.containers',
  ANALYTICS_READONLY: 'https://www.googleapis.com/auth/analytics.readonly',
  ANALYTICS_EDIT: 'https://www.googleapis.com/auth/analytics.edit',
} as const;

export interface GoogleOAuthEnv {
  clientId?: string;
  clientSecret?: string;
  redirectUri?: string;
  refreshToken?: string;
}

export interface OAuthClientConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  refreshToken?: string;
  scopes: string[];
}

function parseEnvLine(line: string): [string, string] | null {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return null;

  const separatorIndex = trimmed.indexOf('=');
  if (separatorIndex === -1) return null;

  const key = trimmed.slice(0, separatorIndex).trim();
  let value = trimmed.slice(separatorIndex + 1).trim();

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }

  return [key, value];
}

export function loadEnvFromDotLocal(cwd = process.cwd()): void {
  const envPath = path.join(cwd, '.env.local');
  if (!fs.existsSync(envPath)) return;

  const contents = fs.readFileSync(envPath, 'utf8');
  for (const line of contents.split(/\r?\n/)) {
    const entry = parseEnvLine(line);
    if (!entry) continue;

    const [key, value] = entry;
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

export function loadGoogleOAuthEnv(): GoogleOAuthEnv {
  loadEnvFromDotLocal();

  return {
    clientId: process.env.GOOGLE_OAUTH_CLIENT_ID?.trim(),
    clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET?.trim(),
    redirectUri: process.env.GOOGLE_OAUTH_REDIRECT_URI?.trim(),
    refreshToken: process.env.GOOGLE_OAUTH_REFRESH_TOKEN?.trim(),
  };
}

export function getMissingEnvVars(names: string[]): string[] {
  return names.filter((name) => {
    const value = process.env[name];
    return !value || !value.trim();
  });
}

export function assertRequiredEnvVars(names: string[], context: string): void {
  const missing = getMissingEnvVars(names);
  if (missing.length === 0) return;

  throw new Error(
    [
      `Missing required environment variables for ${context}:`,
      ...missing.map((name) => `- ${name}`),
      'Populate them in .env.local before running this discovery command.',
    ].join('\n'),
  );
}

export function createOAuthClient(scopes: string[]): OAuthClientConfig {
  loadGoogleOAuthEnv();
  assertRequiredEnvVars(
    ['GOOGLE_OAUTH_CLIENT_ID', 'GOOGLE_OAUTH_CLIENT_SECRET', 'GOOGLE_OAUTH_REDIRECT_URI'],
    'Google OAuth client setup',
  );

  return {
    clientId: process.env.GOOGLE_OAUTH_CLIENT_ID!.trim(),
    clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET!.trim(),
    redirectUri: process.env.GOOGLE_OAUTH_REDIRECT_URI!.trim(),
    refreshToken: process.env.GOOGLE_OAUTH_REFRESH_TOKEN?.trim(),
    scopes,
  };
}

export function buildGoogleConsentUrl(config: OAuthClientConfig): string {
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    access_type: 'offline',
    prompt: 'consent',
    scope: config.scopes.join(' '),
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeAuthorizationCodeForRefreshToken(
  config: OAuthClientConfig,
  authorizationCode: string,
): Promise<string> {
  const body = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    code: authorizationCode,
    redirect_uri: config.redirectUri,
    grant_type: 'authorization_code',
  });

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      [
        `Failed to exchange authorization code for tokens (${response.status}).`,
        'Check the OAuth client values, redirect URI, and pasted authorization code.',
        `Google response: ${errorText}`,
      ].join('\n'),
    );
  }

  const json = (await response.json()) as {
    refresh_token?: string;
    access_token?: string;
  };

  if (!json.refresh_token) {
    throw new Error(
      [
        'Google did not return a refresh token.',
        'Retry the flow with prompt=consent and make sure you are approving offline access.',
      ].join('\n'),
    );
  }

  return json.refresh_token;
}

export async function getAccessToken(config: OAuthClientConfig): Promise<string> {
  if (!config.refreshToken) {
    throw new Error(
      [
        'Missing GOOGLE_OAUTH_REFRESH_TOKEN.',
        'Read-only discovery is prepared, but a refresh token is required to authenticate.',
        'Obtain a refresh token manually and add it to .env.local.',
      ].join('\n'),
    );
  }

  const body = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    refresh_token: config.refreshToken,
    grant_type: 'refresh_token',
  });

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      [
        `Failed to exchange refresh token for access token (${response.status}).`,
        'Check the OAuth client values in .env.local and ensure the refresh token is valid.',
        `Google response: ${errorText}`,
      ].join('\n'),
    );
  }

  const json = (await response.json()) as { access_token?: string };
  if (!json.access_token) {
    throw new Error('Google OAuth token response did not include an access token.');
  }

  return json.access_token;
}

export async function createAuthorizedJsonFetcher(scopes: string[]) {
  const oauthClient = createOAuthClient(scopes);
  const accessToken = await getAccessToken(oauthClient);

  return async function fetchJson<T>(url: string): Promise<T> {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
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
