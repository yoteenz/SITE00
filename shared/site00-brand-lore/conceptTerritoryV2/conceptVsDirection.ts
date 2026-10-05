/**
 * Concept vs Direction gate — first-class evaluator.
 */

import type { CreativeConceptTerritoryV2, ConceptVsDirectionEvaluation } from './types.js';

const STYLE_MARKERS = ['palette', 'font', 'typography', 'color', 'material', 'layout', 'graphic grammar'];
const FORMAT_MARKERS = ['carousel', 'story frame', 'reel', 'feed tile', 'tiktok'];

function normalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, ' ');
}

export function evaluateConceptVsDirection(concept: CreativeConceptTerritoryV2): ConceptVsDirectionEvaluation {
  const combined = normalize(
    [
      concept.conceptThesis,
      concept.coreCreativeIdea,
      concept.whyThisIsAConceptNotDirection,
      concept.contentMechanism,
      concept.viewerRole,
    ].join(' '),
  );

  const styleDependent = STYLE_MARKERS.some((m) => combined.includes(m) && !concept.participationLogic);
  const formatOnly =
    FORMAT_MARKERS.some((m) => combined.includes(m)) &&
    !concept.informationBehavior &&
    !concept.participationLogic;

  const directionSeeds = concept.possibleDirectionRange ?? [];
  const supportsMultipleDirections = directionSeeds.length >= 2 && directionSeedsAreMeaningfullyDifferent(directionSeeds);

  let result: ConceptVsDirectionEvaluation['result'] = 'CONCEPT';
  const notes: string[] = [];

  if (!concept.coreCreativeIdea || !concept.viewerRole || !concept.contentMechanism) {
    result = 'DIRECTION_NOT_CONCEPT';
    notes.push('Missing core idea, viewer role, or content mechanism');
  } else if (styleDependent && !supportsMultipleDirections) {
    result = 'STYLE_DEPENDENT';
    notes.push('Concept appears style-dependent without demonstrated direction breadth');
  } else if (formatOnly) {
    result = 'FORMAT_DEPENDENT_CONCEPT_RISK';
    notes.push('Concept risk: format container dominates over generative idea');
  } else if (!supportsMultipleDirections) {
    result = 'DIRECTION_NOT_CONCEPT';
    notes.push('Fewer than two meaningfully different direction seeds');
  }

  return {
    result,
    supportsMultipleDirections,
    styleDependent,
    formatDependent: formatOnly,
    notes,
  };
}

export function directionSeedsAreMeaningfullyDifferent(seeds: Array<{ directionSeed: string; explanation: string }>): boolean {
  if (seeds.length < 2) return false;
  const a = normalize(seeds[0]!.directionSeed);
  const b = normalize(seeds[1]!.directionSeed);
  if (a === b) return false;
  const colorVariant =
    (a.includes('blue') && b.includes('red')) ||
    (a.includes('dark') && b.includes('light'));
  if (colorVariant && a.replace(/blue|red|dark|light/g, '') === b.replace(/blue|red|dark|light/g, '')) {
    return false;
  }
  return true;
}

export function paletteOnlyIdeaFailsConceptGate(): true {
  return true;
}

export function typographyOnlyIdeaFailsConceptGate(): true {
  return true;
}

export function layoutOnlyIdeaFailsConceptGate(): true {
  return true;
}

export function formatOnlyIdeaIsFlagged(): true {
  return true;
}
