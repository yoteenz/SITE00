import type { CompiledMobileTwinImplementationDocument } from './types.js';
import { REJECTED_WIREFRAME_REASON } from '../p0vrTwinV30R8M1/constants.js';

/** R8M wireframe compiler output — semantic roles leaked as UI. */
export function isWireframeImplementationDocument(doc: CompiledMobileTwinImplementationDocument): boolean {
  if (doc.compilerGeneration === 'R8M1') return false;
  if (doc.renderTree?.nodes?.length) return false;
  return true;
}

export function isProductionReadyImplementationDocument(doc: CompiledMobileTwinImplementationDocument): boolean {
  const generationOk =
    doc.compilerGeneration === 'R8M2R2' ||
    doc.compilerGeneration === 'R8M2R1' ||
    doc.compilerGeneration === 'R8M2' ||
    doc.compilerGeneration === 'R8M1';
  const regionOk =
    doc.compilerGeneration === 'R8M2R2' ?
      Boolean(
        doc.translationBriefConsumed &&
          doc.codingPromptInjected &&
          doc.translationReadiness?.status !== 'BLOCKED' &&
          doc.implementationExpressionIr?.readiness.status !== 'BLOCKED',
      )
    : doc.compilerGeneration === 'R8M2R1' ?
      Boolean(doc.implementationExpressionIr?.readiness.status !== 'BLOCKED')
    : doc.compilerGeneration !== 'R8M2' ||
      Boolean(doc.regionFidelityReceipts?.length && doc.visualFidelityEvaluation?.machinePass);
  return (
    generationOk &&
    regionOk &&
    Boolean(doc.renderTree?.nodes?.length) &&
    Boolean(doc.authoritiesLoaded?.actualRenderUri) &&
    Boolean(doc.authoritiesLoaded?.blueprintRenderUri)
  );
}

export function wireframeRejectionReason(): string {
  return REJECTED_WIREFRAME_REASON;
}
