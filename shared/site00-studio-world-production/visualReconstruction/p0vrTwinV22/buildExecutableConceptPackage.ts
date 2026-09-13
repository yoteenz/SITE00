import type { ConceptCandidate, ExecutableConceptPackage } from './types.js';
import type { ConceptAssetManifest, ConceptBlueprint, ConceptFunctionBindingPlan } from './types.js';
import { canBuildConcept, computeConceptBuildReadiness } from './computeConceptBuildReadiness.js';
import { assertNoGeneratedHostArtifactsInClientBuild } from '../p0vrTwinV22R2/assertNoGeneratedHostArtifactsInClientBuild.js';
import type { HostShellContract } from '../p0vrTwinV22R2/types.js';

export function buildExecutableConceptPackage(input: {
  candidate: ConceptCandidate;
  blueprint: ConceptBlueprint;
  manifest: ConceptAssetManifest;
  bindingPlan: ConceptFunctionBindingPlan;
  shellContract: string[];
  hostShellContract?: HostShellContract;
  hostBoundary?: import('../p0vrTwinV22R2/types.js').SanitizedConceptBoundaryResult | null;
}): ExecutableConceptPackage {
  assertNoGeneratedHostArtifactsInClientBuild(input.blueprint);
  const readiness = computeConceptBuildReadiness({
    candidate: input.candidate,
    blueprint: input.blueprint,
    manifest: input.manifest,
    bindingPlan: input.bindingPlan,
    hostBoundary: input.hostBoundary ?? null,
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
    hostShellContract: input.hostShellContract,
    responsiveContract: input.blueprint.responsiveRelationships,
    pageIntentSnapshot: input.candidate.pageIntentSnapshot,
    functionGraphSnapshot: input.candidate.functionGraphSnapshot,
    status: 'READY',
    createdAt: now,
  };
}
