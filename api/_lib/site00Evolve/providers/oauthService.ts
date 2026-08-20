/** OAuth state management — CSRF-safe, org+provider bound, single-use */

import { randomBytes, createHash } from 'node:crypto';
import { getSupabaseAdmin } from '../../supabase.js';
import { orgIdFromSlug } from '../orgRegistry.js';
import { validateSecretStoreConfiguration } from './providerSecretStore.js';

import { memOAuthStates, resetOAuthStateStore } from './oauthStateStore.js';
import { getCanonicalMetaOAuthCallbackUrl } from './oauthConstants.js';

export function useMemoryOAuth(): boolean {
  return process.env.EVOLVE_USE_MEMORY === '1' || process.env.VITEST === 'true';
}

export function resetOAuthMemory(): void {
  resetOAuthStateStore();
}

function generateStateToken(): string {
  return createHash('sha256').update(randomBytes(32)).digest('hex');
}

export type OAuthStartResult =
  | { ok: true; stateToken: string; authorizationUrl: string | null; status: string }
  | { ok: false; code: string; message: string; missingEnv?: string[] };

export function getProviderOAuthConfig(providerKey: string): {
  configured: boolean;
  missing: string[];
  clientId?: string;
  redirectUri?: string;
} {
  if (providerKey === 'meta_instagram') {
    const missing: string[] = [];
    if (!process.env.META_APP_ID?.trim()) missing.push('META_APP_ID');
    if (!process.env.META_APP_SECRET?.trim()) missing.push('META_APP_SECRET');
    if (!process.env.META_OAUTH_REDIRECT_URI?.trim()) missing.push('META_OAUTH_REDIRECT_URI');
    const redirectUri = process.env.META_OAUTH_REDIRECT_URI?.trim() || getCanonicalMetaOAuthCallbackUrl();
    const canonical = getCanonicalMetaOAuthCallbackUrl();
    const invalidRedirect = Boolean(process.env.META_OAUTH_REDIRECT_URI?.trim() && redirectUri !== canonical);
    return {
      configured: missing.length === 0 && !invalidRedirect,
      missing: invalidRedirect ? [...missing, 'META_OAUTH_REDIRECT_URI_INVALID'] : missing,
      clientId: process.env.META_APP_ID,
      redirectUri,
    };
  }
  return { configured: false, missing: [`${providerKey.toUpperCase()}_NOT_CONFIGURED`] };
}

export async function startOAuthAuthorization(
  orgSlug: string,
  providerKey: string,
  connectionId: string,
): Promise<OAuthStartResult> {
  const orgId = orgIdFromSlug(orgSlug)!;
  const secretCfg = validateSecretStoreConfiguration();
  if (!secretCfg.configured && !useMemoryOAuth()) {
    return { ok: false, code: 'REQUIRES_SECURE_CONFIGURATION', message: secretCfg.message };
  }

  const oauthCfg = getProviderOAuthConfig(providerKey);
  if (!oauthCfg.configured) {
    return {
      ok: false,
      code: 'REQUIRES_OWNER_CONFIGURATION',
      message: `Owner must configure: ${oauthCfg.missing.join(', ')}`,
      missingEnv: oauthCfg.missing,
    };
  }

  const stateToken = generateStateToken();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

  if (useMemoryOAuth()) {
    memOAuthStates.set(stateToken, {
      organization_id: orgId,
      provider_key: providerKey,
      connection_id: connectionId,
      redirect_uri: oauthCfg.redirectUri,
      expires_at: expiresAt,
    });
  } else {
    const { error } = await getSupabaseAdmin().from('site00_oauth_states').insert({
      state_token: stateToken,
      organization_id: orgId,
      provider_key: providerKey,
      connection_id: connectionId,
      redirect_uri: oauthCfg.redirectUri,
      expires_at: expiresAt,
    });
    if (error) throw error;
  }

  let authorizationUrl: string | null = null;
  if (providerKey === 'meta_instagram' && oauthCfg.clientId && oauthCfg.redirectUri) {
    const scopes = ['instagram_basic', 'instagram_content_publish', 'pages_show_list'];
    authorizationUrl =
      `https://www.facebook.com/v19.0/dialog/oauth?client_id=${encodeURIComponent(oauthCfg.clientId)}` +
      `&redirect_uri=${encodeURIComponent(oauthCfg.redirectUri ?? getCanonicalMetaOAuthCallbackUrl())}` +
      `&state=${encodeURIComponent(stateToken)}` +
      `&scope=${encodeURIComponent(scopes.join(','))}`;
  }

  return { ok: true, stateToken, authorizationUrl, status: 'AUTHORIZING' };
}

export async function consumeOAuthState(
  stateToken: string,
  providerKey: string,
  organizationId: string,
): Promise<{ ok: boolean; connectionId?: string; error?: string }> {
  if (useMemoryOAuth()) {
    const row = memOAuthStates.get(stateToken);
    if (!row) return { ok: false, error: 'INVALID_STATE' };
    if (row.organization_id !== organizationId) return { ok: false, error: 'CROSS_ORG_DENIED' };
    if (row.provider_key !== providerKey) return { ok: false, error: 'WRONG_PROVIDER' };
    if (new Date(String(row.expires_at)) < new Date()) return { ok: false, error: 'STATE_EXPIRED' };
    if (row.consumed_at) return { ok: false, error: 'STATE_ALREADY_USED' };
    row.consumed_at = new Date().toISOString();
    return { ok: true, connectionId: String(row.connection_id) };
  }

  const { data, error } = await getSupabaseAdmin()
    .from('site00_oauth_states')
    .select('*')
    .eq('state_token', stateToken)
    .maybeSingle();
  if (error) throw error;
  if (!data) return { ok: false, error: 'INVALID_STATE' };
  if (data.organization_id !== organizationId) return { ok: false, error: 'CROSS_ORG_DENIED' };
  if (data.provider_key !== providerKey) return { ok: false, error: 'WRONG_PROVIDER' };
  if (new Date(data.expires_at) < new Date()) return { ok: false, error: 'STATE_EXPIRED' };
  if (data.consumed_at) return { ok: false, error: 'STATE_ALREADY_USED' };

  await getSupabaseAdmin()
    .from('site00_oauth_states')
    .update({ consumed_at: new Date().toISOString() })
    .eq('id', data.id);

  return { ok: true, connectionId: data.connection_id ?? undefined };
}
