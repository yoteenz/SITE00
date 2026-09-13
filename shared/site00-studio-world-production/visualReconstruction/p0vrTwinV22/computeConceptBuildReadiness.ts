import type {
  ConceptAssetManifest,
  ConceptBlueprint,
  ConceptBuildReadiness,
  ConceptCandidate,
  ConceptFunctionBindingPlan,
} from './types.js';
import type { SanitizedConceptBoundaryResult } from '../p0vrTwinV22R2/types.js';
import { assertClientCanvasExcludesHostArtifactExtent } from '../p0vrTwinV22R2/assertClientCanvasExcludesHostArtifactExtent.js';
import { assertClientCanvasIncludesFirstClientObject } from '../p0vrTwinV22R2/assertClientCanvasIncludesFirstClientObject.js';

export function computeConceptBuildReadiness(input: {
  candidate: Pick<ConceptCandidate, 'visualAssetUrl' | 'founderJudgment' | 'visualAuthorityStatus'>;
  blueprint: ConceptBlueprint | null;
  manifest: ConceptAssetManifest | null;
  bindingPlan: ConceptFunctionBindingPlan | null;
  hostBoundary?: SanitizedConceptBoundaryResult | null;
}): ConceptBuildReadiness {
  const visualReady = Boolean(input.candidate.visualAssetUrl);
  const blueprintReady = Boolean(input.blueprint && input.blueprint.objects.length > 0);
  const assetsReady = Boolean(
    input.manifest &&
      input.manifest.slots.length > 0 &&
      input.manifest.slots.every(
        (s) => s.status === 'RESOLVED' || s.sourceStrategy === 'CONCEPT_REGION_DERIVATION',
      ),
  );
  const functionsReady = Boolean(
    input.bindingPlan &&
      input.bindingPlan.requiredFunctionCoverage >= 0.75 &&
      input.bindingPlan.unboundFunctions.length <= 2,
  );
  const shellReady = Boolean(input.blueprint?.shellRelationship);
  let clientCanvasTrimOk = true;
  if (input.hostBoundary?.clientCanvasBoundary) {
    try {
      assertClientCanvasExcludesHostArtifactExtent({
        boundary: input.hostBoundary.clientCanvasBoundary,
        generatedHostArtifacts: input.hostBoundary.generatedHostArtifacts,
      });
      assertClientCanvasIncludesFirstClientObject(input.hostBoundary.clientCanvasBoundary);
    } catch {
      clientCanvasTrimOk = false;
    }
  }

  const hostBoundaryReady = input.hostBoundary
    ? Boolean(
        clientCanvasTrimOk &&
          input.hostBoundary.sanitizedBlueprint.objects.every((o) => !o.isGeneratedHostArtifact) &&
          input.hostBoundary.ownershipReceipt.status === 'RESOLVED' &&
          input.hostBoundary.hostShellContract.status === 'LOCKED' &&
          input.hostBoundary.clientCanvasBoundary.sanitizedCanvasHeight > 0,
      )
    : Boolean(input.blueprint && input.blueprint.objects.every((o) => !o.isGeneratedHostArtifact && o.type !== 'nav'));
  const responsiveReady = Boolean(input.blueprint?.responsiveRelationships.length);

  const unresolved: string[] = [];
  if (!visualReady) unresolved.push('visual');
  if (!blueprintReady) unresolved.push('blueprint');
  if (!assetsReady) unresolved.push('assets');
  if (!functionsReady) unresolved.push('functions');
  if (!shellReady) unresolved.push('shell');
  if (!hostBoundaryReady) unresolved.push('hostBoundary');
  if (!responsiveReady) unresolved.push('responsive');

  let status: ConceptBuildReadiness['status'] = 'VISUAL_ONLY';
  if (!visualReady) status = 'VISUAL_ONLY';
  else if (!blueprintReady) status = 'BLUEPRINT_INCOMPLETE';
  else if (!assetsReady) status = 'ASSETS_INCOMPLETE';
  else if (!functionsReady) status = 'FUNCTIONS_INCOMPLETE';
  else if (!hostBoundaryReady) status = 'FUNCTIONS_INCOMPLETE';
  else if (input.candidate.founderJudgment === 'APPROVED' && input.candidate.visualAuthorityStatus === 'LOCKED_FOR_BUILD') {
    status = 'APPROVED_READY_TO_BUILD';
  } else status = 'READY_TO_BUILD';

  return {
    visualReady,
    blueprintReady,
    assetsReady,
    functionsReady,
    shellReady,
    hostBoundaryReady,
    responsiveReady,
    unresolved,
    status,
  };
}

export function canBuildConcept(readiness: ConceptBuildReadiness, approved: boolean): boolean {
  if (!approved) return false;
  if (readiness.status === 'VISUAL_ONLY') return false;
  if (!readiness.blueprintReady || !readiness.assetsReady || !readiness.functionsReady || !readiness.hostBoundaryReady) {
    return false;
  }
  return readiness.status === 'READY_TO_BUILD' || readiness.status === 'APPROVED_READY_TO_BUILD';
}
