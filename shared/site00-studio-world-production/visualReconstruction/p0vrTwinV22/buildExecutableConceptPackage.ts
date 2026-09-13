import type { ConceptCandidate, ExecutableConceptPackage } from './types.js';
import type { ConceptAssetManifest, ConceptBlueprint, ConceptFunctionBindingPlan } from './types.js';
import { canBuildConcept, computeConceptBuildReadiness } from './computeConceptBuildReadiness.js';

export function buildExecutableConceptPackage(input: {
  candidate: ConceptCandidate;
  blueprint: ConceptBlueprint;
  manifest: ConceptAssetManifest;
  bindingPlan: ConceptFunctionBindingPlan;
  shellContract: string[];
}): ExecutableConceptPackage {
  const readiness = computeConceptBuildReadiness({
    candidate: input.candidate,
    blueprint: input.blueprint,
    manifest: input.manifest,
    bindingPlan: input.bindingPlan,
  });

  if (!canBuildConcept(readiness, input.candidate.founderJudgment === 'APPROVED')) {
    throw new Error('TWIN_V2_PACKAGE_BLOCKED: concept not approved-ready-to-build');
  }

  const now = new Date().toISOString();
  return {
    packageId: `ecp-${input.candidate.conceptId}`,
    conceptId: input.candidate.conceptId,
    visualAuthority: {
      imageUrl: input.candidate.visualAssetUrl,
      imageStorageRef: input.candidate.visualAsset,
      lockedAt: now,
    },
    blueprint: { ...input.blueprint, status: 'LOCKED' },
    assetManifest: input.manifest,
    functionBindingPlan: input.bindingPlan,
    shellContract: input.shellContract,
    responsiveContract: input.blueprint.responsiveRelationships,
    status: 'READY',
    createdAt: now,
  };
}
