import type { ConceptDirectedTwinSession } from '../p0vrTwinV21/types.js';
import type { ConceptBuildFidelityReceipt } from './types.js';
import { buildTwinV2FromPackage } from '../p0vrTwinV23/buildTwinV2FromPackage.js';

export type ConceptDirectedTwinV2ComposeFromPackageResult = {
  sessionPatch: Partial<ConceptDirectedTwinSession>;
  functionBindingSummary: string[];
  fidelityReceipt: ConceptBuildFidelityReceipt;
};

/** Package-driven compose — delegates to P0.VR.TWINV2.3 builder (no semantic fallback). */
export function composeConceptDirectedTwinV2FromPackage(
  session: ConceptDirectedTwinSession,
): ConceptDirectedTwinV2ComposeFromPackageResult {
  const { sessionPatch, functionBindingSummary, artifacts } = buildTwinV2FromPackage(session);
  return {
    functionBindingSummary,
    fidelityReceipt: artifacts.fidelityReceipt,
    sessionPatch,
  };
}
