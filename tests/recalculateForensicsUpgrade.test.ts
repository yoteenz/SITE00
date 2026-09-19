/**
 * RECALCULATE FORENSICS — stored report rescore + session stamp.
 */

import { describe, expect, it, beforeEach } from 'vitest';
import {
  openPageCreativeUpgradeSession,
  recalculatePageCreativeUpgradeForensics,
  getPageCreativeUpgradeSession,
  resetPageCreativeUpgradeSessionsForTest,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrCapture1/pageCreativeUpgradeSession.js';
import {
  getForensicReport,
  resetForensicReportRegistryForTest,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrDiag1/forensicReportRegistry.js';

const SHELL = {
  headerHeightPx: 56,
  headerPaddingX: 16,
  contentPaddingX: 16,
  sectionGap: 12,
  bottomNavHeightPx: 72,
  viewportWidth: 390,
  viewportHeight: 844,
};

describe('recalculatePageCreativeUpgradeForensics', () => {
  beforeEach(() => {
    resetPageCreativeUpgradeSessionsForTest();
    resetForensicReportRegistryForTest();
  });

  it('stores report on open and rescores from registry on recalculate', () => {
    openPageCreativeUpgradeSession({
      projectId: 'ndxbook',
      pageId: 'ndxbook:/projects/ndxbook',
      viewport: 'mobile',
      captureId: 'cap_1',
      pagePurpose: 'Overview',
      parentAuthorityLabel: 'Overview',
      route: '/projects/ndxbook',
      isRoot: true,
      designAuthorityVersionId: 'auth_1',
      designAuthorityAssetRef: 'https://example.com/auth.webp',
      captureAssetRef: 'https://example.com/cap.webp',
      visualShellSpec: SHELL,
      screenId: 'overview',
    });

    const before = getPageCreativeUpgradeSession('ndxbook', 'ndxbook:/projects/ndxbook', 'mobile');
    expect(before?.forensicsReportId).toBeTruthy();
    expect(getForensicReport(before!.forensicsReportId!)).toBeTruthy();

    const updated = recalculatePageCreativeUpgradeForensics('ndxbook', 'ndxbook:/projects/ndxbook', 'mobile', {
      pageId: 'ndxbook:/projects/ndxbook',
      viewport: 'mobile',
      pageArchetype: 'ndxbook-overview-mobile',
      screenId: 'overview',
      route: '/projects/ndxbook',
      pagePurpose: 'Overview',
      isRootPage: true,
      currentCapture: {
        captureId: 'cap_1',
        width: 390,
        height: 844,
        imageRef: 'https://example.com/cap.webp',
      },
      designAuthority: {
        authorityVersionId: 'auth_1',
        width: 390,
        height: 844,
        assetRef: 'https://example.com/auth.webp',
        referenceType: 'VIEWPORT_SCREENSHOT',
        visualShellSpec: SHELL,
      },
    });

    expect(updated?.forensicsRecalculatedAt).toBeTruthy();
    expect(updated?.visualDiagnosis?.forensicCoverage).toBeTruthy();
  });
});
