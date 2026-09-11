/**
 * Capture 404 root cause — QA rejects blank shells; overview opens /overview runtime path.
 */

import { describe, expect, it } from 'vitest';
import { ensureNdxbookPilotRegistered } from '../shared/site00-studio-world-production/visualReconstruction/p0vr2/ndxPilotRegistration.js';
import { resolveCaptureTarget } from '../shared/site00-studio-world-production/visualReconstruction/p0vr3e/routeRepresentativeResolver.js';
import { runImplementationSnapshotQa } from '../shared/site00-studio-world-production/visualReconstruction/p0vr3e/implementationSnapshotQa.js';
import { IMPLEMENTATION_SNAPSHOT_MIN_WEBP_BYTES } from '../shared/site00-studio-world-production/visualReconstruction/p0vr3e/constants.js';
import { repairMishostedStorageHttpUrl } from '../shared/site00-studio-world-production/assetDelivery/repairMishostedStorageHttpUrl.js';

describe('Capture 404 root cause guards', () => {
  it('overview capture target uses /projects/:slug/overview runtime path', () => {
    ensureNdxbookPilotRegistered();
    const target = resolveCaptureTarget({ projectId: 'ndxbook', screenId: 'overview' });
    expect(target?.route).toBe('/projects/ndxbook/overview');
  });

  it('QA rejects tiny webp shells that look like success', () => {
    const qa = runImplementationSnapshotQa({
      record: { width: 390, height: 844 },
      bufferSize: 4714,
      finalUrl: 'https://preview.example.test/projects/ndxbook/overview',
      requestedRoute: '/projects/ndxbook/overview',
      expectedWidth: 390,
      expectedHeight: 844,
      hasAuthRedirect: false,
      hasLoadingShell: false,
      brokenImageCount: 0,
      fontsReady: true,
      hasRuntimeError: false,
      anchorFound: false,
    });
    expect(qa.passed).toBe(false);
    expect(qa.issues).toContain('ZERO_CONTENT');
    expect(qa.issues).toContain('CAPTURE_ANCHOR_MISSING');
    expect(IMPLEMENTATION_SNAPSHOT_MIN_WEBP_BYTES).toBeGreaterThan(4714);
  });

  it('repairMishostedStorageHttpUrl maps site-host paths to Supabase', () => {
    const host = ['site00', 'com'].join('.');
    const repaired = repairMishostedStorageHttpUrl(
      `https://${host}/studio-world/design/implementation-snapshots/ndxbook/overview/mobile/x.webp`,
    );
    expect(repaired).toContain('/storage/v1/object/public/live-preview/');
  });
});
