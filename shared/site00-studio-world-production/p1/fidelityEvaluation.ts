/**
 * P1 implementation fidelity evaluator — hybrid deterministic + vision scaffold.
 */

import { randomUUID } from 'node:crypto';
import type { SurfaceDesignProof } from '../../site00-brand-lore/experienceExpression/designProofTypes.js';
import { FIDELITY_DIMENSIONS } from './types.js';
import type {
  ExperienceImplementationEvaluationResult,
  FidelityDimensionResult,
  FidelityOverallResult,
  ImplementedSurfaceReference,
} from './types.js';
import { runDeterministicFunctionalChecks, functionalChecksPass } from './functionalPreservation.js';

const VISION_DIMENSIONS = new Set([
  'CONCEPT_FIDELITY',
  'PAGE_FAMILY_FIDELITY',
  'HOST_FIDELITY',
  'ARTWORK_FIDELITY',
  'ASSET_BINDING_FIDELITY',
  'TYPOGRAPHY_BEHAVIOR',
  'COLOR_BEHAVIOR',
  'COMPOSITION_BEHAVIOR',
  'INTERACTION_GRAMMAR',
  'GENERIC_TEMPLATE_RESEMBLANCE',
]);

export function evaluateImplementationFidelity(params: {
  runId: string;
  packageId: string;
  proof: SurfaceDesignProof;
  implementedCaptures: ImplementedSurfaceReference[];
  visionEvaluationAvailable: boolean;
  route?: string;
}): ExperienceImplementationEvaluationResult {
  const hasCapture = params.implementedCaptures.length > 0;
  const hasApprovedProof = Boolean(params.proof.composedProof);

  const functionalChecks = runDeterministicFunctionalChecks({
    route: params.route ?? params.proof.surface,
  });

  const dimensions = FIDELITY_DIMENSIONS.map((dimension) => {
    let result: FidelityDimensionResult = 'NOT_EVALUATED';
    const notes: string[] = [];

    if (VISION_DIMENSIONS.has(dimension)) {
      if (!params.visionEvaluationAvailable) {
        notes.push('Vision evaluation unavailable — NOT_EVALUATED');
      } else if (!hasCapture || !hasApprovedProof) {
        notes.push('Missing capture or approved proof — cannot evaluate');
        result = 'NOT_EVALUATED';
      }
    }

    if (dimension === 'FUNCTIONAL_FIDELITY') {
      result = functionalChecksPass(functionalChecks) ? 'PASS' : 'NOT_EVALUATED';
      if (!functionalChecksPass(functionalChecks)) {
        notes.push('One or more deterministic functional checks failed or unevaluated');
      }
    }

    if (dimension === 'RESPONSIVE_TRANSLATION') {
      const hasMobile = params.implementedCaptures.some((c) => c.viewport === 'MOBILE');
      const hasDesktop = params.implementedCaptures.some((c) => c.viewport === 'DESKTOP');
      if (!hasMobile && hasDesktop) {
        result = 'NOT_EVALUATED';
        notes.push('Desktop-only capture — mobile policy requires mobile evidence');
      }
    }

    if (!hasCapture) {
      result = 'NOT_EVALUATED';
      notes.push('No implemented surface capture — fidelity cannot PASS');
    }

    return { dimension, result, notes };
  });

  let overallResult: FidelityOverallResult = 'NOT_EVALUATED';
  if (!hasCapture) {
    overallResult = 'BLOCKED';
  } else if (dimensions.some((d) => d.result === 'FAIL' as FidelityDimensionResult)) {
    overallResult = 'VISUAL_FAILURE';
  } else if (!functionalChecksPass(functionalChecks)) {
    overallResult = 'FUNCTIONAL_FAILURE';
  } else if (dimensions.every((d) => d.result === 'NOT_EVALUATED')) {
    overallResult = 'NOT_EVALUATED';
  } else if (dimensions.some((d) => d.result === 'WARN' as FidelityDimensionResult)) {
    overallResult = 'PASS_WITH_WARNINGS';
  } else if (dimensions.every((d) => d.result === 'PASS' || d.result === 'NOT_EVALUATED')) {
    overallResult = dimensions.some((d) => d.result === 'PASS') ? 'PASS_WITH_WARNINGS' : 'NOT_EVALUATED';
  }

  return {
    evaluationId: randomUUID(),
    runId: params.runId,
    packageId: params.packageId,
    approvedProofId: params.proof.proofRecordId,
    implementedCaptureIds: params.implementedCaptures.map((c) => c.referenceId),
    evaluatedAt: new Date().toISOString(),
    overallResult,
    dimensions,
    deterministicFunctionalChecks: functionalChecks,
    visionEvaluationAvailable: params.visionEvaluationAvailable,
  };
}

export function failedImplementationCannotPass(
  evaluation: ExperienceImplementationEvaluationResult,
): boolean {
  if (evaluation.overallResult === 'PASS') {
    return evaluation.dimensions.some((d) => d.result === 'NOT_EVALUATED' && VISION_DIMENSIONS.has(d.dimension));
  }
  return true;
}

export function buildImplementationRevisionDelta(params: {
  parentPackageId: string;
  fidelity: ExperienceImplementationEvaluationResult;
  preserve?: string[];
}): import('./types.js').ImplementationRevisionDelta {
  const visualCorrections = params.fidelity.dimensions
    .filter((d) => d.result === 'FAIL' || d.result === 'WARN')
    .map((d) => `Address ${d.dimension}: ${d.notes.join('; ')}`);

  return {
    revisionId: `rev-${params.parentPackageId}-${Date.now()}`,
    parentPackageId: params.parentPackageId,
    preserve: params.preserve ?? [
      'Approved visual proof concept',
      'Host Canon',
      'Functional Canon routes and actions',
      'Project data and search',
    ],
    change: visualCorrections.length > 0 ? visualCorrections : ['Surgical visual corrections per fidelity findings'],
    doNot: [
      'Regenerate approved visual proof',
      'Change page-family grammar',
      'Remove required functionality',
      'Auto-rewrite code without founder review',
    ],
    functionalCorrections: params.fidelity.deterministicFunctionalChecks
      .filter((c) => c.result === 'FAIL')
      .map((c) => c.checkId),
    visualCorrections,
    responsiveCorrections: params.fidelity.dimensions
      .filter((d) => d.dimension === 'RESPONSIVE_TRANSLATION' && d.result !== 'PASS')
      .map((d) => d.notes.join('; ')),
    assetCorrections: [],
    accessibilityCorrections: params.fidelity.dimensions
      .filter((d) => d.dimension === 'ACCESSIBILITY_RISK')
      .flatMap((d) => d.notes),
    compiledAt: new Date().toISOString(),
    automaticCodeMutation: false,
  };
}
