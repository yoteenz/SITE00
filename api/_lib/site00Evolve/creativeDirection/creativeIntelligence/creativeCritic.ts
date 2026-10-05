/**
 * Deterministic Creative Critic checks — runs before/after provider critique.
 */

import type { CoreDirectionFormationInput, FormedCoreDirection, DirectionCritique } from './types.js';
import { detectObviousDuplication } from './formationValidation.js';

const GENERIC_MARKERS = ['any brand', 'timeless', 'clean modern', 'premium feel', 'website hero'];

export function runDeterministicCritic(
  input: CoreDirectionFormationInput,
  directions: FormedCoreDirection[],
): DirectionCritique[] {
  return directions.map((d) => {
    const failureReasons: string[] = [];
    const dimensions: DirectionCritique['dimensions'] = {};

    if (!d.loreLineage?.length) {
      failureReasons.push('Does not cite Brand Lore lineage');
      dimensions.LORE_LINEAGE_QUALITY = 'FAIL';
    } else {
      dimensions.LORE_LINEAGE_QUALITY = 'PASS';
    }

    const generic = GENERIC_MARKERS.some(
      (m) => d.bigIdea.toLowerCase().includes(m) || d.proprietaryQuality.toLowerCase().includes(m),
    );
    dimensions.ANTI_GENERIC_RISK = generic ? 'FAIL' : 'PASS';
    if (generic) failureReasons.push('Could belong to almost any brand');

    const colorOnly =
      d.coreColorLogic &&
      !d.governingBehavior &&
      d.bigIdea.toLowerCase().includes('color');
    if (colorOnly) {
      failureReasons.push('Main difference appears to be color');
      dimensions.DISTINCTIVENESS = 'FAIL';
    }

    if (input.brandExpressionContext === 'SOCIAL_FIRST_EDITORIAL') {
      const websiteConcept = /landing page|homepage|website hero|saas dashboard/i.test(
        `${d.bigIdea} ${d.socialExpressionHypothesis}`,
      );
      dimensions.SOCIAL_FIRST_VIABILITY = websiteConcept ? 'FAIL' : 'PASS';
      if (websiteConcept) failureReasons.push('Website-first concept for social-first brand');
    }

    if (!d.governingBehavior?.trim()) {
      failureReasons.push('No meaningful governing behavior');
      dimensions.CONCEPT_STRENGTH = 'FAIL';
    }

    if (!d.primaryBrandArtifact?.trim()) {
      failureReasons.push('No clear primary artifact/metaphor');
      dimensions.VISUAL_POTENTIAL = 'FAIL';
    }

    if (d.antiDirection?.length && input.creativeAntiPatterns?.length) {
      const contradicts = d.antiDirection.some((ad) =>
        input.creativeAntiPatterns!.some((cap) => ad.toLowerCase().includes(cap.toLowerCase().slice(0, 12))),
      );
      if (contradicts) {
        failureReasons.push('Contradicts anti-direction');
        dimensions.BRAND_GROUNDEDNESS = 'FAIL';
      }
    }

    const overall = failureReasons.length > 0 ? 'FAIL' : 'PASS';
    return {
      directionId: d.directionId,
      directionName: d.directionName,
      overall,
      dimensions,
      failureReasons,
      revisionGuidance: failureReasons.length ? failureReasons.join('; ') : null,
    };
  });
}

export function critiquesRequireRevision(critiques: DirectionCritique[]): boolean {
  return critiques.some((c) => c.overall === 'FAIL' || c.overall === 'WEAK');
}

export function failedDirectionIdsFromCritiques(critiques: DirectionCritique[]): string[] {
  return critiques.filter((c) => c.overall === 'FAIL' || c.overall === 'WEAK').map((c) => c.directionId);
}

export function buildDistinctivenessFromDirections(directions: FormedCoreDirection[]) {
  const duplicatePairs = detectObviousDuplication(directions);
  return {
    passed: duplicatePairs.length === 0,
    duplicatePairs,
    worldDifferentiationQuestion:
      'If names and colors disappeared, would these still feel like three different worlds?',
    worldDifferentiationAnswer:
      duplicatePairs.length === 0
        ? 'Yes — governing behaviors, artifacts, and metaphors diverge.'
        : 'No — obvious field duplication detected.',
  };
}
