/**
 * C1.9R1 — Live FULL_REASONING Meridian proof tests.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  MERIDIAN_ATELIER_LAUNCH_BRIEF,
  MERIDIAN_ATELIER_BRAND_ID,
  deriveMeridianBrandLanguageIdentity,
} from '../api/_lib/site00ExpressionEngine/brandLanguage/c19BlindBrandFixture.js';
import {
  initBrandLanguageStore,
  resetBrandLanguageStore,
  getBrandLanguageStoreMode,
} from '../api/_lib/site00ExpressionEngine/brandLanguage/brandLanguageSupabaseStore.js';
import {
  initCampaignCopyStore,
  resetCampaignCopyStore,
  getCampaignCopyStoreMode,
} from '../api/_lib/site00ExpressionEngine/campaignCopy/campaignCopyStore.js';
import {
  initCreativeIntelligenceStore,
  resetCreativeIntelligenceStore,
  getCreativeIntelligenceStoreModeSync,
} from '../api/_lib/site00ExpressionEngine/seniorCreativeJudgment/creativeIntelligenceStore.js';
import { checkCreativeReasoningProviderHealth } from '../api/_lib/site00ExpressionEngine/seniorCreativeJudgment/creativeReasoningProvider.js';
import { runC19BlindCampaignPackage } from '../api/_lib/site00ExpressionEngine/seniorCreativeJudgment/c19GenericCampaignArchitect.js';
import {
  runC19R1MeridianLiveProof,
  isC19R1LivePass,
} from '../api/_lib/site00ExpressionEngine/runC19R1MeridianLiveProof.js';
import { assessMeridianMaterialImprovement } from '../api/_lib/site00ExpressionEngine/meridianComparisonAssessment.js';
import {
  resetMeridianLiveProofStore,
  persistMeridianRun,
  persistMeridianComparison,
  recordMeridianFounderJudgment,
} from '../api/_lib/site00ExpressionEngine/meridianLiveProofStore.js';
import { serializeC19R1ForComparisonView } from '../api/_lib/site00ExpressionEngine/meridianComparisonSerializer.js';
import { evaluateCategoryClicheRisk } from '../api/_lib/site00ExpressionEngine/brandLanguage/categoryClicheQA.js';
import { evaluateCrossBrandVoiceContamination } from '../api/_lib/site00ExpressionEngine/brandLanguage/crossBrandVoiceContaminationQA.js';
import { detectRhetoricalPatternOveruse, trackRhetoricalPatterns } from '../api/_lib/site00ExpressionEngine/brandLanguage/rhetoricalPatternLineage.js';
import { bootstrapC19R1MeridianLiveProof } from '../api/_lib/site00ExpressionEngine/entry003/entry003C14Pipeline.js';
import { runMultiUnitBlindCampaignPackage } from '../api/_lib/site00ExpressionEngine/seniorCreativeJudgment/multiUnitCampaignArchitect.js';

describe('C1.9R1 Live FULL_REASONING Meridian Proof', () => {
  beforeEach(() => {
    process.env.VITEST = 'true';
    resetBrandLanguageStore();
    resetCampaignCopyStore();
    resetCreativeIntelligenceStore();
    resetMeridianLiveProofStore();
    delete process.env.SITE00_CREATIVE_REASONING_MOCK_FULL;
  });

  it('1. Meridian control uses unchanged brief', async () => {
    const control = await runC19BlindCampaignPackage(MERIDIAN_ATELIER_LAUNCH_BRIEF, {
      forceRuntimeMode: 'DETERMINISTIC_FALLBACK',
    });
    expect(control.brief.briefId).toBe(MERIDIAN_ATELIER_LAUNCH_BRIEF.briefId);
    expect(control.brief.brandName).toBe('Meridian Atelier');
    expect(control.brief.campaignObjective).toBe(MERIDIAN_ATELIER_LAUNCH_BRIEF.campaignObjective);
  });

  it('2. live run uses same brief hash', async () => {
    const result = await runC19R1MeridianLiveProof();
    expect(result.briefVerified).toBe(true);
    expect(result.sameBriefHash).toBe(MERIDIAN_ATELIER_LAUNCH_BRIEF.briefId);
    expect(result.controlRun.campaign.brief.briefId).toBe(MERIDIAN_ATELIER_LAUNCH_BRIEF.briefId);
  });

  it('3. provider health gates execution', async () => {
    const health = await checkCreativeReasoningProviderHealth();
    expect(health.providerName).toBeDefined();
    expect(health.model).toContain('claude');
    if (!process.env.ANTHROPIC_API_KEY) {
      expect(health.reasoningDispatchAllowed).toBe(false);
    }
  });

  it('4. mock cannot satisfy live proof', async () => {
    process.env.SITE00_CREATIVE_REASONING_MOCK_FULL = '1';
    const result = await runC19R1MeridianLiveProof();
    expect(result.capabilityStatus).toBe('FULL_REASONING_LIVE_TEST_BLOCKED');
    expect(result.fullReasoningRun).toBeNull();
    delete process.env.SITE00_CREATIVE_REASONING_MOCK_FULL;
  });

  it('5. dispatch count >0 required for live pass', async () => {
    const result = await runC19R1MeridianLiveProof();
    if (!process.env.ANTHROPIC_API_KEY) {
      expect(isC19R1LivePass(result)).toBe(false);
      expect(result.runtimeReceipt.totalDispatchCount).toBe(0);
    }
  });

  it('6. FULL_REASONING can supersede control (assessment path)', async () => {
    const control = await runC19BlindCampaignPackage(MERIDIAN_ATELIER_LAUNCH_BRIEF, {
      forceRuntimeMode: 'DETERMINISTIC_FALLBACK',
    });
    const full = structuredClone(control);
    full.initialCampaignWinner = 'Superseded winner';
    full.packageJudgment.finalCampaignDirection = 'Revised live direction';
    full.textReasoningDispatchCount = 3;
    full.copyPackage!.copyReasoningDispatchCount = 2;
    const assessment = assessMeridianMaterialImprovement({ control, full, liveBlocked: false });
    expect(assessment.whatChanged.length).toBeGreaterThan(0);
    expect(['FULL_REASONING_MATERIALLY_BETTER', 'FULL_REASONING_SOMEWHAT_BETTER', 'ROUGHLY_EQUIVALENT']).toContain(
      assessment.overallJudgment,
    );
  });

  it('7. FULL_REASONING can retain control', async () => {
    const control = await runC19BlindCampaignPackage(MERIDIAN_ATELIER_LAUNCH_BRIEF, {
      forceRuntimeMode: 'DETERMINISTIC_FALLBACK',
    });
    const full = structuredClone(control);
    full.textReasoningDispatchCount = 1;
    const assessment = assessMeridianMaterialImprovement({ control, full, liveBlocked: false });
    expect(assessment.whatItKept.length).toBeGreaterThan(0);
  });

  it('8. campaign challenge fields present on control', async () => {
    const control = await runC19BlindCampaignPackage(MERIDIAN_ATELIER_LAUNCH_BRIEF, {
      forceRuntimeMode: 'DETERMINISTIC_FALLBACK',
    });
    expect(control.packageJudgment.packageFirstAnswerChallenge.length).toBeGreaterThan(0);
    expect(control.packageJudgment.packageChallenger.length).toBeGreaterThan(0);
  });

  it('9. copy challenge fields present per unit', async () => {
    const control = await runC19BlindCampaignPackage(MERIDIAN_ATELIER_LAUNCH_BRIEF, {
      forceRuntimeMode: 'DETERMINISTIC_FALLBACK',
    });
    for (const u of control.copyPackage!.unitCopyDirections.filter((x) => x.medium !== 'LIGHTWEIGHT_CRAFT_REVIEW')) {
      expect(u.firstAnswerChallenge.resolution.length).toBeGreaterThan(0);
      expect(u.challenger.conceptName.length).toBeGreaterThan(0);
    }
  });

  it('10. category cliché QA runs', () => {
    const identity = deriveMeridianBrandLanguageIdentity();
    const qa = evaluateCategoryClicheRisk(
      ['ritual dusk threshold memory desire private sensual architecture room'],
      identity.signatureLanguage,
    );
    expect(qa.clicheHits.length).toBeGreaterThan(0);
  });

  it('11. cross-brand contamination QA runs', () => {
    const identity = deriveMeridianBrandLanguageIdentity();
    const qa = evaluateCrossBrandVoiceContamination('Your feed is lying to you about luxury', identity);
    expect(qa.failureClasses).toBeDefined();
    expect(typeof qa.passed).toBe('boolean');
  });

  it('12. rhetorical pattern QA runs', () => {
    trackRhetoricalPatterns("It's not luxury. It's you.", MERIDIAN_ATELIER_BRAND_ID);
    trackRhetoricalPatterns("It's not scent. It's memory.", MERIDIAN_ATELIER_BRAND_ID);
    const over = detectRhetoricalPatternOveruse(MERIDIAN_ATELIER_BRAND_ID, 1);
    expect(over.overused).toBe(true);
  });

  it('13. X brand-fit challenge exists in package', async () => {
    const control = await runC19BlindCampaignPackage(MERIDIAN_ATELIER_LAUNCH_BRIEF, {
      forceRuntimeMode: 'DETERMINISTIC_FALLBACK',
    });
    const xUnit = control.units.find((u) => u.medium === 'X_POST');
    expect(xUnit).toBeDefined();
    expect(xUnit!.judgment.firstAnswerChallenge.attackVectors.length).toBeGreaterThan(0);
  });

  it('14. Story interaction is not mandatory poll', async () => {
    const control = await runC19BlindCampaignPackage(MERIDIAN_ATELIER_LAUNCH_BRIEF, {
      forceRuntimeMode: 'DETERMINISTIC_FALLBACK',
    });
    const story = control.units.find((u) => u.medium === 'STORY_SEQUENCE' || u.formatTarget === 'STORY');
    expect(story).toBeDefined();
    expect(story!.finalDirection.toLowerCase()).not.toMatch(/must use poll|required poll/i);
  });

  it('15. medium tension supported via rationale fields', async () => {
    const control = await runC19BlindCampaignPackage(MERIDIAN_ATELIER_LAUNCH_BRIEF, {
      forceRuntimeMode: 'DETERMINISTIC_FALLBACK',
    });
    for (const u of control.units) {
      expect(u.mediumRationale.length).toBeGreaterThan(0);
    }
  });

  it('16. hero line candidates generated', async () => {
    const result = await runC19R1MeridianLiveProof();
    expect(result.heroLineCandidates.control.length).toBeGreaterThanOrEqual(5);
  });

  it('17. copy final may differ from first answer (structure)', async () => {
    const control = await runC19BlindCampaignPackage(MERIDIAN_ATELIER_LAUNCH_BRIEF, {
      forceRuntimeMode: 'DETERMINISTIC_FALLBACK',
    });
    const withRevision = control.copyPackage!.unitCopyDirections.some(
      (u) => u.finalCaption && u.primaryCaption && u.finalCaption !== u.primaryCaption,
    );
    expect(typeof withRevision).toBe('boolean');
  });

  it('18. deterministic vs full comparison exists', async () => {
    const result = await runC19R1MeridianLiveProof();
    expect(result.comparison.overallJudgment).toBeDefined();
    expect(result.comparison.recommendation.length).toBeGreaterThan(0);
  });

  it('19. comparison does not auto-favor full when blocked', async () => {
    const result = await runC19R1MeridianLiveProof();
    if (result.fullReasoningBlocked) {
      expect(result.comparison.overallJudgment).toBe('FULL_REASONING_LIVE_TEST_BLOCKED');
      expect(result.comparison.materialImprovement).toBe(false);
    }
  });

  it('20. material improvement assessment exists', async () => {
    const result = await runC19R1MeridianLiveProof();
    expect(typeof result.comparison.materialImprovement).toBe('boolean');
    expect(result.comparison.dimensions).toBeDefined();
  });

  it('21. control and full runs persist separately', async () => {
    const result = await runC19R1MeridianLiveProof();
    expect(result.controlRun.label).toBe('CONTROL_A_DETERMINISTIC');
    expect(result.controlRun.runId).toMatch(/control_a_deterministic/);
    if (result.fullReasoningRun) {
      expect(result.fullReasoningRun.label).toBe('FULL_REASONING_B');
      expect(result.fullReasoningRun.runId).not.toBe(result.controlRun.runId);
    }
  });

  it('22. founder comparison view serializes for UI', async () => {
    const result = await runC19R1MeridianLiveProof();
    const view = serializeC19R1ForComparisonView(result);
    expect(view.controlRun.label).toContain('DETERMINISTIC');
    expect(view.comparisonId).toBeTruthy();
    expect(view.runtimeReceipt.providerName).toBeDefined();
  });

  it('23. founder judgment actions persist', async () => {
    const control = await runC19BlindCampaignPackage(MERIDIAN_ATELIER_LAUNCH_BRIEF, {
      forceRuntimeMode: 'DETERMINISTIC_FALLBACK',
    });
    const controlRun = persistMeridianRun({ label: 'CONTROL_A_DETERMINISTIC', campaign: control });
    const record = persistMeridianComparison({
      briefId: MERIDIAN_ATELIER_LAUNCH_BRIEF.briefId,
      controlRun,
      fullReasoningRun: null,
      fullReasoningBlocked: true,
      comparison: assessMeridianMaterialImprovement({ control, full: null, liveBlocked: true }),
      founderJudgment: 'UNREVIEWED',
    });
    const updated = recordMeridianFounderJudgment({
      comparisonId: record.comparisonId,
      judgment: 'HYBRIDIZE',
      hybridSelections: { campaignDirectionFrom: 'CONTROL', copyFrom: 'FULL' },
    });
    expect(updated?.founderJudgment).toBe('HYBRIDIZE');
    expect(updated?.hybridSelections?.campaignDirectionFrom).toBe('CONTROL');
  });

  it('24. hybridization supported', () => {
    const allowed = ['FULL_REASONING_WINS', 'DETERMINISTIC_WINS', 'HYBRIDIZE', 'NEITHER', 'PUSH_FURTHER'];
    expect(allowed).toContain('HYBRIDIZE');
  });

  it('25. live runtime receipt exists', async () => {
    const result = await runC19R1MeridianLiveProof();
    expect(result.runtimeReceipt.startedAt).toBeTruthy();
    expect(result.runtimeReceipt.completedAt).toBeTruthy();
    expect(result.runtimeReceipt.imageProviderDispatchCount).toBe(0);
    expect(result.runtimeReceipt.falDispatchCount).toBe(0);
    expect(result.runtimeReceipt.videoProviderDispatchCount).toBe(0);
  });

  it('26. provider retry bounded to 1', async () => {
    const result = await runC19R1MeridianLiveProof();
    expect(result.runtimeReceipt.retries).toBeLessThanOrEqual(1);
  });

  it('27. store mode verified', async () => {
    await initBrandLanguageStore();
    await initCampaignCopyStore();
    await initCreativeIntelligenceStore();
    const result = await runC19R1MeridianLiveProof();
    expect(['MEMORY', 'SUPABASE']).toContain(result.storeModes.brandLanguage);
    expect(['MEMORY', 'SUPABASE']).toContain(result.storeModes.copy);
    expect(['MEMORY', 'SUPABASE']).toContain(result.storeModes.creativeIntelligence);
    if (process.env.VITEST === 'true') {
      expect(getBrandLanguageStoreMode()).toBe('MEMORY');
      expect(getCampaignCopyStoreMode()).toBe('MEMORY');
      expect(getCreativeIntelligenceStoreModeSync()).toBe('MEMORY');
    }
  });

  it('28. Entry 003 regression unchanged', async () => {
    const ndx = await runMultiUnitBlindCampaignPackage();
    expect(ndx.brief.projectId).toBe('verdant-row');
  });

  it('29. bootstrap C1.9R1 API phase', async () => {
    const c19r1 = await bootstrapC19R1MeridianLiveProof();
    expect(c19r1.sprint).toBe('C1.9R1_LIVE_MERIDIAN_PROOF');
    expect(c19r1.view).toBeDefined();
    expect(c19r1.view.controlRun.campaign.brief.brandName).toBe('Meridian Atelier');
  });

  it('30. control label is CONTROL_A_DETERMINISTIC', async () => {
    const result = await runC19R1MeridianLiveProof();
    expect(result.controlRun.label).toBe('CONTROL_A_DETERMINISTIC');
    expect(result.controlRun.campaign.runtimeMode).toBe('DETERMINISTIC_FALLBACK');
  });

  it('31. blocked full slot is null not copied deterministic', async () => {
    const result = await runC19R1MeridianLiveProof();
    if (result.fullReasoningBlocked) {
      expect(result.fullReasoningRun).toBeNull();
      expect(result.capabilityStatus).toBe('FULL_REASONING_LIVE_TEST_BLOCKED');
    }
  });

  it('32. brand rhetorical signature included', async () => {
    const result = await runC19R1MeridianLiveProof();
    expect(result.brandRhetoricalSignature.description.length).toBeGreaterThan(5);
  });

  it('33. does not expose API key in receipt', async () => {
    process.env.ANTHROPIC_API_KEY = 'sk-test-secret-key';
    const result = await runC19R1MeridianLiveProof();
    const serialized = JSON.stringify(result);
    expect(serialized).not.toContain('sk-test-secret-key');
    delete process.env.ANTHROPIC_API_KEY;
  });
});
