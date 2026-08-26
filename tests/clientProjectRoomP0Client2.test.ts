/**
 * P0.CLIENT.2 — Client Reviews experience tests.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it, beforeAll } from 'vitest';
import {
  translateReviewStatusForClient,
  clientReviewStatusLabel,
  translateCommentStatusForClient,
  stripReviewInternalFields,
  reviewPayloadContainsForbiddenFields,
} from '../shared/site00-client-reviews/translators.js';
import {
  PREVIEW_REVIEW_OBJECTS,
  getPreviewVersionsForReview,
} from '../shared/site00-client-reviews/previewSeed.js';
import {
  clientReviewDetailPath,
  clientReviewQueuePath,
} from '../shared/site00-client-reviews/client.js';
import {
  capabilitiesForRole,
  clientHasCapability,
} from '../shared/site00-client-project-room/capabilities.js';
import {
  getClientReviewQueue,
  getClientReviewDetail,
  addClientReviewComment,
  addClientReviewAnnotation,
  submitClientApproval,
  submitClientRevision,
  submitClientDecline,
  resetPreviewReviewDataForTests,
} from '../api/_lib/site00ClientReviews/reviewService.js';
import { ensurePreviewReviewFixturesSeeded, resetPreviewSeedCache } from '../api/_lib/site00ClientReviews/previewFixtureSeed.js';

const ROOT = join(import.meta.dirname, '..');
const DEV_BASE = process.env.VITE_DEV_SERVER_URL ?? 'http://127.0.0.1:5174';
const TEST_OWNER_ID = '11111111-1111-4111-8111-111111111111';
const TEST_COLLABORATOR_ID = '22222222-2222-4222-8222-222222222222';
const TEST_VIEWER_ID = '33333333-3333-4333-8333-333333333333';

function enablePreviewMode() {
  process.env.SITE00_CLIENT_REVIEW_PREVIEW_MODE = '1';
  delete process.env.SITE00_PRODUCTION;
  process.env.NODE_ENV = 'test';
  process.env.VERCEL_ENV = 'development';
}

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe.sequential('P0.CLIENT.2 client reviews architecture', () => {
  beforeAll(async () => {
    enablePreviewMode();
    resetPreviewSeedCache();
    await ensurePreviewReviewFixturesSeeded();
  });

  it('translates internal review statuses for client visibility', () => {
    expect(translateReviewStatusForClient('INTERNAL_DRAFT')).toBe('HIDDEN');
    expect(translateReviewStatusForClient('CLIENT_REVIEW_READY')).toBe('READY_FOR_REVIEW');
    expect(translateReviewStatusForClient('REVISION_IN_PROGRESS')).toBe('REVISION_IN_PROGRESS');
    expect(clientReviewStatusLabel('READY_FOR_REVIEW')).toBe('READY FOR REVIEW');
    expect(translateCommentStatusForClient('ACKNOWLEDGED')).toBe('IN_PROGRESS');
  });

  it('strips forbidden fields from review payloads', () => {
    const stripped = stripReviewInternalFields({
      title: 'Test',
      repo: 'secret',
      nested: { branch: 'main', prompt: 'hidden' },
    });
    expect(JSON.stringify(stripped)).not.toContain('repo');
    expect(JSON.stringify(stripped)).not.toContain('branch');
    expect(reviewPayloadContainsForbiddenFields({ commit: 'abc' })).toBe(true);
    expect(reviewPayloadContainsForbiddenFields({ title: 'safe' })).toBe(false);
  });

  it('exposes review queue with client-safe object types', async () => {
    const queue = await getClientReviewQueue('preview-client-room', 'qa@test.com', TEST_OWNER_ID);
    expect(queue.reviews.length).toBeGreaterThan(0);
    expect(queue.actionableCount).toBeGreaterThan(0);
    expect(queue.reviews.some((r) => r.objectType === 'IDENTITY_DIRECTION')).toBe(true);
    expect(JSON.stringify(queue)).not.toMatch(/"repo"|"branch"|"commit"|"fal"|"provider"/i);
  });

  it('returns review detail with compare, versions, and permissions', async () => {
    const detail = await getClientReviewDetail({
      projectSlug: 'preview-client-room',
      reviewId: 'review-identity-direction-02',
      email: 'owner@test.com',
      userId: TEST_OWNER_ID,
    });
    expect(detail.review.compareAvailable).toBe(true);
    expect(detail.review.compareLeftLabel).toBe('DIRECTION 01');
    expect(detail.versions.length).toBeGreaterThan(1);
    expect(detail.permissions.canApprove).toBe(true);
    expect(getPreviewVersionsForReview('review-identity-direction-02').some((v) => v.isCurrent)).toBe(true);
  });

  it('enforces role capabilities for approve / comment / viewer', async () => {
    const owner = await getClientReviewDetail({
      projectSlug: 'preview-client-room',
      reviewId: 'review-identity-direction-02',
      email: 'owner@test.com',
      userId: TEST_OWNER_ID,
      roleOverride: 'CLIENT_OWNER',
    });
    const collab = await getClientReviewDetail({
      projectSlug: 'preview-client-room',
      reviewId: 'review-identity-direction-02',
      email: 'collab@test.com',
      userId: TEST_COLLABORATOR_ID,
      roleOverride: 'CLIENT_COLLABORATOR',
    });
    const viewer = await getClientReviewDetail({
      projectSlug: 'preview-client-room',
      reviewId: 'review-identity-direction-02',
      email: 'viewer@test.com',
      userId: TEST_VIEWER_ID,
      roleOverride: 'CLIENT_VIEWER',
    });
    expect(owner.permissions.canApprove).toBe(true);
    expect(collab.permissions.canApprove).toBe(false);
    expect(collab.permissions.canComment).toBe(true);
    expect(viewer.permissions.canComment).toBe(false);
    expect(viewer.permissions.canApprove).toBe(false);
    expect(clientHasCapability(capabilitiesForRole('CLIENT_COLLABORATOR'), 'CAN_APPROVE')).toBe(false);
  });

  it('persists comments and viewport-scoped annotations', async () => {
    enablePreviewMode();
    await resetPreviewReviewDataForTests(['review-identity-direction-02']);
    await addClientReviewComment({
      projectSlug: 'preview-client-room',
      reviewId: 'review-identity-direction-02',
      versionId: 'rv-id-dir-v04',
      viewport: 'MOBILE',
      body: 'Mobile feedback',
      email: 'owner@test.com',
      userId: TEST_OWNER_ID,
    });
    await addClientReviewAnnotation({
      projectSlug: 'preview-client-room',
      reviewId: 'review-identity-direction-02',
      versionId: 'rv-id-dir-v04',
      viewport: 'MOBILE',
      xPercent: 40,
      yPercent: 55,
      body: 'Move logo',
      email: 'owner@test.com',
      userId: TEST_OWNER_ID,
    });
    const detail = await getClientReviewDetail({
      projectSlug: 'preview-client-room',
      reviewId: 'review-identity-direction-02',
      email: 'owner@test.com',
      userId: TEST_OWNER_ID,
    });
    expect(detail.comments.some((c) => c.body.includes('Mobile feedback'))).toBe(true);
    expect(detail.annotations.filter((a) => a.viewport === 'MOBILE').length).toBe(1);
    expect(detail.annotations.some((a) => a.viewport === 'DESKTOP')).toBe(false);
  });

  it('supports idempotent approval and blocks stale version', async () => {
    enablePreviewMode();
    await resetPreviewReviewDataForTests(['review-identity-direction-02']);
    const requestId = 'approve-test-1';
    const receipt1 = await submitClientApproval({
      projectSlug: 'preview-client-room',
      reviewId: 'review-identity-direction-02',
      versionId: 'rv-id-dir-v04',
      expectedVersionId: 'rv-id-dir-v04',
      requestId,
      email: 'owner@test.com',
      userId: TEST_OWNER_ID,
    });
    const receipt2 = await submitClientApproval({
      projectSlug: 'preview-client-room',
      reviewId: 'review-identity-direction-02',
      versionId: 'rv-id-dir-v04',
      expectedVersionId: 'rv-id-dir-v04',
      requestId,
      email: 'owner@test.com',
      userId: TEST_OWNER_ID,
    });
    expect(receipt2.receiptId).toBe(receipt1.receiptId);
    await expect(
      submitClientApproval({
        projectSlug: 'preview-client-room',
        reviewId: 'review-identity-direction-02',
        versionId: 'rv-id-dir-v03',
        expectedVersionId: 'rv-id-dir-v03',
        requestId: 'stale-1',
        email: 'owner@test.com',
        userId: TEST_OWNER_ID,
      }),
    ).rejects.toThrow('STALE_VERSION');
  });

  it('records revision requests and decline without deleting history', async () => {
    enablePreviewMode();
    await resetPreviewReviewDataForTests(['review-identity-direction-02']);
    const revision = await submitClientRevision({
      projectSlug: 'preview-client-room',
      reviewId: 'review-identity-direction-02',
      versionId: 'rv-id-dir-v04',
      expectedVersionId: 'rv-id-dir-v04',
      requestId: 'rev-1',
      summary: 'Adjust typography',
      email: 'owner@test.com',
      userId: TEST_OWNER_ID,
    });
    expect(revision.summary).toContain('Adjust typography');
    const afterRevision = await getClientReviewDetail({
      projectSlug: 'preview-client-room',
      reviewId: 'review-identity-direction-02',
      email: 'owner@test.com',
      userId: TEST_OWNER_ID,
    });
    expect(afterRevision.review.status).toBe('REVISION_IN_PROGRESS');

    await resetPreviewReviewDataForTests(['review-identity-direction-02']);
    await submitClientDecline({
      projectSlug: 'preview-client-room',
      reviewId: 'review-identity-direction-02',
      versionId: 'rv-id-dir-v04',
      expectedVersionId: 'rv-id-dir-v04',
      requestId: 'decline-1',
      email: 'owner@test.com',
      userId: TEST_OWNER_ID,
    });
    const afterDecline = await getClientReviewDetail({
      projectSlug: 'preview-client-room',
      reviewId: 'review-identity-direction-02',
      email: 'owner@test.com',
      userId: TEST_OWNER_ID,
    });
    expect(afterDecline.review.status).toBe('DECLINED');
    expect(afterDecline.versions.length).toBeGreaterThan(0);
  });

  it('wires client review routes and UI modules', () => {
    expect(read('src/site00/config/routes.ts')).toContain("clientProjectRoomReviewDetail:");
    expect(read('src/routes/Site00Routes.tsx')).toContain('ClientReviewDetailPage');
    expect(read('src/site00/pages/clientProjectRoom/ClientProjectRoomReviewsPages.tsx')).toContain(
      'ClientReviewQueueList',
    );
    expect(read('src/site00/components/clientReviews/ClientReviewDetailView.tsx')).toContain('COMPARE');
    expect(read('api/site00/client-reviews.ts')).toContain('submitClientApproval');
    expect(clientReviewQueuePath('preview-client-room')).toBe('/client/projects/preview-client-room/reviews');
    expect(clientReviewDetailPath('preview-client-room', 'review-identity-direction-02')).toBe(
      '/client/projects/preview-client-room/reviews/review-identity-direction-02',
    );
  });
});

describe('P0.CLIENT.2 browser QA — client reviews routes', () => {
  it('renders review queue and detail on preview project room', async () => {
    const { chromium } = await import('playwright');
    const browser = await chromium.launch({ headless: true });
    const artifactsDir = '/opt/cursor/artifacts';
    const { mkdirSync } = await import('node:fs');
    mkdirSync(artifactsDir, { recursive: true });

    try {
      for (const viewport of [
        { name: 'mobile', width: 390, height: 844 },
        { name: 'tablet', width: 834, height: 1112 },
        { name: 'desktop', width: 1280, height: 900 },
      ]) {
        const page = await browser.newPage({ viewport: { width: viewport.width, height: viewport.height } });
        await page.addInitScript(() => {
          window.localStorage.setItem('isSignedIn', 'true');
        });

        await page.goto(`${DEV_BASE}/client/projects/preview-client-room/reviews`, {
          waitUntil: 'networkidle',
          timeout: 60000,
        });
        await page.waitForSelector('.site00-cpr-review-card', { timeout: 30000 });
        expect(await page.locator('.site00-cpr-review-card').count()).toBeGreaterThan(0);
        await page.screenshot({
          path: join(artifactsDir, `p0client2-reviews-queue-${viewport.name}.png`),
          fullPage: false,
        });

        await page.goto(
          `${DEV_BASE}/client/projects/preview-client-room/reviews/review-identity-direction-02`,
          { waitUntil: 'networkidle', timeout: 60000 },
        );
        await page.waitForSelector('.site00-cpr-review-detail', { timeout: 30000 });
        expect(await page.locator('.site00-cpr-review-viewport-btn').count()).toBeGreaterThan(0);
        await page.getByRole('button', { name: 'COMPARE', exact: true }).click();
        await page.waitForSelector('.site00-cpr-review-compare.is-compare-on', { timeout: 10000 });
        await page.screenshot({
          path: join(artifactsDir, `p0client2-review-detail-${viewport.name}.png`),
          fullPage: false,
        });

        if (viewport.name === 'mobile') {
          expect(await page.locator('.site00-cpr-bottom-nav').count()).toBeGreaterThan(0);
        }
        if (viewport.name === 'desktop') {
          expect(await page.locator('.site00-cpr-sidebar').count()).toBeGreaterThan(0);
        }

        await page.close();
      }
    } finally {
      await browser.close();
    }
  }, 180000);
});
