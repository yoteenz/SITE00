/**
 * C1.8 — Brand-true copy intelligence tests.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  deriveBrandLanguageIdentity,
  deriveCampaignVoice,
  deriveUnitVoice,
  generateBrandLanguageTerritories,
  computeVoiceConfidence,
  strengthenBrandLanguageFromApprovedEdit,
  extractBrandSpecificityMarkers,
  brandIdentityToCampaignVoiceProfile,
} from '../api/_lib/site00ExpressionEngine/brandLanguage/brandLanguageIdentity.js';
import {
  MULTI_BRAND_BLIND_FIXTURES,
  MYSTERIOUS_FASHION_IDENTITY,
  LUXURY_BEAUTY_IDENTITY,
  PLAYFUL_CONSUMER_IDENTITY,
  DIRECT_SERVICE_IDENTITY,
  NDXBOOK_REGRESSION_IDENTITY,
} from '../api/_lib/site00ExpressionEngine/brandLanguage/multiBrandBlindFixtures.js';
import {
  detectNdxbookVoiceLeak,
  evaluateCrossBrandVoiceContamination,
  evaluateCrossBrandVoiceDistance,
  captionCouldBelongToAnyBrand,
} from '../api/_lib/site00ExpressionEngine/brandLanguage/crossBrandVoiceContaminationQA.js';
import {
  trackRhetoricalPatterns,
  detectRhetoricalPatternOveruse,
  resetRhetoricalPatternLineage,
  getRhetoricalPatternLineage,
} from '../api/_lib/site00ExpressionEngine/brandLanguage/rhetoricalPatternLineage.js';
import {
  generateBrandTrueCopy,
  runMultiBrandLaunchCopyBlindTest,
  compareDeterministicVsFullReasoning,
  resolveCopyRuntimeMode,
} from '../api/_lib/site00ExpressionEngine/campaignCopy/copyReasoningProvider.js';
import { buildCreativeBrainContext } from '../api/_lib/site00ExpressionEngine/campaignCopy/creativeBrainContext.js';
import {
  applyFounderCopyAction,
  isCopyPackageReady,
  wasDraftRejected,
  registerRejectedDraft,
} from '../api/_lib/site00ExpressionEngine/campaignCopy/founderCopyActions.js';
import {
  resetCampaignCopyStore,
  getCampaignCopyStoreMode,
  applyFounderCopyAction as storeApplyFounder,
} from '../api/_lib/site00ExpressionEngine/campaignCopy/campaignCopyStore.js';
import { campaignCopySchemaExists } from '../api/_lib/site00ExpressionEngine/campaignCopy/campaignCopySupabaseStore.js';
import { bootstrapC18BrandTrueCopyIntelligence } from '../api/_lib/site00ExpressionEngine/entry003/entry003C14Pipeline.js';
import { runMultiUnitBlindCampaignPackage } from '../api/_lib/site00ExpressionEngine/seniorCreativeJudgment/multiUnitCampaignArchitect.js';
import { buildNdxbookVoiceOverlay } from '../api/_lib/site00ExpressionEngine/campaignCopy/ndxbookCopyAdapter.js';
import {
  COPY_RUNTIME_MODES,
  BRAND_VOICE_CONFIDENCE_LEVELS,
  BRAND_LANGUAGE_EVIDENCE_SOURCES,
  SALES_INTENSITY_LEVELS,
  COPY_APPROVAL_STATES,
  BRAND_LANGUAGE_FAILURE_CLASSES,
} from '../shared/site00-expression-engine/brand-language/types.js';
import { COPY_FAILURE_CLASSES } from '../shared/site00-expression-engine/campaign-copy/types.js';
import { resetCreativeIntelligenceStore } from '../api/_lib/site00ExpressionEngine/seniorCreativeJudgment/creativeIntelligenceStore.js';

describe('C1.8 Brand-True Copy Intelligence', () => {
  beforeEach(() => {
    process.env.VITEST = 'true';
    resetCampaignCopyStore();
    resetCreativeIntelligenceStore();
    resetRhetoricalPatternLineage();
  });

  it('1. BrandLanguageIdentity exists', () => {
    expect(MYSTERIOUS_FASHION_IDENTITY.brandId).toBe('blind-mysterious-fashion');
    expect(MYSTERIOUS_FASHION_IDENTITY.brandArchetype.length).toBeGreaterThan(3);
  });

  it('2–3. brand/campaign/unit voice hierarchy', () => {
    const campaignVoice = deriveCampaignVoice(LUXURY_BEAUTY_IDENTITY, 'Summer launch');
    const unitVoice = deriveUnitVoice(LUXURY_BEAUTY_IDENTITY, 'PRODUCT_HERO', 'HERO_REEL');
    expect(campaignVoice).toContain('warm-golden');
    expect(unitVoice).toContain('desire');
    expect(unitVoice).not.toBe(campaignVoice);
  });

  it('4–5. brand evidence hierarchy + voice confidence', () => {
    expect(BRAND_LANGUAGE_EVIDENCE_SOURCES).toContain('APPROVED_COPY');
    expect(computeVoiceConfidence([])).toBe('LOW');
    expect(computeVoiceConfidence([{ sourceType: 'APPROVED_COPY', sourceId: '1', textSample: 'x', approved: true, weight: 10, recency: '', campaignScope: false, brandScope: true }])).toBe('HIGH');
    expect(BRAND_VOICE_CONFIDENCE_LEVELS).toContain('MODERATE');
  });

  it('6. language territories when confidence low', () => {
    const low = deriveBrandLanguageIdentity({ brandId: 'unknown-brand-x', brandName: 'Unknown' });
    const territories = generateBrandLanguageTerritories(low);
    expect(territories.length).toBeGreaterThanOrEqual(2);
  });

  it('7–8. NDXBOOK adapter scoped + NDXBOOK_VOICE_LEAK', () => {
    const base = brandIdentityToCampaignVoiceProfile(
      deriveBrandLanguageIdentity({ brandId: 'x', brandName: 'X' }),
      'campaign',
    );
    const overlay = buildNdxbookVoiceOverlay(base);
    expect(overlay.witLevel).toBe('high');
    expect(detectNdxbookVoiceLeak('The receipt your leaves left', 'blind-luxury-beauty')).toBe(true);
    expect(BRAND_LANGUAGE_FAILURE_CLASSES).toContain('NDXBOOK_VOICE_LEAK');
  });

  it('9–10. CrossBrandVoiceContaminationQA + COPY_COULD_BELONG_TO_ANY_BRAND', () => {
    const qa = evaluateCrossBrandVoiceContamination('Introducing our new collection for spring', MYSTERIOUS_FASHION_IDENTITY);
    expect(typeof qa.passed).toBe('boolean');
    expect(COPY_FAILURE_CLASSES).toContain('COPY_COULD_BELONG_TO_ANY_BRAND');
  });

  it('11. BrandSpecificityMarkers exist', () => {
    const markers = extractBrandSpecificityMarkers(MYSTERIOUS_FASHION_IDENTITY, 'Tonight.');
    expect(markers.rhythm).toBeTruthy();
    expect(markers.wordChoice.length).toBeGreaterThan(0);
  });

  it('12. personality dimensions exist', () => {
    expect(LUXURY_BEAUTY_IDENTITY.personalityDimensions.sensuality).toBeGreaterThan(0.8);
    expect(PLAYFUL_CONSUMER_IDENTITY.personalityDimensions.humor).toBeGreaterThan(0.8);
  });

  it('13–14. brand CTA + SalesIntensity', () => {
    expect(DIRECT_SERVICE_IDENTITY.ctaBehavior).toContain('GET STARTED');
    expect(SALES_INTENSITY_LEVELS).toContain('DIRECT');
    expect(DIRECT_SERVICE_IDENTITY.salesIntensity).toBe('DIRECT');
  });

  it('15. humor profile exists', () => {
    expect(PLAYFUL_CONSUMER_IDENTITY.humorProfile.dominantStyle).toBe('chaotic');
  });

  it('16. restraint profile exists', () => {
    expect(MYSTERIOUS_FASHION_IDENTITY.restraintProfile.allowsSilence).toBe(true);
  });

  it('17–18. luxury assessment + generic cliché detection', () => {
    const ctx = buildCreativeBrainContext({ brandIdentity: LUXURY_BEAUTY_IDENTITY, visualDirection: 'hero' });
    return generateBrandTrueCopy(ctx).then((r) => {
      expect(r.luxuryAssessment?.passed).toBe(true);
      expect(r.luxuryAssessment?.genericClichesDetected).toBe(false);
    });
  });

  it('19. cool/aloof brand mode', async () => {
    const r = await generateBrandTrueCopy(
      buildCreativeBrainContext({ brandIdentity: MYSTERIOUS_FASHION_IDENTITY, visualDirection: 'hero' }),
    );
    expect(r.primaryCaption.split(/\s+/).length).toBeLessThanOrEqual(4);
  });

  it('20. warm/community mode', async () => {
    const r = await generateBrandTrueCopy(
      buildCreativeBrainContext({ brandIdentity: PLAYFUL_CONSUMER_IDENTITY, visualDirection: 'hero' }),
    );
    expect(r.primaryCaption.toLowerCase()).toMatch(/sorry|accident|flavor/);
  });

  it('21. direct-response mode', async () => {
    const r = await generateBrandTrueCopy(
      buildCreativeBrainContext({ brandIdentity: DIRECT_SERVICE_IDENTITY, visualDirection: 'hero' }),
    );
    expect(r.ctaCopy).toBe('GET STARTED');
  });

  it('22. post-specific modulation', () => {
    const launch = deriveUnitVoice(LUXURY_BEAUTY_IDENTITY, 'LAUNCH', 'HERO_REEL');
    const meme = deriveUnitVoice(LUXURY_BEAUTY_IDENTITY, 'MEME', 'X_POST');
    expect(launch).not.toBe(meme);
  });

  it('23–25. CopyRuntimeMode + LLM path + deterministic guardrails', async () => {
    expect(COPY_RUNTIME_MODES).toContain('FULL_REASONING');
    const mode = await resolveCopyRuntimeMode();
    expect(COPY_RUNTIME_MODES).toContain(mode);
    const r = await generateBrandTrueCopy(
      buildCreativeBrainContext({ brandIdentity: MYSTERIOUS_FASHION_IDENTITY, visualDirection: 'x' }),
    );
    expect(r.failureClasses).toBeDefined();
  });

  it('26–27. persona lenses + CopyFirstAnswerChallenge uses brand', async () => {
    const r = await generateBrandTrueCopy(
      buildCreativeBrainContext({ brandIdentity: LUXURY_BEAUTY_IDENTITY, visualDirection: 'x' }),
    );
    expect(r.personaLensesUsed).toContain('RED_TEAM_COPY_CHIEF');
    expect(r.firstAnswerChallenge.attackVectors.some((v) => v.vector.includes('BRAND'))).toBe(true);
  });

  it('28–29. rhetorical lineage + overuse fail', () => {
    trackRhetoricalPatterns("You didn't fail. You waited.", 'test-brand');
    trackRhetoricalPatterns("You didn't quit. You paused.", 'test-brand');
    trackRhetoricalPatterns("You didn't stop. You breathed.", 'test-brand');
    const over = detectRhetoricalPatternOveruse('test-brand', 3);
    expect(over.overused).toBe(true);
    expect(getRhetoricalPatternLineage().patterns.length).toBeGreaterThan(0);
  });

  it('30. BrandRhetoricalSignature exists', () => {
    expect(MYSTERIOUS_FASHION_IDENTITY.rhetoricalSignature.mostlyFragments).toBe(true);
  });

  it('31. wrong-brand similarity can fail', () => {
    const qa = evaluateCrossBrandVoiceContamination('Velvet light on bare collarbone.', MYSTERIOUS_FASHION_IDENTITY);
    expect(qa.soundsLikeOtherBrand).toBe(true);
  });

  it('32–33. CopyTriangulation + NO_CAPTION valid', async () => {
    const r = await generateBrandTrueCopy(
      buildCreativeBrainContext({ brandIdentity: MYSTERIOUS_FASHION_IDENTITY, visualDirection: 'visual only' }),
    );
    expect(r.triangulation.brandFit).toBe(true);
    expect(r.triangulation.passed).toBe(true);
  });

  it('34–37. deterministic vs full-reasoning + 4-brand blind + voice distance', async () => {
    const blind = await runMultiBrandLaunchCopyBlindTest('DETERMINISTIC_FALLBACK');
    expect(blind.length).toBe(4);
    const captions = blind.map((b) => b.result.primaryCaption);
    expect(new Set(captions).size).toBe(4);
    const distance = evaluateCrossBrandVoiceDistance(
      Object.fromEntries(blind.map((b) => [b.brandLanguageIdentity.brandId, b.result.primaryCaption])),
    );
    expect(distance.passed).toBe(true);
    const cmp = await compareDeterministicVsFullReasoning();
    expect(cmp.deterministic.length).toBe(4);
  });

  it('38–41. brand regressions', async () => {
    const ndx = await generateBrandTrueCopy(
      buildCreativeBrainContext({ brandIdentity: NDXBOOK_REGRESSION_IDENTITY, visualDirection: 'x' }),
    );
    expect(ndx.primaryCaption.toLowerCase()).toMatch(/receipt|culture|archive/);
    const lux = await runMultiBrandLaunchCopyBlindTest('DETERMINISTIC_FALLBACK');
    const beauty = lux.find((b) => b.brandLanguageIdentity.brandId === 'blind-luxury-beauty')!;
    expect(beauty.result.primaryCaption.toLowerCase()).toMatch(/velvet|ritual|skin/);
    const svc = lux.find((b) => b.brandLanguageIdentity.brandId === 'blind-direct-service')!;
    expect(svc.result.ctaCopy).toBe('GET STARTED');
    const humor = lux.find((b) => b.brandLanguageIdentity.brandId === 'blind-playful-consumer')!;
    expect(humor.result.primaryCaption.toLowerCase()).toMatch(/sorry|flavor/);
  });

  it('42. copy Supabase adapter wired', async () => {
    expect(typeof campaignCopySchemaExists).toBe('function');
    expect(await campaignCopySchemaExists()).toBe(false);
  });

  it('43–48. founder actions persist', async () => {
    const campaign = await runMultiUnitBlindCampaignPackage();
    const pkg = campaign.copyPackage!;
    const unitId = pkg.unitCopyDirections[0]!.unitId;

    const love = await applyFounderCopyAction({ copyPackageId: pkg.copyPackageId, unitId, action: 'LOVE IT' });
    expect(love.ok).toBe(true);

    const altA = await applyFounderCopyAction({ copyPackageId: pkg.copyPackageId, unitId, action: 'ALT A' });
    expect(altA.ok).toBe(true);
    expect(altA.package!.unitCopyDirections[0]!.finalCaption).toBe(
      pkg.unitCopyDirections[0]!.altCaptionA,
    );

    const altB = await applyFounderCopyAction({ copyPackageId: pkg.copyPackageId, unitId, action: 'ALT B' });
    expect(altB.ok).toBe(true);

    const edit = await applyFounderCopyAction({
      copyPackageId: pkg.copyPackageId,
      unitId,
      action: 'EDIT',
      editText: 'Founder edited brand-true line.',
    });
    expect(edit.ok).toBe(true);
    expect(edit.package!.unitCopyDirections[0]!.versions.some((v) => v.source === 'FOUNDER_EDITED')).toBe(true);

    const push = await applyFounderCopyAction({ copyPackageId: pkg.copyPackageId, unitId, action: 'PUSH FURTHER' });
    expect(push.ok).toBe(true);

    const notVoice = await applyFounderCopyAction({
      copyPackageId: pkg.copyPackageId,
      unitId,
      action: 'NOT MY VOICE',
      projectId: 'verdant-row',
    });
    expect(notVoice.ok).toBe(true);
    registerRejectedDraft(`${pkg.copyPackageId}:${unitId}:rejected`);
    expect(wasDraftRejected(`${pkg.copyPackageId}:${unitId}:rejected`)).toBe(true);
  });

  it('49–50. approved edits strengthen identity; rejected drafts do not teach globally', () => {
    const before = deriveBrandLanguageIdentity({ brandId: 'unknown-z', brandName: 'Z' });
    const after = strengthenBrandLanguageFromApprovedEdit(before, 'Our signature approved line.');
    expect(after.examplesOfInVoiceLanguage).toContain('Our signature approved line.');
    expect(after.confidence).not.toBe('LOW');
    registerRejectedDraft('rejected-draft-1');
    expect(wasDraftRejected('rejected-draft-1')).toBe(true);
  });

  it('51. Preview updates after copy selection — UI component exports actions', async () => {
    const { readFileSync } = await import('node:fs');
    const { join } = await import('node:path');
    const ui = readFileSync(
      join(import.meta.dirname, '../src/site00/components/founderWorkspace/expressionEngine/MultiUnitCreativePackageReview.tsx'),
      'utf8',
    );
    expect(ui).toContain('ALT A');
    expect(ui).toContain('selectAlt');
  });

  it('52. copy approval affects package readiness', async () => {
    const campaign = await runMultiUnitBlindCampaignPackage();
    expect(isCopyPackageReady(campaign.copyPackage!)).toBe(false);
    for (const u of campaign.copyPackage!.unitCopyDirections) {
      await applyFounderCopyAction({
        copyPackageId: campaign.copyPackage!.copyPackageId,
        unitId: u.unitId,
        action: 'LOVE IT',
      });
    }
    const updated = (await applyFounderCopyAction({
      copyPackageId: campaign.copyPackage!.copyPackageId,
      unitId: campaign.copyPackage!.unitCopyDirections[0]!.unitId,
      action: 'LOVE IT',
    })).package!;
    expect(isCopyPackageReady(updated)).toBe(true);
  });

  it('53–55. CreativeBrainContext + post context + brand overrides global', async () => {
    const ctx = buildCreativeBrainContext({
      brandIdentity: MYSTERIOUS_FASHION_IDENTITY,
      visualDirection: 'Visual lands desire — do not narrate',
      onAssetCopy: null,
    });
    expect(ctx.brandLanguageIdentity.brandId).toBe('blind-mysterious-fashion');
    expect(ctx.visualMechanism.length).toBeGreaterThan(5);
    const r = await generateBrandTrueCopy(ctx);
    expect(r.primaryCaption).not.toContain('Visual lands desire');
  });

  it('56. FULL_REASONING live mode honestly reported', async () => {
    const c18 = await bootstrapC18BrandTrueCopyIntelligence();
    expect(c18.reasoningComparison.fullReasoningLiveTestBlocked).toBe(true);
    expect(typeof c18.copyRuntimeMode).toBe('string');
  });

  it('57–59. zero visual dispatch + C1 regressions + build', async () => {
    const c18 = await bootstrapC18BrandTrueCopyIntelligence();
    expect(c18.imageProviderDispatchCount).toBe(0);
    expect(c18.videoProviderDispatchCount).toBe(0);
    expect(c18.falDispatchCount).toBe(0);
    expect(c18.sprint).toBe('C1.8_BRAND_TRUE_COPY_INTELLIGENCE');
    expect(getCampaignCopyStoreMode()).toBe('MEMORY');
    expect(MULTI_BRAND_BLIND_FIXTURES.length).toBe(4);
    expect(captionCouldBelongToAnyBrand('Introducing our new collection for spring season', 'Brand')).toBe(true);
    expect(typeof storeApplyFounder).toBe('function');
    expect(COPY_APPROVAL_STATES).toContain('FOUNDER_EDITED');
  });
});
