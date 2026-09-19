/**
 * P0.5E.4A — Calibration → casting readiness bridge tests.
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { buildNdxFounderCharacterDiscoveryRun } from './ndxEmbodiedCharacterFounderDiscovery/ndxFounderDiscoveryRun.js';
import {
  calibrationDiscoveryComplete,
  castingStatusHeadline,
  evaluateNdxFounderCharacterCastingReadiness,
} from './ndxEmbodiedCharacterFounderDiscovery/ndxCastingReadinessBridge.js';
import { ndxApplyCalibrationReaction } from './ndxEmbodiedCharacterFounderDiscovery/ndxCalibrationAdapter.js';
import { evaluateExtendedHumanity } from '../site00-studio-world-production/embodiedCharacterFounderDiscovery/humanityEvaluation.js';
import {
  saveFounderCharacterRecognition,
  saveFounderVoiceLabJudgment,
} from '../../api/_lib/site00Evolve/founderCharacterDiscovery/founderCharacterDiscoveryService.js';
import {
  resetFounderCharacterDiscoveryMemory,
  resetFounderCharacterDiscoveryStoreModeCache,
} from '../../api/_lib/site00Evolve/founderCharacterDiscovery/founderCharacterDiscoveryStoreAdapter.js';

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

describe('ndxCastingReadinessBridge', () => {
  beforeEach(() => {
    resetFounderCharacterDiscoveryStoreModeCache();
    resetFounderCharacterDiscoveryMemory();
  });

  it('YES_I_KNOW_HER alone does not unlock when calibration discovery incomplete', () => {
    const run = buildNdxFounderCharacterDiscoveryRun();
    const withRecognition = {
      ...run,
      founderRecognition: {
        ...run.founderRecognition,
        response: 'YES_I_KNOW_HER' as const,
        inferred: false as const,
      },
    };
    const readiness = evaluateNdxFounderCharacterCastingReadiness({
      run: withRecognition,
      humanityEvaluation: humanityFor(withRecognition),
    });
    expect(readiness.founderKnowsHer).toBe(true);
    expect(readiness.readyForCharacterSynthesis).toBe(false);
    expect(castingStatusHeadline(withRecognition)).toContain('Continue calibration');
  });

  it('calibration progress unlocks synthesis readiness without YES I KNOW HER', () => {
    let run = buildNdxFounderCharacterDiscoveryRun();
    const interactionIds = [
      'cal-scenario-ndx-wrong-receipt',
      'cal-contradiction-nosy-respectful',
      'cal-flaw-confirmation-bias',
      'cal-intelligence-cultural-memory',
      'cal-voice-misleading-viral',
      'cal-book-not-finished',
      'cal-visual-cluster',
    ];
    for (const interactionId of interactionIds) {
      ({ run } = ndxApplyCalibrationReaction(run, { interactionId, reaction: 'YES_THATS_HER' }));
    }
    run = {
      ...run,
      founderRecognition: {
        ...run.founderRecognition,
        response: 'YES_I_KNOW_HER',
        inferred: false as const,
      },
    };
    expect(calibrationDiscoveryComplete(run)).toBe(true);
    const readiness = evaluateNdxFounderCharacterCastingReadiness({
      run,
      humanityEvaluation: humanityFor(run),
    });
    expect(readiness.readyForCharacterSynthesis).toBe(true);
    expect(castingStatusHeadline({ ...run, castingReadiness: readiness })).toContain('READY FOR CHARACTER SYNTHESIS');
  });

  it('voice lab judgments persist through service and satisfy voice gate', async () => {
    const { initializeFounderCharacterDiscoveryRoom } = await import(
      '../../api/_lib/site00Evolve/founderCharacterDiscovery/founderCharacterDiscoveryService.js'
    );
    await initializeFounderCharacterDiscoveryRoom({ projectId: 'ndxbook' });
    const saved = await saveFounderVoiceLabJudgment({
      projectId: 'ndxbook',
      sampleId: 'voice-lab-sample-1',
      channel: 'TEXT_TO_FRIEND',
      judgment: 'YES_EXACTLY',
    });
    expect(saved.voiceLabSamples[0]?.judgments.TEXT_TO_FRIEND).toBe('YES_EXACTLY');
    expect(saved.castingReadiness.voiceDifferentiationEstablished).toBe(true);
  });

  it('recognition persists and updates headline after YES_I_KNOW_HER', async () => {
    const { initializeFounderCharacterDiscoveryRoom } = await import(
      '../../api/_lib/site00Evolve/founderCharacterDiscovery/founderCharacterDiscoveryService.js'
    );
    await initializeFounderCharacterDiscoveryRoom({ projectId: 'ndxbook' });
    const result = await saveFounderCharacterRecognition({
      projectId: 'ndxbook',
      response: 'YES_I_KNOW_HER',
    });
    const saved = result.run;
    expect(saved.founderRecognition.response).toBe('YES_I_KNOW_HER');
    expect(saved.castingReadiness.founderKnowsHer).toBe(true);
    expect(castingStatusHeadline(saved)).not.toContain('BLOCKED until YES_I_KNOW_HER');
  });
});
