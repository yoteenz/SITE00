import { composeConceptDirectedTwinV2FromPackage } from '../p0vrTwinV22/composeFromExecutablePackage.js';
import type { ConceptDirectedTwinSession } from './types.js';

export type ConceptDirectedTwinV2ComposeResult = {
  sessionPatch: Partial<ConceptDirectedTwinSession>;
  functionBindingSummary: string[];
};

/** Builds coded twin V2 only from ExecutableConceptPackage (TWINV2.2). */
export function composeConceptDirectedTwinV2(session: ConceptDirectedTwinSession): ConceptDirectedTwinV2ComposeResult {
  const result = composeConceptDirectedTwinV2FromPackage(session);
  return {
    functionBindingSummary: result.functionBindingSummary,
    sessionPatch: result.sessionPatch,
  };
}
