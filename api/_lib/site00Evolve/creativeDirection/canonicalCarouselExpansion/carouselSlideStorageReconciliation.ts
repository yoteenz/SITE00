/**
 * Reconcile carousel run records with durable Supabase storage.
 * fal may succeed while upload fails — run JSONB can claim SUCCESS without a blob.
 */

import type {
  CanonicalCarouselExpansionRun,
  CarouselSlideRecord,
} from '../../../../../shared/site00-brand-lore/canonicalCarouselExpansionTypes.js';
import { isCarouselRunSuperseded } from '../../../../../shared/site00-brand-lore/canonicalCarouselSupersession.js';
import { site00StorageObjectExists } from '../../../site00Assts/storage.js';

function clearSlideForRegeneration(slide: CarouselSlideRecord): CarouselSlideRecord {
  return {
    ...slide,
    asset: null,
    generationReceipt: {
      firstGenerationResult: 'TRANSPORT_FAILURE',
      creativeAttemptCount: slide.generationReceipt?.creativeAttemptCount ?? 0,
      firstGenerationPromptHash: slide.generationReceipt?.firstGenerationPromptHash ?? null,
      firstGenerationModel: slide.generationReceipt?.firstGenerationModel ?? 'openai/gpt-image-2',
      firstGenerationCostUsd: slide.generationReceipt?.firstGenerationCostUsd ?? 0,
      failureReason: 'Storage blob missing — queued for regeneration',
      generatedAt: slide.generationReceipt?.generatedAt ?? null,
    },
  };
}

export async function reconcileCarouselRunMissingStorage(
  run: CanonicalCarouselExpansionRun,
): Promise<{ run: CanonicalCarouselExpansionRun; repairedSlideCount: number }> {
  if (isCarouselRunSuperseded(run)) {
    return { run, repairedSlideCount: 0 };
  }

  let repairedSlideCount = 0;
  const directions = await Promise.all(
    run.directions.map(async (dir) => {
      const slides = await Promise.all(
        dir.slides.map(async (slide) => {
          if (slide.preserved || !slide.asset?.storagePath) return slide;
          if (slide.generationReceipt?.firstGenerationResult !== 'SUCCESS') return slide;
          const exists = await site00StorageObjectExists(slide.asset.storagePath);
          if (exists) return slide;
          repairedSlideCount += 1;
          return clearSlideForRegeneration(slide);
        }),
      );
      return { ...dir, slides };
    }),
  );

  if (repairedSlideCount === 0) return { run, repairedSlideCount: 0 };

  const nextStatus =
    run.status === 'COMPLETE' && directions.some((d) => d.slides.some((s) => !s.preserved && !s.asset))
      ? 'GENERATING_SLIDE'
      : run.status;

  return {
    run: {
      ...run,
      directions,
      status: nextStatus,
      error: run.error ?? null,
    },
    repairedSlideCount,
  };
}

export async function carouselSlideStorageExists(slide: CarouselSlideRecord): Promise<boolean> {
  if (!slide.asset?.storagePath) return false;
  return site00StorageObjectExists(slide.asset.storagePath);
}
