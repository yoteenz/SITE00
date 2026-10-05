/** OAuth callback — token exchange server-side, encrypted storage, safe redirect */

import { getSupabaseAdmin } from '../../supabase.js';
import { slugFromOrgId } from '../orgRegistry.js';
import { useMemoryOAuth } from './oauthService.js';
import { storeProviderCredential, redactForLogs } from './providerSecretStore.js';
import { getPilotReturnUrl } from './oauthConstants.js';
import * as db from './connectionStore.js';
import { useMemoryConnections, memConnections, recordConnectionEvent } from './connectionService.js';

async function loadStateRow(stateToken: string): Promise<Record<string, unknown> | null> {
  if (useMemoryOAuth()) {
    const { memOAuthStates } = await import('./oauthStateStore.js');
    return memOAuthStates.get(stateToken) ?? null;
  }
  const { data, error } = await getSupabaseAdmin()
    .from('site00_oauth_states')
    .select('*')
    .eq('state_token', stateToken)
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function markStateConsumed(stateToken: string): Promise<void> {
  if (useMemoryOAuth()) {
    const { consumeOAuthStateRecord } = await import('./oauthStateStore.js');
    consumeOAuthStateRecord(stateToken);
    return;
  }
  await getSupabaseAdmin()
    .from('site00_oauth_states')
    .update({ consumed_at: new Date().toISOString() })
    .eq('state_token', stateToken);
}

async function exchangeMetaCode(code: string, redirectUri: string): Promise<Record<string, unknown>> {
  if (useMemoryOAuth()) {
    return { access_token: 'test-access-token', token_type: 'bearer', expires_in: 3600 };
  }
  const clientId = process.env.META_APP_ID!;
  const clientSecret = process.env.META_APP_SECRET!;
  const url =
    `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${encodeURIComponent(clientId)}` +
    `&client_secret=${encodeURIComponent(clientSecret)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&code=${encodeURIComponent(code)}`;
  const res = await fetch(url);
  const json = (await res.json()) as Record<string, unknown>;
  if (!res.ok || json.error) {
    throw new Error(String((json.error as { message?: string })?.message ?? 'Token exchange failed'));
  }
  return json;
}

export async function handleMetaOAuthCallback(opts: {
  code: string | null;
  state: string | null;
  error?: string | null;
}): Promise<{ redirectUrl: string; ok: boolean; error?: string }> {
  if (opts.error) {
    return { redirectUrl: `${getPilotReturnUrl('ndxbook')}?oauth=error&reason=${encodeURIComponent(opts.error)}`, ok: false, error: opts.error };
  }
  if (!opts.code || !opts.state) {
    return { redirectUrl: `${getPilotReturnUrl('ndxbook')}?oauth=error&reason=missing_code_or_state`, ok: false, error: 'MISSING_PARAMS' };
  }

  const row = await loadStateRow(opts.state);
  if (!row) {
    return { redirectUrl: `${getPilotReturnUrl('ndxbook')}?oauth=error&reason=invalid_state`, ok: false, error: 'INVALID_STATE' };
  }
  if (row.consumed_at) {
    return { redirectUrl: `${getPilotReturnUrl('ndxbook')}?oauth=error&reason=state_already_used`, ok: false, error: 'STATE_ALREADY_USED' };
  }
  if (new Date(String(row.expires_at)) < new Date()) {
    return { redirectUrl: `${getPilotReturnUrl('ndxbook')}?oauth=error&reason=state_expired`, ok: false, error: 'STATE_EXPIRED' };
  }
  if (String(row.provider_key) !== 'meta_instagram') {
    return { redirectUrl: `${getPilotReturnUrl('ndxbook')}?oauth=error&reason=wrong_provider`, ok: false, error: 'WRONG_PROVIDER' };
  }

  const orgId = String(row.organization_id);
  const orgSlug = slugFromOrgId(orgId) ?? 'ndxbook';
  const connectionId = String(row.connection_id);
  const redirectUri = String(row.redirect_uri ?? process.env.META_OAUTH_REDIRECT_URI ?? '');

  try {
    const tokenPayload = await exchangeMetaCode(opts.code, redirectUri);
    const stored = await storeProviderCredential({
      organizationId: orgId,
      providerKey: 'meta_instagram',
      payload: tokenPayload,
      expiresAt: tokenPayload.expires_in
        ? new Date(Date.now() + Number(tokenPayload.expires_in) * 1000).toISOString()
        : null,
    });
    if (!stored.ok) {
      return {
        redirectUrl: `${getPilotReturnUrl(orgSlug)}?oauth=error&reason=secure_config`,
        ok: false,
        error: stored.message,
      };
    }

    const patch = {
      status: 'CONNECTING',
      connection_state: 'CONNECTING',
      secret_ref: stored.secretRef,
      credential_state: 'CONFIGURED',
      verification_status: 'VERIFICATION_REQUIRED',
      updated_at: new Date().toISOString(),
    };

    if (useMemoryConnections()) {
      const conn = memConnections.find((c) => c.id === connectionId && c.organization_id === orgId);
      if (conn) Object.assign(conn, patch);
    } else {
      const existing = await db.loadConnectionById(connectionId, orgId);
      if (!existing) throw new Error('CROSS_ORG_DENIED');
      await db.upsertConnection({ ...existing, ...patch });
    }

    await markStateConsumed(opts.state);
    await recordConnectionEvent({
      organization_id: orgId,
      connection_id: connectionId,
      event_type: 'AUTHORIZATION_VERIFIED',
      summary: 'OAuth token exchanged and stored securely',
      metadata: redactForLogs({ provider: 'meta_instagram' }),
    });

    return { redirectUrl: `${getPilotReturnUrl(orgSlug)}?oauth=complete`, ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'OAuth failed';
    return { redirectUrl: `${getPilotReturnUrl(orgSlug)}?oauth=error&reason=${encodeURIComponent(msg)}`, ok: false, error: msg };
  }
}
