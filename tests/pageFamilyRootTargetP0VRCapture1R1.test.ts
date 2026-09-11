/**
 * P0.VR.CAPTURE.1R1 — Family root targeting + overview capture authority.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import { buildPageFamilyFromRows } from '../shared/site00-studio-world-production/pageFamilyWorkspace/pageFamilyBuilder.js';
import {
  buildPageFamilyRootTarget,
  buildPageId,
  defaultSelectedNodeId,
  listJumpToPageTargets,
  migrateHistoricalRootCapturePageId,
  resolveCanonicalRootDisplayName,
  resolveCanonicalRootRoute,
  resolveReviewStepLabel,
  resolveRootScreenId,
} from '../shared/site00-studio-world-production/pageFamilyWorkspace/pageFamilyRootTarget.js';
import {
  authorityStatusLabel,
  resolvePageViewportAuthority,
  resolveRootUpgradePrimaryAction,
} from '../shared/site00-studio-world-production/pageFamilyWorkspace/pageViewportAuthority.js';
import { P0_VR_CAPTURE_1R1_BUILD } from '../shared/site00-studio-world-production/pageFamilyWorkspace/types.js';
import {
  ensureNdxbookPilotRegistered,
  resetNdxPilotForTest,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr2/ndxPilotRegistration.js';
import {
  openPageCreativeUpgradeSession,
  resetPageCreativeUpgradeSessionsForTest,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrCapture1/index.js';
import { planCaptureCurrentPage } from '../shared/site00-studio-world-production/visualReconstruction/p0vrCapture1/captureCurrentPage.js';

const ROOT = join(import.meta.dirname, '..');

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

const ndxRows = [
  {
    screenId: 'overview',
    displayName: 'Overview',
    route: '/projects/ndxbook/overview',
    normalizedRoute: '/projects/ndxbook/overview',
    mobile: { publicUrl: null, status: 'NEVER_CAPTURED' },
  },
  {
    screenId: 'content-ops',
    displayName: 'Content Operations',
    route: '/projects/ndxbook/content-operations',
    normalizedRoute: '/projects/ndxbook/content-operations',
    neverCaptured: true,
  },
  {
    screenId: 'cultural',
    displayName: 'Cultural Intelligence',
    route: '/projects/ndxbook/cultural-intelligence',
    normalizedRoute: '/projects/ndxbook/cultural-intelligence',
  },
];

const ndxRowsWithCanonicalRoot = [
  {
    screenId: 'overview',
    displayName: 'Overview',
    route: '/projects/ndxbook',
    normalizedRoute: '/projects/ndxbook',
  },
  ...ndxRows.slice(1),
  {
    screenId: 'overview-alias',
    displayName: 'Overview Alias',
    route: '/projects/ndxbook/overview',
    normalizedRoute: '/projects/ndxbook/overview',
  },
];

describe('P0.VR.CAPTURE.1R1 — Family root targeting', () => {
  beforeEach(() => {
    resetNdxPilotForTest();
    resetPageCreativeUpgradeSessionsForTest();
  });

  it('1. PageFamilyRootTarget module exists', () => {
    expect(read('shared/site00-studio-world-production/pageFamilyWorkspace/pageFamilyRootTarget.ts')).toContain(
      'PageFamilyRootTarget',
    );
  });

  it('2. root appears first in JUMP TO options', () => {
    const family = buildPageFamilyFromRows({ projectId: 'ndxbook', rows: ndxRows });
    const jump = listJumpToPageTargets(family);
    expect(jump[0]?.isRoot).toBe(true);
    expect(jump[0]?.level).toBe(0);
  });

  it('3. root-first ordering by depth', () => {
    const family = buildPageFamilyFromRows({ projectId: 'ndxbook', rows: ndxRows });
    const jump = listJumpToPageTargets(family);
    for (let i = 1; i < jump.length; i++) {
      expect(jump[i]!.level).toBeGreaterThanOrEqual(jump[i - 1]!.level);
    }
  });

  it('4. default selection is root not first child', () => {
    const family = buildPageFamilyFromRows({ projectId: 'ndxbook', rows: ndxRows });
    const root = family.nodes.find((n) => n.level === 0)!;
    expect(defaultSelectedNodeId(family, null)).toBe(root.nodeId);
  });

  it('5. canonical root name is NDXBOOK OVERVIEW not desktop hub', () => {
    expect(resolveCanonicalRootDisplayName('ndxbook', { displayName: 'Desktop Overview Hub', screenId: 'x' })).toBe(
      'NDXBOOK OVERVIEW',
    );
    expect(resolveCanonicalRootDisplayName('ndxbook', { displayName: 'Overview', screenId: 'overview' })).toBe(
      'NDXBOOK OVERVIEW',
    );
  });

  it('6. canonical route prefers /projects/ndxbook over /overview alias', () => {
    const resolved = resolveCanonicalRootRoute('ndxbook', ndxRows);
    expect(resolved.canonicalRoute).toBe('/projects/ndxbook');
    expect(resolved.aliases).toContain('/projects/ndxbook/overview');
  });

  it('7. duplicate root detection when both routes registered', () => {
    const resolved = resolveCanonicalRootRoute('ndxbook', ndxRowsWithCanonicalRoot);
    expect(resolved.duplicateRootWarning).toContain('DUPLICATE_ROOT');
  });

  it('8. overview alias excluded from child nodes', () => {
    const family = buildPageFamilyFromRows({ projectId: 'ndxbook', rows: ndxRows });
    const root = family.nodes.find((n) => n.level === 0)!;
    expect(root.route).toBe('/projects/ndxbook');
    expect(family.nodes.some((n) => n.route === '/projects/ndxbook/overview')).toBe(false);
  });

  it('9. mapped root is not design-approved', () => {
    const family = buildPageFamilyFromRows({ projectId: 'ndxbook', rows: ndxRows });
    const root = family.nodes.find((n) => n.level === 0)!;
    expect(root.statusLabel).toBe('MAPPED');
    expect(root.designStatus).not.toBe('APPROVED');
  });

  it('10. PageViewportAuthority module exists', () => {
    expect(read('shared/site00-studio-world-production/pageFamilyWorkspace/pageViewportAuthority.ts')).toContain(
      'PageViewportAuthority',
    );
  });

  it('11. approved mobile authority for ndxbook overview root', () => {
    ensureNdxbookPilotRegistered();
    const authority = resolvePageViewportAuthority({
      projectId: 'ndxbook',
      pageId: buildPageId('ndxbook', '/projects/ndxbook'),
      screenId: 'overview',
      viewport: 'mobile',
      routeMapped: true,
      isRoot: true,
    });
    expect(authority.authorityStatus).toBe('APPROVED');
    expect(authority.previewUrl).toBeTruthy();
  });

  it('12. approved desktop authority stored separately', () => {
    ensureNdxbookPilotRegistered();
    const mobile = resolvePageViewportAuthority({
      projectId: 'ndxbook',
      pageId: buildPageId('ndxbook', '/projects/ndxbook'),
      screenId: 'overview',
      viewport: 'mobile',
      isRoot: true,
    });
    const desktop = resolvePageViewportAuthority({
      projectId: 'ndxbook',
      pageId: buildPageId('ndxbook', '/projects/ndxbook'),
      screenId: 'overview',
      viewport: 'desktop',
      isRoot: true,
    });
    expect(mobile.referenceId).not.toBe(desktop.referenceId);
  });

  it('13. authority preview not no-preview-yet when approved', () => {
    ensureNdxbookPilotRegistered();
    const authority = resolvePageViewportAuthority({
      projectId: 'ndxbook',
      pageId: buildPageId('ndxbook', '/projects/ndxbook'),
      screenId: 'overview',
      viewport: 'mobile',
      isRoot: true,
    });
    expect(authority.previewUrl).toContain('/visual-references/');
  });

  it('14. root capture plan resolves /projects/ndxbook/overview for overview screen', () => {
    const plan = planCaptureCurrentPage({
      projectId: 'ndxbook',
      pageId: buildPageId('ndxbook', '/projects/ndxbook'),
      screenId: 'overview',
      route: '/projects/ndxbook',
      viewport: 'mobile',
    });
    expect(plan.resolvedRuntimePath).toBe('/projects/ndxbook/overview');
    expect(plan.singlePageJob).toBe(true);
  });

  it('15. root creative upgrade session supports isRoot', () => {
    const session = openPageCreativeUpgradeSession({
      projectId: 'ndxbook',
      pageId: buildPageId('ndxbook', '/projects/ndxbook'),
      viewport: 'mobile',
      captureId: 'cap-root',
      pagePurpose: 'NDXBOOK OVERVIEW',
      parentAuthorityLabel: 'ignored for root',
      route: '/projects/ndxbook',
      isRoot: true,
    });
    expect(session.isRoot).toBe(true);
    expect(session.parentAuthorityId).toBeNull();
  });

  it('16. upgrade gate requires design authority when missing', () => {
    const authority = resolvePageViewportAuthority({
      projectId: 'unknown-project',
      pageId: 'unknown-project:/projects/unknown-project',
      screenId: 'overview',
      viewport: 'mobile',
      isRoot: true,
    });
    expect(resolveRootUpgradePrimaryAction(authority)).toBe('SET_DESIGN_AUTHORITY');
    expect(authorityStatusLabel(authority.authorityStatus)).toBe('MISSING');
  });

  it('17. historical capture migration to canonical page id', () => {
    expect(migrateHistoricalRootCapturePageId('ndxbook', 'ndxbook:/projects/ndxbook/overview')).toBe(
      'ndxbook:/projects/ndxbook',
    );
  });

  it('18. buildPageFamilyRootTarget fields', () => {
    const family = buildPageFamilyFromRows({ projectId: 'ndxbook', rows: ndxRows });
    const rootNode = family.nodes.find((n) => n.level === 0)!;
    const target = buildPageFamilyRootTarget({ family, rows: ndxRows, rootNode });
    expect(target.isRoot).toBe(true);
    expect(target.canonicalName).toBe('NDXBOOK OVERVIEW');
    expect(target.route).toBe('/projects/ndxbook');
  });

  it('19. dynamic review copy for root vs child', () => {
    const family = buildPageFamilyFromRows({ projectId: 'ndxbook', rows: ndxRows });
    const root = family.nodes.find((n) => n.level === 0)!;
    const child = family.nodes.find((n) => n.level === 1)!;
    expect(resolveReviewStepLabel(root)).toBe('REVIEW PAGE');
    expect(resolveReviewStepLabel(child)).toBe('REVIEW CHILD');
  });

  it('20. PageFamilySelector includes root in jump to', () => {
    expect(read('src/site00/components/designWorkspace/pageFamily/PageFamilySelector.tsx')).toContain(
      'listJumpToPageTargets',
    );
    expect(read('src/site00/components/designWorkspace/pageFamily/PageFamilySelector.tsx')).not.toContain(
      'n.level > 0',
    );
  });

  it('21. PageFamilyWorkspace defaults root selection', () => {
    expect(read('src/site00/components/designWorkspace/pageFamily/PageFamilyWorkspace.tsx')).toContain(
      'defaultSelectedNodeId',
    );
  });

  it('22. PageFamilyMap root is selectable', () => {
    expect(read('src/site00/components/designWorkspace/pageFamily/PageFamilyMap.tsx')).toContain('onSelectNode(parent.nodeId)');
  });

  it('23. capture panel separates design authority and live page', () => {
    expect(read('src/site00/components/designWorkspace/pageFamily/PageCaptureNowPanel.tsx')).toContain(
      'DESIGN AUTHORITY',
    );
    expect(read('src/site00/components/designWorkspace/pageFamily/PageCaptureNowPanel.tsx')).toContain('LIVE PAGE');
  });

  it('24. build marker v277', () => {
    expect(P0_VR_CAPTURE_1R1_BUILD).toBe('v277');
  });

  it('25. resolveRootScreenId avoids desktop-overview as root screen', () => {
    expect(resolveRootScreenId('ndxbook', { screenId: 'desktop-overview', displayName: 'x' })).toBe('overview');
  });
});
