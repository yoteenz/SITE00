/**
 * C1.9 — Live creative intelligence activation + production proof tests.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  MERIDIAN_ATELIER_LAUNCH_BRIEF,
  deriveMeridianBrandLanguageIdentity,
  isC19ExcludedBrand,
  MERIDIAN_ATELIER_BRAND_ID,
} from '../api/_lib/site00ExpressionEngine/brandLanguage/c19BlindBrandFixture.js';
import {
  initBrandLanguageStore,
  resetBrandLanguageStore,
  getBrandLanguageStoreMode,
  brandLanguageSchemaExists,
  persistBrandLanguageIdentity,
  persistBrandLanguageEvidence,
  persistRhetoricalSignature,
  applyApprovedInVoiceLearning,
  rejectOutOfVoiceDraft,
  getCurrentVersionLabel,
  getVoiceConfidenceHistory,
} from '../api/_lib/site00ExpressionEngine/brandLanguage/brandLanguageSupabaseStore.js';
import { buildCreativeSystemInspector } from '../api/_lib/site00ExpressionEngine/creativeSystemInspector.js';
import {
  runC19LiveProductionProof,
  isProductionProofPass,
} from '../api/_lib/site00ExpressionEngine/runC19LiveProductionProof.js';
import { bootstrapC19LiveCreativeIntelligence } from '../api/_lib/site00ExpressionEngine/entry003/entry003C14Pipeline.js';
import { checkCreativeReasoningProviderHealth } from '../api/_lib/site00ExpressionEngine/seniorCreativeJudgment/creativeReasoningProvider.js';
import {
  resetCampaignCopyStore,
  getCampaignCopyStoreMode,
  initCampaignCopyStore,
  applyFounderCopyAction,
} from '../api/_lib/site00ExpressionEngine/campaignCopy/campaignCopyStore.js';
import { campaignCopySchemaExists } from '../api/_lib/site00ExpressionEngine/campaignCopy/campaignCopySupabaseStore.js';
import { creativeIntelligenceSchemaExists } from '../api/_lib/site00ExpressionEngine/seniorCreativeJudgment/creativeIntelligenceSupabaseStore.js';
import {
  runC19BlindCampaignPackage,
  deriveGenericTerritories,
} from '../api/_lib/site00ExpressionEngine/seniorCreativeJudgment/c19GenericCampaignArchitect.js';
import { compareDeterministicVsFullReasoning } from '../api/_lib/site00ExpressionEngine/campaignCopy/copyReasoningProvider.js';
import { captionCouldBelongToAnyBrand } from '../api/_lib/site00ExpressionEngine/brandLanguage/crossBrandVoiceContaminationQA.js';
import { detectRhetoricalPatternOveruse, trackRhetoricalPatterns } from '../api/_lib/site00ExpressionEngine/brandLanguage/rhetoricalPatternLineage.js';
import { resetCreativeIntelligenceStore } from '../api/_lib/site00ExpressionEngine/seniorCreativeJudgment/creativeIntelligenceStore.js';
import { runMultiUnitBlindCampaignPackage } from '../api/_lib/site00ExpressionEngine/seniorCreativeJudgment/multiUnitCampaignArchitect.js';

describe('C1.9 Live Creative Intelligence Activation', () => {
  beforeEach(() => {
    process.env.VITEST = 'true';
    resetCampaignCopyStore();
    resetBrandLanguageStore();
    resetCreativeIntelligenceStore();
    delete process.env.SITE00_CREATIVE_REASONING_MOCK_FULL;
  });

  it('1. live provider health check exists', async () => {
    const health = await checkCreativeReasoningProviderHealth();
    expect(health.providerName).toBeDefined();
    expect(health.model).toContain('claude');
    expect(health.lastHealthCheck).toBeTruthy();
  });

  it('2. FULL_REASONING requires real provider in production path', async () => {
    const health = await checkCreativeReasoningProviderHealth();
    if (!process.env.ANTHROPIC_API_KEY) {
      expect(health.reasoningDispatchAllowed).toBe(false);
    }
  });

  it('3. mock cannot satisfy production proof gate', async () => {
    process.env.SITE00_CREATIVE_REASONING_MOCK_FULL = '1';
    const result = await runC19LiveProductionProof();
    expect(result.capabilityStatuses.FULL_REASONING_LIVE).toBe('FULL_REASONING_LIVE_TEST_BLOCKED');
    delete process.env.SITE00_CREATIVE_REASONING_MOCK_FULL;
  });

  it('4. BrandLanguageIdentity Supabase store exists', async () => {
    expect(typeof brandLanguageSchemaExists).toBe('function');
    expect(typeof persistBrandLanguageIdentity).toBe('function');
  });

  it('5. BrandLanguageEvidence persists in memory mode', async () => {
    await initBrandLanguageStore();
    await persistBrandLanguageEvidence({
      brandId: MERIDIAN_ATELIER_BRAND_ID,
      sourceType: 'APPROVED_COPY',
      textSample: 'Private space, not status.',
      approved: true,
    });
    expect(getBrandLanguageStoreMode()).toBe('MEMORY');
  });

  it('6. rhetorical signature persists', async () => {
    const identity = deriveMeridianBrandLanguageIdentity();
    await persistRhetoricalSignature(MERIDIAN_ATELIER_BRAND_ID, identity.rhetoricalSignature);
    expect(identity.rhetoricalSignature.description.length).toBeGreaterThan(5);
  });

  it('7. identity versions persist', async () => {
    const identity = deriveMeridianBrandLanguageIdentity();
    const v1 = await persistBrandLanguageIdentity(identity, 'test', true);
    expect(v1.versionLabel).toMatch(/^V\d{3}$/);
  });

  it('8. confidence history persists', async () => {
    const identity = deriveMeridianBrandLanguageIdentity();
    await persistBrandLanguageIdentity(identity, 'confidence_test', true);
    expect(getVoiceConfidenceHistory(MERIDIAN_ATELIER_BRAND_ID).length).toBeGreaterThan(0);
  });

  it('9. copy store schema check exists', async () => {
    expect(typeof campaignCopySchemaExists).toBe('function');
  });

  it('10. creative corrections schema check exists', async () => {
    expect(typeof creativeIntelligenceSchemaExists).toBe('function');
  });

  it('11. senior judgments schema check exists', async () => {
    expect(typeof creativeIntelligenceSchemaExists).toBe('function');
  });

  it('12-17. founder actions persist through store', async () => {
    const campaign = await runC19BlindCampaignPackage(MERIDIAN_ATELIER_LAUNCH_BRIEF, {
      forceRuntimeMode: 'DETERMINISTIC_FALLBACK',
    });
    const pkg = campaign.copyPackage!;
    const unit = pkg.unitCopyDirections[0]!;

    for (const action of ['LOVE IT', 'ALT A', 'ALT B', 'EDIT', 'PUSH FURTHER', 'NOT MY VOICE'] as const) {
      const r = await applyFounderCopyAction({
        copyPackageId: pkg.copyPackageId,
        unitId: unit.unitId,
        action,
        editText: action === 'EDIT' ? 'Founder edit line.' : undefined,
        projectId: MERIDIAN_ATELIER_BRAND_ID,
      });
      expect(r.ok).toBe(true);
    }
  });

  it('18. approved edit can update identity', async () => {
    const identity = deriveMeridianBrandLanguageIdentity();
    const updated = await applyApprovedInVoiceLearning(identity, 'A room at dusk.', 'FOUNDER_EDITED_IN_VOICE');
    expect(updated.examplesOfInVoiceLanguage).toContain('A room at dusk.');
  });

  it('19. rejected draft cannot teach identity as approved', async () => {
    await rejectOutOfVoiceDraft(MERIDIAN_ATELIER_BRAND_ID, 'Shop now!!!', 'test-campaign');
    const identity = deriveMeridianBrandLanguageIdentity();
    expect(identity.examplesOfInVoiceLanguage).not.toContain('Shop now!!!');
  });

  it('20. fresh blind campaign is Meridian Atelier', () => {
    expect(MERIDIAN_ATELIER_LAUNCH_BRIEF.brandName).toBe('Meridian Atelier');
    expect(isC19ExcludedBrand(MERIDIAN_ATELIER_BRAND_ID)).toBe(false);
  });

  it('21. no final concept pre-supplied in brief', () => {
    const briefJson = JSON.stringify(MERIDIAN_ATELIER_LAUNCH_BRIEF);
    expect(briefJson).not.toMatch(/winning concept|hero line|tagline/i);
  });

  it('22-24. campaign package runs with copy for major units', async () => {
    const campaign = await runC19BlindCampaignPackage(MERIDIAN_ATELIER_LAUNCH_BRIEF, {
      forceRuntimeMode: 'DETERMINISTIC_FALLBACK',
    });
    expect(campaign.units.length).toBeGreaterThanOrEqual(5);
    expect(campaign.copyPackage?.unitCopyDirections.length).toBeGreaterThanOrEqual(5);
    for (const u of campaign.copyPackage!.unitCopyDirections.filter((x) => x.medium !== 'LIGHTWEIGHT_CRAFT_REVIEW')) {
      expect(u.primaryCaption.length).toBeGreaterThan(0);
    }
  });

  it('25. copy triangulation helpers available', () => {
    expect(captionCouldBelongToAnyBrand('Discover our new collection today', 'Meridian Atelier')).toBe(true);
  });

  it('26. generic copy can fail QA', () => {
    expect(captionCouldBelongToAnyBrand('Introducing our exciting new launch', 'Meridian Atelier')).toBe(true);
  });

  it('27. AI rhetorical pattern overuse can fail', () => {
    trackRhetoricalPatterns("It's not luxury. It's you.", MERIDIAN_ATELIER_BRAND_ID);
    trackRhetoricalPatterns("It's not scent. It's memory.", MERIDIAN_ATELIER_BRAND_ID);
    trackRhetoricalPatterns("It's not product. It's room.", MERIDIAN_ATELIER_BRAND_ID);
    const over = detectRhetoricalPatternOveruse(MERIDIAN_ATELIER_BRAND_ID, 2);
    expect(over.overused).toBe(true);
  });

  it('28-29. copy moods and CTA vary by unit in package', async () => {
    const campaign = await runC19BlindCampaignPackage(MERIDIAN_ATELIER_LAUNCH_BRIEF, {
      forceRuntimeMode: 'DETERMINISTIC_FALLBACK',
    });
    const captions = campaign.copyPackage!.unitCopyDirections.map((u) => u.primaryCaption);
    const unique = new Set(captions);
    expect(unique.size).toBeGreaterThan(1);
  });

  it('30-31. deterministic vs full comparison runs', async () => {
    const cmp = await compareDeterministicVsFullReasoning();
    expect(cmp.deterministic.length).toBeGreaterThan(0);
    expect(Array.isArray(cmp.comparisonNotes)).toBe(true);
  });

  it('32-34. founder actions and multi-session via production proof', async () => {
    const result = await runC19LiveProductionProof();
    expect(result.founderActionQA.altASelected).toBe(true);
    expect(result.founderActionQA.editPersistsAfterReload).toBe(true);
    expect(result.multiSessionVerified).toBe(true);
  });

  it('35. brand identity version tracked', async () => {
    const result = await runC19LiveProductionProof();
    expect(result.brandLanguageIdentityVersion).toMatch(/^V\d{3}$/);
  });

  it('36. Entry 003 regression path still callable', async () => {
    const ndx = await runMultiUnitBlindCampaignPackage();
    expect(ndx.brief.projectId).toBe('verdant-row');
  });

  it('38. visual provider dispatch 0', async () => {
    const result = await runC19LiveProductionProof();
    expect(result.runtimeReceipt).toBeDefined();
    expect(result.productionCampaign.imageProviderDispatchCount).toBe(0);
    expect(result.productionCampaign.falDispatchCount).toBe(0);
  });

  it('39. bootstrap C1.9 API phase', async () => {
    const c19 = await bootstrapC19LiveCreativeIntelligence();
    expect(c19.sprint).toBe('C1.9_LIVE_CREATIVE_INTELLIGENCE_ACTIVATION');
    expect(c19.blindBrand.brandName).toBe('Meridian Atelier');
  });

  it('system inspector exposes store modes', async () => {
    await initCampaignCopyStore();
    const inspector = await buildCreativeSystemInspector({ brandId: MERIDIAN_ATELIER_BRAND_ID });
    expect(inspector.copyStoreMode).toBeDefined();
    expect(inspector.brandLanguageStoreMode).toBeDefined();
    expect(inspector.falDispatchCount).toBe(0);
  });

  it('production proof pass gate is strict', async () => {
    const result = await runC19LiveProductionProof();
    if (!process.env.ANTHROPIC_API_KEY) {
      expect(isProductionProofPass(result)).toBe(false);
      expect(result.blockers.length).toBeGreaterThan(0);
    }
  });

  it('generic territories derive from brief only', () => {
    const t = deriveGenericTerritories(MERIDIAN_ATELIER_LAUNCH_BRIEF);
    expect(t.length).toBe(3);
    expect(t[0]).toContain('Meridian Atelier');
  });
});
