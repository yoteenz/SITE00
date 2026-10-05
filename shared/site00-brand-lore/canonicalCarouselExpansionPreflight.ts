/**
 * Carousel expansion preflight — requires 6/6 preserved covers before generation.
 */

import type { CanonicalCreativeRangeRun } from './canonicalCreativeRangeTypes.js';
import type { CarouselExpansionPreflight } from './canonicalCarouselExpansionTypes.js';
import { CANONICAL_CAROUSEL_EXPANSION_EXPERIMENT } from './canonicalCarouselExpansionConstants.js';
import {
  resolvePreservedCoversFromRangeRun,
  runCanonicalCarouselCoverPreservationTest,
} from './canonicalCarouselCoverPreservation.js';
import { runSharedTopicLockTest, buildSharedCarouselTopicContext } from './canonicalCarouselTopic.js';

export function buildCarouselExpansionPreflight(
  rangeRun: CanonicalCreativeRangeRun | null,
): CarouselExpansionPreflight {
  const covers = resolvePreservedCoversFromRangeRun(rangeRun);
  const coverTest = runCanonicalCarouselCoverPreservationTest(covers);
  const topic = buildSharedCarouselTopicContext();
  const topicTest = runSharedTopicLockTest(topic);
  const blockers: string[] = [];
  if (!coverTest.passed) {
    blockers.push(`Covers ${coverTest.resolved}/6 — complete Experiment B heroes first`);
  }
  if (!topicTest.passed) blockers.push('Shared topic lock failed');
  if (rangeRun?.status !== 'COMPLETE' && coverTest.resolved < 6) {
    blockers.push('Canonical creative range validation not complete');
  }
  return {
    carouselExpansionReady: blockers.length === 0,
    experimentClassification: CANONICAL_CAROUSEL_EXPANSION_EXPERIMENT,
    coversResolved: coverTest.resolved,
    coversRequired: 6,
    sharedTopicLocked: topicTest.passed,
    canonicalDirectionCount: 6,
    blockers,
  };
}
