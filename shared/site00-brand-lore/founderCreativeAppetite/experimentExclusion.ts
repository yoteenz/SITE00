/**
 * Experiment isolation — Founder Creative Appetite must not contaminate frozen NDXBOOK runs.
 */

import {
  CREATIVE_APPETITE_AVAILABILITY,
  CREATIVE_APPETITE_AVAILABLE_FROM_CANON_VERSION,
  FROZEN_NDXBOOK_EXPERIMENT_IDS,
  NDXBOOK_CONCEPT_EXPERIMENT_SNAPSHOT_VERSION,
} from './constants.js';
import type { CreativeAppetiteExperimentExclusion } from './types.js';

const CONTAMINATION_KEYS = [
  'founderCreativeAppetite',
  'creativeAppetite',
  'creativeAppetiteProfile',
  'creativeRiskTolerance',
  'abstractionTolerance',
  'visualExperimentationTolerance',
  'appetiteSummary',
  'founderCreativeAppetiteSummary',
  'hardCreativeBoundaries',
  'creativeDirectorLatitude',
] as const;

export function buildNdxbookConceptExperimentExclusion(capturedAt: string): CreativeAppetiteExperimentExclusion {
  return {
    excludedFromExperimentId: 'ndxbook-six-concept-hero-range',
    excludedReason:
      'Intelligence collected after experiment snapshot began. Reserved for future creative work to preserve experimental integrity.',
    availableFromCanonVersion: CREATIVE_APPETITE_AVAILABLE_FROM_CANON_VERSION,
    capturedAt,
    availability: CREATIVE_APPETITE_AVAILABILITY.EXCLUDED_CURRENT_EXPERIMENT,
  };
}

export function isFrozenNdxbookExperiment(experimentId: string | null | undefined): boolean {
  if (!experimentId) return false;
  return (FROZEN_NDXBOOK_EXPERIMENT_IDS as readonly string[]).includes(experimentId);
}

export function shouldIncludeCreativeAppetiteInFormation(params: {
  experimentId?: string | null;
  intelligenceSnapshotVersion?: number | null;
}): boolean {
  if (isFrozenNdxbookExperiment(params.experimentId ?? null)) return false;
  const version = params.intelligenceSnapshotVersion ?? NDXBOOK_CONCEPT_EXPERIMENT_SNAPSHOT_VERSION;
  return version >= CREATIVE_APPETITE_AVAILABLE_FROM_CANON_VERSION;
}

export function assertCreativeAppetiteNotInjectedIntoFrozenExperiment(serializedPayload: string): void {
  const lower = serializedPayload.toLowerCase();
  for (const key of CONTAMINATION_KEYS) {
    if (lower.includes(key.toLowerCase())) {
      for (const frozenId of FROZEN_NDXBOOK_EXPERIMENT_IDS) {
        if (lower.includes(frozenId.toLowerCase())) {
          throw new Error(
            `CREATIVE_APPETITE_CONTAMINATION: "${key}" found in frozen experiment payload (${frozenId})`,
          );
        }
      }
      if (
        lower.includes('concept_orthogonality_experiment') ||
        lower.includes('concept_territory_hero') ||
        lower.includes('ndxbook-six-concept-hero-range')
      ) {
        throw new Error(`CREATIVE_APPETITE_CONTAMINATION: "${key}" found in frozen NDXBOOK concept experiment payload`);
      }
    }
  }
}

export function stripCreativeAppetiteFromPayload<T extends Record<string, unknown>>(payload: T): T {
  const clone = { ...payload };
  for (const key of CONTAMINATION_KEYS) {
    delete clone[key];
  }
  return clone;
}
