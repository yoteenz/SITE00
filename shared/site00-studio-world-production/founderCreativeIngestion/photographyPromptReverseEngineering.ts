/**
 * P0.CB.1 — Reverse-engineer photography reconstruction prompts from reference evidence.
 */

import type { PhotographyReconstructionSpec, SlideReference } from './types.js';

const NDX_CONTINUITY_BLOCK = [
  'Contemporary African-American woman when NDX character appears',
  'Natural/protective hair possibilities',
  'Gold jewelry lived-in when visible',
  'Black and neutrals dominate wardrobe',
  'Lime accent used sparingly as signature intervention — not dominant fill',
  'Editorial ease — not influencer gloss',
].join('. ');

const NEGATIVE_BLOCK = [
  'plastic skin',
  'over-smoothed face',
  'uncanny eyes',
  'malformed hands',
  'excessive cinematic grading',
  'generic influencer styling',
  'overproduced luxury',
  'AI gloss',
  'incorrect lime dominance',
  'identity drift',
  'reference compression artifacts',
  'screenshot blur',
  'low-resolution upscale noise',
].join(', ');

export function reverseEngineerPhotographyPrompt(params: {
  slide: SlideReference;
  subjectNotes: string;
  environmentNotes: string;
  cameraNotes: string;
  lightNotes: string;
  artDirectionNotes: string;
  characterIdentityStatus: 'LOCKED' | 'NOT_LOCKED';
  canonicalCharacterRef: string | null;
}): string {
  const identityLine =
    params.characterIdentityStatus === 'LOCKED' && params.canonicalCharacterRef
      ? `Use canonical NDX character identity (${params.canonicalCharacterRef}). Do not invent a new face.`
      : 'CHARACTER IDENTITY NOT LOCKED — match reference presentation without auto-promoting to character canon.';

  return [
    '[SUBJECT]',
    params.subjectNotes,
    identityLine,
    '',
    '[ENVIRONMENT]',
    params.environmentNotes,
    '',
    '[CAMERA]',
    params.cameraNotes,
    '',
    '[LIGHT]',
    params.lightNotes,
    '',
    '[REALISM]',
    'Photographic skin texture, natural hair detail, realistic hands, material texture, subtle imperfections, non-plastic rendering. Target highest practical production resolution — do NOT reproduce reference compression or blur.',
    '',
    '[ART DIRECTION]',
    params.artDirectionNotes,
    '',
    '[CONTINUITY]',
    NDX_CONTINUITY_BLOCK,
    '',
    '[REFERENCE CONTEXT]',
    `Slide ${params.slide.slideNumber} reference evidence: ${params.slide.compositionNotes.join('; ')}`,
    '',
    '[NEGATIVE]',
    NEGATIVE_BLOCK,
  ].join('\n');
}

export function buildPhotographySpecFromReference(params: {
  slide: SlideReference;
  defaultSourceMode: PhotographyReconstructionSpec['sourceMode'];
  subjectNotes: string;
  environmentNotes: string;
  cameraNotes: string;
  lightNotes: string;
  artDirectionNotes: string;
  characterIdentityStatus: 'LOCKED' | 'NOT_LOCKED';
  canonicalCharacterRef: string | null;
}): PhotographyReconstructionSpec {
  const prompt = reverseEngineerPhotographyPrompt({
    slide: params.slide,
    subjectNotes: params.subjectNotes,
    environmentNotes: params.environmentNotes,
    cameraNotes: params.cameraNotes,
    lightNotes: params.lightNotes,
    artDirectionNotes: params.artDirectionNotes,
    characterIdentityStatus: params.characterIdentityStatus,
    canonicalCharacterRef: params.canonicalCharacterRef,
  });

  return {
    required: params.slide.hasPhotography,
    role: params.slide.hasPhotography ? 'primary photograph' : 'none',
    sourceMode: params.slide.hasPhotography ? params.defaultSourceMode : 'REFERENCE_ONLY',
    referenceIds: params.slide.referenceAssetIds,
    canonicalAssetId: null,
    reconstructionPrompt: prompt,
    promptEditedByFounder: false,
    selectedAssetId: null,
    candidateAssetIds: [],
    lineageAssetIds: [],
  };
}

export function applyPhotographySourceMode(
  spec: PhotographyReconstructionSpec,
  mode: PhotographyReconstructionSpec['sourceMode'],
  assetId?: string,
): PhotographyReconstructionSpec {
  const next = { ...spec, sourceMode: mode };
  if (mode === 'USE_EXISTING_ASSET' || mode === 'UPLOAD_HQ' || mode === 'REPLACE' || mode === 'LOCK_CANONICAL') {
    if (assetId) {
      next.selectedAssetId = assetId;
      next.lineageAssetIds = [...spec.lineageAssetIds, assetId];
    }
  }
  if (mode === 'LOCK_CANONICAL' && assetId) {
    next.canonicalAssetId = assetId;
  }
  return next;
}

export function replacePhotographyPreservesComposition(
  layerModel: { photograph: string | null; typography: string | null },
  newPhotoAssetId: string,
): { photograph: string; typography: string | null; compositionPreserved: true } {
  return {
    photograph: newPhotoAssetId,
    typography: layerModel.typography,
    compositionPreserved: true,
  };
}
