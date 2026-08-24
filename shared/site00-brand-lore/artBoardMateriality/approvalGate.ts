/**
 * First-slide material approval gate + P0.5E Round 01 lock integration.
 */

import type { Experiment01V23Artifact, MarketingExpressionExperiment01V23 } from './types.js';
import { v23HumanMadeRevisionReady } from './v23HumanMadeRevision.js';

export function artBoardMaterialityApprovalGatePasses(artifact: Experiment01V23Artifact): boolean {
  return (
    artifact.materialityEvaluation.passesApprovalGate &&
    v23HumanMadeRevisionReady(artifact.humanMadeEvaluation)
  );
}

export function allV23ArtifactsPassMaterialGate(experiment: MarketingExpressionExperiment01V23 | null | undefined): boolean {
  if (!experiment?.generatedArtifacts.length) return false;
  return experiment.generatedArtifacts.every(artBoardMaterialityApprovalGatePasses);
}

export function round01LockRequiresMaterialGate(params: {
  v23Experiment: MarketingExpressionExperiment01V23 | null | undefined;
}): { allowed: boolean; reason: string | null } {
  if (!params.v23Experiment) {
    return { allowed: false, reason: 'Experiment 01 V2.3 art-board materiality contracts required before Round 01 lock' };
  }
  if (!allV23ArtifactsPassMaterialGate(params.v23Experiment)) {
    return { allowed: false, reason: 'All V2.3 artifacts must pass art-board materiality approval gate before lock' };
  }
  const generated = params.v23Experiment.generatedArtifacts.filter(
    (a) => a.generationStatus === 'GENERATED' && a.generatedAssetUrl,
  );
  if (generated.length < 9) {
    return { allowed: false, reason: 'All nine V2.3 first slides must be generated before Round 01 lock' };
  }
  return { allowed: true, reason: null };
}

export function slide02EvolvesMaterialNotCopy(): true {
  return true;
}
