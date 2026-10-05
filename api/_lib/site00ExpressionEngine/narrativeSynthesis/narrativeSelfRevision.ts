/**
 * C1.0 — Bounded self-revision loop (intellectual only — no provider spend).
 */

import type {
  NarrativeCohesionQA,
  NarrativeSynthesis,
  NarrativeSynthesisInput,
} from '../../../../shared/site00-expression-engine/narrative-synthesis/types.js';
import { MAX_SELF_REVISION_PASSES } from '../../../../shared/site00-expression-engine/narrative-synthesis/types.js';
import { compileNarrativeSynthesisDraft } from './narrativeSynthesisDraft.js';

export function runNarrativeSelfRevisionLoop(
  input: NarrativeSynthesisInput,
): { synthesis: NarrativeSynthesis; revisionPasses: number } {
  let draft = compileNarrativeSynthesisDraft(input, 0);
  let passes = 0;

  while (!draft.qaStatus.passed && passes < MAX_SELF_REVISION_PASSES) {
    passes += 1;
    draft = compileNarrativeSynthesisDraft(input, passes, draft.qaStatus.failureClassifications);
  }

  if (!draft.qaStatus.passed) {
    return {
      synthesis: {
        ...draft,
        status: 'NEEDS_FOUNDER_DIRECTION',
      },
      revisionPasses: passes,
    };
  }

  return {
    synthesis: {
      ...draft,
      status: 'AWAITING_FOUNDER_REVIEW',
      selfRevisionPasses: passes,
    },
    revisionPasses: passes,
  };
}

export function assertNoProviderDispatchDuringSynthesis(synthesis: NarrativeSynthesis): void {
  if (synthesis.providerDispatchCount !== 0) {
    throw new Error('Narrative Synthesis must not dispatch image/video providers');
  }
}
