/**
 * P0.CLIENT.2A — Production review persistence + Supabase authority + preview lockout tests.
 */

import { randomUUID } from 'node:crypto';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import {
  assertClientPreviewModeAllowed,
  isClientReviewPreviewBypassEnabled,
  isSite00ProductionRuntime,
  PREVIEW_REVIEW_PROJECT_SLUG,
} from '../shared/site00-client-reviews/previewGuard.js';
import { buildClientReviewAppViewModel } from '../shared/site00-client-reviews/viewModel.js';
import {
  getClientReviewQueue,
  getClientReviewDetail,
  getClientReviewAppDetail,
  addClientReviewComment,
  addClientReviewAnnotation,
  submitClientApproval,
  submitClientRevision,
  resetPreviewReviewDataForTests,
} from '../api/_lib/site00ClientReviews/reviewService.js';
import { ensurePreviewReviewFixturesSeeded, resetPreviewSeedCache } from '../api/_lib/site00ClientReviews/previewFixtureSeed.js';

const REVIEW_ID = 'review-identity-direction-02';
const VERSION_ID = 'rv-id-dir-v04';
const TEST_USER = randomUUID();

function enablePreviewMode() {
  process.env.SITE00_CLIENT_REVIEW_PREVIEW_MODE = '1';
  delete process.env.SITE00_PRODUCTION;
  process.env.NODE_ENV = 'test';
  process.env.VERCEL_ENV = 'development';
}

describe('P0.CLIENT.2A preview guard', () => {
  it('requires explicit env for preview bypass and fails closed in production', () => {
    const prev = process.env.SITE00_CLIENT_REVIEW_PREVIEW_MODE;
    const prevNode = process.env.NODE_ENV;
    const prevVercel = process.env.VERCEL_ENV;
    try {
      delete process.env.SITE00_CLIENT_REVIEW_PREVIEW_MODE;
      process.env.NODE_ENV = 'production';
      process.env.VERCEL_ENV = 'production';
      expect(isSite00ProductionRuntime()).toBe(true);
      expect(isClientReviewPreviewBypassEnabled()).toBe(false);
      expect(() => assertClientPreviewModeAllowed()).toThrow('FORBIDDEN');
    } finally {
      process.env.SITE00_CLIENT_REVIEW_PREVIEW_MODE = prev;
      process.env.NODE_ENV = prevNode;
      process.env.VERCEL_ENV = prevVercel;
    }
  });
});

describe.sequential('P0.CLIENT.2A Supabase durable review authority', () => {
  beforeAll(() => {
    enablePreviewMode();
    resetPreviewSeedCache();
  });

  beforeEach(async () => {
    enablePreviewMode();
    resetPreviewSeedCache();
    await ensurePreviewReviewFixturesSeeded();
    await resetPreviewReviewDataForTests([REVIEW_ID]);
  });

  it('loads review queue from Supabase not in-memory store', async () => {
    const queue = await getClientReviewQueue(PREVIEW_REVIEW_PROJECT_SLUG, 'qa@test.com', TEST_USER);
    expect(queue.reviews.length).toBeGreaterThan(0);
    expect(queue.reviews.some((r) => r.reviewId === REVIEW_ID)).toBe(true);
  });

  it('persists comments and survives re-read (web write → web read)', async () => {
    const body = `Cross-device comment ${randomUUID()}`;
    await addClientReviewComment({
      projectSlug: PREVIEW_REVIEW_PROJECT_SLUG,
      reviewId: REVIEW_ID,
      versionId: VERSION_ID,
      viewport: 'MOBILE',
      body,
      email: 'owner@test.com',
      userId: TEST_USER,
    });
    const detail = await getClientReviewDetail({
      projectSlug: PREVIEW_REVIEW_PROJECT_SLUG,
      reviewId: REVIEW_ID,
      email: 'owner@test.com',
      userId: TEST_USER,
    });
    expect(detail.comments.some((c) => c.body === body)).toBe(true);
  });

  it('web comment visible via app adapter (web write → app read)', async () => {
    const body = `App adapter comment ${randomUUID()}`;
    await addClientReviewComment({
      projectSlug: PREVIEW_REVIEW_PROJECT_SLUG,
      reviewId: REVIEW_ID,
      versionId: VERSION_ID,
      viewport: 'DESKTOP',
      body,
      email: 'owner@test.com',
      userId: TEST_USER,
    });
    const appDetail = await getClientReviewAppDetail({
      projectSlug: PREVIEW_REVIEW_PROJECT_SLUG,
      reviewId: REVIEW_ID,
      email: 'owner@test.com',
      userId: TEST_USER,
    });
    const vm = buildClientReviewAppViewModel(appDetail);
    expect(vm.comments.some((c) => c.body === body)).toBe(true);
  });

  it('persists MOBILE annotations with viewport scope', async () => {
    await addClientReviewAnnotation({
      projectSlug: PREVIEW_REVIEW_PROJECT_SLUG,
      reviewId: REVIEW_ID,
      versionId: VERSION_ID,
      viewport: 'MOBILE',
      xPercent: 22,
      yPercent: 44,
      email: 'owner@test.com',
      userId: TEST_USER,
    });
    const detail = await getClientReviewDetail({
      projectSlug: PREVIEW_REVIEW_PROJECT_SLUG,
      reviewId: REVIEW_ID,
      email: 'owner@test.com',
      userId: TEST_USER,
    });
    expect(detail.annotations.filter((a) => a.viewport === 'MOBILE').length).toBeGreaterThan(0);
    expect(detail.annotations.some((a) => a.viewport === 'DESKTOP')).toBe(false);
  });

  it('approval is idempotent in durable storage', async () => {
    const requestId = `approve-durable-${randomUUID()}`;
    const r1 = await submitClientApproval({
      projectSlug: PREVIEW_REVIEW_PROJECT_SLUG,
      reviewId: REVIEW_ID,
      versionId: VERSION_ID,
      expectedVersionId: VERSION_ID,
      requestId,
      email: 'owner@test.com',
      userId: TEST_USER,
    });
    const r2 = await submitClientApproval({
      projectSlug: PREVIEW_REVIEW_PROJECT_SLUG,
      reviewId: REVIEW_ID,
      versionId: VERSION_ID,
      expectedVersionId: VERSION_ID,
      requestId,
      email: 'owner@test.com',
      userId: TEST_USER,
    });
    expect(r2.receiptId).toBe(r1.receiptId);
    const detail = await getClientReviewDetail({
      projectSlug: PREVIEW_REVIEW_PROJECT_SLUG,
      reviewId: REVIEW_ID,
      email: 'owner@test.com',
      userId: TEST_USER,
    });
    expect(detail.review.status).toBe('APPROVED');
  });

  it('revision persists with durable receipt', async () => {
    await resetPreviewReviewDataForTests([REVIEW_ID]);
    const requestId = `revision-durable-${randomUUID()}`;
    await submitClientRevision({
      projectSlug: PREVIEW_REVIEW_PROJECT_SLUG,
      reviewId: REVIEW_ID,
      versionId: VERSION_ID,
      expectedVersionId: VERSION_ID,
      requestId,
      summary: 'Adjust headline hierarchy',
      email: 'owner@test.com',
      userId: TEST_USER,
    });
    const detail = await getClientReviewDetail({
      projectSlug: PREVIEW_REVIEW_PROJECT_SLUG,
      reviewId: REVIEW_ID,
      email: 'owner@test.com',
      userId: TEST_USER,
    });
    expect(detail.review.status).toBe('REVISION_IN_PROGRESS');
    expect(detail.decisionHistory.some((e) => e.type === 'REVISION')).toBe(true);
  });

  it('blocks preview access when preview mode disabled', async () => {
    const prev = process.env.SITE00_CLIENT_REVIEW_PREVIEW_MODE;
    delete process.env.SITE00_CLIENT_REVIEW_PREVIEW_MODE;
    await expect(
      getClientReviewQueue(PREVIEW_REVIEW_PROJECT_SLUG, 'qa@test.com', TEST_USER),
    ).rejects.toThrow('FORBIDDEN');
    process.env.SITE00_CLIENT_REVIEW_PREVIEW_MODE = prev;
  });

  it('blocks collaborator approval server-side', async () => {
    await resetPreviewReviewDataForTests([REVIEW_ID]);
    await expect(
      submitClientApproval({
        projectSlug: PREVIEW_REVIEW_PROJECT_SLUG,
        reviewId: REVIEW_ID,
        versionId: VERSION_ID,
        expectedVersionId: VERSION_ID,
        requestId: `collab-${randomUUID()}`,
        email: 'collab@test.com',
        userId: TEST_USER,
        role: 'CLIENT_COLLABORATOR',
      }),
    ).rejects.toThrow('FORBIDDEN');
  });
});
