/**
 * P0.NDX.NARRATIVE-MOMENTUM-PRECISION-AND-REVIEW-UX1
 */

import { describe, expect, it } from 'vitest';
import {
  compileEntry002RetroactiveNarrativeMomentum,
  narrativeMomentumStoryboardHandoff,
  validateNarrativeTensionSequence,
  isInterpretiveClaim,
  assertNoInterpretationClassifiedAsEvidence,
} from '../shared/site00-expression-engine/narrative-momentum/index.js';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('P0.NDX.NARRATIVE-MOMENTUM-PRECISION-AND-REVIEW-UX1', () => {
  it('interpretation cannot be classified as primary evidence', () => {
    expect(isInterpretiveClaim('Memory is edited, not the object')).toBe(true);
    const plan = compileEntry002RetroactiveNarrativeMomentum();
    expect(plan.evidence.every((e) => !isInterpretiveClaim(e.whatIsObserved) || e.strength !== 'PRIMARY')).toBe(true);
    expect(plan.interpretations.some((i) => /memory/i.test(i.claim))).toBe(true);
    assertNoInterpretationClassifiedAsEvidence(plan.evidence);
  });

  it('every evidence object has source status', () => {
    const plan = compileEntry002RetroactiveNarrativeMomentum();
    expect(plan.evidence.length).toBeGreaterThan(0);
    for (const e of plan.evidence) {
      expect(e.status).toBeTruthy();
      expect(e.sourceReference.length).toBeGreaterThan(3);
    }
  });

  it('Entry 002 tension follows cultural glitch canonical progression', () => {
    const plan = compileEntry002RetroactiveNarrativeMomentum();
    const stages = plan.beats.map((b) => b.tensionStage);
    expect(stages).toEqual(['LOW', 'RISING', 'INTERRUPTION', 'ESCALATION', 'PEAK', 'RELEASE', 'RESIDUAL']);
    const tensionIssues = validateNarrativeTensionSequence({ beats: plan.beats, tensionModel: 'CANONICAL' });
    expect(tensionIssues.some((i) => i.flagId === 'TENSION_SEQUENCE_INCOHERENT')).toBe(false);
  });

  it('explicit DOUBLE_PEAK allows peak then escalation', () => {
    const plan = compileEntry002RetroactiveNarrativeMomentum();
    const beats = plan.beats.map((b, i) =>
      i === 3 ? { ...b, tensionStage: 'PEAK' as const }
      : i === 4 ? { ...b, tensionStage: 'ESCALATION' as const }
      : b,
    );
    const issues = validateNarrativeTensionSequence({ beats, tensionModel: 'DOUBLE_PEAK' });
    expect(issues.some((i) => i.trigger.includes('PEAK'))).toBe(false);
  });

  it('reel adaptation preserves all critical narrative beats', () => {
    const plan = compileEntry002RetroactiveNarrativeMomentum();
    const reel = plan.formatAdaptations.find((f) => f.format === 'REEL');
    expect(reel?.reelDetail?.beatSequence.length).toBe(plan.beats.length);
    expect(reel?.beatsUsed.length).toBe(plan.beats.length);
  });

  it('carousel adaptation preserves master narrative slide count', () => {
    const plan = compileEntry002RetroactiveNarrativeMomentum();
    const carousel = plan.formatAdaptations.find((f) => f.format === 'CAROUSEL');
    expect(carousel?.carouselDetail?.slideSequence.length).toBe(plan.beats.length);
    expect(carousel?.carouselDetail?.finalOpenLoop).toBe(plan.openLoop.newQuestion);
  });

  it('storyboard handoff includes viewer knowledge state per beat', () => {
    const plan = compileEntry002RetroactiveNarrativeMomentum();
    const handoff = narrativeMomentumStoryboardHandoff(plan);
    expect(handoff.beatHandoff.length).toBe(plan.beats.length);
    expect(handoff.beatHandoff[0]?.whatViewerKnows.length).toBeGreaterThan(5);
    expect(handoff.beatHandoff[0]?.whyNextShotExists.length).toBeGreaterThan(5);
    expect(handoff.reelDetail?.beatSequence.length).toBe(plan.beats.length);
  });

  it('validator flags include explanation and severity', () => {
    const plan = compileEntry002RetroactiveNarrativeMomentum();
    const poisoned = {
      ...plan,
      narrativeGoal: 'hook problem solution cta',
    };
    const issues = poisoned.validationIssues.length ?
      poisoned.validationIssues
    : compileEntry002RetroactiveNarrativeMomentum();
    const plan2 = compileEntry002RetroactiveNarrativeMomentum();
    const drift = plan2.validationIssues.find((i) => i.flagId === 'GENERIC_FUNNEL_DRIFT');
    if (drift) {
      expect(drift.explanation.length).toBeGreaterThan(10);
      expect(drift.severity).toBeTruthy();
    }
    expect(plan2.validationIssues.some((i) => i.severity === 'ADVISORY' || i.severity === 'WARNING')).toBe(true);
  });

  it('Entry 002 recompiles without PROCESS_PROOF interpretation masquerading as evidence', () => {
    const plan = compileEntry002RetroactiveNarrativeMomentum();
    expect(plan.proofArchitecture.objects.some((p) => p.proofType === 'PROCESS_PROOF')).toBe(false);
    expect(plan.layerMode).toBe('RETROACTIVE_AUTHORITY_LAYER');
    expect(plan.selectedGrammarId).toBe('CULTURAL_GLITCH');
  });

  it('founder review UI uses wizard judgment controls (no colliding QuietAction row)', () => {
    const panel = readFileSync(
      join(import.meta.dirname, '../src/site00/components/founderWorkspace/expressionEngine/ExpressionEngineNarrativeMomentumPanel.tsx'),
      'utf8',
    );
    expect(panel).toContain('site00-nme-wizard__judgment');
    expect(panel).toContain('site00-nme-wizard__workflow');
    expect(panel).not.toContain('QuietAction');
    expect(panel).toContain('narrative-momentum-tension-curve');
    expect(panel).toContain('narrative-momentum-wizard');
  });
});
