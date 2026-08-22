import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { resetConnectionMemory, initiateConnection, verifyConnection, selectAccountProperty, disconnectConnection, listSafeConnections, attemptPublish, ensurePilotConfig } from './providers/connectionService.js';
import { buildCapabilityMap, adapterStatus, getProviderDefinition, PROVIDER_REGISTRY } from './providers/registry.js';
import { assertPublishingAllowed, canTransitionDistributionState, publishingFenceState } from './providers/publishingFence.js';
import { runConnectionSync, normalizeMetricValue, missingMetricLabel } from './providers/syncService.js';
import { createDistributionJob, getPilotReadiness, bootstrapNdxbookPilot } from './providers/pilotService.js';
import { buildPerformanceSnapshot, attributeCampaignEvidence, generateEvidenceInsights, contentBrainLearningBoundary } from './providers/intelligenceService.js';
import { gradeInsightConfidence, buildEvidenceInsight } from './providers/insightEngine.js';
import { normalizeProviderError, ProviderError } from './providers/errors.js';
import { sanitizeConnectionForClient, assertNoSecrets } from './providers/connectionStore.js';
import { buildConnectionCommandItems } from './providers/commandConnections.js';
import { getSocialOpsPayload } from './evolveService.js';
import { buildEvolveCommandItems } from './commandIntegration.js';
import { resetEvolveStore } from './memoryStore.js';
import { orgIdFromSlug } from './orgRegistry.js';

describe('EVOLVE Sprint 03 — external intelligence', () => {
  beforeEach(() => {
    vi.stubEnv('VITEST', 'true');
    vi.stubEnv('EVOLVE_USE_MEMORY', '1');
    vi.stubEnv('EVOLVE_EXTERNAL_PUBLISHING_ENABLED', '');
    resetConnectionMemory();
    resetEvolveStore();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('provider registry lists normalized providers', () => {
    expect(PROVIDER_REGISTRY.length).toBeGreaterThanOrEqual(6);
    expect(getProviderDefinition('google_analytics')?.category).toBe('ANALYTICS');
  });

  it('capability normalization marks unsupported grants as UNAVAILABLE_FOR_CONNECTION', () => {
    const map = buildCapabilityMap(['READ_ANALYTICS', 'PUBLISH_CONTENT'], ['READ_ANALYTICS']);
    expect(map.READ_ANALYTICS).toBe('AVAILABLE');
    expect(map.PUBLISH_CONTENT).toBe('UNAVAILABLE_FOR_CONNECTION');
  });

  it('adapter available does not mean account connected', () => {
    expect(adapterStatus('google_analytics')).toBe('REQUIRES_CREDENTIALS');
  });

  it('creates connection in AUTHORIZATION_REQUIRED state', async () => {
    const conn = await initiateConnection('site-00', 'google_analytics', 'GA Test');
    expect(conn.status).toBe('AUTHORIZATION_REQUIRED');
    expect(conn.credentialState).toBe('REQUIRES_SECURE_CONFIGURATION');
  });

  it('verifies connection without marking CONNECTED without credentials', async () => {
    const conn = await initiateConnection('frontal-slayer', 'google_analytics', 'GA FS');
    const verified = await verifyConnection('frontal-slayer', conn.id);
    expect(verified.status).not.toBe('CONNECTED');
  });

  it('connection degradation reflected in health', async () => {
    const conn = await initiateConnection('site-00', 'meta_instagram', 'IG');
    const verified = await verifyConnection('site-00', conn.id);
    expect(['UNKNOWN', 'BROKEN']).toContain(verified.health);
  });

  it('reauthorization state for missing secret ref', async () => {
    const conn = await initiateConnection('site-00', 'google_search_console', 'GSC');
    const verified = await verifyConnection('site-00', conn.id);
    expect(verified.status).toBe('AUTHORIZATION_REQUIRED');
  });

  it('account discovery requires explicit selection flow', async () => {
    const conn = await initiateConnection('ndxbook', 'google_analytics', 'NDX GA');
    await selectAccountProperty('ndxbook', conn.id, 'acct-1', 'Account One', 'prop-1', 'Property One');
    const listed = await listSafeConnections('ndxbook');
    expect(listed[0]?.externalAccountName).toBe('Account One');
  });

  it('organization isolation on connection list', async () => {
    const conn = await initiateConnection('frontal-slayer', 'resend', 'Email');
    const siteConns = await listSafeConnections('site-00');
    expect(siteConns.find((c) => c.id === conn.id)).toBeUndefined();
  });

  it('cross-org connection access denied on verify', async () => {
    const conn = await initiateConnection('frontal-slayer', 'google_analytics', 'GA');
    await expect(verifyConnection('site-00', conn.id)).rejects.toThrow(/not found/i);
  });

  it('metrics ingestion via sync with provenance', async () => {
    const conn = await initiateConnection('site-00', 'google_analytics', 'GA Sync');
    const result = await runConnectionSync('site-00', conn.id);
    expect(result.recordsNormalized).toBeGreaterThan(0);
  });

  it('missing metric remains NOT_AVAILABLE in snapshot', async () => {
    const snap = await buildPerformanceSnapshot('site-00');
    expect(snap.metrics.IMPRESSIONS).toBe('NOT_AVAILABLE');
  });

  it('zero metric value remains zero not unknown', () => {
    expect(normalizeMetricValue(0)).toBe(0);
    expect(missingMetricLabel()).toBe('NOT_AVAILABLE');
  });

  it('performance snapshot coverage UNMEASURED without data', async () => {
    const snap = await buildPerformanceSnapshot('frontal-slayer');
    expect(snap.coverage).toBe('UNMEASURED');
  });

  it('campaign attribution does not guess', () => {
    expect(attributeCampaignEvidence(null)).toBe('UNATTRIBUTED');
    expect(attributeCampaignEvidence(null, 'utm-campaign')).toBe('ATTRIBUTION_UNCERTAIN');
    expect(attributeCampaignEvidence('camp-1')).toBe('ATTRIBUTED');
  });

  it('insight evidence lineage requires sufficient data', async () => {
    const insights = await generateEvidenceInsights('site-00', []);
    expect(insights[0]?.confidence).toBe('INSUFFICIENT_EVIDENCE');
  });

  it('confidence grading respects sample size', () => {
    expect(gradeInsightConfidence({ sampleSize: 0, measurementComplete: false })).toBe('INSUFFICIENT_EVIDENCE');
    expect(gradeInsightConfidence({ sampleSize: 15, measurementComplete: true })).toBe('HIGH');
  });

  it('next-best-action via command includes connection needs', async () => {
    await initiateConnection('site-00', 'google_analytics', 'GA');
    const cmd = await buildConnectionCommandItems('site-00', 'SITE 00');
    expect(cmd.some((i) => i.category === 'NEEDS_YOU')).toBe(true);
  });

  it('Content Brain learning remains suggested only', () => {
    const boundary = contentBrainLearningBoundary();
    expect(boundary.autoApply).toBe(false);
    const insight = buildEvidenceInsight({
      title: 'Test',
      summary: 'Test',
      evidence: [],
      confidence: 'LOW',
      connectionIds: [],
    });
    expect(insight.metadata.content_brain_boundary).toBe('SUGGESTED_ONLY');
  });

  it('global publishing fence blocks publish', () => {
    expect(() => assertPublishingAllowed('DISABLED')).toThrow(/PUBLISHING_DISABLED/);
  });

  it('organization publishing fence blocks when org disabled', () => {
    vi.stubEnv('EVOLVE_EXTERNAL_PUBLISHING_ENABLED', 'true');
    expect(() => assertPublishingAllowed('DISABLED')).toThrow(/ORGANIZATION_PUBLISHING_DISABLED/);
  });

  it('NDXbook pilot publishing disabled by default', async () => {
    const pilot = await ensurePilotConfig('ndxbook');
    expect(pilot.publishing_status).toBe('DISABLED');
    expect(pilot.pilot_role).toBe('DISTRIBUTION_PUBLISHING_PILOT');
  });

  it('distribution job cannot transition to PUBLISHED', async () => {
    const check = canTransitionDistributionState('APPROVED', 'PUBLISHED');
    expect(check.ok).toBe(false);
  });

  it('APPROVED does not equal PUBLISHED for distribution jobs', async () => {
    const job = await createDistributionJob('ndxbook', { state: 'APPROVED', channel: 'SOCIAL' });
    expect(job.state).toBe('DRAFT');
  });

  it('attempt publish rejected by fence', async () => {
    const conn = await initiateConnection('ndxbook', 'meta_instagram', 'IG');
    await expect(attemptPublish('ndxbook', conn.id)).rejects.toThrow(/PUBLISHING_DISABLED/);
  });

  it('provider error normalization', () => {
    const err = normalizeProviderError(new Error('PUBLISHING_DISABLED'), 'meta_instagram');
    expect(err.code).toBe('PUBLISHING_DISABLED');
  });

  it('sync idempotency — repeated sync returns records', async () => {
    const conn = await initiateConnection('site-00', 'google_analytics', 'GA');
    const a = await runConnectionSync('site-00', conn.id);
    const b = await runConnectionSync('site-00', conn.id);
    expect(a.recordsNormalized).toBeGreaterThan(0);
    expect(b.recordsNormalized).toBeGreaterThan(0);
  });

  it('no credential leakage in safe client view', () => {
    const view = sanitizeConnectionForClient({
      id: '1',
      organization_id: orgIdFromSlug('site-00')!,
      external_system_id: 'sys',
      logical_name: 'Test',
      connection_state: 'NOT_CONNECTED',
      provider_key: 'google_analytics',
      provider_category: 'ANALYTICS',
      connection_type: 'OAUTH',
      display_name: 'Test',
      external_account_id: null,
      external_account_name: null,
      external_property_id: null,
      external_property_name: null,
      status: 'NOT_CONNECTED',
      health: 'UNKNOWN',
      granted_capabilities: [],
      supported_capabilities: ['READ_ANALYTICS'],
      granted_scopes: [],
      connected_at: null,
      last_verified_at: null,
      last_sync_at: null,
      last_error_at: null,
      last_error_code: null,
      last_error_message: null,
      credential_state: 'NOT_CONFIGURED',
      secret_ref: 'secret-ref-should-not-leak',
      metadata: { access_token: 'nope' },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    expect(JSON.stringify(view)).not.toContain('secret-ref');
    expect(() => assertNoSecrets({ access_token: 'x' })).toThrow(/leakage/i);
  });

  it('AIO social deferral preserved', async () => {
    const social = await getSocialOpsPayload('all-in-one-enterprises');
    expect(social.deferredByOwner.length).toBeGreaterThan(0);
    expect(social.deferredByOwner.some((c) => String(c.owner_decision) === 'DEFERRED_BY_OWNER')).toBe(true);
  });

  it('Studio World excluded from marketing client command items', async () => {
    const cmd = await buildEvolveCommandItems();
    expect(cmd.items.every((i) => i.organizationSlug !== 'studio-world')).toBe(true);
  });

  it('COMMAND integration includes deferred and connection items', async () => {
    const cmd = await buildEvolveCommandItems();
    expect(cmd.deferred.length).toBeGreaterThan(0);
  });

  it('NDXbook pilot readiness surface', async () => {
    await bootstrapNdxbookPilot();
    const readiness = await getPilotReadiness('ndxbook');
    expect(readiness.items.length).toBeGreaterThan(10);
    expect(readiness.publishingFence.canPublish).toBe(false);
  });

  it('publishing fence state truthful', () => {
    const fence = publishingFenceState('DISABLED');
    expect(fence.canPublish).toBe(false);
    expect(fence.reason).toBe('PUBLISHING_DISABLED');
  });

  it('disconnect marks connection DISCONNECTED', async () => {
    const conn = await initiateConnection('site-00', 'sendgrid', 'SG');
    await disconnectConnection('site-00', conn.id);
    const listed = await listSafeConnections('site-00');
    expect(listed.find((c) => c.id === conn.id)?.status).toBe('DISCONNECTED');
  });

  it('ProviderError exposes safe code not secrets', () => {
    const err = new ProviderError('AUTH_EXPIRED', 'Token expired', false, 'google_analytics');
    expect(err.message).not.toContain('refresh');
  });
});
