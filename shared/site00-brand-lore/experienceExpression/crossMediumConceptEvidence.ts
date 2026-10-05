/**
 * Cross-medium Concept Territory evidence — provenance-safe, not auto-promoted to Experience Concepts.
 */

import type { CanonicalNdxbookDirectionName } from '../canonicalCreativeRangeConstants.js';
import { buildConceptTerritorySeed } from '../conceptTerritory/conceptTerritorySeeds.js';
import type { CreativeConceptTerritory, WorldExpressionSystem } from '../conceptTerritory/conceptTerritoryTypes.js';
import { EXPERIENCE_TERRITORY_SELECTION_PURPOSE } from './constants.js';

export const CROSS_MEDIUM_EVIDENCE_CLASSIFICATIONS = [
  'BRAND_LEVEL',
  'MEDIUM_SPECIFIC',
  'CONCEPT_SPECIFIC',
  'PREFERENCE_EVIDENCE',
  'EXPLICITLY_PROMOTED_CROSS_MEDIUM',
  'NOT_APPLICABLE',
] as const;

export type CrossMediumEvidenceClassification = (typeof CROSS_MEDIUM_EVIDENCE_CLASSIFICATIONS)[number];

export type CrossMediumConceptEvidence = {
  evidenceId: string;
  territoryId: string;
  directionName: CanonicalNdxbookDirectionName;
  classification: CrossMediumEvidenceClassification;
  /** Creative Concept Territory is social/creative medium evidence — not an Experience Concept. */
  mediumSpecificity: 'SOCIAL_CREATIVE' | 'EXPERIENCE' | 'UNKNOWN';
  centralConcept: string;
  primaryVisualMechanism: string;
  worldExpressionSystemId: string | null;
  promotionPurpose: typeof EXPERIENCE_TERRITORY_SELECTION_PURPOSE | null;
  promotedAt: string | null;
  provenanceNote: string;
  eligibleForExperienceFormation: boolean;
};

export function classifyExperimentDTerritoryEvidence(
  territory: CreativeConceptTerritory,
  world: WorldExpressionSystem | null,
  options?: {
    explicitlyPromoted?: boolean;
    promotionPurpose?: typeof EXPERIENCE_TERRITORY_SELECTION_PURPOSE | null;
    promotedAt?: string | null;
  },
): CrossMediumConceptEvidence {
  const classification: CrossMediumEvidenceClassification = options?.explicitlyPromoted
    ? 'EXPLICITLY_PROMOTED_CROSS_MEDIUM'
    : 'MEDIUM_SPECIFIC';

  return {
    evidenceId: `cmce-${territory.territoryId}`,
    territoryId: territory.territoryId,
    directionName: territory.directionName as CanonicalNdxbookDirectionName,
    classification,
    mediumSpecificity: 'SOCIAL_CREATIVE',
    centralConcept: territory.centralConcept,
    primaryVisualMechanism: territory.primaryVisualMechanism,
    worldExpressionSystemId: world?.expressionSystemId ?? null,
    promotionPurpose: options?.explicitlyPromoted ? (options.promotionPurpose ?? EXPERIENCE_TERRITORY_SELECTION_PURPOSE) : null,
    promotedAt: options?.promotedAt ?? null,
    provenanceNote:
      classification === 'EXPLICITLY_PROMOTED_CROSS_MEDIUM'
        ? 'Founder explicitly promoted cross-medium evidence — still not an Experience Concept'
        : 'Experiment D Creative Concept Territory — medium-specific evidence only',
    eligibleForExperienceFormation: true,
  };
}

export function buildAllExperimentDTerritoryEvidence(): CrossMediumConceptEvidence[] {
  const directions: CanonicalNdxbookDirectionName[] = [
    'THE MARKED-UP COPY',
    'THE COUNTDOWN ROOM',
    'THE PERSONAL ARCHIVE',
    'THE ANNOTATED COPY',
    'THE ROOM WHERE IT HAPPENS',
    'THE INDEX',
  ];
  return directions.map((name) => {
    const { territory, expression } = buildConceptTerritorySeed(name);
    return classifyExperimentDTerritoryEvidence(territory, expression);
  });
}

export function crossMediumEvidenceStatus(
  evidence: CrossMediumConceptEvidence[],
): 'NONE' | 'MEDIUM_SPECIFIC_ONLY' | 'EXPLICITLY_PROMOTED_AVAILABLE' {
  if (!evidence.length) return 'NONE';
  if (evidence.some((e) => e.classification === 'EXPLICITLY_PROMOTED_CROSS_MEDIUM')) {
    return 'EXPLICITLY_PROMOTED_AVAILABLE';
  }
  return 'MEDIUM_SPECIFIC_ONLY';
}

export function historicalRepetitionNotAutoCanon(evidence: CrossMediumConceptEvidence[]): boolean {
  return evidence.every((e) => e.classification !== 'BRAND_LEVEL');
}
