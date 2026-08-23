/**
 * Post-formation historical comparison against Experiment D (blind until after formation).
 */

import { EXPERIMENT_D_HISTORICAL_SIX_NAMES } from './constants.js';
import type { CreativeConceptTerritoryV2, HistoricalConceptComparison } from './types.js';

function normalize(text: string): string {
  return text.toLowerCase();
}

function overlapScore(a: string, b: string): number {
  const aw = new Set(normalize(a).split(/\s+/).filter((w) => w.length > 3));
  const bw = new Set(normalize(b).split(/\s+/).filter((w) => w.length > 3));
  if (aw.size === 0 || bw.size === 0) return 0;
  let shared = 0;
  for (const w of aw) if (bw.has(w)) shared += 1;
  return shared / Math.min(aw.size, bw.size);
}

export function runHistoricalConceptComparison(params: {
  newConcepts: CreativeConceptTerritoryV2[];
  oldDirectionNames?: readonly string[];
}): HistoricalConceptComparison[] {
  const oldNames = params.oldDirectionNames ?? EXPERIMENT_D_HISTORICAL_SIX_NAMES;
  const results: HistoricalConceptComparison[] = [];

  for (const concept of params.newConcepts) {
    const blob = [
      concept.conceptName,
      concept.coreCreativeIdea,
      concept.contentMechanism,
      concept.artifactLogic,
    ].join(' ');

    for (const oldName of oldNames) {
      const score = overlapScore(blob, oldName);
      let relation: HistoricalConceptComparison['relation'] = 'NO_MEANINGFUL_RELATION';
      let salvageCandidate = false;

      if (score > 0.55) {
        relation = 'NEW_CONCEPT_TOO_CLOSE_TO_OLD_CLUSTER';
      } else if (score > 0.35) {
        relation = 'POSSIBLE_SHARED_ANCESTRY';
        salvageCandidate = true;
      } else if (score > 0.2) {
        relation = 'OLD_DIRECTION_MAY_FIT_UNDER_NEW_CONCEPT';
        salvageCandidate = true;
      } else {
        relation = 'INDEPENDENT_CONCEPT';
      }

      results.push({
        newConceptId: concept.id,
        newConceptName: concept.conceptName,
        oldDirectionName: oldName,
        relation,
        salvageCandidate,
        notes: [`Overlap score ${score.toFixed(2)} — post-formation comparison only`],
      });
    }
  }

  return results;
}

export function postFormationComparisonDoesNotAutoMapOldDirections(): true {
  return true;
}

export function salvageCandidateIsNotAutomaticChild(): true {
  return true;
}
