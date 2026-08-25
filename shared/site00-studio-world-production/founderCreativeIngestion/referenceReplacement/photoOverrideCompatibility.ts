/**
 * P0.CB.1A — HQ photography override compatibility evaluation.
 */

import type { SlideReference, SlideReconstructionSpec } from '../types.js';
import type { PhotographyOverrideCompatibilityEvaluation } from './types.js';
import { MEET_NDX_SEQUENCE_ID } from '../adapters/ndxLaunchRow01Pilot.js';

export function evaluatePhotographyOverrideCompatibility(params: {
  slideId: string;
  slideNumber: number;
  priorSpec: SlideReconstructionSpec | null;
  newSlideRef: SlideReference;
  sequenceId: string;
}): PhotographyOverrideCompatibilityEvaluation {
  const prior = params.priorSpec;
  const hadHq =
    prior &&
    (prior.photography.sourceMode === 'USE_EXISTING_ASSET' ||
      prior.photography.sourceMode === 'LOCK_CANONICAL') &&
    Boolean(prior.photography.selectedAssetId ?? prior.photography.canonicalAssetId);

  if (!params.newSlideRef.hasPhotography) {
    return {
      slideId: params.slideId,
      slideNumber: params.slideNumber,
      state: 'NO_LONGER_USED',
      priorSourceMode: prior?.photography.sourceMode ?? null,
      priorSelectedAssetId: prior?.photography.selectedAssetId ?? prior?.photography.canonicalAssetId ?? null,
      carryForward: false,
      requiresFounderDecision: Boolean(hadHq),
      message: hadHq
        ? 'New reference no longer uses photography on this slide — founder must confirm HQ asset disposition'
        : 'No photography on new reference slide',
    };
  }

  if (!hadHq) {
    return {
      slideId: params.slideId,
      slideNumber: params.slideNumber,
      state: params.newSlideRef.hasPhotography ? 'PHOTO_CHANGED' : 'NO_LONGER_USED',
      priorSourceMode: prior?.photography.sourceMode ?? null,
      priorSelectedAssetId: null,
      carryForward: false,
      requiresFounderDecision: false,
      message: 'No prior HQ override — generate or upload when ready',
    };
  }

  const priorAssetId = prior!.photography.selectedAssetId ?? prior!.photography.canonicalAssetId;
  const meetNdxSlide1 =
    params.sequenceId === MEET_NDX_SEQUENCE_ID &&
    params.slideNumber === 1 &&
    priorAssetId?.includes('ndx-hq-desk');

  const compositionShifted = prior!.composition.geometry !== params.newSlideRef.compositionNotes.join('; ');
  const photoStillPresent = params.newSlideRef.hasPhotography;

  if (meetNdxSlide1 && photoStillPresent) {
    return {
      slideId: params.slideId,
      slideNumber: params.slideNumber,
      state: compositionShifted ? 'CROP_CHANGED' : 'COMPATIBLE',
      priorSourceMode: prior!.photography.sourceMode,
      priorSelectedAssetId: priorAssetId ?? null,
      carryForward: true,
      requiresFounderDecision: compositionShifted,
      message: compositionShifted
        ? 'HQ desk photo compatible — recompute crop/placement against new reference'
        : 'HQ NDX desk photo compatible — carry forward USE_EXISTING_ASSET',
    };
  }

  const priorPhotoNotes = prior!.photography.reconstructionPrompt.toLowerCase();
  const newPhotoNotes = params.newSlideRef.compositionNotes.join(' ').toLowerCase();
  const subjectChanged =
    (priorPhotoNotes.includes('portrait') && !newPhotoNotes.includes('portrait')) ||
    (priorPhotoNotes.includes('desk') && !newPhotoNotes.includes('desk'));

  if (subjectChanged) {
    return {
      slideId: params.slideId,
      slideNumber: params.slideNumber,
      state: 'PHOTO_CHANGED',
      priorSourceMode: prior!.photography.sourceMode,
      priorSelectedAssetId: priorAssetId ?? null,
      carryForward: false,
      requiresFounderDecision: true,
      message: 'Photography intent changed — founder must choose KEEP EXISTING HQ, UPLOAD NEW HQ, or GENERATE',
    };
  }

  if (compositionShifted) {
    return {
      slideId: params.slideId,
      slideNumber: params.slideNumber,
      state: 'CROP_CHANGED',
      priorSourceMode: prior!.photography.sourceMode,
      priorSelectedAssetId: priorAssetId ?? null,
      carryForward: true,
      requiresFounderDecision: false,
      message: 'HQ asset preserved — crop/placement may need recompute',
    };
  }

  return {
    slideId: params.slideId,
    slideNumber: params.slideNumber,
    state: 'COMPATIBLE',
    priorSourceMode: prior!.photography.sourceMode,
    priorSelectedAssetId: priorAssetId ?? null,
    carryForward: true,
    requiresFounderDecision: false,
    message: 'HQ override compatible with new reference',
  };
}

export function applyCompatiblePhotoOverride(
  spec: SlideReconstructionSpec,
  evaluation: PhotographyOverrideCompatibilityEvaluation,
): SlideReconstructionSpec {
  if (!evaluation.carryForward || !evaluation.priorSelectedAssetId) return spec;
  return {
    ...spec,
    photography: {
      ...spec.photography,
      sourceMode: evaluation.priorSourceMode === 'LOCK_CANONICAL' ? 'LOCK_CANONICAL' : 'USE_EXISTING_ASSET',
      selectedAssetId: evaluation.priorSelectedAssetId,
      canonicalAssetId: evaluation.priorSelectedAssetId,
    },
    founderOverrides: {
      ...spec.founderOverrides,
      photoOverrideCompatibility: evaluation,
    },
  };
}
