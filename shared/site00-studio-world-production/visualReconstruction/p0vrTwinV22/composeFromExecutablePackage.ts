import type { ConceptDirectedTwinSession } from '../p0vrTwinV21/types.js';
import type { ConceptBuildFidelityReceipt } from './types.js';
import { buildTwinV2ViaVisualCompiler } from '../p0vrTwinV24R1/buildTwinV2ViaVisualCompiler.js';

export type ConceptDirectedTwinV2ComposeFromPackageResult = {
  sessionPatch: Partial<ConceptDirectedTwinSession>;
  functionBindingSummary: string[];
  fidelityReceipt: ConceptBuildFidelityReceipt;
};

/** BUILD THIS CONCEPT → VISUAL_TO_CODE_COMPILER (no legacy package/semantic renderer). */
export function composeConceptDirectedTwinV2FromPackage(
  session: ConceptDirectedTwinSession,
): ConceptDirectedTwinV2ComposeFromPackageResult {
  const { sessionPatch, functionBindingSummary, fidelityReceipt } = buildTwinV2ViaVisualCompiler(session);
  return {
    functionBindingSummary,
    fidelityReceipt,
    sessionPatch,
  };
}
