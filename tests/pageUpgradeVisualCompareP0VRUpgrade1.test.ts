/**
 * P0.VR.UPGRADE.1 — Current vs design authority page upgrade UX.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import { buildPageCreativeDiagnosis } from '../shared/site00-studio-world-production/visualReconstruction/p0vrCapture1/pageCreativeDiagnosis.js';
import {
  approvePageCreativeDirection,
  openPageCreativeUpgradeSession,
  resetPageCreativeUpgradeSessionsForTest,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrCapture1/pageCreativeUpgradeSession.js';
import { buildPageVisualDiagnosis } from '../shared/site00-studio-world-production/visualReconstruction/p0vrCapture1/pageVisualDiagnosis.js';
import { buildReconstructionPlan } from '../shared/site00-studio-world-production/visualReconstruction/p0vrCapture1/index.js';
import {
  getActiveTwinSessionForPage,
  resetReconstructionTwinSessionsForTest,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrUpgrade2/reconstructionTwinSession.js';
import { resetPageImplementationRegistryForTest } from '../shared/site00-studio-world-production/visualReconstruction/p0vrUpgrade2/pageImplementationRegistry.js';
import { P0_VR_UPGRADE_1_BUILD } from '../shared/site00-studio-world-production/visualReconstruction/p0vrCapture1/constants.js';

const root = join(import.meta.dirname, '..');

function read(rel: string): string {
  return readFileSync(join(root, rel), 'utf8');
}

describe('P0.VR.UPGRADE.1 — visual compare page upgrade', () => {
  beforeEach(() => {
    resetPageCreativeUpgradeSessionsForTest();
    resetReconstructionTwinSessionsForTest();
    resetPageImplementationRegistryForTest();
  });

  it('1. panel compares current vs design authority not proposed text', () => {
    const panel = read('src/site00/components/designWorkspace/pageFamily/PageCreativeUpgradePanel.tsx');
    expect(panel).toContain('CURRENT VS DESIGN AUTHORITY');
    expect(panel).toContain('DESIGN AUTHORITY');
    expect(panel).toContain('RECONSTRUCTION PLAN');
    expect(panel).not.toContain('CURRENT VS PROPOSED');
    expect(panel).not.toContain('figcaption>PROPOSED');
  });

  it('2. mobile toggle tabs current authority compare', () => {
    const panel = read('src/site00/components/designWorkspace/pageFamily/PageCreativeUpgradePanel.tsx');
    expect(panel).toContain("'current', 'authority', 'overlay'");
    expect(panel).toContain('useIsMobileViewport');
  });

  it('3. desktop side-by-side compare', () => {
    expect(read('src/site00/styles/site00-design-page-family.css')).toContain('site00-pfw-upgrade-v2__side-by-side');
  });

  it('4. overlay compare reuses slider pattern', () => {
    const panel = read('src/site00/components/designWorkspace/pageFamily/PageCreativeUpgradePanel.tsx');
    expect(panel).toContain('overlayMix');
    expect(panel).toContain('clipPath');
  });

  it('4b. upgrade panel shows measured forensics UI', () => {
    const panel = read('src/site00/components/designWorkspace/pageFamily/PageCreativeUpgradePanel.tsx');
    expect(panel).toContain('TOP VISUAL DIFFERENCES');
    expect(panel).toContain('VIEW EVIDENCE');
    expect(panel).toContain('FUNCTION PRESERVATION');
    expect(panel).toContain('BEFORE DRIFT VS AFTER DRIFT');
  });

  it('4c. forensic buttons use portaled overlays (not plan-gated inline sheets)', () => {
    const panel = read('src/site00/components/designWorkspace/pageFamily/PageCreativeUpgradePanel.tsx');
    expect(panel).toContain('AllForensicsOverlay');
    expect(panel).toContain('ForensicEvidenceDetailOverlay');
    expect(panel).toContain('resolveAllRegionForensics');
    expect(panel).not.toContain('allForensicsOpen && diagnosis?.allRegionForensics');
    expect(panel).not.toMatch(/\(evidenceId \|\| evidenceRegionId\) && plan \?/);
    expect(read('src/site00/styles/site00-design-page-family.css')).toContain('.site00-pfw-forensic-overlay');
  });

  it('5. PageVisualDiagnosis legacy fallback still returns findings', () => {
    const dx = buildPageVisualDiagnosis({ isRootPage: true, viewport: 'mobile', pagePurpose: 'NDXBOOK OVERVIEW' });
    expect(dx.topFindings.length).toBeGreaterThanOrEqual(3);
    expect(dx.findings.some((f) => f.label.includes('HEADER'))).toBe(true);
  });

  it('6. diagnosis not generic drift only', () => {
    const dx = buildPageCreativeDiagnosis({ isRootPage: true, viewport: 'mobile', pagePurpose: 'NDXBOOK OVERVIEW' });
    expect(dx.summary).not.toBe('Live root page drifts from approved design authority reference.');
  });

  it('7. ReconstructionPlan traces to visual dimensions', () => {
    const dx = buildPageVisualDiagnosis({ isRootPage: true, viewport: 'mobile' });
    const plan = buildReconstructionPlan({
      pageId: 'ndxbook:/projects/ndxbook',
      viewport: 'mobile',
      authorityVersionId: 'auth-v1',
      captureId: 'cap-v1',
      route: '/projects/ndxbook',
      pagePurpose: 'NDXBOOK OVERVIEW',
      isRootPage: true,
      diagnosis: dx,
    });
    expect(plan.geometryChanges.length).toBeGreaterThan(0);
    expect(plan.geometryChanges[0]?.sourceDimension).toBeTruthy();
    expect(plan.functionPreservation).toContain('Routing');
    expect(plan.rootPreservation.length).toBeGreaterThan(0);
  });

  it('8. session stores authority and capture refs', () => {
    const session = openPageCreativeUpgradeSession({
      projectId: 'ndxbook',
      pageId: 'ndxbook:/projects/ndxbook',
      viewport: 'mobile',
      captureId: 'cap-1',
      pagePurpose: 'NDXBOOK OVERVIEW',
      parentAuthorityLabel: 'NDXBOOK OVERVIEW',
      route: '/projects/ndxbook',
      isRoot: true,
      designAuthorityVersionId: 'auth-1',
      designAuthorityAssetRef: '/visual-references/authority.png',
      captureAssetRef: '/captures/live.png',
    });
    expect(session.designAuthorityAssetRef).toContain('authority');
    expect(session.captureAssetRef).toContain('live');
    expect(session.visualDiagnosis).toBeTruthy();
    expect(session.reconstructionPlan?.goal).toMatch(/reconstruction/i);
    expect(session.measuredSpecId).toBeTruthy();
    expect(session.forensicsReportId).toBeTruthy();
  });

  it('9. approve direction creates twin session without live mutation', () => {
    openPageCreativeUpgradeSession({
      projectId: 'ndxbook',
      pageId: 'ndxbook:/projects/ndxbook',
      viewport: 'mobile',
      captureId: 'cap-1',
      pagePurpose: 'NDXBOOK OVERVIEW',
      parentAuthorityLabel: 'NDXBOOK OVERVIEW',
      route: '/projects/ndxbook',
      isRoot: true,
      designAuthorityVersionId: 'auth-1',
      designAuthorityAssetRef: '/visual-references/authority.png',
      captureAssetRef: '/captures/live.png',
    });
    approvePageCreativeDirection('ndxbook', 'ndxbook:/projects/ndxbook', 'mobile');
    const twin = getActiveTwinSessionForPage('ndxbook', 'ndxbook:/projects/ndxbook');
    expect(twin?.authorityVersionId).toBe('auth-1');
    expect(twin?.beforeCaptureId).toBe('cap-1');
    expect(twin?.status).toBe('PLANNED');
  });

  it('10. post-build review before after authority', () => {
    const panel = read('src/site00/components/designWorkspace/pageFamily/PageCreativeUpgradePanel.tsx');
    expect(panel).toContain("'before', 'after', 'authority'");
    expect(panel).toContain('AFTER VS DESIGN AUTHORITY');
  });

  it('11. blocks missing sources messaging', () => {
    const panel = read('src/site00/components/designWorkspace/pageFamily/PageCreativeUpgradePanel.tsx');
    expect(panel).toContain('LIVE CAPTURE REQUIRED');
    expect(panel).toContain('DESIGN AUTHORITY REQUIRED');
  });

  it('12. founder note supported', () => {
    expect(read('src/site00/components/designWorkspace/pageFamily/PageCreativeUpgradePanel.tsx')).toContain('FOUNDER NOTE');
  });

  it('13. decorative wizard orb hidden in upgrade drawer', () => {
    expect(read('src/site00/styles/site00-design-page-family.css')).toContain(
      '.site00-pfw-upgrade-drawer .site00-dw-wizard__visual-area',
    );
  });

  it('14. build marker v299', () => {
    expect(P0_VR_UPGRADE_1_BUILD).toBe('v299');
  });

  it('15. workspace passes authority screenshot to panel', () => {
    const ws = read('src/site00/components/designWorkspace/pageFamily/PageFamilyWorkspace.tsx');
    expect(ws).toContain('authorityScreenshot');
    expect(ws).toContain('designAuthorityAssetRef');
  });
});
