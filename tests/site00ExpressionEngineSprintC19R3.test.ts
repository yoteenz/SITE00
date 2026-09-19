/**
 * C1.9R3 — Post-redeploy live FULL_REASONING execution tests.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { getDeploymentIdentity } from '../api/_lib/site00ExpressionEngine/deploymentIdentity.js';
import {
  applyMeridianLiveAcceptanceEnv,
  captureMeridianLiveAcceptanceEnv,
  restoreMeridianLiveAcceptanceEnv,
  withMeridianLiveAcceptanceEnv,
} from '../api/_lib/site00ExpressionEngine/meridianLiveAcceptanceEnv.js';
import {
  runC19R3MeridianLivePostRedeploy,
  isC19R3LiveAcceptancePass,
} from '../api/_lib/site00ExpressionEngine/runC19R3MeridianLivePostRedeploy.js';
import { verifyRailwayProviderConfig, redactSecretsFromPayload } from '../api/_lib/site00ExpressionEngine/railwayProviderConfig.js';
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
import { bootstrapC19R3MeridianLivePostRedeploy } from '../api/_lib/site00ExpressionEngine/entry003/entry003C14Pipeline.js';
import { ANTHROPIC_CREATIVE_MODEL } from '../api/_lib/site00Evolve/creativeDirection/creativeIntelligence/config.js';

describe('C1.9R3 Post-Redeploy Live FULL_REASONING Execution', { timeout: 60000 }, () => {
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

  it('1. deployment identity helper exists', () => {
    const d = getDeploymentIdentity();
    expect(d.providerModel).toBe(ANTHROPIC_CREATIVE_MODEL);
    expect(typeof d.environmentMode).toBe('string');
  });

  it('2. key presence detected without exposure', () => {
    process.env.ANTHROPIC_API_KEY = 'sk-live-secret-c19r3';
    const cfg = verifyRailwayProviderConfig();
    expect(cfg.authConfigured).toBe(true);
    const redacted = redactSecretsFromPayload({ nested: process.env.ANTHROPIC_API_KEY });
    expect(JSON.stringify(redacted)).not.toContain('sk-live-secret-c19r3');
    delete process.env.ANTHROPIC_API_KEY;
  });

  it('3. model must be claude-sonnet-4-6', () => {
    expect(ANTHROPIC_CREATIVE_MODEL).toBe('claude-sonnet-4-6');
    expect(getDeploymentIdentity().providerModel).toBe('claude-sonnet-4-6');
  });

  it('4. mock cannot satisfy acceptance', async () => {
    process.env.ANTHROPIC_API_KEY = 'sk-test';
    process.env.SITE00_CREATIVE_REASONING_MOCK_FULL = '1';
    const result = await runC19R3MeridianLivePostRedeploy();
    expect(result.acceptanceStatus).toBe('FULL_REASONING_LIVE_TEST_BLOCKED');
    expect(result.fullReasoningRun).toBeNull();
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.SITE00_CREATIVE_REASONING_MOCK_FULL;
  });

  it('5. live acceptance env override clears Railway fallback for proof', async () => {
    process.env.SITE00_CREATIVE_REASONING_FORCE_FALLBACK = '1';
    const snap = captureMeridianLiveAcceptanceEnv();
    applyMeridianLiveAcceptanceEnv();
    expect(process.env.SITE00_CREATIVE_REASONING_FORCE_FALLBACK).toBeUndefined();
    expect(process.env.SITE00_MERIDIAN_LIVE_ACCEPTANCE).toBe('1');
    restoreMeridianLiveAcceptanceEnv(snap);
    expect(process.env.SITE00_CREATIVE_REASONING_FORCE_FALLBACK).toBe('1');
  });

  it('6. withMeridianLiveAcceptanceEnv restores env after run', async () => {
    process.env.SITE00_CREATIVE_REASONING_FORCE_FALLBACK = '1';
    await withMeridianLiveAcceptanceEnv(async () => {
      expect(process.env.SITE00_CREATIVE_REASONING_FORCE_FALLBACK).toBeUndefined();
      return true;
    });
    expect(process.env.SITE00_CREATIVE_REASONING_FORCE_FALLBACK).toBe('1');
  });

  it('7. fallback at baseline cleared during live acceptance scope', async () => {
    process.env.ANTHROPIC_API_KEY = 'sk-test-not-real';
    process.env.SITE00_CREATIVE_REASONING_FORCE_FALLBACK = '1';
    delete process.env.VITEST;
    const cfg = verifyRailwayProviderConfig();
    expect(cfg.forceFallbackActive).toBe(true);
    await withMeridianLiveAcceptanceEnv(async () => {
      const health = await checkCreativeReasoningProviderHealth();
      expect(health.reasoningDispatchAllowed).toBe(true);
      expect(health.runtimeMode).toBe('FULL_REASONING');
    });
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.SITE00_CREATIVE_REASONING_FORCE_FALLBACK;
    process.env.VITEST = 'true';
  });

  it('8. CONTROL_A remains immutable id', async () => {
    process.env.ANTHROPIC_API_KEY = 'sk-test';
    const result = await runC19R3MeridianLivePostRedeploy();
    expect(result.controlRunId).toBe('control_a_deterministic');
    expect(getPreservedControlRun()?.runId).toBe('control_a_deterministic');
    delete process.env.ANTHROPIC_API_KEY;
  });

  it('9. same-brief checksum matches meridian brief key', async () => {
    process.env.ANTHROPIC_API_KEY = 'sk-test';
    const result = await runC19R3MeridianLivePostRedeploy();
    expect(result.sameBriefKey).toBe('meridian-atelier-nocturne-drop-2026');
    expect(result.sameBriefHash).toBe(MERIDIAN_ATELIER_LAUNCH_BRIEF.briefId);
    delete process.env.ANTHROPIC_API_KEY;
  });

  it('10. unconfigured Railway blocks acceptance', async () => {
    const result = await runC19R3MeridianLivePostRedeploy();
    expect(result.acceptanceStatus).toBe('RAILWAY_PROVIDER_CONFIG_BLOCKED');
    expect(result.fullReasoningRun).toBeNull();
  });

  it('11. health gates when unconfigured', async () => {
    const health = await checkCreativeReasoningProviderHealth();
    expect(health.authConfigured).toBe(false);
    expect(health.reasoningDispatchAllowed).toBe(false);
  });

  it('12. bootstrap C19R3 returns view payload', async () => {
    const result = await bootstrapC19R3MeridianLivePostRedeploy();
    expect(result.sprint).toBe('C1.9R3_LIVE_POST_REDEPLOY');
    expect(result.view).toBeTruthy();
    expect(result.view.controlRun).toBeTruthy();
  });

  it('13. isC19R3LiveAcceptancePass requires dispatch counts', () => {
    expect(
      isC19R3LiveAcceptancePass({
        acceptanceStatus: 'FULL_REASONING_LIVE_PASS',
        liveAcceptanceEnvOverride: true,
        mockMode: false,
        testProvider: false,
        fullReasoningRun: { runId: 'full-1' } as never,
        runtimeReceipt: {
          creativeReasoningDispatchCount: 1,
          copyReasoningDispatchCount: 1,
          model: ANTHROPIC_CREATIVE_MODEL,
          runtimeMode: 'FULL_REASONING',
        },
      } as never),
    ).toBe(true);
  });

  it('14. visual provider counts remain zero in receipt shape', async () => {
    process.env.ANTHROPIC_API_KEY = 'sk-test';
    const result = await runC19R3MeridianLivePostRedeploy();
    expect(result.runtimeReceipt.imageProviderDispatchCount).toBe(0);
    expect(result.runtimeReceipt.videoProviderDispatchCount).toBe(0);
    expect(result.runtimeReceipt.falDispatchCount).toBe(0);
    delete process.env.ANTHROPIC_API_KEY;
  });

  it('15. comparison record structure present', async () => {
    process.env.ANTHROPIC_API_KEY = 'sk-test';
    const result = await runC19R3MeridianLivePostRedeploy();
    expect(result.comparison).toBeTruthy();
    expect(result.comparisonRecord).toBeTruthy();
    delete process.env.ANTHROPIC_API_KEY;
  });

  it('16. material improvement verdict field exists', async () => {
    process.env.ANTHROPIC_API_KEY = 'sk-test';
    const result = await runC19R3MeridianLivePostRedeploy();
    expect(result.comparison.overallJudgment).toBeTruthy();
    delete process.env.ANTHROPIC_API_KEY;
  });

  it('17. hero line candidates structure', async () => {
    process.env.ANTHROPIC_API_KEY = 'sk-test';
    const result = await runC19R3MeridianLivePostRedeploy();
    expect(Array.isArray(result.heroLineCandidates.control)).toBe(true);
    delete process.env.ANTHROPIC_API_KEY;
  });

  it('18. brand rhetorical signature present', async () => {
    process.env.ANTHROPIC_API_KEY = 'sk-test';
    const result = await runC19R3MeridianLivePostRedeploy();
    expect(result.brandRhetoricalSignature).toBeTruthy();
    delete process.env.ANTHROPIC_API_KEY;
  });

  it('19. QA blocks present', async () => {
    process.env.ANTHROPIC_API_KEY = 'sk-test';
    const result = await runC19R3MeridianLivePostRedeploy();
    expect(result.qa.categoryClicheControl).toBeTruthy();
    expect(result.qa.rhetoricalPatternOveruse).toBeTruthy();
    delete process.env.ANTHROPIC_API_KEY;
  });

  it('20. store modes reported', async () => {
    process.env.ANTHROPIC_API_KEY = 'sk-test';
    const result = await runC19R3MeridianLivePostRedeploy();
    expect(result.storeModes.brandLanguage).toBeTruthy();
    expect(result.storeModes.copy).toBeTruthy();
    delete process.env.ANTHROPIC_API_KEY;
  });
});
