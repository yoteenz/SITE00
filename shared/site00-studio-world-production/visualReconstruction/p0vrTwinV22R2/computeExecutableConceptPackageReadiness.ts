import type { ConceptBuildReadiness, ConceptCandidate } from '../p0vrTwinV22/types.js';

export type ExecutableConceptPackageReadiness = {
  conceptId: string;
  visual: boolean;
  blueprint: boolean;
  assets: boolean;
  functions: boolean;
  hostBoundary: boolean;
  approved: boolean;
  readyToBuild: boolean;
  blockingReasons: string[];
};

export function computeExecutableConceptPackageReadiness(input: {
  candidate: ConceptCandidate;
  readiness: ConceptBuildReadiness;
}): ExecutableConceptPackageReadiness {
  const r = input.readiness;
  const approved = input.candidate.founderJudgment === 'APPROVED';
  const blockingReasons: string[] = [];
  if (!r.visualReady) blockingReasons.push('visual');
  if (!r.blueprintReady) blockingReasons.push('blueprint');
  if (!r.assetsReady) blockingReasons.push('assets');
  if (!r.functionsReady) blockingReasons.push('functions');
  if (!r.hostBoundaryReady) blockingReasons.push('hostBoundary');
  if (!approved) blockingReasons.push('approval');

  const readyToBuild =
    approved &&
    r.visualReady &&
    r.blueprintReady &&
    r.assetsReady &&
    r.functionsReady &&
    r.hostBoundaryReady;

  return {
    conceptId: input.candidate.conceptId,
    visual: r.visualReady,
    blueprint: r.blueprintReady,
    assets: r.assetsReady,
    functions: r.functionsReady,
    hostBoundary: r.hostBoundaryReady,
    approved,
    readyToBuild,
    blockingReasons,
  };
}
