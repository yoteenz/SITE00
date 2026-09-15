import type { CompiledMobileTwinImplementationDocument } from '../p0vrTwinV30R8M/types.js';
import { scanDocumentForAuthorityRasterViolations } from './runtimeAuthorityRasterFirewall.js';
import { R8M1_CORRECTION_REQUIRED_REASON } from './constants.js';

export function documentRequiresR8M2Recompile(doc: CompiledMobileTwinImplementationDocument): boolean {
  if (
    doc.compilerGeneration === 'R8M2R5' &&
    doc.implementationVersion === 'mobile-twin-impl-v7-forensic-blueprint' &&
    doc.forensicFidelityGate?.status === 'REVIEW_READY'
  ) {
    return false;
  }
  if (doc.compilerGeneration === 'R8M2R4' || doc.compilerGeneration === 'R8M2R3') return true;
  if (
    doc.compilerGeneration === 'R8M2R2' ||
    doc.compilerGeneration === 'R8M2R1' ||
    doc.compilerGeneration === 'R8M2'
  ) {
    return true;
  }
  if (doc.compilerGeneration === 'R8M1' || doc.compilerGeneration === 'R8M') return true;
  const uris = (doc.renderTree?.nodes ?? doc.nodes).map((n) => n.imageUri);
  if (scanDocumentForAuthorityRasterViolations(uris).length) return true;
  return !doc.implementationVersion || doc.implementationVersion !== 'mobile-twin-impl-v3';
}

export function markR8M1CorrectionRequired(doc: CompiledMobileTwinImplementationDocument): CompiledMobileTwinImplementationDocument {
  return {
    ...doc,
    priorBuildCorrection: {
      priorGeneration: doc.compilerGeneration ?? 'R8M1',
      reason: R8M1_CORRECTION_REQUIRED_REASON,
      status: 'CORRECTION_REQUIRED',
    },
  };
}
