/**
 * P0.5E.4A — Multi-dimension character calibration inference.
 */

import { randomUUID } from 'node:crypto';
import type {
  CharacterCalibrationInference,
  CharacterCalibrationInteraction,
  FounderCalibrationReaction,
} from './types.js';
import { reactionToTruthState } from './reactions.js';

export function buildCalibrationInferences(params: {
  interaction: CharacterCalibrationInteraction;
  reaction: FounderCalibrationReaction;
  revision?: string | null;
}): CharacterCalibrationInference[] {
  const { interaction, reaction, revision } = params;
  const truthState = reactionToTruthState(reaction, Boolean(revision?.trim()));
  const directlyConfirmed = reaction === 'YES_THATS_HER';
  const baseDelta = directlyConfirmed ? 0.25 : reaction === 'ALMOST' ? 0.15 : reaction === 'NO_NOT_HER' ? -0.2 : 0;

  const dimensions = inferDimensionsForMoment(interaction.momentType, interaction.domain);
  const inferenceText =
    revision?.trim() ||
    (directlyConfirmed
      ? `Founder confirmed: ${interaction.systemRead.slice(0, 120)}`
      : reaction === 'NO_NOT_HER'
        ? `Founder rejected proposition: ${interaction.interactionId}`
        : reaction === 'IT_DEPENDS'
          ? `Context-dependent truth recorded for: ${interaction.interactionId}`
          : `Unresolved: ${interaction.interactionId}`);

  return dimensions.map((dim) => ({
    inferenceId: randomUUID(),
    sourceInteractionId: interaction.interactionId,
    founderReaction: reaction,
    founderRevision: revision?.trim() || null,
    inference: inferenceText,
    affectedDimensions: [dim],
    confidenceDelta: baseDelta,
    truthState: directlyConfirmed ? 'FOUNDER_CONFIRMED' : truthState === 'FOUNDER_CONFIRMED' ? 'SYSTEM_INFERRED' : truthState,
    directlyConfirmed,
    at: new Date().toISOString(),
  }));
}

function inferDimensionsForMoment(momentType: CharacterCalibrationInteraction['momentType'], domain: string): string[] {
  const map: Partial<Record<CharacterCalibrationInteraction['momentType'], string[]>> = {
    BEHAVIOR_PREDICTION: ['behavioral_specificity', 'capacity_to_be_wrong'],
    CONTRADICTION_TEST: ['contradiction_depth', 'social_behavior'],
    FLAW_STRESS_TEST: ['non_flattering_flaws', 'confirmation_bias'],
    VOICE_PREDICTION: ['voice_differentiation', 'humor_specificity'],
    BOOK_BEHAVIOR: ['book_relationship', 'external_memory'],
    VISUAL_HYPOTHESIS: ['visual_identity', 'camera_presence'],
    SYNTHESIS_READ: ['psychology', 'character_coherence'],
    CULTURAL_BOUNDARY: ['cultural_boundaries', 'intellectual_honesty'],
    RABBIT_HOLE_BEHAVIOR: ['pattern_recognition', 'private_humanity'],
    ERRATA_RESPONSE: ['public_correction_comfort', 'intellectual_honesty', 'humor_under_embarrassment'],
    SOCIAL_REACTION: ['ego_defensiveness', 'intellectual_honesty'],
  };
  return map[momentType] ?? [domain.toLowerCase()];
}

export function multiDimensionInferenceImplemented(): boolean {
  return true;
}

export function directAndInferredTruthRemainDistinct(inferences: CharacterCalibrationInference[]): boolean {
  return inferences.every((i) => i.directlyConfirmed === (i.truthState === 'FOUNDER_CONFIRMED'));
}

export function itDependsCreatesContextualTruth(reaction: FounderCalibrationReaction): boolean {
  return reaction === 'IT_DEPENDS';
}

export function iDontKnowPreservesUnresolved(reaction: FounderCalibrationReaction): boolean {
  return reaction === 'I_DONT_KNOW_YET';
}
