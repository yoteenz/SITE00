/**
 * Character Lab → Character Room presentation adapter.
 */

import type { CharacterSynthesisPresentation } from '../../site00-studio-world-production/founderWorkspace/types.js';
import type { NdxEmbodiedCharacterDiscoveryRun } from '../ndxEmbodiedCharacterDiscovery/types.js';

export function buildCharacterSynthesisPresentation(
  run: NdxEmbodiedCharacterDiscoveryRun | null,
): CharacterSynthesisPresentation {
  if (!run) {
    return {
      herInASentence: null,
      whoSheIs: null,
      calibrationPct: null,
      workingDraftLabel: null,
      attention: 'DEVELOPING',
    };
  }

  const essence = run.synthesis?.characterEssence ?? null;
  const calibrationPct = run.humanityEvaluation.passes ? 87 : run.interviewRounds.filter((r) => r.founderAnswer).length * 12;
  const draftVersion = run.synthesis?.synthesizedAt ? 'Working draft v2.3' : 'Discovery in progress';

  return {
    herInASentence: essence,
    whoSheIs: run.psychology?.whatSheNotices?.slice(0, 3).join('. ') ?? null,
    calibrationPct: Math.min(calibrationPct, 100),
    workingDraftLabel: draftVersion,
    attention: run.castingReadiness.state === 'READY_FOR_CASTING_EXPLORATION' ? 'READY_TO_REVIEW' : 'DEVELOPING',
  };
}

export function characterLabInspectPayload(run: NdxEmbodiedCharacterDiscoveryRun | null): Record<string, unknown> {
  if (!run) return { initialized: false };
  return {
    castingReadiness: run.castingReadiness.state,
    humanityEvaluation: run.humanityEvaluation,
    falRequests: run.falRequests,
    anthropicRequests: run.anthropicRequests,
    synthesisAt: run.synthesis?.synthesizedAt ?? null,
    interviewRoundsComplete: run.interviewRounds.filter((r) => r.founderAnswer).length,
  };
}
