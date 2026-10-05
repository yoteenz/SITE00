import { describe, expect, it } from 'vitest';
import {
  buildCaptureNavigationReceipt,
  captureNavigationRouteMatchesTarget,
  captureRootOverviewRoutesEquivalent,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrCapture1R3a/index.js';
import {
  resolvePageUpgradeBlockReasons,
  shouldOfferPageUpgrade,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrCapture1/pageCapturePrimaryAction.js';

describe('captureRouteEquivalence', () => {
  it('treats project root and /overview as equivalent', () => {
    expect(captureRootOverviewRoutesEquivalent('/projects/ndxbook', '/projects/ndxbook/overview')).toBe(true);
    expect(captureRootOverviewRoutesEquivalent('/projects/ndxbook/overview', '/projects/ndxbook')).toBe(true);
    expect(captureRootOverviewRoutesEquivalent('/projects/ndxbook/content', '/projects/ndxbook/overview')).toBe(false);
  });

  it('marks overview runtime navigation as MATCH when final differs from requested only by /overview', () => {
    const receipt = buildCaptureNavigationReceipt({
      jobId: 'job-1',
      requestedRoute: '/projects/ndxbook',
      resolvedRuntimePath: '/projects/ndxbook/overview',
      finalUrl: '/projects/ndxbook/overview',
      viewport: 'mobile',
    });
    expect(receipt.status).toBe('MATCH');
  });

  it('accepts legacy MISMATCH receipts for root overview targets in upgrade gate', () => {
    expect(
      captureNavigationRouteMatchesTarget({
        targetRoute: '/projects/ndxbook',
        requestedRoute: '/projects/ndxbook',
        resolvedRuntimePath: '/projects/ndxbook/overview',
        finalUrl: '/projects/ndxbook/overview',
        status: 'MISMATCH',
      }),
    ).toBe(true);
  });
});

describe('resolvePageUpgradeBlockReasons', () => {
  it('surfaces authority approval when previews pass but authority is not approved', () => {
    const reasons = resolvePageUpgradeBlockReasons({
      upgradeAllowed: true,
      upgradeBlockReason: null,
      liveState: 'READY',
      designPreviewStatus: 'PASS',
      livePreviewStatus: 'PASS',
      hasStoredCapture: true,
      authorityApproved: false,
      authorityStatus: 'MAPPED',
    });
    expect(reasons).toContain('SET OR APPROVE DESIGN AUTHORITY FIRST');
    expect(
      shouldOfferPageUpgrade({
        upgradeAllowed: true,
        liveState: 'READY',
        designPreviewStatus: 'PASS',
        livePreviewStatus: 'PASS',
        hasStoredCapture: true,
        authorityApproved: false,
      }),
    ).toBe(false);
  });
});
