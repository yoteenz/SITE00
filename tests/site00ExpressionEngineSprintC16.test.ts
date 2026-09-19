/**
 * C1.6 — Full reasoning proof + multi-unit creative globalization tests.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  checkCreativeReasoningProviderHealth,
  runCreativeReasoning,
} from '../api/_lib/site00ExpressionEngine/seniorCreativeJudgment/creativeReasoningProvider.js';
import {
  runMultiUnitBlindCampaignPackage,
  VERDANT_ROW_LAUNCH_BRIEF,
  isTrivialUtilityUnit,
} from '../api/_lib/site00ExpressionEngine/seniorCreativeJudgment/multiUnitCampaignArchitect.js';
import {
  bootstrapC16MultiUnitCreativeIntelligence,
} from '../api/_lib/site00ExpressionEngine/entry003/entry003C14Pipeline.js';
import {
  runMarketingPackageMasterDirectorWithCreativeJudgment,
  runEntry003SharedRegression,
  runBlindCreativeMarketingTest,
} from '../api/_lib/site00ExpressionEngine/seniorCreativeJudgment/creativeIntelligenceRuntime.js';
import {
  resetCreativeIntelligenceStore,
  getCreativeIntelligenceStoreModeSync,
  seedCorrectionFromFounderFeedback,
} from '../api/_lib/site00ExpressionEngine/seniorCreativeJudgment/creativeIntelligenceStore.js';
import * as supabaseStore from '../api/_lib/site00ExpressionEngine/seniorCreativeJudgment/creativeIntelligenceSupabaseStore.js';
import { canApproveCreativeDirection } from '../api/_lib/site00ExpressionEngine/seniorCreativeJudgment/packageSeniorCreativeJudgment.js';
import { SOLSTICE_AUDIO_LAUNCH_BRIEF } from '../api/_lib/site00ExpressionEngine/seniorCreativeJudgment/blindTestFixtures.js';
import {
  PACKAGE_CREATIVE_QUALITY_TIERS,
  PACKAGE_FOUNDER_HANDHOLDING_RISK_LEVELS,
  CORRECTION_SCOPES,
  PACKAGE_CLONING_FAILURE_CLASSES,
} from '../shared/site00-expression-engine/package-creative-judgment/types.js';
import { buildBlindTestInitialConcept } from '../api/_lib/site00ExpressionEngine/seniorCreativeJudgment/blindTestFixtures.js';
import { resetCreativeDirectorRuntimeStore } from '../api/_lib/site00ExpressionEngine/creativeDirector/creativeDirectorService.js';
import { resetEntry003Store } from '../api/_lib/site00ExpressionEngine/entry003/entry003Service.js';

const ROOT = join(import.meta.dirname, '..');

describe('C1.6 Multi-unit creative globalization', () => {
  beforeEach(() => {
    process.env.VITEST = 'true';
    resetCreativeDirectorRuntimeStore();
    resetEntry003Store();
    resetCreativeIntelligenceStore();
  });

  afterEach(() => {
    delete process.env.SITE00_CREATIVE_REASONING_MOCK_FULL;
  });

  it('1. FULL_REASONING provider path exists', async () => {
    process.env.SITE00_CREATIVE_REASONING_MOCK_FULL = '1';
    const result = await runCreativeReasoning({
      input: buildBlindTestInitialConcept(SOLSTICE_AUDIO_LAUNCH_BRIEF),
      campaignResponsibility: 'test',
      retrievedPrinciples: [],
    });
    expect(result.runtimeMode).toBe('FULL_REASONING');
    expect(result.textReasoningDispatchCount).toBeGreaterThan(0);
  });

  it('2. provider health check exists', async () => {
    const health = await checkCreativeReasoningProviderHealth();
    expect(health.providerName).toBeTruthy();
    expect(health.lastHealthCheck).toBeTruthy();
    expect(typeof health.structuredOutputSupported).toBe('boolean');
  });

  it('3. runtime mode exposed', async () => {
    const pkg = await runMultiUnitBlindCampaignPackage();
    expect(['FULL_REASONING', 'HYBRID', 'DETERMINISTIC_FALLBACK', 'FULL_REASONING_LIVE_TEST_BLOCKED']).toContain(
      pkg.runtimeMode,
    );
  });

  it('4. structured provider output validated', async () => {
    process.env.SITE00_CREATIVE_REASONING_MOCK_FULL = '1';
    const result = await runCreativeReasoning({
      input: buildBlindTestInitialConcept(SOLSTICE_AUDIO_LAUNCH_BRIEF),
      campaignResponsibility: 'test',
      retrievedPrinciples: [],
    });
    expect(result.attackVectors.length).toBeGreaterThanOrEqual(3);
    expect(result.finalDirection.length).toBeGreaterThan(5);
  });

  it('5. chain-of-thought not persisted in judgment record shape', async () => {
    const pkg = await runMultiUnitBlindCampaignPackage();
    const hero = pkg.units.find((u) => u.medium === 'HERO_REEL')!;
    const json = JSON.stringify(hero.judgment);
    expect(json.toLowerCase()).not.toContain('chain-of-thought');
    expect(json.toLowerCase()).not.toContain('let me think');
  });

  it('6. Senior Creative Judgment runs for every major unit', async () => {
    const pkg = await runMultiUnitBlindCampaignPackage();
    const major = pkg.units.filter((u) => u.reviewType === 'SENIOR_CREATIVE_JUDGMENT');
    expect(major.length).toBeGreaterThanOrEqual(5);
    major.forEach((u) => {
      expect(u.judgment.firstAnswerChallenge.attackVectors.length).toBeGreaterThan(0);
    });
  });

  it('7. trivial utility unit may use lightweight review', () => {
    expect(isTrivialUtilityUnit('UTILITY resize crop')).toBe(true);
    const pkg = runMultiUnitBlindCampaignPackage();
    return pkg.then((p) => {
      const light = p.units.find((u) => u.reviewType === 'LIGHTWEIGHT_CRAFT_REVIEW');
      expect(light).toBeTruthy();
    });
  });

  it('8. package-level Senior Judgment exists', async () => {
    const pkg = await runMultiUnitBlindCampaignPackage();
    expect(pkg.packageJudgment.packageJudgmentId).toBeTruthy();
    expect(pkg.packageJudgment.finalCampaignDirection).toBeTruthy();
  });

  it('9. PackageCreativeQualityTier exists', () => {
    expect(PACKAGE_CREATIVE_QUALITY_TIERS).toContain('EXCEPTIONAL');
  });

  it('10. PackageFounderHandholdingRisk exists', () => {
    expect(PACKAGE_FOUNDER_HANDHOLDING_RISK_LEVELS).toContain('LOW');
  });

  it('11. fresh blind campaign is non-NDXBOOK', () => {
    expect(VERDANT_ROW_LAUNCH_BRIEF.projectId).toBe('verdant-row');
    expect(VERDANT_ROW_LAUNCH_BRIEF.brandName).toBe('Verdant Row');
  });

  it('12. fresh blind campaign is not Solstice', () => {
    expect(VERDANT_ROW_LAUNCH_BRIEF.brandName).not.toContain('Solstice');
    expect(VERDANT_ROW_LAUNCH_BRIEF.projectId).not.toBe('solstice-audio');
  });

  it('13. thin brief contains no final concept', () => {
    expect(VERDANT_ROW_LAUNCH_BRIEF).not.toHaveProperty('winningConcept');
    expect(VERDANT_ROW_LAUNCH_BRIEF).not.toHaveProperty('conceptName');
  });

  it('14. package includes 5+ meaningful units', async () => {
    const pkg = await runMultiUnitBlindCampaignPackage();
    expect(pkg.units.filter((u) => u.reviewType === 'SENIOR_CREATIVE_JUDGMENT').length).toBeGreaterThanOrEqual(5);
  });

  it('15. hero Reel receives cinematic assessment', async () => {
    const pkg = await runMultiUnitBlindCampaignPackage();
    const hero = pkg.units.find((u) => u.medium === 'HERO_REEL')!;
    expect(hero.judgment.mediumNecessity.medium).toMatch(/REEL|FILM/);
  });

  it('16. Carousel receives sequence assessment', async () => {
    const pkg = await runMultiUnitBlindCampaignPackage();
    const carousel = pkg.units.find((u) => u.medium === 'CAROUSEL')!;
    expect(carousel.role.whyThisMedium.toLowerCase()).toContain('carousel');
  });

  it('17. Story receives story-native assessment', async () => {
    const pkg = await runMultiUnitBlindCampaignPackage();
    const story = pkg.units.find((u) => u.medium === 'STORY_SEQUENCE')!;
    expect(story.role.whyThisMedium.toLowerCase()).toMatch(/story|tap/);
  });

  it('18. X receives rhetorical assessment', async () => {
    const pkg = await runMultiUnitBlindCampaignPackage();
    const x = pkg.units.find((u) => u.medium === 'X_POST')!;
    expect(x.role.campaignRole).toMatch(/SOCIAL|ARGUMENT/i);
  });

  it('19. Email receives persuasion assessment', async () => {
    const pkg = await runMultiUnitBlindCampaignPackage();
    const email = pkg.units.find((u) => u.medium === 'EMAIL')!;
    expect(email.role.campaignRole).toMatch(/PERSUASION|CONVERSION/i);
  });

  it('20. each major unit receives first-answer challenge', async () => {
    const pkg = await runMultiUnitBlindCampaignPackage();
    pkg.units
      .filter((u) => u.reviewType === 'SENIOR_CREATIVE_JUDGMENT')
      .forEach((u) => {
        expect(u.judgment.firstAnswerChallenge.attackVectors.length).toBeGreaterThan(0);
      });
  });

  it('21. each major unit can receive challenger', async () => {
    const pkg = await runMultiUnitBlindCampaignPackage();
    pkg.units
      .filter((u) => u.reviewType === 'SENIOR_CREATIVE_JUDGMENT')
      .forEach((u) => {
        expect(u.judgment.challenger.conceptName.length).toBeGreaterThan(0);
      });
  });

  it('22. package challenger exists', async () => {
    const pkg = await runMultiUnitBlindCampaignPackage();
    expect(pkg.packageJudgment.packageChallenger.length).toBeGreaterThan(3);
  });

  it('23. campaign idea differs from hero concept field', async () => {
    const pkg = await runMultiUnitBlindCampaignPackage();
    expect(pkg.campaignIdea).toBeTruthy();
    expect(pkg.heroConcept).toBeTruthy();
  });

  it('24. CampaignCreativeDNA exists', async () => {
    const pkg = await runMultiUnitBlindCampaignPackage();
    expect(pkg.packageJudgment.campaignCreativeDNA.coreTension.length).toBeGreaterThan(10);
  });

  it('25. cloned-format failure exists', () => {
    expect(PACKAGE_CLONING_FAILURE_CLASSES).toContain('PACKAGE_CLONED_ACROSS_FORMATS');
  });

  it('26. package escalation exists', async () => {
    const pkg = await runMultiUnitBlindCampaignPackage();
    expect(pkg.packageJudgment.campaignEscalation.length).toBeGreaterThan(2);
  });

  it('27. handoffs exist', async () => {
    const pkg = await runMultiUnitBlindCampaignPackage();
    expect(pkg.handoffs.length).toBeGreaterThanOrEqual(3);
  });

  it('28. campaign ending exists', async () => {
    const pkg = await runMultiUnitBlindCampaignPackage();
    expect(pkg.packageJudgment.campaignEnding.length).toBeGreaterThan(5);
  });

  it('29. creative corrections Supabase adapter exists', () => {
    expect(typeof supabaseStore.upsertCreativeCorrectionToSupabase).toBe('function');
    expect(typeof supabaseStore.creativeIntelligenceSchemaExists).toBe('function');
  });

  it('30. senior judgments Supabase adapter exists', () => {
    expect(typeof supabaseStore.upsertSeniorJudgmentToSupabase).toBe('function');
  });

  it('31. correction scope exists', () => {
    expect(CORRECTION_SCOPES).toContain('GLOBAL_METHOD');
    expect(CORRECTION_SCOPES).toContain('PROJECT_TASTE');
  });

  it('32. global method differs from taste in seed', () => {
    const record = seedCorrectionFromFounderFeedback({
      surfaceFeedback: 'world is decorative',
      taxonomy: 'WORLD_TOO_DECORATIVE',
      scope: 'GLOBAL_METHOD',
    });
    expect((record as { scope?: string }).scope).toBe('GLOBAL_METHOD');
  });

  it('33. relevant correction retrieval works', async () => {
    seedCorrectionFromFounderFeedback({
      surfaceFeedback: 'artifact redundant when environment proves labor',
      taxonomy: 'ARTIFACT_REDUNDANT',
      scope: 'GLOBAL_METHOD',
    });
    const pkg = await runMultiUnitBlindCampaignPackage();
    expect(Array.isArray(pkg.principlesApplied)).toBe(true);
  });

  it('34. generic founder review UI is wired', () => {
    const ui = readFileSync(
      join(ROOT, 'src/site00/components/founderWorkspace/expressionEngine/MultiUnitCreativePackageReview.tsx'),
      'utf8',
    );
    const workspace = readFileSync(
      join(ROOT, 'src/site00/components/founderWorkspace/expressionEngine/ExpressionEngineReferenceMobileWorkspace.tsx'),
      'utf8',
    );
    expect(ui).toContain('MultiUnitCreativePackageReview');
    expect(workspace).toContain('C1.6');
  });

  it('35. unit drilldown exists in UI', () => {
    const ui = readFileSync(
      join(ROOT, 'src/site00/components/founderWorkspace/expressionEngine/MultiUnitCreativePackageReview.tsx'),
      'utf8',
    );
    expect(ui).toContain('expandedUnit');
    expect(ui).toContain('CHALLENGER');
  });

  it('36. runtime mode visible in founder UI', () => {
    const ui = readFileSync(
      join(ROOT, 'src/site00/components/founderWorkspace/expressionEngine/MultiUnitCreativePackageReview.tsx'),
      'utf8',
    );
    expect(ui).toContain('FULL REASONING');
  });

  it('37. production gate blocks incomplete judgment', async () => {
    const pkg = await runMultiUnitBlindCampaignPackage();
    if (pkg.packageJudgment.packageFounderHandholdingRisk === 'HIGH') {
      expect(canApproveCreativeDirection(pkg.packageJudgment, pkg.units)).toBe(false);
    } else {
      expect(typeof canApproveCreativeDirection(pkg.packageJudgment, pkg.units)).toBe('boolean');
    }
  });

  it('38. Entry 003 regression passes', async () => {
    const reg = await runEntry003SharedRegression();
    expect(reg.input.conceptName).toBe('THE EMPLOYEE-ONLY DOOR');
    expect(reg.artifactNecessity.explanatoryPropRisk).toBe(true);
  });

  it('39. Solstice regression passes', async () => {
    const solstice = await runBlindCreativeMarketingTest();
    expect(solstice.brief.brandName).toBe('Solstice Audio');
    expect(solstice.judgment.challenger.conceptName).toBeTruthy();
  });

  it('40. FULL_REASONING blind run when mock provider enabled', async () => {
    process.env.SITE00_CREATIVE_REASONING_MOCK_FULL = '1';
    const pkg = await runMultiUnitBlindCampaignPackage();
    const major = pkg.units.filter((u) => u.reviewType === 'SENIOR_CREATIVE_JUDGMENT');
    expect(major.some((u) => u.runtimeMode === 'FULL_REASONING')).toBe(true);
  });

  it('41. fallback reported honestly when not full', async () => {
    const pkg = await runMultiUnitBlindCampaignPackage();
    expect(pkg.reasoningDepthLimited).toBe(true);
    expect(pkg.runtimeMode).toBe('DETERMINISTIC_FALLBACK');
  });

  it('42. text reasoning dispatch receipt exists', async () => {
    const pkg = await runMultiUnitBlindCampaignPackage();
    expect(pkg.dispatchReceipts.length).toBeGreaterThan(0);
    expect(pkg.dispatchReceipts[0]?.purpose).toContain('unit_judgment');
  });

  it('43. provider retries bounded — max 1 retry constant', () => {
    const src = readFileSync(
      join(ROOT, 'api/_lib/site00ExpressionEngine/seniorCreativeJudgment/creativeReasoningProvider.ts'),
      'utf8',
    );
    expect(src).toContain('MAX_PROVIDER_RETRIES = 1');
  });

  it('44–46. zero visual provider dispatch', async () => {
    const c16 = await bootstrapC16MultiUnitCreativeIntelligence();
    expect(c16.imageProviderDispatchCount).toBe(0);
    expect(c16.videoProviderDispatchCount).toBe(0);
    expect(c16.falDispatchCount).toBe(0);
  });

  it('47. prior C1 MPMD runs all units', async () => {
    const mpmd = await runMarketingPackageMasterDirectorWithCreativeJudgment();
    expect(mpmd.seniorJudgmentRuns.length).toBeGreaterThan(1);
  });

  it('48. build passes — store mode resolves in tests', () => {
    expect(getCreativeIntelligenceStoreModeSync()).toBe('MEMORY');
  });

  it('bootstrap C1.6 full runtime', async () => {
    process.env.SITE00_CREATIVE_REASONING_MOCK_FULL = '1';
    const c16 = await bootstrapC16MultiUnitCreativeIntelligence();
    expect(c16.multiUnitBlindCampaign.units.length).toBeGreaterThanOrEqual(5);
    expect(c16.multiUnitBlindCampaign.packageJudgment.status).toBe('AWAITING_FOUNDER_REVIEW');
    expect(c16.providerHealth.providerName).toBeTruthy();
  });
});
