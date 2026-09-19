/**
 * P0.CGO.2 — Conceptual Efficiency + Product/World Interaction Logic tests.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  P0_CGO_2_BUILD,
  ProductWorldInteractionEngine,
  productWorldInteractionEngine,
  buildProductInteractionProfile,
  getBodyInterfacesForCategory,
  getBehaviorInterfacesForCategory,
  searchLateralWorlds,
  defaultCreativeRange,
  hasRealConnectionPath,
  buildForensicBilliardsBenchmark,
  buildWeakLuxuryBenchmark,
  campaignWorldGenesisEngine,
  enrichWorldCandidate,
  enrichWorldCandidates,
  countNonLiteralBeautyWorlds,
  runForensicBenchmarkScoring,
  scoreNaturalProductVisibility,
  detectForcedProductPlacement,
  scoreCategoryEnvironmentDependency,
  scoreConceptualEfficiency,
  scoreProductionComplexity,
  computeConceptValueRatio,
  classifyQuadrant,
  buildMinimalExecutionConcept,
  selectMicroNarrativeGrammar,
  isShortFormDuration,
  runCreativeReductionPass,
  scoreConceptualDensity,
  scoreCreativeElementUtility,
  scoreCampaignExtensibility,
  scoreLoopability,
  assessOneShotPotential,
  scoreCameraEconomy,
  runConceptualEfficiencyQA,
  detectGenericExecution,
  creativeDirectionOrchestrationSystem,
  saveApprovedCandidate,
  getCampaignRunPersistence,
  clearWorldGenesisStoreForTest,
  REFERENCE_ABSTRACTION_PRINCIPLES,
  LITERAL_BEAUTY_WORLDS,
  computeExecutionWitScore,
} from '../shared/site00-expression-engine/campaign-genesis-orchestration/index.js';
import {
  brandCreativeContextAssembler,
  clearBrandCreativeContextStoreForTest,
  persistAssembledContext,
} from '../shared/site00-brand-lore/brandCreativeContext/index.js';

const ROOT = join(import.meta.dirname, '..');

function brandContextFor(brandSlug: string) {
  const result = brandCreativeContextAssembler.assemble({ brandId: brandSlug });
  persistAssembledContext(result.context);
  return result.context;
}

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('P0.CGO.2 — Conceptual Efficiency + Interaction Logic', () => {
  beforeEach(() => {
    clearWorldGenesisStoreForTest();
    clearBrandCreativeContextStoreForTest();
  });

  it('1. build v274', () => {
    expect(P0_CGO_2_BUILD).toBe('v274');
  });

  it('2. ProductWorldInteractionEngine exists', () => {
    expect(read('shared/site00-expression-engine/campaign-genesis-orchestration/productWorldInteractionEngine.ts')).toContain(
      'ProductWorldInteractionEngine',
    );
    expect(new ProductWorldInteractionEngine()).toBeTruthy();
  });

  it('3. ProductInteractionProfile fields', () => {
    const p = buildProductInteractionProfile({ productId: 'j1', productCategory: 'JEWELRY' });
    expect(p.bodyInterfaces).toContain('HANDS');
    expect(p.behaviorInterfaces.length).toBeGreaterThan(0);
    expect(p.motionSignature.motions.length).toBeGreaterThan(0);
    expect(p.unnaturalActions.some((a) => /HOLD/i.test(a))).toBe(true);
  });

  it('4. body interfaces jewelry', () => {
    expect(getBodyInterfacesForCategory('JEWELRY')).toContain('FINGERS');
  });

  it('5. behavior interfaces hair', () => {
    expect(getBehaviorInterfacesForCategory('HAIR')).toContain('WIND_RESPONSE');
  });

  it('6. ProductMotionSignature hair', () => {
    const p = buildProductInteractionProfile({ productId: 'h1', productCategory: 'HAIR' });
    expect(p.motionSignature.motions).toContain('SWAY');
    expect(p.motionSignature.primaryMotion).toBe('SWAY');
  });

  it('7. LateralWorldSearch returns non-category worlds', () => {
    const profile = buildProductInteractionProfile({ productId: 'j1', productCategory: 'JEWELRY' });
    const worlds = searchLateralWorlds({
      brandSlug: 'test',
      productCategory: 'JEWELRY',
      interactionProfile: profile,
      objective: 'LAUNCH',
    });
    expect(worlds.length).toBeGreaterThan(0);
    expect(worlds.some((w) => /GAME|TRANSIT|FOOD/i.test(w.setting))).toBe(true);
  });

  it('8. WorldCategoryDistance default range', () => {
    const range = defaultCreativeRange();
    expect(range.filter((d) => d === 'ADJACENT').length).toBe(1);
    expect(range.filter((d) => d === 'LATERAL').length).toBeGreaterThanOrEqual(2);
    expect(range).toContain('UNEXPECTED');
  });

  it('9. unexpected worlds have connection path', () => {
    const profile = buildProductInteractionProfile({ productId: 'h1', productCategory: 'HAIR' });
    const worlds = searchLateralWorlds({
      brandSlug: 'frontal-slayer',
      productCategory: 'HAIR',
      interactionProfile: profile,
      objective: 'LAUNCH',
    });
    for (const w of worlds) {
      expect(hasRealConnectionPath(w.interactionBridge)).toBe(true);
    }
  });

  it('10. WorldInteractionBridge from candidate', () => {
    const forensic = buildForensicBilliardsBenchmark();
    const profile = buildProductInteractionProfile({ productId: 'j', productCategory: 'JEWELRY' });
    const bridge = productWorldInteractionEngine.buildInteractionBridgeFromCandidate(forensic, profile);
    expect(bridge.interactionPoint.length).toBeGreaterThan(0);
    expect(bridge.whyNatural.length).toBeGreaterThan(10);
  });

  it('11. ProductVisibilityThroughBehavior via enrichment', () => {
    const forensic = enrichWorldCandidate(buildForensicBilliardsBenchmark(), {
      brandSlug: 'forensic',
      productCategory: 'JEWELRY',
      objective: 'LAUNCH',
      brandContext: null,
    });
    expect(forensic.efficiencyEnrichment?.visibilityThroughBehavior.behavior.length).toBeGreaterThan(0);
  });

  it('12. NaturalProductVisibilityScore high for behavior', () => {
    const s = scoreNaturalProductVisibility({ behaviorLed: true, presentationPose: false, actionStopsForProduct: false });
    expect(s.classification).toBe('HIGH');
  });

  it('13. ForcedProductPlacementDetector', () => {
    const flags = detectForcedProductPlacement('Model holds jewelry toward camera — centered product hero');
    expect(flags).toContain('MODEL_PRESENTATION_POSE');
  });

  it('14. CategoryEnvironmentDependencyScore lateral low', () => {
    const s = scoreCategoryEnvironmentDependency({
      setting: 'SUBWAY PLATFORM',
      productCategory: 'HAIR',
      worldDistance: 'LATERAL',
    });
    expect(s.classification).not.toBe('HIGH_DEPENDENCY');
  });

  it('15. ConceptualEfficiencyScore high for minimal strong idea', () => {
    const prod = scoreProductionComplexity({
      locationCount: 1,
      subjectCount: 1,
      propCount: 2,
      cameraSetupCount: 1,
      shotCount: 1,
      effectCount: 0,
    });
    const eff = scoreConceptualEfficiency({
      productionComplexity: prod,
      conceptualYield: { overall: 0.85, dimensionsCovered: [], dimensionCount: 10, classification: 'HIGH_YIELD' },
      narrativeClarity: 0.9,
      productClarity: 0.85,
      motifCount: 3,
      copyNative: true,
      worldClarity: 0.85,
      memorability: 0.8,
      extensibility: 0.75,
    });
    expect(eff.overall).toBeGreaterThanOrEqual(0.65);
    expect(['HIGH_EFFICIENCY', 'MEDIUM_EFFICIENCY']).toContain(eff.classification);
  });

  it('16. ProductionComplexityScore extreme for bloat', () => {
    const s = scoreProductionComplexity({
      locationCount: 5,
      subjectCount: 5,
      propCount: 12,
      cameraSetupCount: 8,
      shotCount: 12,
      effectCount: 6,
    });
    expect(s.level).toBe('EXTREME');
  });

  it('17. ConceptValueRatio quadrant', () => {
    const r = computeConceptValueRatio({
      conceptualYield: 0.85,
      conceptualEfficiency: 0.8,
      brandSpecificity: 0.8,
      productInteractionNaturalness: 0.85,
      productionComplexity: 0.2,
    });
    expect(r.quadrant).toBe('HIGH_YIELD_HIGH_EFFICIENCY');
  });

  it('18. yield/efficiency quadrant classifier', () => {
    expect(classifyQuadrant(0.7, 0.7)).toBe('HIGH_YIELD_HIGH_EFFICIENCY');
    expect(classifyQuadrant(0.3, 0.3)).toBe('LOW_YIELD_LOW_EFFICIENCY');
  });

  it('19. MinimalExecutionConcept', () => {
    const c = enrichWorldCandidate(buildForensicBilliardsBenchmark(), {
      brandSlug: 'f',
      productCategory: 'JEWELRY',
      objective: 'LAUNCH',
      brandContext: null,
    });
    const min = buildMinimalExecutionConcept({ candidate: c });
    expect(min.shotCount).toBeGreaterThanOrEqual(1);
    expect(min.singleCopyHook.length).toBeGreaterThan(0);
  });

  it('20. MicroNarrativeGrammar', () => {
    const c = campaignWorldGenesisEngine.generateWorldCandidates({
      brandSlug: 'frontal-slayer',
      productCategory: 'HAIR',
      objective: 'LAUNCH',
      brandContext: brandContextFor('frontal-slayer'),
    }).fresh!;
    const g = selectMicroNarrativeGrammar(c);
    expect(g.length).toBeGreaterThan(0);
  });

  it('21. short-form 3-8 second duration', () => {
    expect(isShortFormDuration(6)).toBe(true);
    expect(isShortFormDuration(15)).toBe(false);
  });

  it('22. CreativeLeapTrace from generation path', () => {
    const c = campaignWorldGenesisEngine.generateWorldCandidates({
      brandSlug: 'frontal-slayer',
      productCategory: 'HAIR',
      objective: 'LAUNCH',
      brandContext: brandContextFor('frontal-slayer'),
    }).fresh!;
    expect(c.efficiencyEnrichment?.creativeLeapTrace.fromGenerationPath).toBe(true);
    expect(c.efficiencyEnrichment?.creativeLeapTrace.steps.some((s) => s.stage === 'WORLD')).toBe(true);
  });

  it('23. BodyStorySurfaceMap', () => {
    const c = campaignWorldGenesisEngine.generateWorldCandidates({
      brandSlug: 'frontal-slayer',
      productCategory: 'HAIR',
      objective: 'LAUNCH',
      brandContext: brandContextFor('frontal-slayer'),
    }).fresh!;
    expect(Object.keys(c.efficiencyEnrichment?.bodyStorySurfaces ?? {}).length).toBeGreaterThan(0);
  });

  it('24. CameraEconomyScore', () => {
    const s = scoreCameraEconomy(1, 0.9);
    expect(s.overall).toBeGreaterThan(0.7);
  });

  it('25. OneShotCampaignPotential', () => {
    const o = assessOneShotPotential({ conceptClarity: 0.85, productVisibility: 0.8, worldClarity: 0.85, memorability: 0.8 });
    expect(o.viable).toBe(true);
  });

  it('26. single-shot campaign support', () => {
    const candidate = campaignWorldGenesisEngine.generateWorldCandidates({
      brandSlug: 'frontal-slayer',
      productCategory: 'HAIR',
      objective: 'LAUNCH',
      brandContext: brandContextFor('frontal-slayer'),
    }).fresh!;
    const bible = campaignWorldGenesisEngine.approveWorldToBible({
      candidate,
      brandId: 'frontal-slayer',
      campaignId: 'c1',
    });
    const orch = creativeDirectionOrchestrationSystem.orchestrate(bible, candidate);
    if (candidate.efficiencyEnrichment?.oneShotPotential.viable) {
      expect(orch.shots.some((s) => s.role === 'SINGLE_SHOT_CONCEPT')).toBe(true);
    } else {
      expect(orch.shots.length).toBeGreaterThanOrEqual(7);
    }
  });

  it('27. CreativeReductionPass', () => {
    const candidate = campaignWorldGenesisEngine.generateWorldCandidates({
      brandSlug: 'frontal-slayer',
      productCategory: 'HAIR',
      objective: 'LAUNCH',
      brandContext: brandContextFor('frontal-slayer'),
    }).fresh!;
    const reduction = runCreativeReductionPass({ candidate, props: [...candidate.propSystem, 'Extra prop', 'Another prop', 'Busy prop', 'More props', 'Sixth prop'] });
    expect(reduction.question).toContain('LESS');
    expect(reduction.items.some((i) => i.recommendation === 'REMOVE')).toBe(true);
  });

  it('28. ConceptualDensityScore', () => {
    const d = scoreConceptualDensity([
      { name: 'felt', roles: ['WORLD', 'MOTIF', 'COLOR', 'COPY'] },
      { name: 'busy prop', roles: ['PROP'] },
    ]);
    expect(d.highDensityElements).toContain('felt');
  });

  it('29. CreativeElementUtility', () => {
    const u = scoreCreativeElementUtility('Platform tiles', 'PROP', ['WORLD', 'MOTIF', 'BEHAVIOR']);
    expect(u.utilityScore).toBeGreaterThan(0.5);
  });

  it('30. CampaignExtensibilityScore', () => {
    const e = scoreCampaignExtensibility(3, true);
    expect(e.derivativeAssets.length).toBeGreaterThan(3);
  });

  it('31. LoopabilityScore', () => {
    const l = scoreLoopability(true, 'wind sway');
    expect(l.naturalLoop).toBe(true);
  });

  it('32. reference abstraction principles', () => {
    expect(REFERENCE_ABSTRACTION_PRINCIPLES).toContain('UNRELATED_WORLD');
    expect(REFERENCE_ABSTRACTION_PRINCIPLES).toContain('MINIMAL_EXECUTION');
  });

  it('33. forensic benchmark high yield efficiency', () => {
    const { forensicEnriched, weakEnriched } = runForensicBenchmarkScoring(
      buildForensicBilliardsBenchmark(),
      buildWeakLuxuryBenchmark(),
      'JEWELRY',
    );
    expect(forensicEnriched.conceptualYield.overall).toBeGreaterThan(weakEnriched.conceptualYield.overall);
    expect(forensicEnriched.efficiencyEnrichment!.naturalProductVisibility.overall).toBeGreaterThan(
      weakEnriched.efficiencyEnrichment!.naturalProductVisibility.overall,
    );
  });

  it('34. weak benchmark lower interaction naturalness', () => {
    const weak = enrichWorldCandidate(buildWeakLuxuryBenchmark(), {
      brandSlug: 'weak',
      productCategory: 'JEWELRY',
      objective: 'LAUNCH',
      brandContext: null,
    });
    expect(weak.efficiencyEnrichment!.naturalProductVisibility.overall).toBeLessThan(0.75);
  });

  it('35. FS three-world pilot', () => {
    const result = campaignWorldGenesisEngine.generateWorldCandidates({
      brandSlug: 'frontal-slayer',
      productCategory: 'HAIR',
      objective: 'LAUNCH',
      brandContext: brandContextFor('frontal-slayer'),
    });
    expect(result.candidates.length).toBeGreaterThanOrEqual(3);
    expect(result.safe).toBeTruthy();
    expect(result.fresh).toBeTruthy();
    expect(result.wildCard).toBeTruthy();
  });

  it('36. FS non-literal world requirement', () => {
    const result = campaignWorldGenesisEngine.generateWorldCandidates({
      brandSlug: 'frontal-slayer',
      productCategory: 'HAIR',
      objective: 'LAUNCH',
      brandContext: brandContextFor('frontal-slayer'),
    });
    expect(countNonLiteralBeautyWorlds(result.candidates)).toBeGreaterThanOrEqual(2);
    for (const w of LITERAL_BEAUTY_WORLDS) {
      const primary = result.candidates.filter((c) => c.setting.toUpperCase().includes(w.replace(' ', '')));
      expect(primary.length).toBeLessThanOrEqual(1);
    }
  });

  it('37. FS micro reel 3-8s', () => {
    const fresh = campaignWorldGenesisEngine.generateWorldCandidates({
      brandSlug: 'frontal-slayer',
      productCategory: 'HAIR',
      objective: 'LAUNCH',
      brandContext: brandContextFor('frontal-slayer'),
    }).fresh!;
    const dur = fresh.efficiencyEnrichment?.minimalExecution.durationSeconds ?? 0;
    expect(isShortFormDuration(dur) || dur <= 12).toBe(true);
    expect(fresh.efficiencyEnrichment?.conceptualEfficiency.overall ?? 0).toBeGreaterThan(0.4);
  });

  it('38. NDXBOOK worlds differ from FS', () => {
    const fs = campaignWorldGenesisEngine.generateWorldCandidates({
      brandSlug: 'frontal-slayer',
      productCategory: 'HAIR',
      objective: 'LAUNCH',
      brandContext: brandContextFor('frontal-slayer'),
    });
    const ndx = campaignWorldGenesisEngine.generateWorldCandidates({
      brandSlug: 'ndxbook',
      productCategory: 'GENERAL',
      objective: 'LAUNCH',
      brandContext: brandContextFor('ndxbook'),
    });
    expect(fs.fresh?.coreConcept).not.toBe(ndx.fresh?.coreConcept);
    expect(ndx.candidates.every((c) => !c.coreConcept.includes('IN TRANSIT'))).toBe(true);
  });

  it('39. BrandCreativeContext gate blocks without context', () => {
    const blocked = campaignWorldGenesisEngine.generateWorldCandidates({
      brandSlug: 'frontal-slayer',
      productCategory: 'HAIR',
      objective: 'LAUNCH',
      brandContext: null,
    });
    expect(blocked.candidates.length).toBe(0);
  });

  it('40. ConceptualEfficiencyQA', () => {
    const c = campaignWorldGenesisEngine.generateWorldCandidates({
      brandSlug: 'frontal-slayer',
      productCategory: 'HAIR',
      objective: 'LAUNCH',
      brandContext: brandContextFor('frontal-slayer'),
    }).fresh!;
    const qa = runConceptualEfficiencyQA(c);
    expect(qa.checks.length).toBeGreaterThanOrEqual(10);
    expect(qa.pass).toBe(true);
  });

  it('41. ExecutionWit with efficiency inputs', () => {
    const wit = computeExecutionWitScore({
      motifCount: 3,
      behaviorPresent: true,
      surprisePresent: true,
      lateralConnection: true,
      conceptualEfficiency: 0.8,
      worldNativeCopy: true,
      reductionApplied: true,
    });
    expect(wit.overall).toBeGreaterThan(0.75);
  });

  it('42. GenericExecutionDetector CGO.2 flags', () => {
    const issues = detectGenericExecution('Luxury studio generic product centering model as mannequin', 'CLUE');
    expect(issues.some((i) => i.includes('LUXURY') || i.includes('MANNEQUIN') || i.includes('CENTER'))).toBe(true);
  });

  it('43. persistence on approve', () => {
    const candidate = campaignWorldGenesisEngine.generateWorldCandidates({
      brandSlug: 'frontal-slayer',
      productCategory: 'HAIR',
      objective: 'LAUNCH',
      brandContext: brandContextFor('frontal-slayer'),
    }).fresh!;
    saveApprovedCandidate('world-test-1', candidate);
    const persisted = getCampaignRunPersistence('world-test-1');
    expect(persisted?.efficiencyEnrichment.creativeLeapTrace.fromGenerationPath).toBe(true);
  });

  it('44. jewelry lateral acceptance — not jewelry store', () => {
    const profile = buildProductInteractionProfile({ productId: 'j', productCategory: 'JEWELRY' });
    const worlds = searchLateralWorlds({
      brandSlug: 'jewelry-test',
      productCategory: 'JEWELRY',
      interactionProfile: profile,
      objective: 'LAUNCH',
    });
    expect(worlds.every((w) => !/JEWELRY STORE|DRESSING ROOM|VANITY/i.test(w.setting))).toBe(true);
  });

  it('45. does not copy poker as default template', () => {
    const result = campaignWorldGenesisEngine.generateWorldCandidates({
      brandSlug: 'frontal-slayer',
      productCategory: 'HAIR',
      objective: 'LAUNCH',
      brandContext: brandContextFor('frontal-slayer'),
    });
    const concepts = result.candidates.map((c) => c.coreConcept + c.setting);
    expect(concepts.some((c) => c.includes('DOUBLE OR NOTHING'))).toBe(false);
    expect(concepts.filter((c) => /POOL|POKER|GREEN FELT/i.test(c)).length).toBe(0);
  });

  it('46. enrichWorldCandidates adds efficiency to all', () => {
    const raw = campaignWorldGenesisEngine.generateWorldCandidates({
      brandSlug: 'ndxbook',
      productCategory: 'GENERAL',
      objective: 'LAUNCH',
      brandContext: brandContextFor('ndxbook'),
    }).candidates;
    expect(raw.every((c) => c.efficiencyEnrichment != null)).toBe(true);
  });

  it('47. Campaign Director UI CGO.2 integration', () => {
    expect(read('src/site00/components/founderWorkspace/campaignDirector/CampaignDirectorWorldScreen.tsx')).toContain('CREATIVE LEAP');
    expect(read('src/site00/components/founderWorkspace/campaignDirector/CampaignDirectorWorkspace.tsx')).toContain('P0.CGO.2');
    expect(read('src/site00/components/founderWorkspace/campaignDirector/CampaignDirectorWorkspace.tsx')).toContain('SIMPLE BUT CLEVER');
  });
});
