/** Owner configuration checklist — safe metadata only, never secret values */

import { validateSecretStoreConfiguration } from './providerSecretStore.js';
import { getCanonicalMetaOAuthCallbackUrl, META_OAUTH_CALLBACK_PATH } from './oauthConstants.js';

export type ConfigItemStatus = 'CONFIGURED' | 'MISSING' | 'INVALID';

export type ConfigCheckItem = {
  key: string;
  label: string;
  status: ConfigItemStatus;
  lastValidated: string | null;
  validationResult: string;
};

function envPresent(key: string): boolean {
  return Boolean(process.env[key]?.trim());
}

function validateRedirectUri(): ConfigItemStatus {
  const configured = process.env.META_OAUTH_REDIRECT_URI?.trim();
  if (!configured) return 'MISSING';
  const canonical = getCanonicalMetaOAuthCallbackUrl();
  if (configured !== canonical) {
    return 'INVALID';
  }
  return 'CONFIGURED';
}

export function getOwnerConfigurationChecklist(): {
  items: ConfigCheckItem[];
  exactCallbackUrl: string;
  callbackPath: string;
  allConfigured: boolean;
  validatedAt: string;
} {
  const secretCfg = validateSecretStoreConfiguration();
  const redirectStatus = validateRedirectUri();
  const canonical = getCanonicalMetaOAuthCallbackUrl();

  const items: ConfigCheckItem[] = [
    {
      key: 'META_APP_ID',
      label: 'META APP ID',
      status: envPresent('META_APP_ID') ? 'CONFIGURED' : 'MISSING',
      lastValidated: new Date().toISOString(),
      validationResult: envPresent('META_APP_ID') ? 'Present in server environment' : 'Not set — add to API host environment',
    },
    {
      key: 'META_APP_SECRET',
      label: 'META APP SECRET',
      status: envPresent('META_APP_SECRET') ? 'CONFIGURED' : 'MISSING',
      lastValidated: new Date().toISOString(),
      validationResult: envPresent('META_APP_SECRET') ? 'Present in server environment (value not exposed)' : 'Not set',
    },
    {
      key: 'META_OAUTH_REDIRECT_URI',
      label: 'META OAUTH REDIRECT URI',
      status: redirectStatus,
      lastValidated: new Date().toISOString(),
      validationResult:
        redirectStatus === 'CONFIGURED'
          ? `Matches canonical callback: ${canonical}`
          : redirectStatus === 'INVALID'
            ? `Must exactly equal: ${canonical}`
            : 'Not set — must match exact callback URL below',
    },
    {
      key: 'EVOLVE_PROVIDER_SECRET_KEY',
      label: 'EVOLVE PROVIDER SECRET KEY',
      status: secretCfg.configured ? 'CONFIGURED' : 'MISSING',
      lastValidated: new Date().toISOString(),
      validationResult: secretCfg.configured ? 'Encryption key configured' : secretCfg.message,
    },
  ];

  return {
    items,
    exactCallbackUrl: canonical,
    callbackPath: META_OAUTH_CALLBACK_PATH,
    allConfigured: items.every((i) => i.status === 'CONFIGURED'),
    validatedAt: new Date().toISOString(),
  };
}
