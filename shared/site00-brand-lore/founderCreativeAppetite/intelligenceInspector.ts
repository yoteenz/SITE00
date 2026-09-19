/**
 * Admin/founder intelligence inspector — separate domains with provenance.
 */

import type { BrandLoreProfile } from '../types.js';
import { CREATIVE_APPETITE_AVAILABILITY } from './constants.js';
import type { FounderCreativeAppetiteProfile } from './types.js';
import { isFrozenNdxbookExperiment } from './experimentExclusion.js';

export type IntelligenceDomainInspector = {
  domain: string;
  label: string;
  captured: boolean;
  profileVersion: string | number | null;
  provenance: string | null;
  experimentExclusion: {
    excluded: boolean;
    excludedFromExperimentId: string | null;
    excludedReason: string | null;
    availableFromCanonVersion: number | null;
  } | null;
};

export function buildIntelligenceInspectorView(params: {
  profile: BrandLoreProfile | null;
  orgSlug: string;
  experimentId?: string | null;
}): {
  brandPersonality: IntelligenceDomainInspector;
  primaryExpressionContext: IntelligenceDomainInspector;
  founderCreativeAppetite: IntelligenceDomainInspector;
  ndxbookConceptExperiment: {
    frozen: boolean;
    creativeAppetiteInjected: false;
    reason: string | null;
  } | null;
} {
  const { profile, orgSlug, experimentId = 'ndxbook-six-concept-hero-range' } = params;
  const appetite = profile?.founderCreativeAppetite ?? null;
  const appetiteCaptured = Boolean(appetite && Object.keys(appetite.rawAnswers ?? {}).length > 0);
  const exclusion = appetite?.experimentExclusions?.[0] ?? null;
  const isNdxbook = orgSlug === 'ndxbook';

  return {
    brandPersonality: {
      domain: 'BRAND_PERSONALITY',
      label: 'Brand Personality',
      captured: Boolean(profile?.brandPersonality),
      profileVersion: profile?.brandPersonality?.profileVersion ?? null,
      provenance: profile?.brandPersonality ? 'IDENTITY_LORE / CALIBRATION' : null,
      experimentExclusion: null,
    },
    primaryExpressionContext: {
      domain: 'PRIMARY_EXPRESSION_CONTEXT',
      label: 'Primary Expression Context',
      captured: Boolean(profile?.contextClassification),
      profileVersion: profile?.profileVersion ?? null,
      provenance: profile?.contextClassification ?? null,
      experimentExclusion: null,
    },
    founderCreativeAppetite: {
      domain: 'FOUNDER_CREATIVE_APPETITE',
      label: 'Founder Creative Appetite',
      captured: appetiteCaptured,
      profileVersion: appetite?.profileVersion ?? null,
      provenance: appetiteCaptured ? 'FOUNDER_QUESTIONNAIRE' : null,
      experimentExclusion: exclusion
        ? {
            excluded: exclusion.availability === CREATIVE_APPETITE_AVAILABILITY.EXCLUDED_CURRENT_EXPERIMENT,
            excludedFromExperimentId: exclusion.excludedFromExperimentId,
            excludedReason: exclusion.excludedReason,
            availableFromCanonVersion: exclusion.availableFromCanonVersion,
          }
        : null,
    },
    ndxbookConceptExperiment: isNdxbook
      ? {
          frozen: isFrozenNdxbookExperiment(experimentId),
          creativeAppetiteInjected: false as const,
          reason: appetiteCaptured
            ? 'COLLECTED AFTER EXPERIMENT SNAPSHOT — RESERVED FOR FUTURE CREATIVE WORK'
            : 'CREATIVE APPETITE NOT YET CAPTURED',
        }
      : null,
  };
}

export function buildCreativeAppetiteAvailabilityRecord(
  appetite: FounderCreativeAppetiteProfile | null | undefined,
): {
  availability: string;
  excludedFromExperimentId: string | null;
  excludedReason: string | null;
  availableFromCanonVersion: number;
  capturedAt: string | null;
} {
  const exclusion = appetite?.experimentExclusions?.[0];
  return {
    availability:
      exclusion?.availability ??
      (appetite ? CREATIVE_APPETITE_AVAILABILITY.AVAILABLE_FUTURE : CREATIVE_APPETITE_AVAILABILITY.AVAILABLE_FUTURE),
    excludedFromExperimentId: exclusion?.excludedFromExperimentId ?? null,
    excludedReason: exclusion?.excludedReason ?? null,
    availableFromCanonVersion: exclusion?.availableFromCanonVersion ?? 2,
    capturedAt: appetite?.capturedAt ?? null,
  };
}
