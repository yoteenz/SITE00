/**
 * C1.1 — Bounded creative convergence loop (max 3 passes).
 */

import type {
  CreativeDirectorRevisionRecord,
  CreativeDirectorSelfCritique,
} from '../../../../shared/site00-expression-engine/creative-director/types.js';
import { MAX_CREATIVE_DIRECTOR_PASSES } from '../../../../shared/site00-expression-engine/creative-director/types.js';

export function runCreativeConvergenceLoop<T>(args: {
  executePass: (pass: number, priorFailures: string[]) => T;
  critique: (result: T) => CreativeDirectorSelfCritique;
}): { result: T; revisionRecords: CreativeDirectorRevisionRecord[]; passes: number } {
  const records: CreativeDirectorRevisionRecord[] = [];
  let pass = 0;
  let priorFailures: string[] = [];
  let result = args.executePass(pass, priorFailures);

  while (pass < MAX_CREATIVE_DIRECTOR_PASSES - 1) {
    const critique = args.critique(result);
    if (!critique.requiresRevision) break;
    if (critique.founderWouldConnectDots === false && critique.failureClasses.length === 0) break;
    if (pass >= MAX_CREATIVE_DIRECTOR_PASSES - 2 && critique.failureClasses.length === 0) break;

    records.push({
      pass: pass + 1,
      failureClasses: critique.failureClasses,
      whatChanged: critique.failureClasses.includes('WEAK_CAUSALITY')
        ? 'Strengthened beat causality and turn setup'
        : critique.failureClasses.includes('TOO_CLOSE_TO_PRIOR_ENTRY')
          ? 'Re-ranked territory away from prior Entry surfaces'
          : 'Targeted revision on connective tissue',
      whyItImproved: 'Diagnosed weakness revision — not random regeneration',
    });

    pass += 1;
    priorFailures = critique.failureClasses;
    result = args.executePass(pass, priorFailures);
  }

  return { result, revisionRecords: records, passes: pass };
}
