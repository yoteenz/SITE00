/**
 * P0.NDX.NARRATIVE-MOMENTUM-ENGINE1
 */

import { describe, expect, it } from 'vitest';

import {
  compileEntry002RetroactiveNarrativeMomentum,
  listNarrativeGrammars,
  getNarrativeGrammar,
  selectNarrativeGrammar,
  compileNarrativeMomentumPlan,
  narrativeMomentumStoryboardHandoff,
  validateNarrativeMomentumPlan,
  narrativeSimilarityValidator,
} from '../shared/site00-expression-engine/narrative-momentum/index.js';
import { brandOverlayFor } from '../shared/site00-expression-engine/narrative-momentum/brandOverlays.js';
import { adaptNarrativeToReel } from '../shared/site00-expression-engine/narrative-momentum/formatAdaptation.js';

describe('P0.NDX.NARRATIVE-MOMENTUM-ENGINE1', () => {
  it('keeps creative territory separate from narrative grammar library', () => {
    const grammars = listNarrativeGrammars();
    const labels = grammars.map((g) => g.label.toUpperCase());
    expect(labels.some((l) => l.includes('PERSONAL ARCHIVE'))).toBe(false);
    expect(labels.some((l) => l.includes('MARKED-UP COPY'))).toBe(false);
  });

  it('requires audience shift on compiled plans', () => {
    const plan = compileEntry002RetroactiveNarrativeMomentum();
    expect(plan.audienceStartingBelief.length).toBeGreaterThan(10);
    expect(plan.audienceDesiredShift.length).toBeGreaterThan(10);
    expect(plan.narrativeGoal).not.toMatch(/make it engaging/i);
  });

  it('selects grammar from topic/brand/proof not format alone', () => {
    const sel = selectNarrativeGrammar({
      brandId: 'ndxbook',
      topic: '2016 IG BADDIE FASHION nostalgia revision',
      creativeTerritoryLabel: 'THE NOSTALGIA EDIT SUITE',
      contentObjective: 'Cultural reframe',
      audienceStartingBelief: '2016 = fashion era',
      desiredShift: 'Memory edit recognition',
      availableProofTypes: ['ARCHIVAL_PROOF', 'COMPARATIVE_PROOF'],
      format: 'CAROUSEL',
      chapterArgumentLabels: ['CLAIM', 'RECEIPT', 'CONTRADICTION'],
    });
    expect(sel.selectedGrammar).toBe('CULTURAL_GLITCH');
    expect(sel.alternateGrammar).toBe('INVESTIGATION');
  });

  it('preserves existing NDX CONTRADICTION grammar lineage', () => {
    const g = getNarrativeGrammar('CONTRADICTION');
    expect(g.legacyNdxChapter01).toBe(true);
    expect(g.beatSequence.map((b) => b.label)).toEqual([
      'CLAIM',
      'RECEIPT',
      'CONTRADICTION',
      'LENS',
      'INTERJECTION',
      'SYNTHESIS',
      'RESIDUAL TENSION',
    ]);
  });

  it('classifies proof types in Entry 002 retroactive plan', () => {
    const plan = compileEntry002RetroactiveNarrativeMomentum();
    const types = new Set(plan.proofArchitecture.objects.map((p) => p.proofType));
    expect(types.has('ARCHIVAL_PROOF')).toBe(true);
    expect(types.has('COMPARATIVE_PROOF')).toBe(true);
    expect(plan.proofArchitecture.objects.some((p) => p.strength === 'PRIMARY')).toBe(true);
  });

  it('builds structured open loop and campaign continuation', () => {
    const plan = compileEntry002RetroactiveNarrativeMomentum();
    expect(plan.openLoop.newQuestion.length).toBeGreaterThan(10);
    expect(plan.openLoop.continuation.destination).not.toBe('NONE');
    expect(plan.campaignHandoff.openLoopSummary).toBe(plan.openLoop.newQuestion);
  });

  it('flags generic funnel drift', () => {
    const plan = compileEntry002RetroactiveNarrativeMomentum();
    const flagged = validateNarrativeMomentumPlan({
      ...plan,
      narrativeGoal: 'hook problem solution cta for engagement',
    });
    expect(flagged).toContain('GENERIC_FUNNEL_DRIFT');
  });

  it('derivatives inherit master narrative via reel adaptation', () => {
    const plan = compileEntry002RetroactiveNarrativeMomentum();
    const reel = adaptNarrativeToReel(plan);
    expect(reel.beatsUsed.length).toBe(plan.beats.length);
    expect(reel.reelArchitecture?.reframe).toBe(plan.reframe.after);
  });

  it('storyboard handoff receives NarrativeMomentumPlan beats', () => {
    const plan = compileEntry002RetroactiveNarrativeMomentum();
    const handoff = narrativeMomentumStoryboardHandoff(plan);
    expect(handoff.narrativeMomentumPlanId).toBe(plan.id);
    expect(handoff.beats.length).toBeGreaterThan(5);
    expect(handoff.reelArchitecture).not.toBeNull();
  });

  it('Entry 002 retroactive ingest uses RETROACTIVE_AUTHORITY_LAYER without provider spend', () => {
    const plan = compileEntry002RetroactiveNarrativeMomentum();
    expect(plan.layerMode).toBe('RETROACTIVE_AUTHORITY_LAYER');
    expect(plan.providerDispatchCount).toBe(0);
    expect(plan.selectedGrammarId).toBe('CULTURAL_GLITCH');
  });

  it('brand overlays prevent NDX bleed into other brands', () => {
    const fs = brandOverlayFor('frontal-slayer');
    const ndx = brandOverlayFor('ndxbook');
    expect(fs?.preferredGrammars).not.toEqual(ndx?.preferredGrammars);
    expect(fs?.preferredGrammars).toContain('TRANSFORMATION');
  });

  it('repetition validator detects similar narratives', () => {
    const a = compileEntry002RetroactiveNarrativeMomentum();
    const b = compileEntry002RetroactiveNarrativeMomentum([a]);
    const flag = narrativeSimilarityValidator(b, [a]);
    expect(flag).toBe('NARRATIVE_REPETITION_WARNING');
  });

  it('grammar library count is at least ten', () => {
    expect(listNarrativeGrammars().length).toBeGreaterThanOrEqual(10);
  });

  it('Entry 002 proof-of-concept fields are populated by intelligence', () => {
    const plan = compileEntry002RetroactiveNarrativeMomentum();
    expect(plan.selectedGrammarId).toBe('CULTURAL_GLITCH');
    expect(plan.tensionArc.stages.length).toBeGreaterThan(0);
    expect(plan.culturalGlitch).not.toBeNull();
    expect(plan.formatAdaptations.some((f) => f.format === 'REEL')).toBe(true);
    expect(plan.beats.some((b) => b.label.includes('RECEIPT') || b.label.includes('RECEIPT'))).toBe(true);
  });

  it('production journey marks narrative momentum ACTIVE for founder review', async () => {
    const { buildProductionJourney, resolveActiveJourneyStage } = await import(
      '../src/site00/components/founderWorkspace/expressionEngine/productionJourney.js'
    );
    const stages = buildProductionJourney({
      coverAuthority: 'APPROVED',
      narrativeMomentumStatus: 'FOUNDER_REVIEW',
      reelTreatment: 'LOCKED',
      preStoryboardComplete: false,
      activeProductionStep: 'FINAL_CINEMATIC_STORYBOARD',
      finalStoryboardStatus: 'GENERATED',
      finalStoryboardValid: true,
      finalStoryboardApproved: false,
      keyframeEligibility: 'BLOCKED',
      videoEligibility: 'BLOCKED',
    });
    const narrative = stages.find((s) => s.id === 'NARRATIVE_MOMENTUM');
    expect(narrative?.status).toBe('ACTIVE');
    expect(resolveActiveJourneyStage(stages)).toBe('NARRATIVE_MOMENTUM');
  });
});
