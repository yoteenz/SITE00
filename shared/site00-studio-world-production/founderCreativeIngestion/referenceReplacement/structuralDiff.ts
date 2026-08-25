/**
 * P0.CB.1A — Structural reference diff between versions.
 */

import { randomUUID } from 'node:crypto';
import type { SlideReference } from '../types.js';
import type { CreativeReferenceDiff, CreativeReferenceDiffChange } from './types.js';

export function computeCreativeReferenceDiff(params: {
  parentSequenceId: string;
  oldReferenceVersionId: string | null;
  newReferenceVersionId: string;
  oldSlides: SlideReference[];
  newSlides: SlideReference[];
}): CreativeReferenceDiff {
  const oldByNumber = new Map(params.oldSlides.map((slide) => [slide.slideNumber, slide]));
  const newByNumber = new Map(params.newSlides.map((slide) => [slide.slideNumber, slide]));

  const oldNumbers = [...oldByNumber.keys()].sort((a, b) => a - b);
  const newNumbers = [...newByNumber.keys()].sort((a, b) => a - b);

  const addedSlides = newNumbers.filter((n) => !oldByNumber.has(n));
  const removedSlides = oldNumbers.filter((n) => !newByNumber.has(n));

  const reorderedSlides: number[] = [];
  const shared = oldNumbers.filter((n) => newByNumber.has(n));
  for (let i = 0; i < shared.length; i += 1) {
    const num = shared[i]!;
    const oldIndex = oldNumbers.indexOf(num);
    const newIndex = newNumbers.indexOf(num);
    if (oldIndex !== newIndex) reorderedSlides.push(num);
  }

  const changes: CreativeReferenceDiffChange[] = [];

  for (const slideNumber of newNumbers) {
    const oldSlide = oldByNumber.get(slideNumber) ?? null;
    const newSlide = newByNumber.get(slideNumber)!;
    const added = !oldSlide;
    const removed = false;
    const copyChanged = oldSlide
      ? oldSlide.observableCopy.join('|') !== newSlide.observableCopy.join('|')
      : true;
    const photoChanged = oldSlide ? oldSlide.hasPhotography !== newSlide.hasPhotography : true;
    const compositionChanged = oldSlide
      ? oldSlide.compositionNotes.join('|') !== newSlide.compositionNotes.join('|')
      : true;
    const materialChanged = compositionChanged;
    const edgeBindingChanged =
      compositionChanged &&
      /edge|binding|spiral|torn|gutter|hole/i.test(newSlide.compositionNotes.join(' '));
    const limeChanged =
      copyChanged &&
      /lime|handwritten|annotation/i.test(newSlide.observableCopy.join(' ') + newSlide.compositionNotes.join(' '));
    const typographyChanged = oldSlide ? oldSlide.hasTypography !== newSlide.hasTypography : true;
    const reordered = reorderedSlides.includes(slideNumber);

    changes.push({
      slideNumber,
      oldSlideReferenceId: oldSlide?.slideReferenceId ?? null,
      newSlideReferenceId: newSlide.slideReferenceId,
      copyChanged,
      photoChanged,
      compositionChanged,
      materialChanged,
      edgeBindingChanged,
      limeChanged,
      typographyChanged,
      reordered,
      added,
      removed,
    });
  }

  for (const slideNumber of removedSlides) {
    const oldSlide = oldByNumber.get(slideNumber)!;
    changes.push({
      slideNumber,
      oldSlideReferenceId: oldSlide.slideReferenceId,
      newSlideReferenceId: null,
      copyChanged: true,
      photoChanged: true,
      compositionChanged: true,
      materialChanged: true,
      edgeBindingChanged: true,
      limeChanged: true,
      typographyChanged: true,
      reordered: false,
      added: false,
      removed: true,
    });
  }

  return {
    diffId: randomUUID(),
    parentSequenceId: params.parentSequenceId,
    oldReferenceVersionId: params.oldReferenceVersionId,
    newReferenceVersionId: params.newReferenceVersionId,
    oldSlideCount: params.oldSlides.length,
    newSlideCount: params.newSlides.length,
    slideCountChanged: params.oldSlides.length !== params.newSlides.length,
    addedSlides,
    removedSlides,
    reorderedSlides,
    changes,
    computedAt: new Date().toISOString(),
  };
}

export function computeSpecDiffSummary(params: {
  oldSpec: import('../types.js').SlideReconstructionSpec | null;
  newSpec: import('../types.js').SlideReconstructionSpec;
  slideNumber: number;
}): import('./types.js').SlideSpecDiffSummary {
  const old = params.oldSpec;
  const neu = params.newSpec;
  const legacyCaseMismatch = Boolean(neu.founderOverrides.legacyCaseMismatch);
  return {
    slideNumber: params.slideNumber,
    compositionChanged: !old || old.composition.layoutGrammar !== neu.composition.layoutGrammar,
    copyChanged: !old || old.copy.exactText.join('|') !== neu.copy.exactText.join('|'),
    materialChanged: !old || old.surface.material !== neu.surface.material,
    photoChanged: !old || old.photography.required !== neu.photography.required,
    edgeBehaviorChanged: !old || old.composition.geometry !== neu.composition.geometry,
    bindingChanged: !old || old.surface.paper !== neu.surface.paper,
    constructionHistoryChanged:
      !old ||
      String(old.founderOverrides.notebookGrammar ?? '') !== String(neu.founderOverrides.notebookGrammar ?? ''),
    limeChanged: !old || old.brandSignals.join('|') !== neu.brandSignals.join('|'),
    typographyChanged: !old || old.typography.treatment !== neu.typography.treatment,
    annotationsChanged: !old || old.annotations.join('|') !== neu.annotations.join('|'),
    legacyCaseMismatch,
  };
}
