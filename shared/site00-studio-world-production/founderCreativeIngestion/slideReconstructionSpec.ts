/**
 * P0.CB.1 — Build SlideReconstructionSpec from slide references.
 */

import { randomUUID } from 'node:crypto';
import {
  DEFAULT_TARGET_ASPECT_RATIO,
  DEFAULT_TARGET_RESOLUTION,
} from './constants.js';
import { buildPhotographySpecFromReference } from './photographyPromptReverseEngineering.js';
import type { SlideReference, SlideReconstructionSpec } from './types.js';

export function buildSlideReconstructionSpec(params: {
  slide: SlideReference;
  defaultPhotoSourceMode: SlideReconstructionSpec['photography']['sourceMode'];
  characterIdentityStatus: 'LOCKED' | 'NOT_LOCKED';
  canonicalCharacterRef: string | null;
  photographyNotes?: {
    subject: string;
    environment: string;
    camera: string;
    light: string;
    artDirection: string;
  };
}): SlideReconstructionSpec {
  const { slide } = params;
  const photoNotes = params.photographyNotes ?? inferPhotographyNotes(slide);

  const photography = buildPhotographySpecFromReference({
    slide,
    defaultSourceMode: params.defaultPhotoSourceMode,
    subjectNotes: photoNotes.subject,
    environmentNotes: photoNotes.environment,
    cameraNotes: photoNotes.camera,
    lightNotes: photoNotes.light,
    artDirectionNotes: photoNotes.artDirection,
    characterIdentityStatus: params.characterIdentityStatus,
    canonicalCharacterRef: params.canonicalCharacterRef,
  });

  const headline = slide.observableCopy[0] ?? `Slide ${slide.slideNumber}`;
  const body = slide.observableCopy.slice(1);

  return {
    slideId: randomUUID(),
    sequenceId: slide.sequenceId,
    slideReferenceId: slide.slideReferenceId,
    referenceAssetIds: slide.referenceAssetIds,
    targetAspectRatio: DEFAULT_TARGET_ASPECT_RATIO,
    targetResolution: DEFAULT_TARGET_RESOLUTION,
    copy: {
      exactText: slide.observableCopy,
      hierarchy: [headline, ...body],
      emphasis: slide.observableCopy.filter((t) => t === t.toUpperCase() && t.length > 8),
      annotationText: slide.observableCopy.filter((t) => /lime|handwritten|annotation/i.test(t) || t.includes('*')),
    },
    composition: {
      layoutGrammar: slide.compositionNotes[0] ?? 'editorial carousel frame',
      focalRegion: slide.hasPhotography ? 'photograph + typographic stack' : 'typography dominant',
      negativeSpace: 'preserve editorial breathing room from reference',
      alignment: 'match reference hierarchy — no arbitrary redesign',
      geometry: slide.compositionNotes.join('; ') || 'reference-fidelity layout',
      layering: slide.hasAnnotations ? 'paper + type + annotations + photo layers' : 'surface + type + photo',
    },
    surface: {
      background: slide.compositionNotes.find((n) => /black|cream|paper|beige/i.test(n)) ?? 'reference surface',
      paper: 'textured editorial paper when present',
      texture: 'tactile grain — cleaner than reference compression',
      material: 'reference-fidelity materials',
    },
    typography: {
      roles: slide.hasTypography ? ['headline', 'body', 'annotation'] : ['none'],
      relativeScale: 'preserve reference hierarchy',
      treatment: 'serif headline + sans/typewriter body + lime handwriting accents',
    },
    photography,
    objects: slide.compositionNotes.filter((n) => /object|mug|notebook|receipt|screenshot/i.test(n)),
    annotations: slide.hasAnnotations ? slide.observableCopy.filter((t) => t.length < 80) : [],
    brandSignals: ['NDX lime restraint', 'editorial black/cream palette', 'tactile evidence grammar'],
    reconstructionPrompt: assembleSlideReconstructionPrompt(headline, slide, photography.reconstructionPrompt),
    confidence: slide.confidence,
    founderOverrides: {},
    reviewStatus: 'PENDING',
    productionAssetId: null,
    productionMasterUrl: null,
    layerModel: {
      background: 'layer-background',
      photograph: slide.hasPhotography ? null : null,
      typography: slide.hasTypography ? 'layer-typography' : null,
      annotations: slide.hasAnnotations ? 'layer-annotations' : null,
      decorativeObjects: null,
      overlays: null,
      texture: 'layer-texture',
    },
  };
}

function inferPhotographyNotes(slide: SlideReference) {
  if (!slide.hasPhotography) {
    return {
      subject: 'No photograph — typography/surface dominant',
      environment: 'Graphic surface',
      camera: 'N/A',
      light: 'Even graphic light',
      artDirection: slide.compositionNotes.join('. '),
    };
  }
  return {
    subject: 'Match reference subject presentation, wardrobe, hair, expression, pose',
    environment: slide.compositionNotes.join('. ') || 'Reference environment',
    camera: 'Match reference framing, distance, and perspective — production-grade clarity',
    light: 'Match reference light direction and mood — no reference compression',
    artDirection: 'Reference-fidelity reconstruction — not new creative direction',
  };
}

function assembleSlideReconstructionPrompt(headline: string, slide: SlideReference, photoPrompt: string): string {
  return [
    `SLIDE ${slide.slideNumber}: ${headline}`,
    `Composition: ${slide.compositionNotes.join('; ')}`,
    slide.hasPhotography ? `Photography:\n${photoPrompt}` : 'No photography layer',
    'Goal: REFERENCE-FIDELITY RECONSTRUCTION at production resolution',
  ].join('\n\n');
}

export function editReconstructionPrompt(spec: SlideReconstructionSpec, prompt: string): SlideReconstructionSpec {
  return {
    ...spec,
    photography: {
      ...spec.photography,
      reconstructionPrompt: prompt,
      promptEditedByFounder: true,
    },
    reconstructionPrompt: prompt,
  };
}
