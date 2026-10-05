import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { resetEvolveStore } from './memoryStore.js';
import { resetConnectionMemory, initiateConnection, selectAccountProperty, verifyConnection, memConnections } from './providers/connectionService.js';
import { resetOAuthMemory, startOAuthAuthorization, consumeOAuthState } from './providers/oauthService.js';
import { resetSecretStoreMemory, storeProviderCredential, redactForLogs } from './providers/providerSecretStore.js';
import {
  runNdxbookAssessment,
  generateNdxbookManifest,
  bootstrapNdxbookChannels,
  evaluateBrandReadiness,
  evaluateContentBrainReadiness,
} from './providers/ndxbookService.js';
import { getOwnerConfigurationChecklist } from './providers/ownerConfigService.js';
import { getCanonicalMetaOAuthCallbackUrl } from './providers/oauthConstants.js';
import { handleMetaOAuthCallback } from './providers/oauthCallbackHandler.js';
import { resetOAuthStateStore, memOAuthStates } from './providers/oauthStateStore.js';
import { confirmConnectionAccount } from './providers/accountConfirmation.js';
import { discoverMetaInstagramAccounts, verifyConnectionCapabilities } from './providers/accountDiscoveryService.js';
import { evaluateFenceEnablementReadiness } from './providers/pilotActivationService.js';
import {
  saveFirstPostDraft,
  sendFirstPostForApproval,
  runFirstPostDryRun,
  resetFirstPostMemory,
} from './providers/firstPostCandidateService.js';
import { runPublicationDryRun } from './providers/dryRunService.js';
import { runAnalyticsBaseline } from './providers/analyticsBaselineService.js';
import { getExpandedPilotReadiness } from './providers/pilotReadinessSprint04.js';
import { buildConnectionCommandItems } from './providers/commandConnections.js';
import { getSocialOpsPayload } from './evolveService.js';
import { sanitizeConnectionForClient } from './providers/connectionStore.js';
import { orgIdFromSlug } from './orgRegistry.js';
import { getPrimaryFamily } from '../../../shared/site00-email/registry/family-map.js';

const CANONICAL_CALLBACK = 'https://api.site00.com/api/admin/site00-evolve/oauth/callback';

const FULL_ASSESSMENT = {
  organizationPurpose: 'NDXbook is a publishing platform',
  whatItOffers: 'Book distribution and marketing tools',
  targetAudience: 'Independent authors',
  primaryObjective: 'Build Instagram audience for launch',
  secondaryObjectives: ['Drive website visits'],
  contentGoals: ['Educational posts', 'Behind the scenes'],
  conversionTarget: 'Visit ndxbook.com',
  brandVoice: 'Knowledgeable and approachable',
  visualIdentityStatus: 'DEFINED',
  publishingCadence: '3x weekly',
  approvalPreference: 'OWNER_APPROVAL_REQUIRED',
  websiteDestination: 'https://ndxbook.com',
  brandAssetsAvailable: 'Logo and brand colors on file',
  brandVoiceAvailable: true,
  visualIdentityAvailable: true,
};

describe('EVOLVE Sprint 05A — NDXbook pilot activation', () => {
  beforeEach(() => {
    vi.stubEnv('VITEST', 'true');
    vi.stubEnv('EVOLVE_USE_MEMORY', '1');
    vi.stubEnv('EVOLVE_EXTERNAL_PUBLISHING_ENABLED', '');
    vi.stubEnv('EVOLVE_PROVIDER_SECRET_KEY', 'test-secret-key-for-encryption-only');
    vi.stubEnv('META_APP_ID', 'test-app-id');
    vi.stubEnv('META_APP_SECRET', 'test-app-secret');
    vi.stubEnv('META_OAUTH_REDIRECT_URI', CANONICAL_CALLBACK);
    resetEvolveStore();
    resetConnectionMemory();
    resetOAuthMemory();
    resetSecretStoreMemory();
    resetOAuthStateStore();
    resetFirstPostMemory();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('1. configuration status reports CONFIGURED/MISSING/INVALID without secrets', () => {
    const cfg = getOwnerConfigurationChecklist();
    expect(cfg.items.every((i) => !JSON.stringify(i).includes('test-app-secret'))).toBe(true);
    expect(cfg.items.find((i) => i.key === 'META_APP_ID')?.status).toBe('CONFIGURED');
    expect(cfg.allConfigured).toBe(true);
  });

  it('2. callback URL generation returns exact canonical path', () => {
    expect(getCanonicalMetaOAuthCallbackUrl()).toBe(CANONICAL_CALLBACK);
    const cfg = getOwnerConfigurationChecklist();
    expect(cfg.exactCallbackUrl).toBe(CANONICAL_CALLBACK);
  });

  it('3. OAuth callback exchanges token and redirects safely', async () => {
    const conn = await initiateConnection('ndxbook', 'meta_instagram', 'NDX IG');
    const start = await startOAuthAuthorization('ndxbook', 'meta_instagram', conn.id);
    expect(start.ok).toBe(true);
    if (!start.ok) return;
    const result = await handleMetaOAuthCallback({ code: 'auth-code', state: start.stateToken, error: null });
    expect(result.ok).toBe(true);
    expect(result.redirectUrl).toContain('oauth=complete');
    expect(result.redirectUrl).not.toContain('access_token');
  });

  it('4. secret storage encrypts credentials — not in connection row', async () => {
    const stored = await storeProviderCredential({
      organizationId: orgIdFromSlug('ndxbook')!,
      providerKey: 'meta_instagram',
      payload: { access_token: 'secret-token' },
    });
    expect(stored.ok).toBe(true);
    const safe = sanitizeConnectionForClient({
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
      secret_ref: stored.secretRef,
      metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    expect(JSON.stringify(safe)).not.toContain('secret-token');
  });

  it('5. assessment persistence stores owner answers', async () => {
    await bootstrapNdxbookChannels();
    const result = await runNdxbookAssessment(FULL_ASSESSMENT, 'owner@test.com');
    expect(result.assessment).toBeTruthy();
  });

  it('6. owner-confirmed classification on assessment fields', async () => {
    await runNdxbookAssessment(FULL_ASSESSMENT);
    const cb = await evaluateContentBrainReadiness('ndxbook');
    expect(cb.canonCount).toBeGreaterThan(0);
  });

  it('7. Content Brain bootstrap from assessment', async () => {
    await runNdxbookAssessment(FULL_ASSESSMENT);
    const cb = await evaluateContentBrainReadiness('ndxbook');
    expect(cb.sufficient).toBe(true);
  });

  it('8. brand readiness returns READY/PARTIAL/INSUFFICIENT with gaps', async () => {
    await runNdxbookAssessment(FULL_ASSESSMENT);
    const brand = await evaluateBrandReadiness('ndxbook');
    expect(['READY', 'PARTIAL', 'INSUFFICIENT']).toContain(brand.overall);
    expect(brand.gaps.length).toBeGreaterThan(0);
  });

  it('9. profile creation after assessment', async () => {
    await runNdxbookAssessment(FULL_ASSESSMENT);
    const readiness = await getExpandedPilotReadiness('ndxbook');
    const profileItem = readiness.items.find((i) => i.key === 'profile');
    expect(profileItem?.state).toBe('READY');
  });

  it('10. objective creation from owner answers only', async () => {
    await runNdxbookAssessment(FULL_ASSESSMENT);
    const readiness = await getExpandedPilotReadiness('ndxbook');
    expect(readiness.items.find((i) => i.key === 'objectives')?.state).toBe('READY');
  });

  it('11. manifest generation after assessment', async () => {
    await runNdxbookAssessment(FULL_ASSESSMENT);
    const manifest = await generateNdxbookManifest();
    expect(manifest.ok !== false || manifest.manifest).toBeTruthy();
  });

  it('12. account discovery returns accounts after OAuth', async () => {
    const conn = await initiateConnection('ndxbook', 'meta_instagram', 'NDX IG');
    const stored = await storeProviderCredential({
      organizationId: orgIdFromSlug('ndxbook')!,
      providerKey: 'meta_instagram',
      payload: { access_token: 'tok' },
    });
    Object.assign(memConnections.find((c) => c.id === conn.id)!, {
      secret_ref: stored.ok ? stored.secretRef : null,
      credential_state: 'CONFIGURED',
    });
    const discovered = await discoverMetaInstagramAccounts('ndxbook', conn.id);
    expect(discovered.accounts.length).toBeGreaterThan(0);
  });

  it('13. explicit account selection required when multiple accounts', async () => {
    const conn = await initiateConnection('ndxbook', 'meta_instagram', 'NDX IG');
    const stored = await storeProviderCredential({
      organizationId: orgIdFromSlug('ndxbook')!,
      providerKey: 'meta_instagram',
      payload: { access_token: 'tok' },
    });
    Object.assign(memConnections.find((c) => c.id === conn.id)!, {
      secret_ref: stored.ok ? stored.secretRef : null,
      credential_state: 'CONFIGURED',
    });
    const discovered = await discoverMetaInstagramAccounts('ndxbook', conn.id);
    expect(discovered.requiresSelection).toBe(true);
    expect(discovered.accounts.length).toBeGreaterThan(1);
  });

  it('14. account confirmation persists confirmed_by/at', async () => {
    const conn = await initiateConnection('ndxbook', 'meta_instagram', 'NDX IG');
    Object.assign(memConnections.find((c) => c.id === conn.id)!, {
      verification_status: 'VERIFIED',
      status: 'CONNECTED',
    });
    const confirmed = await confirmConnectionAccount('ndxbook', conn.id, 'owner@test.com');
    expect(confirmed.accountConfirmedAt).toBeTruthy();
  });

  it('15. capability verification reports granted scopes', async () => {
    const conn = await initiateConnection('ndxbook', 'meta_instagram', 'NDX IG');
    Object.assign(memConnections.find((c) => c.id === conn.id)!, {
      granted_scopes: ['instagram_basic', 'instagram_content_publish'],
    });
    const caps = await verifyConnectionCapabilities('ndxbook', conn.id);
    expect(caps.capabilities.PUBLISH_CONTENT).toBe('AVAILABLE');
  });

  it('16. analytics baseline attempted when capability exists', async () => {
    const conn = await initiateConnection('ndxbook', 'meta_instagram', 'NDX IG');
    Object.assign(memConnections.find((c) => c.id === conn.id)!, {
      analytics_capability: 'AVAILABLE',
      granted_capabilities: ['READ_ANALYTICS'],
    });
    const baseline = await runAnalyticsBaseline('ndxbook', conn.id);
    expect(baseline.attempted).toBe(true);
    expect(baseline.status).toBe('COMPLETED');
  });

  it('17. first-post candidate draft and approval flow', async () => {
    const draft = await saveFirstPostDraft('ndxbook', { caption: 'Pilot post caption' });
    expect(draft.approvalState).toBe('DRAFT');
    const sent = await sendFirstPostForApproval('ndxbook', draft.id, 'owner@test.com');
    expect(sent.candidate.approvalState).toBe('READY_FOR_REVIEW');
  });

  it('18. dry run completes with zero provider writes', async () => {
    await runNdxbookAssessment(FULL_ASSESSMENT);
    const conn = await initiateConnection('ndxbook', 'meta_instagram', 'NDX IG');
    await selectAccountProperty('ndxbook', conn.id, 'ig-1', 'NDXbook', 'prop-1', 'NDXbook IG');
    Object.assign(memConnections.find((c) => c.id === conn.id)!, {
      verification_status: 'VERIFIED',
      status: 'CONNECTED',
      account_confirmed_at: new Date().toISOString(),
      publishing_capability: 'AVAILABLE',
      granted_capabilities: ['PUBLISH_CONTENT'],
    });
    const draft = await saveFirstPostDraft('ndxbook', { caption: 'Test', connectionId: conn.id });
    const dry = await runFirstPostDryRun('ndxbook', draft.id, 'APPROVED');
    expect(dry.status).toBe('DRY_RUN_COMPLETE');
    expect(dry.providerWriteCalled).toBe(false);
  });

  it('19. zero provider writes on dry run path', async () => {
    const conn = await initiateConnection('ndxbook', 'meta_instagram', 'NDX IG');
    Object.assign(memConnections.find((c) => c.id === conn.id)!, {
      verification_status: 'VERIFIED',
      status: 'CONNECTED',
      account_confirmed_at: new Date().toISOString(),
    });
    const result = await runPublicationDryRun('ndxbook', { connectionId: conn.id, approvalState: 'APPROVED' });
    expect(result.providerWriteCalled).toBe(false);
  });

  it('20. publishing fences remain disabled', async () => {
    const readiness = await getExpandedPilotReadiness('ndxbook');
    expect(readiness.globalPublishing).toContain('DISABLED');
    expect(readiness.items.find((i) => i.key === 'org_fence')?.state).toBe('DISABLED');
  });

  it('21. READY_FOR_FENCE_ENABLEMENT only when all prerequisites pass', async () => {
    const before = await evaluateFenceEnablementReadiness('ndxbook');
    expect(before.readiness).toBe('PARTIAL');

    await runNdxbookAssessment(FULL_ASSESSMENT);
    const conn = await initiateConnection('ndxbook', 'meta_instagram', 'NDX IG');
    await selectAccountProperty('ndxbook', conn.id, 'ig-1', 'NDXbook', 'prop-1', 'NDXbook IG');
    await verifyConnectionCapabilities('ndxbook', conn.id);
    await confirmConnectionAccount('ndxbook', conn.id, 'owner@test.com');
    Object.assign(memConnections.find((c) => c.id === conn.id)!, {
      publishing_capability: 'AVAILABLE',
      granted_capabilities: ['PUBLISH_CONTENT', 'READ_ANALYTICS'],
    });

    const after = await evaluateFenceEnablementReadiness('ndxbook');
    expect(after.readiness).toBe('READY_FOR_FENCE_ENABLEMENT');
  });

  it('22. AIO deferral regression preserved', async () => {
    const social = await getSocialOpsPayload('all-in-one-enterprises');
    expect(social.deferredByOwner.some((c) => String(c.owner_decision) === 'DEFERRED_BY_OWNER')).toBe(true);
  });

  it('23. Studio World exclusion — no studio routes in pilot readiness', async () => {
    const readiness = await getExpandedPilotReadiness('ndxbook');
    expect(readiness.items.some((i) => i.label.toLowerCase().includes('studio world'))).toBe(false);
  });

  it('24. Email Family regression unchanged', () => {
    expect(getPrimaryFamily('access-credential-issued')).toBeTruthy();
  });

  it('25. OAuth state rejects invalid/wrong org/wrong provider', async () => {
    const conn = await initiateConnection('ndxbook', 'meta_instagram', 'NDX IG');
    const start = await startOAuthAuthorization('ndxbook', 'meta_instagram', conn.id);
    if (!start.ok) throw new Error('oauth start failed');
    const wrongOrg = await consumeOAuthState(start.stateToken, 'meta_instagram', orgIdFromSlug('site-00')!);
    expect(wrongOrg.ok).toBe(false);
    await handleMetaOAuthCallback({ code: 'x', state: start.stateToken, error: null });
    const reused = await handleMetaOAuthCallback({ code: 'y', state: start.stateToken, error: null });
    expect(reused.ok).toBe(false);
  });

  it('COMMAND integration reflects Sprint 05A states', async () => {
    vi.stubEnv('META_APP_ID', '');
    const items = await buildConnectionCommandItems('ndxbook', 'NDXBOOK');
    expect(items.some((i) => i.category === 'NEEDS_YOU' && i.title.includes('Meta credentials'))).toBe(true);
    expect(items.some((i) => i.category === 'DEFERRED' && i.title === 'Automation')).toBe(true);
  });

  it('log redaction removes credential fields', () => {
    const redacted = redactForLogs({ access_token: 'x', name: 'safe' });
    expect(redacted.access_token).toBe('[REDACTED]');
  });

  it('redirect URI INVALID when mismatch', () => {
    vi.stubEnv('META_OAUTH_REDIRECT_URI', 'https://wrong.example/callback');
    const cfg = getOwnerConfigurationChecklist();
    expect(cfg.items.find((i) => i.key === 'META_OAUTH_REDIRECT_URI')?.status).toBe('INVALID');
  });
});
