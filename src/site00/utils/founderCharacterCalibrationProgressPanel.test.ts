import { describe, expect, it } from 'vitest';
import { buildNdxFounderCharacterDiscoveryRun } from '../../../shared/site00-brand-lore/ndxEmbodiedCharacterFounderDiscovery/ndxFounderDiscoveryRun.js';
import { ndxApplyCalibrationReaction, ndxContinueCalibration } from '../../../shared/site00-brand-lore/ndxEmbodiedCharacterFounderDiscovery/ndxCalibrationAdapter.js';
import { buildFounderCharacterDiscoveryProgress } from './founderCharacterDiscoveryProgress';
import { stepNeedsCalibrationMoment } from '../components/founderWorkspace/FounderCharacterCalibrationProgressPanel';

describe('founderCharacterCalibrationProgressPanel helpers', () => {
  it('routes incomplete calibration checklist steps through moment flow', () => {
    const progress = buildFounderCharacterDiscoveryProgress(buildNdxFounderCharacterDiscoveryRun());
    const moments = progress.steps.find((s) => s.id === 'moments');
    expect(moments).toBeTruthy();
    expect(stepNeedsCalibrationMoment(moments)).toBe(true);
    expect(stepNeedsCalibrationMoment(progress.steps.find((s) => s.id === 'voice'))).toBe(false);
  });
});

describe('ndxContinueCalibration', () => {
  it('advances to next unresolved moment when current pointer is stale', () => {
    let run = buildNdxFounderCharacterDiscoveryRun();
    const first = run.calibrationState!.interactions.find((i) => !i.resolved)!;
    ({ run } = ndxApplyCalibrationReaction(run, {
      interactionId: first.interactionId,
      reaction: 'YES_THATS_HER',
    }));
    run = {
      ...run,
      calibrationState: {
        ...run.calibrationState!,
        currentInteractionId: first.interactionId,
      },
    };

    const continued = ndxContinueCalibration(run);
    expect(continued.interaction).not.toBeNull();
    expect(continued.interaction?.interactionId).not.toBe(first.interactionId);
    expect(continued.interaction?.resolved).toBe(false);
  });
});
