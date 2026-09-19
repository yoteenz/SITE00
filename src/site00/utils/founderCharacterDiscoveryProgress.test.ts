import { describe, expect, it } from 'vitest';
import { buildNdxFounderCharacterDiscoveryRun } from '../../../shared/site00-brand-lore/ndxEmbodiedCharacterFounderDiscovery/ndxFounderDiscoveryRun.js';
import { ndxApplyCalibrationReaction } from '../../../shared/site00-brand-lore/ndxEmbodiedCharacterFounderDiscovery/ndxCalibrationAdapter.js';
import { evaluateNdxFounderCharacterCastingReadiness } from '../../../shared/site00-brand-lore/ndxEmbodiedCharacterFounderDiscovery/ndxCastingReadinessBridge.js';
import { evaluateExtendedHumanity } from '../../../shared/site00-studio-world-production/embodiedCharacterFounderDiscovery/humanityEvaluation.js';
import { buildFounderCharacterDiscoveryProgress } from './founderCharacterDiscoveryProgress';

function humanityFor(run: ReturnType<typeof buildNdxFounderCharacterDiscoveryRun>) {
  return evaluateExtendedHumanity({
    contradictions: run.contradictions,
    flawProfile: run.flawProfile,
    intelligenceMap: run.intelligenceMap,
    relationships: run.relationships,
    culturalBoundaries: run.culturalBoundaries,
    publicPrivate: run.publicPrivate,
    privateHumanityPresent: run.flawProfile.procrastinates.length > 0,
  });
}

describe('founderCharacterDiscoveryProgress', () => {
  it('shows incomplete loop with next step for fresh run', () => {
    const run = buildNdxFounderCharacterDiscoveryRun();
    const progress = buildFounderCharacterDiscoveryProgress(run);
    expect(progress.readyForCharacterSynthesis).toBe(false);
    expect(progress.nextStep).not.toBeNull();
    expect(progress.percentComplete).toBeLessThan(50);
    expect(progress.steps.some((s) => s.id === 'truths' && !s.complete)).toBe(true);
  });

  it('surfaces direct YES truth requirement separately from moments', () => {
    let run = buildNdxFounderCharacterDiscoveryRun();
    for (let i = 0; i < 6; i++) {
      ({ run } = ndxApplyCalibrationReaction(run, {
        interactionId: run.calibrationState!.interactions[i]!.interactionId,
        reaction: 'ALMOST',
        revision: 'Close but tweak',
      }));
    }
    const progress = buildFounderCharacterDiscoveryProgress({
      ...run,
      castingReadiness: evaluateNdxFounderCharacterCastingReadiness({
        run,
        humanityEvaluation: humanityFor(run),
      }),
    });
    expect(progress.momentsCompleted).toBeGreaterThanOrEqual(6);
    expect(progress.directTruthsCount).toBe(0);
    const truths = progress.steps.find((s) => s.id === 'truths');
    expect(truths?.complete).toBe(false);
    expect(truths?.detail).toContain("YES THAT'S HER");
  });
});
