/**
 * P0.CGO.2 — ConceptualEfficiencyQA + enhanced generic detection integration.
 */

import type { CampaignWorldCandidate } from './types.js';
import type { ConceptualEfficiencyQAResult } from './conceptualEfficiencyTypes.js';
import { detectGenericExecution } from './genericExecutionDetector.js';
import { hasRealConnectionPath } from './lateralWorldSearch.js';

export function runConceptualEfficiencyQA(candidate: CampaignWorldCandidate): ConceptualEfficiencyQAResult {
  const e = candidate.efficiencyEnrichment;
  const checks: ConceptualEfficiencyQAResult['checks'] = [];
  const revisionHints: string[] = [];

  checks.push({
    check: 'product_interaction_naturalness',
    pass: (e?.naturalProductVisibility.overall ?? 0) >= 0.65,
    detail: e?.naturalProductVisibility.reason ?? 'missing enrichment',
  });

  checks.push({
    check: 'world_category_distance',
    pass: (e?.categoryEnvironmentDependency.classification ?? '') !== 'HIGH_DEPENDENCY',
    detail: `dependency: ${e?.categoryEnvironmentDependency.classification ?? 'unknown'}`,
  });

  checks.push({
    check: 'interaction_bridge_strength',
    pass: e ? hasRealConnectionPath(e.interactionBridge) : false,
    detail: e?.interactionBridge.whyNatural ?? '',
  });

  checks.push({
    check: 'conceptual_yield',
    pass: candidate.conceptualYield.overall >= 0.55,
    detail: `${Math.round(candidate.conceptualYield.overall * 100)}%`,
  });

  checks.push({
    check: 'conceptual_efficiency',
    pass: (e?.conceptualEfficiency.overall ?? 0) >= 0.55,
    detail: e?.conceptualEfficiency.classification ?? '',
  });

  checks.push({
    check: 'conceptual_density',
    pass: (e?.conceptualDensity.overall ?? 0) >= 0.4,
    detail: `${e?.conceptualDensity.averageRolesPerElement ?? 0} roles/element`,
  });

  checks.push({
    check: 'production_complexity_appropriate',
    pass: (e?.productionComplexity.level ?? 'HIGH') !== 'EXTREME' || candidate.conceptualYield.overall >= 0.8,
    detail: e?.productionComplexity.level ?? '',
  });

  checks.push({
    check: 'camera_economy',
    pass: (e?.cameraEconomy.overall ?? 0) >= 0.5,
    detail: `${e?.cameraEconomy.cameraDecisions ?? 0} camera decisions`,
  });

  checks.push({
    check: 'forced_placement',
    pass: (e?.forcedPlacementFlags.length ?? 1) === 0,
    detail: e?.forcedPlacementFlags.join(', ') || 'none',
  });

  const copySample = candidate.copyLanguage.join(' ');
  checks.push({
    check: 'world_native_copy',
    pass: !/luxury that moves|timeless luxury|elevate your look/i.test(copySample),
    detail: copySample.slice(0, 60),
  });

  checks.push({
    check: 'motif_propagation',
    pass: candidate.motifs.length >= 2,
    detail: candidate.motifs.slice(0, 3).join(', '),
  });

  checks.push({
    check: 'human_expression_integration',
    pass:
      candidate.humanExpression.hair.length +
        candidate.humanExpression.hands.length +
        candidate.humanExpression.movement.length >
      0,
    detail: 'styling participates in concept',
  });

  checks.push({
    check: 'creative_leap_from_generation',
    pass: e?.creativeLeapTrace.fromGenerationPath === true,
    detail: e?.creativeLeapTrace.connectiveLogic ?? '',
  });

  const genericFlags = detectGenericExecution(
    `${candidate.productIntegration.join(' ')} ${candidate.setting}`,
    'INTERACTION',
  );

  if (!checks.find((c) => c.check === 'product_interaction_naturalness')?.pass) {
    revisionHints.push('Make the product appear through the subject\'s action rather than a presentation pose.');
  }
  if (!checks.find((c) => c.check === 'world_category_distance')?.pass) {
    revisionHints.push('Move world laterally — product category should not define the environment.');
  }
  if ((e?.productionComplexity.shotCount ?? 0) > 4) {
    revisionHints.push('Remove the second location. Keep the camera locked.');
  }
  if (!checks.find((c) => c.check === 'world_native_copy')?.pass) {
    revisionHints.push('Let the world motif generate the title — avoid generic product descriptor copy.');
  }
  if (revisionHints.length === 0 && genericFlags.length) {
    revisionHints.push('Reduce generic editorial polish. Increase behavior specificity.');
  }

  const pass = checks.filter((c) => !c.pass).length <= 2 && genericFlags.length <= 1;

  return { pass, checks, genericFlags, revisionHints };
}
