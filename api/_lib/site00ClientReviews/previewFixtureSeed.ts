import {
  PREVIEW_REVIEW_OBJECTS,
  PREVIEW_REVIEW_VERSIONS,
  PREVIEW_DECISION_HISTORY,
} from '../../../shared/site00-client-reviews/previewSeed.js';
import { PREVIEW_REVIEW_PROJECT_SLUG } from '../../../shared/site00-client-reviews/previewGuard.js';
import {
  countPreviewFixtures,
  insertReviewEvent,
  upsertPreviewReviewObject,
  upsertPreviewReviewVersion,
} from './reviewRepository.js';

let previewSeedPromise: Promise<void> | null = null;

export async function ensurePreviewReviewFixturesSeeded(): Promise<void> {
  if (previewSeedPromise) return previewSeedPromise;
  previewSeedPromise = (async () => {
    const existing = await countPreviewFixtures(PREVIEW_REVIEW_PROJECT_SLUG);
    if (existing >= PREVIEW_REVIEW_OBJECTS.length) return;

    for (const review of PREVIEW_REVIEW_OBJECTS) {
      await upsertPreviewReviewObject({ review, isPreviewFixture: true });
      for (const versionId of review.availableVersionIds) {
        const version = PREVIEW_REVIEW_VERSIONS[versionId];
        if (version) await upsertPreviewReviewVersion(version);
      }
      await insertReviewEvent({
        projectId: null,
        reviewId: review.reviewId,
        eventType: 'REVIEW_OPENED',
        payload: { summary: PREVIEW_DECISION_HISTORY.find((e) => e.type === 'OPENED')?.summary ?? 'Review opened' },
        clientVisible: true,
      });
    }
  })();
  return previewSeedPromise;
}

export function resetPreviewSeedCache(): void {
  previewSeedPromise = null;
}
