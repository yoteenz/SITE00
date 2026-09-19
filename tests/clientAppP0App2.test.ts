/**
 * P0.APP.2 — Client app visual convergence tests.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  CLIENT_APP_DESIGN_STATUS,
  CLIENT_APP_QA_MATRIX,
} from '../shared/site00-client-app/designStatus.js';
import { buildPreviewReviewDetail } from '../shared/site00-client-reviews/previewDetail.js';
import { CLIENT_APP_FIXTURES, CLIENT_APP_FIXTURE_SLUGS } from '../shared/site00-client-app/fixtures.js';
import { getClientAppInboxThreads, getClientAppLibraryCategories } from '../shared/site00-client-app/appContent.js';
import { appBasePathForSlug, appReviewPath } from '../src/site00/hooks/useAppBasePath.ts';

const ROOT = join(import.meta.dirname, '..');

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('P0.APP.2 client app visual convergence', () => {
  it('locks design status as REFERENCE_LOCKED_V1', () => {
    expect(CLIENT_APP_DESIGN_STATUS).toBe('REFERENCE_LOCKED_V1');
  });

  it('defines 25-screen QA matrix', () => {
    expect(CLIENT_APP_QA_MATRIX).toHaveLength(25);
    expect(CLIENT_APP_QA_MATRIX.every((r) => r.referenceMatched)).toBe(true);
  });

  it('provides preview review detail for identity direction', () => {
    const detail = buildPreviewReviewDetail('review-identity-direction-02');
    expect(detail?.review.title).toContain('IDENTITY');
    expect(detail?.permissions.canApprove).toBe(true);
  });

  it('includes post-launch opportunity fixture', () => {
    const fixture = CLIENT_APP_FIXTURES[CLIENT_APP_FIXTURE_SLUGS.D_POST_LAUNCH_OPPORTUNITY];
    expect(fixture.appExperience.projectPulse.isPostLaunch).toBe(true);
    expect(fixture.appExperience.projectPulse.activeOpportunity?.recommendedOffer).toContain('SITE');
  });

  it('uses app-scoped review components and routes', () => {
    expect(read('src/site00/components/clientApp/ClientAppReviewDetailView.tsx')).toContain('site00-app-review-detail');
    expect(read('src/routes/Site00Routes.tsx')).toContain('reviews/:reviewId/compare');
    expect(read('src/routes/Site00Routes.tsx')).toContain('appPreviewSelect');
  });

  it('builds preview paths for review sub-routes', () => {
    expect(appReviewPath('fixture-app-ndxbook', 'review-identity-direction-02', true, 'compare')).toBe(
      '/app/preview/fixture-app-ndxbook/reviews/review-identity-direction-02/compare',
    );
    expect(appBasePathForSlug('fixture-app-ndxbook', true)).toBe('/app/preview/fixture-app-ndxbook');
  });

  it('serves inbox and library from manifest in preview-safe helpers', () => {
    const manifest = CLIENT_APP_FIXTURES[CLIENT_APP_FIXTURE_SLUGS.C_NDXBOOK];
    expect(getClientAppInboxThreads(manifest).length).toBeGreaterThan(0);
    expect(getClientAppLibraryCategories(manifest).length).toBeGreaterThan(0);
  });

  it('preserves P0.CLIENT review API wiring in app detail page', () => {
    expect(read('src/site00/pages/clientApp/AppReviewsQueuePage.tsx')).toContain('/api/site00/client-reviews');
    expect(read('src/site00/pages/clientApp/AppReviewsQueuePage.tsx')).toContain('preview-client-room');
  });
});
