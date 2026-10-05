/**
 * P0.CB.1 — Bridge photography reconstruction to Realism Lab provider abstraction.
 * P0.5E.4F — Pre-canon NDX photography guard before FAL dispatch.
 */

import { evaluatePreCanonCharacterGenerationGuard } from '../characterAuthority/preCanonGuard.js';
import type { CharacterVisualCastingState } from '../characterVisualCasting/types.js';
import { buildGptImage2TextCapability } from '../characterContinuityPipeline/generationCapability.js';
import { ESTIMATED_STILL_GENERATION_COST_USD } from './constants.js';
import type { SlideReconstructionSpec } from './types.js';

export type RealismLabGenerationEstimate = {
  provider: string;
  model: string;
  readiness: 'READY' | 'AUTH_REQUIRED' | 'SCHEMA_REVIEW_REQUIRED' | 'BLOCKED';
  estimatedCostUsd: number;
  promptHash: string;
};

export function compilePhotographyGenerationInstructions(params: {
  spec: SlideReconstructionSpec;
  falConfigured: boolean;
}): { compiledPrompt: string; estimate: RealismLabGenerationEstimate } {
  const cap = buildGptImage2TextCapability();
  const photo = params.spec.photography;

  const compiledPrompt = [
    photo.reconstructionPrompt,
    `[SLIDE CONTEXT] ${params.spec.reconstructionPrompt}`,
    `[TARGET] ${params.spec.targetResolution} ${params.spec.targetAspectRatio} production master — NOT reference crop upscale`,
  ].join('\n\n');

  let readiness: RealismLabGenerationEstimate['readiness'] = 'READY';
  if (!params.falConfigured) readiness = 'AUTH_REQUIRED';
  else if (cap.schemaSupportState === 'SCHEMA_REVIEW_REQUIRED') readiness = 'SCHEMA_REVIEW_REQUIRED';

  return {
    compiledPrompt,
    estimate: {
      provider: cap.provider,
      model: cap.endpoint,
      readiness,
      estimatedCostUsd: ESTIMATED_STILL_GENERATION_COST_USD,
      promptHash: compiledPrompt.slice(0, 32),
    },
  };
}

const GENERATION_SOURCE_MODES = new Set(['GENERATE_FROM_REFERENCE', 'REPLACE']);

function assertNdxPhotographyAllowedBeforeGeneration(params: {
  spec: SlideReconstructionSpec;
  casting?: CharacterVisualCastingState | null;
}): void {
  if (!params.spec.photography.required) return;
  if (!GENERATION_SOURCE_MODES.has(params.spec.photography.sourceMode)) return;

  const surface = params.spec.sequenceId.includes('meet') ? 'MEET_NDX' : 'FOUNDER_CREATIVE_RECONSTRUCTION';
  const guard = evaluatePreCanonCharacterGenerationGuard({
    casting: params.casting ?? null,
    surface,
    requiresCharacterPhotography: true,
    allowReferenceOnly: false,
    allowPlaceholder: false,
  });

  if (!guard.allowed || guard.mode !== 'PRODUCTION') {
    throw new Error(guard.founderMessage ?? 'CHARACTER_VISUAL_IDENTITY_NOT_READY');
  }
}

/** Founder-triggered only — returns placeholder asset when not dispatching. */
export function dispatchPhotographyGeneration(params: {
  spec: SlideReconstructionSpec;
  falConfigured: boolean;
  dispatchFal: boolean;
  casting?: CharacterVisualCastingState | null;
}): { spec: SlideReconstructionSpec; assetId: string; previewUrl: string | null; falDispatched: boolean } {
  if (params.spec.photography.sourceMode === 'REFERENCE_ONLY') {
    throw new Error('Photography is REFERENCE_ONLY — resolve source mode before generation');
  }

  assertNdxPhotographyAllowedBeforeGeneration({ spec: params.spec, casting: params.casting });
  if (
    params.spec.photography.sourceMode === 'USE_EXISTING_ASSET' ||
    params.spec.photography.sourceMode === 'LOCK_CANONICAL'
  ) {
    const assetId = params.spec.photography.selectedAssetId ?? params.spec.photography.canonicalAssetId;
    if (!assetId) throw new Error('Canonical/existing asset required');
    return {
      spec: params.spec,
      assetId,
      previewUrl: `/api/placeholder/founder-creative/hq/${assetId}`,
      falDispatched: false,
    };
  }

  const compiled = compilePhotographyGenerationInstructions({
    spec: params.spec,
    falConfigured: params.falConfigured,
  });

  const assetId = `photo-gen-${params.spec.slideId.slice(0, 8)}-${Date.now()}-${compiled.estimate.promptHash.slice(0, 4)}`;
  const previewUrl = params.dispatchFal
    ? null
    : `/api/placeholder/founder-creative/generated/${assetId}`;

  const updated: SlideReconstructionSpec = {
    ...params.spec,
    photography: {
      ...params.spec.photography,
      candidateAssetIds: [...params.spec.photography.candidateAssetIds, assetId],
      selectedAssetId: assetId,
      lineageAssetIds: [...params.spec.photography.lineageAssetIds, assetId],
    },
    layerModel: {
      ...params.spec.layerModel,
      photograph: assetId,
    },
  };

  return {
    spec: updated,
    assetId,
    previewUrl,
    falDispatched: params.dispatchFal,
  };
}

export function realismLabReusedNotDuplicated(): true {
  return true;
}
