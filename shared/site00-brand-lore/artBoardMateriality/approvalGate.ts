/**
 * First-slide material approval gate + P0.5E Round 01 lock integration.
 * P0.5C.4B.1 — lime restraint gate.
 */

import type { Experiment01V23Artifact, MarketingExpressionExperiment01V23 } from './types.js';
import { v23HumanMadeRevisionReady } from './v23HumanMadeRevision.js';
import { signatureLimeRevisionReady } from './signatureLime.js';
import { signatureLimeRestraintGatePasses } from './signatureLimeRestraint.js';
import {
  migrateV23ArtifactGenerationLineage,
  selectedAssetPassesCurrentLineage,
} from './v23GenerationAuthority.js';
import { v23VisualAuthorityGatePasses } from './visualAuthorityC6.js';
import { v23AuthoredArtifactGatePasses } from './authoredArtifactC6A.js';
import { notebookCarouselGatePasses } from './notebookCarouselEvaluation.js';

export function artBoardMaterialityApprovalGatePasses(artifact: Experiment01V23Artifact): boolean {
  const migrated = migrateV23ArtifactGenerationLineage(artifact);
  return (
    migrated.materialityEvaluation.passesApprovalGate &&
    v23HumanMadeRevisionReady(migrated.humanMadeEvaluation) &&
    signatureLimeRevisionReady(migrated.signatureLimeEvaluation) &&
    signatureLimeRestraintGatePasses(migrated.contract.signatureLimeRestraint)
  );
}

export function signatureLimeGatePasses(artifact: Experiment01V23Artifact): boolean {
  return (
    signatureLimeRevisionReady(artifact.signatureLimeEvaluation) &&
    signatureLimeRestraintGatePasses(artifact.contract.signatureLimeRestraint)
  );
}

export function limeRestraintGatePasses(artifact: Experiment01V23Artifact): boolean {
  return signatureLimeRestraintGatePasses(artifact.contract.signatureLimeRestraint);
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

export function notebookCarouselGrammarGatePasses(artifact: Experiment01V23Artifact, topicIndex: number): boolean {
  return notebookCarouselGatePasses(artifact, topicIndex);
}

export function round01NotebookCarouselGate(params: {
  v23Experiment: MarketingExpressionExperiment01V23 | null | undefined;
}): { allowed: boolean; reason: string | null } {
  if (!params.v23Experiment) {
    return { allowed: false, reason: 'V2.3 experiment required for notebook carousel gate' };
  }
  const artifacts = params.v23Experiment.generatedArtifacts;
  const allPass = artifacts.every((a, i) => notebookCarouselGatePasses(a, i + 1));
  if (!allPass) {
    return {
      allowed: false,
      reason: 'P0.5C.7 NOTEBOOK_CAROUSEL_GATE — physical page, template grammar, uppercase, photo integration, construction history',
    };
  }
  return { allowed: true, reason: null };
}

export function authoredArtifactGatePasses(artifact: Experiment01V23Artifact): boolean {
  return v23AuthoredArtifactGatePasses(artifact);
}

export function visualAuthorityGatePasses(artifact: Experiment01V23Artifact): boolean {
  return v23VisualAuthorityGatePasses(artifact);
}

export function round01VisualAuthorityGate(params: {
  v23Experiment: MarketingExpressionExperiment01V23 | null | undefined;
}): { allowed: boolean; reason: string | null } {
  if (!params.v23Experiment) {
    return { allowed: false, reason: 'V2.3 experiment required for Round 01 visual authority gate' };
  }
  const generated = params.v23Experiment.generatedArtifacts.filter(
    (a) => a.generationStatus === 'GENERATED' && a.generatedAssetUrl,
  );
  if (generated.length < 9) {
    return { allowed: false, reason: 'All nine first slides must be generated before visual authority gate' };
  }
  if (!generated.every((a) => visualAuthorityGatePasses(a))) {
    return {
      allowed: false,
      reason: 'ROUND_01_VISUAL_AUTHORITY_GATE — all selected assets must pass P0.5C.6 visual appetite + bespoke art direction evaluations',
    };
  }
  if (!generated.every((a) => authoredArtifactGatePasses(a))) {
    return {
      allowed: false,
      reason: 'ROUND_01_AUTHORED_ARTIFACT_GATE — all selected assets must pass P0.5C.6A authored artifact grammar + human history evaluations',
    };
  }
  return { allowed: true, reason: null };
}

export function round01LockRequiresMaterialGate(params: {
  v23Experiment: MarketingExpressionExperiment01V23 | null | undefined;
}): { allowed: boolean; reason: string | null } {
  if (!params.v23Experiment) {
    return { allowed: false, reason: 'Experiment 01 V2.3 art-board materiality contracts required before Round 01 lock' };
  }
  if (!allV23ArtifactsPassMaterialGate(params.v23Experiment)) {
    return {
      allowed: false,
      reason: 'All V2.3 artifacts must pass materiality + human-made + signature lime + lime restraint gates before lock',
    };
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
      reason: 'Round 01 lock requires selected assets generated from current V2.3 contract lineage (C.4A + C.4B + C.4B.1 + C.5 + C.6 + C.6A). Legacy generations remain visible but cannot lock.',
    };
  }
  const visualGate = round01VisualAuthorityGate(params);
  if (!visualGate.allowed) {
    return visualGate;
  }
  return { allowed: true, reason: null };
}

export function slide02EvolvesMaterialNotCopy(): true {
  return true;
}

export function round01LockRequiresLimeRestraint(): true {
  return true;
}
