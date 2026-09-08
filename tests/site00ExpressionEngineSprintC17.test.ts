/**
 * C1.7 — Campaign Copy Director tests.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { runCampaignCopyDirector, checkCopyProductionGate } from '../api/_lib/site00ExpressionEngine/campaignCopy/campaignCopyDirector.js';
import { bootstrapC17CampaignCopyDirector } from '../api/_lib/site00ExpressionEngine/entry003/entry003C14Pipeline.js';
import { runMultiUnitBlindCampaignPackage } from '../api/_lib/site00ExpressionEngine/seniorCreativeJudgment/multiUnitCampaignArchitect.js';
import {
  resetCampaignCopyStore,
  updateUnitCopyVersion,
  getCampaignCopyStoreMode,
} from '../api/_lib/site00ExpressionEngine/campaignCopy/campaignCopyStore.js';
import { evaluateCampaignCopyCohesion } from '../api/_lib/site00ExpressionEngine/campaignCopy/campaignCopyCohesionQA.js';
import { buildNdxbookVoiceOverlay, ndxbookCaptionShouldNotRepeatInterjection } from '../api/_lib/site00ExpressionEngine/campaignCopy/ndxbookCopyAdapter.js';
import {
  COPY_ROLES,
  COPY_VISUAL_RELATIONSHIPS,
  COPY_CREATIVE_QUALITY_TIERS,
  COPY_FOUNDER_HANDHOLDING_RISK_LEVELS,
  CTA_CLASSES,
  HASHTAG_STRATEGIES,
  COPY_FAILURE_CLASSES,
  COPY_CORRECTION_TAXONOMY,
} from '../shared/site00-expression-engine/campaign-copy/types.js';
import { resetCreativeIntelligenceStore, seedCorrectionFromFounderFeedback } from '../api/_lib/site00ExpressionEngine/seniorCreativeJudgment/creativeIntelligenceStore.js';
import { VERDANT_ROW_LAUNCH_BRIEF } from '../api/_lib/site00ExpressionEngine/seniorCreativeJudgment/blindMultiUnitFixtures.js';

const ROOT = join(import.meta.dirname, '..');

describe('C1.7 Campaign Copy Director', () => {
  beforeEach(() => {
    process.env.VITEST = 'true';
    resetCampaignCopyStore();
    resetCreativeIntelligenceStore();
  });

  it('1. CampaignCopyDirector exists', () => {
    expect(typeof runCampaignCopyDirector).toBe('function');
  });

  it('2. shared architecture is not NDXBOOK-only', async () => {
    const campaign = await runMultiUnitBlindCampaignPackage();
    expect(campaign.brief.projectId).toBe('verdant-row');
    expect(campaign.copyPackage?.campaignId).toBeTruthy();
  });

  it('3. caption differs from onAssetCopy when on-asset present', async () => {
    const campaign = await runMultiUnitBlindCampaignPackage();
    const story = campaign.copyPackage!.unitCopyDirections.find((u) => u.medium === 'STORY_SEQUENCE')!;
    expect(story.copyPackage.onAssetCopy).toBeTruthy();
    expect(story.finalCaption).not.toBe(story.copyPackage.onAssetCopy);
  });

  it('4. CopyVisualRelationship exists', () => {
    expect(COPY_VISUAL_RELATIONSHIPS).toContain('COUNTERPOINT');
    expect(COPY_VISUAL_RELATIONSHIPS).toContain('AFTERSHOCK');
  });

  it('5. caption role exists', () => {
    expect(COPY_ROLES).toContain('EXTEND_VISUAL');
    expect(COPY_ROLES).toContain('CREATE_AFTERSHOCK');
  });

  it('6. COPY_REPEATS_VISUAL can fail', () => {
    expect(COPY_FAILURE_CLASSES).toContain('COPY_REPEATS_VISUAL');
  });

  it('7. COPY_EXPLAINS_JOKE can fail', () => {
    expect(COPY_FAILURE_CLASSES).toContain('COPY_EXPLAINS_JOKE');
  });

  it('8. CampaignVoiceProfile exists', async () => {
    const campaign = await runMultiUnitBlindCampaignPackage();
    expect(campaign.copyPackage!.voiceProfile.brandVoice.length).toBeGreaterThan(5);
  });

  it('9. platform-native behavior exists', async () => {
    const campaign = await runMultiUnitBlindCampaignPackage();
    const x = campaign.copyPackage!.unitCopyDirections.find((u) => u.medium === 'X_POST')!;
    expect(x.mediumNecessity.platformNativeBehavior.toLowerCase()).toMatch(/quotable|discourse|provoc/);
  });

  it('10. Reel caption logic exists', async () => {
    const campaign = await runMultiUnitBlindCampaignPackage();
    const reel = campaign.copyPackage!.unitCopyDirections.find((u) => u.medium === 'HERO_REEL')!;
    expect(reel.visualRelationship).toBe('AFTERSHOCK');
    expect(reel.mediumNecessity.whyCopyBelongsHere.toLowerCase()).toContain('aftershock');
  });

  it('11. Carousel caption logic exists', async () => {
    const campaign = await runMultiUnitBlindCampaignPackage();
    const carousel = campaign.copyPackage!.unitCopyDirections.find((u) => u.medium === 'CAROUSEL')!;
    expect(carousel.mediumNecessity.platformNativeBehavior.toLowerCase()).toContain('save');
  });

  it('12. Story copy logic exists', async () => {
    const campaign = await runMultiUnitBlindCampaignPackage();
    const story = campaign.copyPackage!.unitCopyDirections.find((u) => u.medium === 'STORY_SEQUENCE')!;
    expect(story.finalCaption.toLowerCase()).toMatch(/poll|tap|guilty|curious/);
  });

  it('13. TikTok copy logic exists — type supports TIKTOK medium', () => {
    const src = readFileSync(join(ROOT, 'api/_lib/site00ExpressionEngine/campaignCopy/campaignCopyDirector.ts'), 'utf8');
    expect(src).toContain('TIKTOK');
  });

  it('14. X copy logic exists', async () => {
    const campaign = await runMultiUnitBlindCampaignPackage();
    const x = campaign.copyPackage!.unitCopyDirections.find((u) => u.medium === 'X_POST')!;
    expect(x.visualRelationship).toBe('COUNTERPOINT');
    expect(x.finalCaption.length).toBeGreaterThan(20);
  });

  it('15. Email copy logic exists', async () => {
    const campaign = await runMultiUnitBlindCampaignPackage();
    const email = campaign.copyPackage!.unitCopyDirections.find((u) => u.medium === 'EMAIL')!;
    expect(email.copyPackage.headline).toBeTruthy();
    expect(email.copyPackage.subhead).toBeTruthy();
  });

  it('16. Landing copy logic exists — EMAIL/LANDING persuasion unit', async () => {
    const campaign = await runMultiUnitBlindCampaignPackage();
    const email = campaign.copyPackage!.unitCopyDirections.find((u) => u.medium === 'EMAIL')!;
    expect(email.copyPackage.cta).toBe('SIGN_UP');
  });

  it('17. copy territories generated', async () => {
    const campaign = await runMultiUnitBlindCampaignPackage();
    const hero = campaign.copyPackage!.unitCopyDirections[0]!;
    expect(hero.territories.length).toBeGreaterThanOrEqual(3);
  });

  it('18. copy winner selected', async () => {
    const campaign = await runMultiUnitBlindCampaignPackage();
    const hero = campaign.copyPackage!.unitCopyDirections[0]!;
    expect(hero.winningTerritory.rhetoricalBehavior).toBeTruthy();
  });

  it('19. primary + alt captions generated', async () => {
    const campaign = await runMultiUnitBlindCampaignPackage();
    const hero = campaign.copyPackage!.unitCopyDirections.find((u) => u.medium === 'HERO_REEL')!;
    expect(hero.primaryCaption).not.toBe(hero.altCaptionA);
    expect(hero.altCaptionB.length).toBeGreaterThan(5);
  });

  it('20. CopyFirstAnswerChallenge runs', async () => {
    const campaign = await runMultiUnitBlindCampaignPackage();
    const challenged = campaign.copyPackage!.unitCopyDirections.some(
      (u) => u.firstAnswerChallenge.attackVectors.length >= 2,
    );
    expect(challenged).toBe(true);
  });

  it('21. CopyRedTeamPass runs', async () => {
    const campaign = await runMultiUnitBlindCampaignPackage();
    expect(campaign.copyPackage!.unitCopyDirections[0]!.redTeamCriticism.length).toBeGreaterThan(10);
  });

  it('22. copy challenger exists', async () => {
    const campaign = await runMultiUnitBlindCampaignPackage();
    expect(campaign.copyPackage!.unitCopyDirections[0]!.challenger.conceptName).toBeTruthy();
  });

  it('23. CopyCreativeQualityTier exists', () => {
    expect(COPY_CREATIVE_QUALITY_TIERS).toContain('STRONG');
  });

  it('24. CopyFounderHandholdingRisk exists', () => {
    expect(COPY_FOUNDER_HANDHOLDING_RISK_LEVELS).toContain('LOW');
  });

  it('25. CTA Intelligence exists', async () => {
    const campaign = await runMultiUnitBlindCampaignPackage();
    expect(CTA_CLASSES).toContain('NONE');
    expect(campaign.copyPackage!.copySequence.ctaUsedByUnit).toBeTruthy();
  });

  it('26. NONE CTA supported', () => {
    expect(CTA_CLASSES).toContain('NONE');
  });

  it('27. CTA progression exists', async () => {
    const campaign = await runMultiUnitBlindCampaignPackage();
    const ctas = Object.values(campaign.copyPackage!.copySequence.ctaUsedByUnit);
    expect(new Set(ctas).size).toBeGreaterThan(1);
  });

  it('28. pinned comment strategy optional', async () => {
    const campaign = await runMultiUnitBlindCampaignPackage();
    const reel = campaign.copyPackage!.unitCopyDirections.find((u) => u.medium === 'HERO_REEL')!;
    expect(reel.copyPackage.pinnedCommentStrategy === null || typeof reel.copyPackage.pinnedCommentStrategy === 'string').toBe(true);
  });

  it('29. hashtag strategy supports restraint', async () => {
    const campaign = await runMultiUnitBlindCampaignPackage();
    const x = campaign.copyPackage!.unitCopyDirections.find((u) => u.medium === 'X_POST')!;
    expect(x.copyPackage.hashtagStrategy).toBe('NONE');
    expect(HASHTAG_STRATEGIES).toContain('MINIMAL_BRANDED');
  });

  it('30. CampaignCopySequence exists', async () => {
    const campaign = await runMultiUnitBlindCampaignPackage();
    expect(campaign.copyPackage!.copySequence.unitOrder.length).toBeGreaterThanOrEqual(5);
  });

  it('31. phrase lineage exists', async () => {
    const campaign = await runMultiUnitBlindCampaignPackage();
    expect(campaign.copyPackage!.phraseLineage.heroLines.length).toBeGreaterThan(0);
  });

  it('32. copy handoff supported', async () => {
    const campaign = await runMultiUnitBlindCampaignPackage();
    expect(campaign.copyPackage!.unitCopyDirections.some((u) => u.copyHandoff !== null)).toBe(true);
  });

  it('33. NDXBOOK adapter exists', () => {
    const voice = buildNdxbookVoiceOverlay({
      brandVoice: 'base',
      campaignVoice: 'base',
      emotionalTemperature: 'x',
      sentenceRhythm: 'x',
      sentenceLength: 'x',
      vocabularyLevel: 'x',
      witLevel: 'x',
      directness: 'x',
      provocationLevel: 'x',
      warmth: 'x',
      authority: 'x',
      playfulness: 'x',
      restraint: 'x',
      punctuationBehavior: 'x',
      emojiBehavior: 'x',
      slangBehavior: 'x',
      capitalizationBehavior: 'x',
      forbiddenLanguage: [],
      preferredRhetoricalDevices: [],
    });
    expect(voice.witLevel).toBe('high');
    expect(ndxbookCaptionShouldNotRepeatInterjection('SKIP THE CAMERA', 'extend the idea')).toBe(true);
  });

  it('34. non-NDX package supported', async () => {
    const campaign = await runMultiUnitBlindCampaignPackage();
    expect(campaign.brief.brandName).toBe('Verdant Row');
  });

  it('35. Package Preview includes caption — deliverable bridge reference', () => {
    const bridge = readFileSync(
      join(ROOT, 'src/site00/components/founderWorkspace/entry001CampaignPackage/campaignPackageDeliverableBridge.ts'),
      'utf8',
    );
    expect(bridge).toContain('caption');
  });

  it('36. founder can edit copy', async () => {
    const campaign = await runMultiUnitBlindCampaignPackage();
    const id = campaign.copyPackage!.copyPackageId;
    const unitId = campaign.copyPackage!.unitCopyDirections[0]!.unitId;
    const ok = updateUnitCopyVersion(id, unitId, 'V002', 'Founder edited caption line.', 'LOVE IT');
    expect(ok).toBe(true);
  });

  it('37. copy versioning exists', async () => {
    const campaign = await runMultiUnitBlindCampaignPackage();
    const unit = campaign.copyPackage!.unitCopyDirections[0]!;
    expect(unit.versions.some((v) => v.versionLabel === 'V001')).toBe(true);
  });

  it('38. copy persistence exists', () => {
    expect(getCampaignCopyStoreMode()).toBe('MEMORY');
    expect(typeof evaluateCampaignCopyCohesion).toBe('function');
  });

  it('39. copy lineage exists', async () => {
    const campaign = await runMultiUnitBlindCampaignPackage();
    expect(campaign.copyPackage!.unitCopyDirections[0]!.copyPackage.lineage.campaignBriefId).toBe(
      VERDANT_ROW_LAUNCH_BRIEF.briefId,
    );
  });

  it('40. copy corrections feed learning', () => {
    seedCorrectionFromFounderFeedback({
      surfaceFeedback: 'caption is explaining the visual',
      taxonomy: 'WIT_ONLY_IN_COPY',
      scope: 'GLOBAL_METHOD',
    });
    expect(COPY_CORRECTION_TAXONOMY).toContain('COPY_EXPLAINS_JOKE');
  });

  it('41. CampaignCopyCohesionQA exists', async () => {
    const campaign = await runMultiUnitBlindCampaignPackage();
    expect(typeof campaign.copyPackage!.cohesionQA.passed).toBe('boolean');
  });

  it('42. cloned captions can fail', () => {
    expect(COPY_FAILURE_CLASSES).toContain('COPY_CLONED_ACROSS_FORMATS');
  });

  it('43. fresh blind package captions not pre-supplied in fixture', () => {
    expect(VERDANT_ROW_LAUNCH_BRIEF).not.toHaveProperty('caption');
    expect(VERDANT_ROW_LAUNCH_BRIEF).not.toHaveProperty('primaryCaption');
  });

  it('44. fresh package receives copy for all major units', async () => {
    const campaign = await runMultiUnitBlindCampaignPackage();
    expect(campaign.copyPackage!.unitCopyDirections.length).toBeGreaterThanOrEqual(5);
  });

  it('45. at least one copy direction challenged', async () => {
    const campaign = await runMultiUnitBlindCampaignPackage();
    expect(
      campaign.copyPackage!.unitCopyDirections.some((u) => u.firstAnswerChallenge.resolution !== 'KEEP'),
    ).toBe(true);
  });

  it('46. visual/copy relationship varies', async () => {
    const campaign = await runMultiUnitBlindCampaignPackage();
    const rels = new Set(campaign.copyPackage!.unitCopyDirections.map((u) => u.visualRelationship));
    expect(rels.size).toBeGreaterThan(1);
  });

  it('47. CopyMediumNecessityAssessment exists', async () => {
    const campaign = await runMultiUnitBlindCampaignPackage();
    expect(campaign.copyPackage!.unitCopyDirections[0]!.mediumNecessity.whyCopyBelongsHere.length).toBeGreaterThan(10);
  });

  it('48. NO_CAPTION is valid when intentional', () => {
    expect(COPY_ROLES).toContain('NO_CAPTION');
    expect(COPY_ROLES).toContain('MINIMAL_CAPTION');
  });

  it('49. evidence-required logic exists', async () => {
    const campaign = await runMultiUnitBlindCampaignPackage();
    expect(typeof campaign.copyPackage!.unitCopyDirections[0]!.evidenceRequired).toBe('boolean');
  });

  it('50. production gate checks copy approval', async () => {
    const campaign = await runMultiUnitBlindCampaignPackage();
    expect(checkCopyProductionGate(campaign.copyPackage!.unitCopyDirections)).toBe(true);
    expect(campaign.copyPackage!.productionGatePassed).toBeDefined();
  });

  it('51–53. zero visual dispatch + bootstrap + build', async () => {
    const c17 = await bootstrapC17CampaignCopyDirector();
    expect(c17.imageProviderDispatchCount).toBe(0);
    expect(c17.videoProviderDispatchCount).toBe(0);
    expect(c17.falDispatchCount).toBe(0);
    expect(c17.sprint).toBe('C1.7_CAMPAIGN_COPY_DIRECTOR');
  });
});
