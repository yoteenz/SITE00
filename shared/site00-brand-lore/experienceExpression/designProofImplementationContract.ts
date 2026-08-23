/**
 * Implementation contract compiled from approved design proof — approved image is first-class reference.
 */

import { createHash } from 'node:crypto';
import type { SurfaceDesignProof } from './designProofTypes.js';
import type { ExperienceImplementationContract } from './types.js';
import type { ProjectWorkspaceCanon } from '../projectWorkspace/projectWorkspaceCanon.js';
import {
  assertSurfaceApprovedForImplementation,
  evaluateImplementationBlockers,
} from './surfaceDesignLifecycle.js';
import { composerSubstitutionBlocked } from './implementationContract.js';

export function compileDesignProofImplementationContract(params: {
  proof: SurfaceDesignProof;
  workspaceCanon: ProjectWorkspaceCanon;
}): ExperienceImplementationContract {
  const { proof, workspaceCanon } = params;
  const composed = proof.composedProof!;

  const assetBindings = proof.generatedAssets.map((asset) => ({
    requirementId: asset.requirementId,
    assetId: asset.requirementId,
    assetRole: asset.assetRole,
    assetFamily: asset.category,
    surfaceId: proof.proofId,
    pageRoute: proof.surface,
    responsiveVariants: [{ deviceClass: 'DESKTOP' as const, storagePath: asset.storagePath }],
    interactionRelationship: 'Integrated into approved composition',
    fallbackBehavior: 'IMPLEMENTATION_BLOCKED — do not substitute CSS or stock',
    productionState: 'VISUAL_DEVELOPMENT',
    approved: false,
  }));

  const functionalFingerprint = createHash('sha256')
    .update(JSON.stringify(proof.functionalCanon.items.map((i) => i.id)))
    .digest('hex')
    .slice(0, 16);

  const blockers = evaluateImplementationBlockers({
    lifecycle: proof.lifecycle,
    approvedDesignProofId: composed.proofVersion,
    approvedDesignProofVersion: composed.proofVersion,
    contractProofVersion: composed.proofVersion,
    missingRequiredAssets: [],
    functionalCanonFingerprint: functionalFingerprint,
    contractFunctionalFingerprint: functionalFingerprint,
    workspaceCanonFingerprint: workspaceCanon.canonId,
    contractWorkspaceFingerprint: workspaceCanon.canonId,
    clientExpressionFingerprint: proof.clientExpressionFingerprint,
    contractClientFingerprint: proof.clientExpressionFingerprint,
  });

  const approved = assertSurfaceApprovedForImplementation(proof.lifecycle).allowed;

  return {
    contractId: `contract-${proof.proofRecordId}`,
    selectedExperienceConceptId: proof.proofRecordId,
    selectedExperienceBibleId: workspaceCanon.canonId,
    selectedConceptTerritoryId: 'design-proof-derived',
    worldExpressionSystemId: 'none',
    functionalPreservation: proof.functionalCanon.items
      .filter((i) => i.classification !== 'LEGACY_PRESENTATION')
      .map((i) => i.label),
    hostInvariants: [
      'SITE 00 host recognition preserved',
      'Project workspace canon structural grammar',
      ...workspaceCanon.workbenchBehaviors.slice(0, 3),
    ],
    clientExpression:
      proof.clientExpression?.brandLoreSources.map((s) => `Client source: ${s}`) ?? ['SITE 00 owned — no client expression on index'],
    interactionGrammar: proof.artDirection.interactionArtRelationship.split(';').filter(Boolean),
    informationHierarchy: proof.artDirection.compositionalHierarchy,
    surfaceBehavior: [proof.artDirection.experientialRole],
    responsiveBehavior: [proof.artDirection.responsiveTransformation],
    motionBehavior: [proof.artDirection.motionBehavior],
    approvedVisualReferences: [composed.storagePath],
    assetBindings,
    missingRequiredAssets: [],
    implementationStatus: approved && blockers.length === 0 ? 'READY' : 'IMPLEMENTATION_BLOCKED_MISSING_ASSET',
    antiTemplateConstraints: proof.artDirection.prohibitedGenericTemplateBehavior,
    doNotConstraints: [
      'Do not choose a new design concept',
      'Do not substitute stock or generated assets with CSS',
      'Do not revert to equal cards',
      'Do not invent client typography without provenance',
      'Composer must receive approved visual proof image',
      'No production mutation without approved proof',
    ],
    acceptanceCriteria: [
      'CONCEPT_FIDELITY to approved design proof',
      'COMPOSITION_FIDELITY to composed image',
      'ASSET_FIDELITY — bound generated assets',
      'WORKSPACE_FIDELITY — ProjectWorkspaceCanon',
    ],
    compiledAt: new Date().toISOString(),
    approvedDesignProofId: composed.proofVersion,
    approvedDesignProofVersion: composed.proofVersion,
    approvedDesignProofStoragePath: composed.storagePath,
    approvedDesignProofFingerprint: composed.fingerprint,
    surfaceArtDirectionId: proof.artDirection.surfaceArtDirectionId,
    assetManifestId: proof.manifest?.manifestId ?? null,
    approvedAssetBindings: assetBindings,
    functionalCanonFingerprint: functionalFingerprint,
    workspaceCanonFingerprint: workspaceCanon.canonId,
    clientExpressionFingerprint: proof.clientExpressionFingerprint,
    responsiveIntent: proof.device,
    motionIntent: proof.artDirection.motionBehavior,
    doNotConstraintsExtended: proof.artDirection.prohibitedGenericTemplateBehavior,
    implementationBlockers: blockers,
  };
}

export function orchestrationRequiresValidContract(contract: ExperienceImplementationContract | null): boolean {
  if (!contract) return false;
  return Boolean(contract.approvedDesignProofStoragePath && contract.approvedDesignProofFingerprint);
}

export function composerReceivesApprovedVisualReference(contract: ExperienceImplementationContract): boolean {
  return (contract.approvedVisualReferences?.length ?? 0) > 0 && Boolean(contract.approvedDesignProofStoragePath);
}

export function composerSubstitutionProhibited(contract: ExperienceImplementationContract): boolean {
  return composerSubstitutionBlocked(contract);
}
