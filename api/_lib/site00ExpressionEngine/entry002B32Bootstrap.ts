/**
 * Sprint B3.2 — bootstrap Chapter Cover Annotation Variation System.
 */

import type { B32BootstrapResult } from '../../../shared/site00-expression-engine/chapterCoverAnnotationTypes.js';
import { seedChapter01Canon } from './chapterStore.js';
import { buildChapterCoverAnnotationVariationSystem } from './chapterCoverAnnotationVariationSystem.js';
import {
  buildEntry003AnnotationExampleDirection,
  getChapter01CoverAnnotationPlans,
} from './chapterCoverAnnotationPlans.js';
import {
  listCoverAnnotationHistoryForChapter,
  recordCoverAnnotationHistory,
  resetCoverAnnotationHistoryStore,
} from './coverAnnotationHistoryStore.js';
import { runCoverAnnotationVariationQA } from './coverAnnotationVariationQA.js';
import { CHAPTER_01_ID } from './chapter01Canon.js';

export async function bootstrapB32CoverAnnotationVariation(): Promise<B32BootstrapResult> {
  process.env.EXPRESSION_ENGINE_MEMORY_STORE = process.env.EXPRESSION_ENGINE_MEMORY_STORE ?? '1';

  resetCoverAnnotationHistoryStore();
  seedChapter01Canon();

  const annotationSystem = buildChapterCoverAnnotationVariationSystem();
  const chapter01Plans = getChapter01CoverAnnotationPlans();

  const annotationHistory = chapter01Plans.map((plan, index) =>
    recordCoverAnnotationHistory(plan, index + 1),
  );

  const variationQA = chapter01Plans.map((plan, index) =>
    runCoverAnnotationVariationQA({
      plan,
      entryNumber: index + 1,
      priorPlan: index > 0 ? chapter01Plans[index - 1] : null,
    }),
  );

  const entry003Example = buildEntry003AnnotationExampleDirection();

  const adjacentDistinct =
    chapter01Plans[0].annotationFamily !== chapter01Plans[1].annotationFamily;

  return {
    sprint: 'B3.2_COVER_ANNOTATION_VARIATION',
    annotationSystem,
    chapter01Plans,
    annotationHistory: listCoverAnnotationHistoryForChapter(CHAPTER_01_ID),
    entry003Example,
    variationQA,
    chapter01RepetitionStatus: adjacentDistinct
      ? 'DISTINCT_ADJACENT_ENTRIES'
      : 'REPETITION_DETECTED',
    assetsGeneratedThisSprint: 0,
  };
}

export { bootstrapB32CoverAnnotationVariation as bootstrapB32 };
