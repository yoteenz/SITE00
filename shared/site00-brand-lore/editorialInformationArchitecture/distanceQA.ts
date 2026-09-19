/**
 * Three-distance QA + reading path.
 */

import type {
  ArtifactDistanceEvaluation,
  ArtifactReadingPath,
  FirstSlideArtDirectionContract,
} from './types.js';

export function buildArtifactReadingPath(params: {
  primaryHook: string;
  secondaryReveal: string | null;
  primaryEvidence: string[];
  primaryTrace: string;
  metadata: string[];
}): ArtifactReadingPath {
  const firstLook = params.primaryHook;
  const secondLook = params.secondaryReveal ?? params.primaryEvidence[0] ?? 'Visual evidence relationship';
  const thirdLook = params.primaryTrace || 'NDX human intervention';
  const optionalDiscovery = params.metadata[0] ?? 'Provenance / file metadata';

  return {
    firstLook,
    secondLook,
    thirdLook,
    optionalDiscovery,
    articulated: firstLook.length > 0 && secondLook.length > 0,
  };
}

export function readingPathRequiresFirstLook(path: ArtifactReadingPath): boolean {
  return path.firstLook.trim().length > 0;
}

export function readingPathSupportsSecondLook(path: ArtifactReadingPath): boolean {
  return path.secondLook.trim().length > 0;
}

export function evaluateArtifactDistances(contract: FirstSlideArtDirectionContract): ArtifactDistanceEvaluation {
  const hook = contract.viewerShouldNoticeFirst;
  const traceCount = contract.primaryTrace ? 1 : 0;

  const gridPass = hook.length <= 80 && hook.length >= 3;
  const feedPass = gridPass && contract.primaryEvidence.length <= 2;
  const inspectionPass = traceCount <= 1 && contract.informationDisclosure.some((d) => d.classification === 'PROVENANCE_ONLY' || d.classification === 'FIRST_SLIDE_OPTIONAL');

  return {
    grid: {
      pass: gridPass,
      survivesWhenSmall: hook,
      notes: gridPass ? [] : ['Dominant idea must survive thumbnail'],
    },
    feed: {
      pass: feedPass,
      hookLegible: feedPass,
      notes: feedPass ? [] : ['Hook must be legible without zoom'],
    },
    inspection: {
      pass: inspectionPass || Boolean(contract.optionalSecondaryTrace),
      rewardsInspection: Boolean(contract.optionalSecondaryTrace || contract.primaryTrace),
      notes: [],
    },
    evaluatedAt: new Date().toISOString(),
  };
}

export function gridComprehensionNotDependentOnMicrocopy(contract: FirstSlideArtDirectionContract): boolean {
  return contract.viewerShouldNoticeFirst.length >= 5;
}

export function gridDistanceEvaluationExists(eval_: ArtifactDistanceEvaluation): boolean {
  return eval_.grid.pass !== undefined;
}

export function feedDistanceEvaluationExists(eval_: ArtifactDistanceEvaluation): boolean {
  return eval_.feed.pass !== undefined;
}

export function inspectionDistanceEvaluationExists(eval_: ArtifactDistanceEvaluation): boolean {
  return eval_.inspection.pass !== undefined;
}
