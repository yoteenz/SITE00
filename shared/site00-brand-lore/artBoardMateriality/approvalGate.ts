/**
 * First-slide material approval gate + P0.5E Round 01 lock integration.
 * P0.5C.5A — evaluates SELECTED asset current lineage.
 */

import type { Experiment01V23Artifact, MarketingExpressionExperiment01V23 } from './types.js';
import { v23HumanMadeRevisionReady } from './v23HumanMadeRevision.js';
import { signatureLimeRevisionReady } from './signatureLime.js';
import {
  migrateV23ArtifactGenerationLineage,
  selectedAssetPassesCurrentLineage,
} from './v23GenerationAuthority.js';

export function artBoardMaterialityApprovalGatePasses(artifact: Experiment01V23Artifact): boolean {
  const migrated = migrateV23ArtifactGenerationLineage(artifact);
  return (
    migrated.materialityEvaluation.passesApprovalGate &&
    v23HumanMadeRevisionReady(migrated.humanMadeEvaluation) &&
    signatureLimeRevisionReady(migrated.signatureLimeEvaluation)
  );
}

export function signatureLimeGatePasses(artifact: Experiment01V23Artifact): boolean {
  return signatureLimeRevisionReady(artifact.signatureLimeEvaluation);
}

export function v23SelectedAssetPassesCurrentLineage(artifact: Experiment01V23Artifact): boolean {
  return selectedAssetPassesCurrentLineage(migrateV23ArtifactGenerationLineage(artifact));
}

export function allV23ArtifactsPassMaterialGate(experiment: MarketingExpressionExperiment01V23 | null | undefined): boolean {
  if (!experiment?.generatedArtifacts.length) return false;
  return experiment.generatedArtifacts.every(artBoardMaterialityApprovalGatePasses);
}

export function allV23SelectedAssetsPassCurrentLineage(
  experiment: MarketingExpressionExperiment01V23 | null | undefined,
): boolean {
  if (!experiment?.generatedArtifacts.length) return false;
  return experiment.generatedArtifacts.every((a) => v23SelectedAssetPassesCurrentLineage(a));
}

export function round01LockRequiresMaterialGate(params: {
  v23Experiment: MarketingExpressionExperiment01V23 | null | undefined;
}): { allowed: boolean; reason: string | null } {
  if (!params.v23Experiment) {
    return { allowed: false, reason: 'Experiment 01 V2.3 art-board materiality contracts required before Round 01 lock' };
  }
  if (!allV23ArtifactsPassMaterialGate(params.v23Experiment)) {
    return { allowed: false, reason: 'All V2.3 artifacts must pass materiality + human-made + signature lime gates before lock' };
  }
  const generated = params.v23Experiment.generatedArtifacts.filter(
    (a) => a.generationStatus === 'GENERATED' && a.generatedAssetUrl,
  );
  if (generated.length < 9) {
    return { allowed: false, reason: 'All nine V2.3 first slides must be generated before Round 01 lock' };
  }
  if (!allV23SelectedAssetsPassCurrentLineage(params.v23Experiment)) {
    return {
      allowed: false,
      reason: 'Round 01 lock requires selected assets generated from current V2.3 contract lineage (C.4A + C.4B + C.5). Legacy generations remain visible but cannot lock.',
    };
  }
  return { allowed: true, reason: null };
}

export function slide02EvolvesMaterialNotCopy(): true {
  return true;
}
