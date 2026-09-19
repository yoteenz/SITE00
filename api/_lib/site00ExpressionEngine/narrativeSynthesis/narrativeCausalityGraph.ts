/**
 * C1.0 — Causality graph + shuffle test.
 */

import type {
  NarrativeBeat,
  NarrativeCausalityEdge,
  NarrativeCausalityGraph,
} from '../../../../shared/site00-expression-engine/narrative-synthesis/types.js';

export function buildCausalityGraph(beats: NarrativeBeat[]): NarrativeCausalityGraph {
  const edges: NarrativeCausalityEdge[] = [];

  for (let i = 0; i < beats.length - 1; i += 1) {
    const current = beats[i];
    const next = beats[i + 1];
    if (current.causalFlags.causesNextBeat) {
      edges.push({
        fromBeatId: current.beatId,
        toBeatId: next.beatId,
        edgeType: 'CAUSES',
        rationale: current.whyItHappensNow,
      });
    }
    if (current.causalFlags.revealsForNextBeat) {
      edges.push({
        fromBeatId: current.beatId,
        toBeatId: next.beatId,
        edgeType: 'REVEALS_FOR',
        rationale: current.reveals.join('; ') || 'Information required for next beat',
      });
    }
    if (current.causalFlags.emotionallyEarnsNextBeat) {
      edges.push({
        fromBeatId: current.beatId,
        toBeatId: next.beatId,
        edgeType: 'EMOTIONALLY_EARNS',
        rationale: `${current.emotionalStateAfter} → ${next.emotionalStateBefore}`,
      });
    }
  }

  const nonCausal = beats.filter(
    (b) =>
      !b.causalFlags.causesNextBeat &&
      !b.causalFlags.revealsForNextBeat &&
      !b.causalFlags.emotionallyEarnsNextBeat &&
      b.beatType !== 'AFTERSHOCK',
  );

  const shuffle = runNarrativeShuffleTest(beats, edges);

  return {
    beats,
    edges,
    orderDependency: shuffle.orderDependency,
    shuffleTestPassed: shuffle.passed,
    shuffleDamageSummary: shuffle.damageSummary,
    setupDependencies: beats.filter((b) => b.beatType === 'SETUP').map((b) => b.beatId),
    revealDependencies: beats.filter((b) => b.beatType === 'DISCOVERY' || b.beatType === 'TURN').map((b) => b.beatId),
    emotionalDependencies: beats.filter((b) => b.causalFlags.emotionallyEarnsNextBeat).map((b) => b.beatId),
    payoffDependencies: beats.filter((b) => b.beatType === 'PAYOFF' || b.requiredPayoffLink).map((b) => b.beatId),
  };
}

export function runNarrativeShuffleTest(
  beats: NarrativeBeat[],
  edges: NarrativeCausalityEdge[],
): { passed: boolean; orderDependency: 'STRONG' | 'MODERATE' | 'WEAK'; damageSummary: string | null } {
  if (beats.length < 3) {
    return { passed: true, orderDependency: 'MODERATE', damageSummary: null };
  }

  const edgeRatio = edges.length / Math.max(1, beats.length - 1);
  const turnIndex = beats.findIndex((b) => b.beatType === 'TURN');
  const interjectionIndex = beats.findIndex((b) => b.beatType === 'INTERJECTION');

  if (turnIndex <= 0) {
    return {
      passed: false,
      orderDependency: 'WEAK',
      damageSummary: 'Turning point missing or at opening — beats could be reordered without damage.',
    };
  }

  if (interjectionIndex >= 0 && interjectionIndex < turnIndex) {
    return {
      passed: false,
      orderDependency: 'WEAK',
      damageSummary: 'Interjection precedes turn — reorder would break earned truth naming.',
    };
  }

  const orderDependency =
    edgeRatio >= 0.85 ? 'STRONG' : edgeRatio >= 0.5 ? 'MODERATE' : 'WEAK';

  const passed = orderDependency === 'STRONG' || orderDependency === 'MODERATE';

  return {
    passed,
    orderDependency,
    damageSummary: passed
      ? null
      : 'Major beats appear reorderable — likely scene collection rather than causal story.',
  };
}

export function flagNonCausalBeats(beats: NarrativeBeat[]): NarrativeBeat[] {
  return beats.map((beat) => {
    const causal =
      beat.causalFlags.causesNextBeat ||
      beat.causalFlags.revealsForNextBeat ||
      beat.causalFlags.emotionallyEarnsNextBeat;
    if (causal || beat.beatType === 'AFTERSHOCK') return beat;
    return {
      ...beat,
      qaNotes: [...beat.qaNotes, 'NARRATIVE_ORNAMENT — satisfies no causality rule'],
      removableWithoutDamage: true,
    };
  });
}
