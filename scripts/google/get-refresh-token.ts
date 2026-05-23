import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import {
  GOOGLE_SCOPES,
  buildGoogleConsentUrl,
  createOAuthClient,
  exchangeAuthorizationCodeForRefreshToken,
} from './lib/auth';

function getRequestedScopes(): string[] {
  const includeGtmEdit = process.argv.includes('--gtm-edit');

  if (includeGtmEdit) {
    return [
      GOOGLE_SCOPES.GTM_READONLY,
      GOOGLE_SCOPES.GTM_EDIT_CONTAINERS,
      GOOGLE_SCOPES.ANALYTICS_READONLY,
    ];
  }

  return [GOOGLE_SCOPES.GTM_READONLY, GOOGLE_SCOPES.ANALYTICS_READONLY];
}

async function main() {
  const oauthClient = createOAuthClient(getRequestedScopes());

  const consentUrl = buildGoogleConsentUrl(oauthClient);

  console.log('\nOpen this URL in your browser and approve access:\n');
  console.log(consentUrl);
  console.log('\nPaste the returned authorization code below.\n');

  const rl = createInterface({ input, output });

  try {
    const authorizationCode = (await rl.question('Authorization code: ')).trim();

    if (!authorizationCode) {
      throw new Error('No authorization code was provided.');
    }

    const refreshToken = await exchangeAuthorizationCodeForRefreshToken(
      oauthClient,
      authorizationCode,
    );

    console.log('\nRefresh token:\n');
    console.log(refreshToken);
  } finally {
    rl.close();
  }
}

main().catch((error) => {
  console.error('\nGoogle OAuth refresh token helper failed.');
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
