/**
 * First-slide approval gate + P0.5E Round 01 lock integration.
 */

import type { Experiment01V22Artifact, MarketingExpressionExperiment01V22 } from './types.js';

export function characterRetentionApprovalGatePasses(artifact: Experiment01V22Artifact): boolean {
  return artifact.characterEvaluation.passesApprovalGate;
}

export function allV22ArtifactsPassCharacterGate(experiment: MarketingExpressionExperiment01V22 | null | undefined): boolean {
  if (!experiment?.generatedArtifacts.length) return false;
  return experiment.generatedArtifacts.every(characterRetentionApprovalGatePasses);
}

export function round01LockRequiresCharacterRetentionGate(params: {
  v22Experiment: MarketingExpressionExperiment01V22 | null | undefined;
}): { allowed: boolean; reason: string | null } {
  if (!params.v22Experiment) {
    return { allowed: false, reason: 'Experiment 01 V2.2 character retention contracts required before Round 01 lock' };
  }
  if (!allV22ArtifactsPassCharacterGate(params.v22Experiment)) {
    return { allowed: false, reason: 'All V2.2 artifacts must pass character retention approval gate before lock' };
  }
  const generated = params.v22Experiment.generatedArtifacts.filter(
    (a) => a.generationStatus === 'GENERATED' && a.generatedAssetUrl,
  );
  if (generated.length < 9) {
    return { allowed: false, reason: 'All nine V2.2 first slides must be generated before Round 01 lock' };
  }
  return { allowed: true, reason: null };
}

export function slide02InheritsCharacterNotJoke(): true {
  return true;
}
