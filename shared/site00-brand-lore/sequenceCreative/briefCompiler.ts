/**
 * Compile sequence-native creative brief for individual frames.
 */

import type { SequenceCreativeSystem, FrameSequenceContext } from './types.js';
import { resolveSequenceReferenceStrategy } from './referenceStrategy.js';

export function compileSequenceFrameBrief(params: {
  brandIntelligenceSummary?: string;
  conceptTerritorySummary?: string;
  worldExpressionSummary?: string;
  sequenceSystem: SequenceCreativeSystem;
  frameContext: FrameSequenceContext;
}): Record<string, unknown> {
  const ref = resolveSequenceReferenceStrategy(params.sequenceSystem);

  return {
    methodologyVersion: params.sequenceSystem.methodologyVersion,
    brandIntelligence: params.brandIntelligenceSummary ?? null,
    conceptTerritory: params.conceptTerritorySummary ?? null,
    worldExpression: params.worldExpressionSummary ?? null,
    sequenceCreativeSystem: {
      sequenceId: params.sequenceSystem.sequenceId,
      allowedPalette: params.sequenceSystem.allowedPalette,
      paletteUsageHierarchy: params.sequenceSystem.paletteUsageHierarchy,
      typographySystem: params.sequenceSystem.typographySystem,
      graphicGrammar: params.sequenceSystem.graphicGrammar,
      materialTreatment: params.sequenceSystem.materialTreatment,
      imageTreatment: params.sequenceSystem.imageTreatment,
      prohibitedDrift: params.sequenceSystem.prohibitedDrift,
      allowedVariation: params.sequenceSystem.allowedVariation,
    },
    frame: {
      index: params.frameContext.frameIndex,
      role: params.frameContext.frameRole,
      anchorSummary: params.frameContext.anchorSummary,
      previousFrameSummary: params.frameContext.previousFrameSummary,
      controlledDeviation: params.frameContext.controlledDeviation,
    },
    referenceStrategy: ref,
    explicitProhibitions: [
      'Do not create another image in this style without sequence contract',
      'Do not copy Slide 01 composition',
      'Do not alter post-level palette hierarchy without deviation event',
      'Do not introduce new typographic language',
    ],
  };
}

export function buildRevisionSequenceLockContext(sequenceSystem: SequenceCreativeSystem): Record<string, unknown> {
  return {
    preserveSequenceIdentity: true,
    sequenceCreativeSystemId: sequenceSystem.sequenceCreativeSystemId,
    paletteUsageHierarchy: sequenceSystem.paletteUsageHierarchy,
    typographySystem: sequenceSystem.typographySystem,
    prohibitedDrift: sequenceSystem.prohibitedDrift,
    revisionRules: [
      'PRESERVE SEQUENCE IDENTITY',
      'CHANGE REQUESTED ELEMENT ONLY',
      'DO NOT COPY SLIDE 01 COMPOSITION',
      'DO NOT ALTER POST-LEVEL PALETTE HIERARCHY',
      'DO NOT INTRODUCE NEW TYPOGRAPHIC LANGUAGE',
      'DO NOT ALTER WORLD DNA',
    ],
  };
}
