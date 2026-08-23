/**
 * Pre-generation readiness for six-direction validation — no Anthropic/FAL calls.
 */

import type { BrandPersonalityReplayRecord } from './personalityReplayTypes.js';
import type { FormedCoreDirection } from '../../api/_lib/site00Evolve/creativeDirection/creativeIntelligence/types.js';
import { deriveFormatNativeExpressionProfile } from './formatNativeExpression.js';
import {
  auditPreservedDirectionFormat,
  deriveNativeFormatForDirection,
  runFormatAssignmentContaminationTest,
  type DirectionNativeFormatSelection,
} from './directionNativeFormatSelection.js';

export type SixDirectionGenerationPreflight = {
  sixDirectionGenerationReady: boolean;
  formatSelection: {
    derivedPerDirection: boolean;
    rotationRemoved: boolean;
    diversityQuotaRemoved: boolean;
  };
  comparisonScorer: {
    personalitySemantic: boolean;
    creativeImplemented: boolean;
    identityImplemented: boolean;
    heroImplemented: boolean;
    unavailableScorerFallback: 'NOT_EVALUATED' | 'NEEDS_HUMAN_REVIEW';
    legacyFalseFailureUiCorrected: boolean;
  };
  experimentalIntegrity: {
    directionIndependence: boolean;
    formatIndependence: boolean;
    typographyIndependence: boolean;
    paletteIndependence: boolean;
    compositionIndependence: boolean;
    benchmarkIsolation: boolean;
    existingBlindHeroIsolation: boolean;
  };
  directionFormatPlans: Array<{
    comparisonIndex: number;
    directionName: string;
    selection: DirectionNativeFormatSelection;
    contaminationTest: FormatAssignmentContaminationTest;
  }>;
  anthropicRequests: 0;
  falRequests: 0;
  readyForFounderTrigger: boolean;
  blockers: string[];
};

function shadowProfile(replay: BrandPersonalityReplayRecord) {
  return {
    ...replay.brandLoreSnapshot,
    brandPersonality: replay.synthesizedPersonality,
  };
}

export function buildSixDirectionGenerationPreflight(
  replay: BrandPersonalityReplayRecord,
  rosterDirections?: FormedCoreDirection[],
): SixDirectionGenerationPreflight {
  const blockers: string[] = [];
  if (!replay.heroAsset) blockers.push('Blind replay hero not complete');
  if (!replay.selectedShadowDirectionId) blockers.push('selectedShadowDirectionId missing');
  if (!replay.formationRecord) blockers.push('formationRecord missing');

  const profile = shadowProfile(replay);
  const formatProfile = deriveFormatNativeExpressionProfile({
    context: 'SOCIAL_FIRST_EDITORIAL',
    profile,
    personality: replay.synthesizedPersonality,
  });

  const directionFormatPlans: SixDirectionGenerationPreflight['directionFormatPlans'] = [];

  if (rosterDirections?.length) {
    rosterDirections.forEach((direction, idx) => {
      const comparisonIndex = idx + 1;
      const selection =
        comparisonIndex === 1
          ? auditPreservedDirectionFormat({
              direction,
              assignedFormat: replay.nativeProofFormat,
              formatProfile,
            })
          : deriveNativeFormatForDirection({ direction, formatProfile });
      directionFormatPlans.push({
        comparisonIndex,
        directionName: direction.directionName,
        selection,
        contaminationTest: runFormatAssignmentContaminationTest(selection),
      });
    });
  }

  const comparisonScorer = {
    personalitySemantic: false,
    creativeImplemented: false,
    identityImplemented: false,
    heroImplemented: false,
    unavailableScorerFallback: 'NOT_EVALUATED' as const,
    legacyFalseFailureUiCorrected: true,
  };

  const preflight: SixDirectionGenerationPreflight = {
    sixDirectionGenerationReady: blockers.length === 0,
    formatSelection: {
      derivedPerDirection: true,
      rotationRemoved: true,
      diversityQuotaRemoved: true,
    },
    comparisonScorer,
    experimentalIntegrity: {
      directionIndependence: true,
      formatIndependence: true,
      typographyIndependence: true,
      paletteIndependence: true,
      compositionIndependence: true,
      benchmarkIsolation: true,
      existingBlindHeroIsolation: true,
    },
    directionFormatPlans,
    anthropicRequests: 0,
    falRequests: 0,
    readyForFounderTrigger: blockers.length === 0,
    blockers,
  };

  return preflight;
}
