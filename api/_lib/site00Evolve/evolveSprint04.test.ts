import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { resetEvolveStore } from './memoryStore.js';
import { resetConnectionMemory } from './providers/connectionService.js';
import { resetOAuthMemory, startOAuthAuthorization, consumeOAuthState } from './providers/oauthService.js';
import { resetSecretStoreMemory, storeProviderCredential, validateSecretStoreConfiguration, redactForLogs } from './providers/providerSecretStore.js';
import { runNdxbookAssessment, generateNdxbookManifest, bootstrapNdxbookChannels } from './providers/ndxbookService.js';
import { confirmConnectionAccount } from './providers/accountConfirmation.js';
import { runPublicationDryRun } from './providers/dryRunService.js';
import { initiateConnection, verifyConnection, selectAccountProperty } from './providers/connectionService.js';
import { getExpandedPilotReadiness } from './providers/pilotReadinessSprint04.js';
import { getSocialOpsPayload } from './evolveService.js';
import { sanitizeConnectionForClient } from './providers/connectionStore.js';
import { orgIdFromSlug } from './orgRegistry.js';
import { getPrimaryFamily } from '../../../shared/site00-email/registry/family-map.js';

describe('EVOLVE Sprint 04 — NDXbook pilot readiness', () => {
  beforeEach(() => {
    vi.stubEnv('VITEST', 'true');
    vi.stubEnv('EVOLVE_USE_MEMORY', '1');
    vi.stubEnv('EVOLVE_EXTERNAL_PUBLISHING_ENABLED', '');
    vi.stubEnv('EVOLVE_PROVIDER_SECRET_KEY', 'test-secret-key-for-encryption-only');
    resetEvolveStore();
    resetConnectionMemory();
    resetOAuthMemory();
    resetSecretStoreMemory();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('NDXbook assessment completes and creates profile', async () => {
    await bootstrapNdxbookChannels();
    const assessment = await runNdxbookAssessment({
      primaryObjective: 'Validate distribution pipeline',
      targetAudience: 'Owner-defined audience',
      provenance: { primaryObjective: 'OWNER_CONFIRMED' },
    });
    expect(assessment.assessment?.organization_id).toBe(orgIdFromSlug('ndxbook'));
  });

  it('manifest requires completed assessment', async () => {
    const before = await generateNdxbookManifest();
    expect(before.ok).toBe(false);
    await runNdxbookAssessment({
      primaryObjective: 'Pilot objective',
      provenance: { primaryObjective: 'OWNER_CONFIRMED' },
    });
    const after = await generateNdxbookManifest();
    expect(after.manifest ?? after.ok).toBeTruthy();
  });

  it('OAuth start requires owner configuration when env missing', async () => {
    vi.stubEnv('META_APP_ID', '');
    const conn = await initiateConnection('ndxbook', 'meta_instagram', 'NDX IG');
    const result = await startOAuthAuthorization('ndxbook', 'meta_instagram', conn.id);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('REQUIRES_OWNER_CONFIGURATION');
  });

  it('OAuth state is organization and provider bound', async () => {
    vi.stubEnv('META_APP_ID', 'app-id');
    vi.stubEnv('META_APP_SECRET', 'secret');
    vi.stubEnv('META_OAUTH_REDIRECT_URI', 'https://api.site00.com/api/admin/site00-evolve/oauth/callback');
    const conn = await initiateConnection('ndxbook', 'meta_instagram', 'NDX IG');
    const start = await startOAuthAuthorization('ndxbook', 'meta_instagram', conn.id);
    expect(start.ok).toBe(true);
    if (start.ok) {
      const wrongOrg = await consumeOAuthState(start.stateToken, 'meta_instagram', orgIdFromSlug('site-00')!);
      expect(wrongOrg.ok).toBe(false);
      const ok = await consumeOAuthState(start.stateToken, 'meta_instagram', orgIdFromSlug('ndxbook')!);
      expect(ok.ok).toBe(true);
      const reused = await consumeOAuthState(start.stateToken, 'meta_instagram', orgIdFromSlug('ndxbook')!);
      expect(reused.ok).toBe(false);
    }
  });

  it('credentials stored via secret store not connection row', async () => {
    const stored = await storeProviderCredential({
      organizationId: orgIdFromSlug('ndxbook')!,
      providerKey: 'meta_instagram',
      payload: { access_token: 'secret-token', refresh_token: 'refresh' },
    });
    expect(stored.ok).toBe(true);
    const conn = sanitizeConnectionForClient({
      id: '1',
      organization_id: orgIdFromSlug('ndxbook')!,
      external_system_id: 's',
      logical_name: 'IG',
      connection_state: 'CONNECTED',
      provider_key: 'meta_instagram',
      provider_category: 'SOCIAL',
      connection_type: 'OAUTH',
      display_name: 'IG',
      external_account_id: '123',
      external_account_name: 'NDXbook',
      external_property_id: null,
      external_property_name: null,
      status: 'CONNECTED',
      health: 'HEALTHY',
      granted_capabilities: [],
      supported_capabilities: [],
      granted_scopes: [],
      connected_at: null,
      last_verified_at: null,
      last_sync_at: null,
      last_error_at: null,
      last_error_code: null,
      last_error_message: null,
      credential_state: 'CONFIGURED',
      secret_ref: stored.ok ? stored.secretRef : null,
      metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    expect(JSON.stringify(conn)).not.toContain('secret-token');
  });

  it('dry run completes with fences disabled — zero provider writes', async () => {
    const conn = await initiateConnection('ndxbook', 'meta_instagram', 'IG');
    Object.assign(
      (await import('./providers/connectionService.js')).memConnections.find((c) => c.id === conn.id)!,
      { verification_status: 'VERIFIED', status: 'CONNECTED', account_confirmed_at: new Date().toISOString() },
    );
    const result = await runPublicationDryRun('ndxbook', {
      connectionId: conn.id,
      approvalState: 'APPROVED',
    });
    expect(result.status).toBe('DRY_RUN_COMPLETE');
    expect(result.providerWriteCalled).toBe(false);
    expect(result.preview?.fenceStates.global).toBe('DISABLED');
  });

  it('organization fence noted in dry run preview when global enabled', async () => {
    vi.stubEnv('EVOLVE_EXTERNAL_PUBLISHING_ENABLED', 'true');
    const conn = await initiateConnection('ndxbook', 'meta_instagram', 'IG');
    Object.assign(
      (await import('./providers/connectionService.js')).memConnections.find((c) => c.id === conn.id)!,
      { verification_status: 'VERIFIED', status: 'CONNECTED', account_confirmed_at: new Date().toISOString() },
    );
    const result = await runPublicationDryRun('ndxbook', {
      connectionId: conn.id,
      approvalState: 'APPROVED',
    });
    expect(result.status).toBe('DRY_RUN_COMPLETE');
    expect(result.preview?.fenceStates.organization).toBe('DISABLED');
  });

  it('approval fence blocks unapproved content', async () => {
    vi.stubEnv('EVOLVE_EXTERNAL_PUBLISHING_ENABLED', 'true');
    vi.stubEnv('EVOLVE_PROVIDER_SECRET_KEY', 'test-key');
    const conn = await initiateConnection('ndxbook', 'meta_instagram', 'IG');
    Object.assign(
      (await import('./providers/connectionService.js')).memConnections.find((c) => c.id === conn.id)!,
      { verification_status: 'VERIFIED', status: 'CONNECTED', account_confirmed_at: new Date().toISOString() },
    );
    const { ensurePilotConfig } = await import('./providers/connectionService.js');
    const pilot = await ensurePilotConfig('ndxbook');
    pilot.publishing_status = 'PILOT_ENABLED';
    const result = await runPublicationDryRun('ndxbook', {
      connectionId: conn.id,
      approvalState: 'DRAFT',
    });
    expect(result.blockReason).toBe('BLOCKED_APPROVAL_REQUIRED');
  });

  it('account confirmation required before publish readiness', async () => {
    vi.stubEnv('EVOLVE_EXTERNAL_PUBLISHING_ENABLED', 'true');
    const conn = await initiateConnection('ndxbook', 'meta_instagram', 'IG');
    const row = (await import('./providers/connectionService.js')).memConnections.find((c) => c.id === conn.id)!;
    Object.assign(row, { verification_status: 'VERIFIED', status: 'CONNECTED' });
    const pilot = await (await import('./providers/connectionService.js')).ensurePilotConfig('ndxbook');
    pilot.publishing_status = 'PILOT_ENABLED';
    const result = await runPublicationDryRun('ndxbook', {
      connectionId: conn.id,
      approvalState: 'APPROVED',
    });
    expect(result.blockReason).toBe('BLOCKED_ACCOUNT_CONFIRMATION_REQUIRED');
  });

  it('cross-org connection denied', async () => {
    const conn = await initiateConnection('frontal-slayer', 'meta_instagram', 'FS');
    await expect(confirmConnectionAccount('site-00', conn.id, 'owner@test.com')).rejects.toThrow(/denied/i);
  });

  it('AIO social deferral preserved', async () => {
    const social = await getSocialOpsPayload('all-in-one-enterprises');
    expect(social.deferredByOwner.some((c) => String(c.owner_decision) === 'DEFERRED_BY_OWNER')).toBe(true);
  });

  it('email family regression unchanged', () => {
    expect(getPrimaryFamily('access-credential-issued')).toBeTruthy();
  });

  it('log redaction removes credential fields', () => {
    const redacted = redactForLogs({ access_token: 'x', name: 'safe' });
    expect(redacted.access_token).toBe('[REDACTED]');
    expect(redacted.name).toBe('safe');
  });

  it('secret store requires encryption key in production mode', () => {
    vi.stubEnv('VITEST', '');
    vi.stubEnv('EVOLVE_USE_MEMORY', '');
    vi.stubEnv('EVOLVE_PROVIDER_SECRET_KEY', '');
    const cfg = validateSecretStoreConfiguration();
    expect(cfg.configured).toBe(false);
    vi.stubEnv('VITEST', 'true');
  });

  it('expanded pilot readiness returns checklist', async () => {
    const readiness = await getExpandedPilotReadiness('ndxbook');
    expect(readiness.items.length).toBeGreaterThan(15);
    expect(readiness.globalPublishing).toContain('DISABLED');
  });
});
