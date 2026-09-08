/**
 * C1.9R2 — Live provider activation + Meridian acceptance tests.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { verifyRailwayProviderConfig, redactSecretsFromPayload } from '../api/_lib/site00ExpressionEngine/railwayProviderConfig.js';
import {
  runC19R2MeridianLiveAcceptance,
  isC19R2LiveAcceptancePass,
} from '../api/_lib/site00ExpressionEngine/runC19R2MeridianLiveAcceptance.js';
import { checkCreativeReasoningProviderHealth } from '../api/_lib/site00ExpressionEngine/seniorCreativeJudgment/creativeReasoningProvider.js';
import {
  resetMeridianLiveProofStore,
  getPreservedControlRun,
} from '../api/_lib/site00ExpressionEngine/meridianLiveProofStore.js';
import { MERIDIAN_ATELIER_LAUNCH_BRIEF } from '../api/_lib/site00ExpressionEngine/brandLanguage/c19BlindBrandFixture.js';
import {
  resetBrandLanguageStore,
  initBrandLanguageStore,
} from '../api/_lib/site00ExpressionEngine/brandLanguage/brandLanguageSupabaseStore.js';
import {
  resetCampaignCopyStore,
  initCampaignCopyStore,
} from '../api/_lib/site00ExpressionEngine/campaignCopy/campaignCopyStore.js';
import {
  resetCreativeIntelligenceStore,
  initCreativeIntelligenceStore,
} from '../api/_lib/site00ExpressionEngine/seniorCreativeJudgment/creativeIntelligenceStore.js';
import { bootstrapC19R2MeridianLiveAcceptance } from '../api/_lib/site00ExpressionEngine/entry003/entry003C14Pipeline.js';
import { runMultiUnitBlindCampaignPackage } from '../api/_lib/site00ExpressionEngine/seniorCreativeJudgment/multiUnitCampaignArchitect.js';
import { ANTHROPIC_CREATIVE_MODEL } from '../api/_lib/site00Evolve/creativeDirection/creativeIntelligence/config.js';

describe('C1.9R2 Live Provider Activation + Meridian Acceptance', () => {
  beforeEach(() => {
    process.env.VITEST = 'true';
    resetBrandLanguageStore();
    resetCampaignCopyStore();
    resetCreativeIntelligenceStore();
    resetMeridianLiveProofStore();
    delete process.env.SITE00_CREATIVE_REASONING_MOCK_FULL;
    delete process.env.SITE00_CREATIVE_REASONING_FORCE_FALLBACK;
    delete process.env.SITE00_MERIDIAN_LIVE_ACCEPTANCE;
    delete process.env.ANTHROPIC_API_KEY;
  });

  it('1. Railway provider config detection exists', () => {
    const cfg = verifyRailwayProviderConfig();
    expect(typeof cfg.configured).toBe('boolean');
    expect(cfg.capabilityStatus).toMatch(/RAILWAY_PROVIDER/);
  });

  it('2. key value never exposed in payloads', () => {
    process.env.ANTHROPIC_API_KEY = 'sk-live-secret-test-key-abc';
    const cfg = verifyRailwayProviderConfig();
    const redacted = redactSecretsFromPayload({ cfg, nested: { key: 'sk-live-secret-test-key-abc' } });
    expect(JSON.stringify(redacted)).not.toContain('sk-live-secret-test-key-abc');
    expect(JSON.stringify(redacted)).toContain('[REDACTED]');
    delete process.env.ANTHROPIC_API_KEY;
  });

  it('3. provider health gates live proof when unconfigured', async () => {
    const health = await checkCreativeReasoningProviderHealth();
    expect(health.authConfigured).toBe(false);
    expect(health.reasoningDispatchAllowed).toBe(false);
  });

  it('4. mock cannot satisfy acceptance', async () => {
    process.env.ANTHROPIC_API_KEY = 'sk-test';
    process.env.SITE00_CREATIVE_REASONING_MOCK_FULL = '1';
    const result = await runC19R2MeridianLiveAcceptance();
    expect(result.acceptanceStatus).toBe('FULL_REASONING_LIVE_TEST_BLOCKED');
    expect(result.fullReasoningRun).toBeNull();
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.SITE00_CREATIVE_REASONING_MOCK_FULL;
  });

  it('5. fallback cannot satisfy acceptance', async () => {
    process.env.ANTHROPIC_API_KEY = 'sk-test';
    process.env.SITE00_CREATIVE_REASONING_FORCE_FALLBACK = '1';
    const result = await runC19R2MeridianLiveAcceptance();
    expect(result.acceptanceStatus).toBe('FULL_REASONING_LIVE_TEST_BLOCKED');
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.SITE00_CREATIVE_REASONING_FORCE_FALLBACK;
  });

  it('6. same Meridian brief used', async () => {
    const result = await runC19R2MeridianLiveAcceptance();
    expect(result.sameBriefHash).toBe(MERIDIAN_ATELIER_LAUNCH_BRIEF.briefId);
  });

  it('7. deterministic control preserved on repeat runs', async () => {
    await runC19R2MeridianLiveAcceptance();
    const first = getPreservedControlRun();
    await runC19R2MeridianLiveAcceptance();
    const second = getPreservedControlRun();
    expect(first?.runId).toBe('control_a_deterministic');
    expect(second?.runId).toBe('control_a_deterministic');
  });

  it('8. FULL_REASONING_B gets unique run ID when present', async () => {
    const result = await runC19R2MeridianLiveAcceptance();
    if (result.fullReasoningRun) {
      expect(result.fullReasoningRun.runId).toMatch(/full_reasoning_b-/);
      expect(result.fullReasoningRun.runId).not.toBe(result.controlRun.runId);
    } else {
      expect(result.fullReasoningRun).toBeNull();
    }
  });

  it('9-10. live dispatch required for pass gate', () => {
    expect(isC19R2LiveAcceptancePass({
      acceptanceStatus: 'FULL_REASONING_LIVE_PASS',
      railwayConfig: { configured: true, authConfigured: true, capabilityStatus: 'RAILWAY_PROVIDER_READY', providerName: 'anthropic', model: ANTHROPIC_CREATIVE_MODEL, mockActive: false, forceFallbackActive: false, vitestStubActive: false },
      mockActive: false,
      fallbackActive: false,
      vitestStubActive: false,
      runtimeReceipt: { creativeReasoningDispatchCount: 0, copyReasoningDispatchCount: 0, runtimeMode: 'FULL_REASONING' },
      fullReasoningRun: null,
    } as never)).toBe(false);
  });

  it('11. structured output validated via provider health', async () => {
    process.env.ANTHROPIC_API_KEY = 'sk-test';
    const health = await checkCreativeReasoningProviderHealth();
    expect(health.structuredOutputSupported).toBe(true);
    delete process.env.ANTHROPIC_API_KEY;
  });

  it('12. retry bounded to one', async () => {
    const result = await runC19R2MeridianLiveAcceptance();
    expect(result.runtimeReceipt.retries).toBeLessThanOrEqual(1);
  });

  it('13. unconfigured returns RAILWAY_PROVIDER_CONFIG_BLOCKED', async () => {
    const result = await runC19R2MeridianLiveAcceptance();
    expect(result.acceptanceStatus).toBe('RAILWAY_PROVIDER_CONFIG_BLOCKED');
    expect(result.railwayConfig.configured).toBe(false);
  });

  it('14-21. acceptance orchestrator returns comparison + QA fields', async () => {
    const result = await runC19R2MeridianLiveAcceptance();
    expect(result.comparison.overallJudgment).toBeDefined();
    expect(result.qa.categoryClicheControl).toBeDefined();
    expect(result.heroLineCandidates.control.length).toBeGreaterThanOrEqual(5);
  });

  it('22. full run persists separately from control', async () => {
    const result = await runC19R2MeridianLiveAcceptance();
    expect(result.controlRun.label).toBe('CONTROL_A_DETERMINISTIC');
    if (result.fullReasoningRun) {
      expect(result.fullReasoningRun.label).toBe('FULL_REASONING_B');
    }
  });

  it('23. store mode verified', async () => {
    await initBrandLanguageStore();
    await initCampaignCopyStore();
    await initCreativeIntelligenceStore();
    const result = await runC19R2MeridianLiveAcceptance();
    expect(['MEMORY', 'SUPABASE']).toContain(result.storeModes.brandLanguage);
  });

  it('24. comparison UI payload from bootstrap', async () => {
    const c19r2 = await bootstrapC19R2MeridianLiveAcceptance();
    expect(c19r2.sprint).toBe('C1.9R2_LIVE_PROVIDER_ACTIVATION');
    expect(c19r2.view.controlRun.campaign.brief.brandName).toBe('Meridian Atelier');
  });

  it('25. material improvement assessment exists', async () => {
    const result = await runC19R2MeridianLiveAcceptance();
    expect(typeof result.comparison.materialImprovement).toBe('boolean');
  });

  it('26. full reasoning does not auto-win when blocked', async () => {
    const result = await runC19R2MeridianLiveAcceptance();
    if (result.fullReasoningBlocked) {
      expect(result.comparison.materialImprovement).toBe(false);
    }
  });

  it('27. visual providers remain zero', async () => {
    const result = await runC19R2MeridianLiveAcceptance();
    expect(result.runtimeReceipt.imageProviderDispatchCount).toBe(0);
    expect(result.runtimeReceipt.falDispatchCount).toBe(0);
    expect(result.runtimeReceipt.videoProviderDispatchCount).toBe(0);
  });

  it('28. Entry 003 regression unchanged', async () => {
    const ndx = await runMultiUnitBlindCampaignPackage();
    expect(ndx.brief.projectId).toBe('verdant-row');
  });

  it('29. model default is not retired claude-sonnet-4-20250514', () => {
    expect(ANTHROPIC_CREATIVE_MODEL).not.toBe('claude-sonnet-4-20250514');
    expect(ANTHROPIC_CREATIVE_MODEL).toContain('claude-sonnet');
  });
});
