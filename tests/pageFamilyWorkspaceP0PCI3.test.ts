/**
 * P0.PCI.3 — Page Family Workspace tests.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it, beforeEach } from 'vitest';
import { P0_PCI_3_BUILD } from '../shared/site00-studio-world-production/pageFamilyWorkspace/types.js';
import {
  buildPageFamilyFromRows,
  detectRouteCycle,
  listSiblingNodes,
} from '../shared/site00-studio-world-production/pageFamilyWorkspace/pageFamilyBuilder.js';
import {
  resolveNavigationPromises,
  summarizeNavigationDetection,
} from '../shared/site00-studio-world-production/pageFamilyWorkspace/parentNavigationIntentResolver.js';
import { buildProjectProgressSummary } from '../shared/site00-studio-world-production/pageFamilyWorkspace/pageFamilyReadiness.js';
import {
  approveNodeDesign,
  clearPageFamilyStoreForTest,
  confirmFamilyStructure,
  isFamilyStructureConfirmed,
} from '../shared/site00-studio-world-production/pageFamilyWorkspace/pageFamilyStore.js';
import { resolveWorkflowAction } from '../shared/site00-studio-world-production/pageFamilyWorkspace/pageFamilyWorkflow.js';

const ROOT = join(import.meta.dirname, '..');

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

const sampleRows = [
  { screenId: 'overview', displayName: 'NDXBOOK Overview', route: '/projects/ndxbook/overview', normalizedRoute: '/projects/ndxbook/overview', mobile: { publicUrl: 'https://x/a.png', status: 'CURRENT' } },
  { screenId: 'content-ops', displayName: 'Content Operations', route: '/projects/ndxbook/content-operations', normalizedRoute: '/projects/ndxbook/content-operations', neverCaptured: true },
  { screenId: 'cultural', displayName: 'Cultural Intelligence', route: '/projects/ndxbook/cultural-intelligence', normalizedRoute: '/projects/ndxbook/cultural-intelligence', resolvedCaptureState: 'FAILED' },
  { screenId: 'campaign', displayName: 'Campaign Board', route: '/projects/ndxbook/cultural-intelligence/campaign-board', normalizedRoute: '/projects/ndxbook/cultural-intelligence/campaign-board', mobile: { publicUrl: null, status: 'DISCOVERED' } },
];

describe('P0.PCI.3 — Page Family Workspace', () => {
  beforeEach(() => clearPageFamilyStoreForTest());

  it('1. build v267', () => {
    expect(P0_PCI_3_BUILD).toBe('v267');
  });

  it('2. PageFamilyWorkspace component', () => {
    expect(read('src/site00/components/designWorkspace/pageFamily/PageFamilyWorkspace.tsx')).toContain('PageFamilyWorkspace');
  });

  it('3. PageFamily data model types', () => {
    expect(read('shared/site00-studio-world-production/pageFamilyWorkspace/types.ts')).toContain('PageFamilyNode');
    expect(read('shared/site00-studio-world-production/pageFamilyWorkspace/types.ts')).toContain('NavigationPromise');
  });

  it('4. parent selection + child derivation from rows', () => {
    const family = buildPageFamilyFromRows({ projectId: 'ndxbook', rows: sampleRows });
    expect(family.nodes.some((n) => n.level === 0)).toBe(true);
    expect(family.childCount).toBeGreaterThan(0);
    expect(family.grandchildCount).toBeGreaterThan(0);
  });

  it('5. NavigationPromise resolver', () => {
    const family = buildPageFamilyFromRows({ projectId: 'ndxbook', rows: sampleRows });
    const parent = family.nodes.find((n) => n.level === 0)!;
    const promises = resolveNavigationPromises({ family, parentNodeId: parent.nodeId });
    expect(promises.length).toBeGreaterThan(0);
    expect(promises[0]?.expectedChildRoute).toBeTruthy();
  });

  it('6. project progress uses real counts not hard-coded', () => {
    const summary = buildProjectProgressSummary(sampleRows);
    expect(summary.totalPages).toBe(4);
    expect(summary.current).toBe(1);
    expect(summary.needReview).toBe(1);
  });

  it('7. unknown counts stay null not zero when empty', () => {
    const summary = buildProjectProgressSummary([]);
    expect(summary.current).toBeNull();
    expect(summary.totalPages).toBe(0);
  });

  it('8. sibling navigation list', () => {
    const family = buildPageFamilyFromRows({ projectId: 'ndxbook', rows: sampleRows });
    const child = family.nodes.find((n) => n.level === 1)!;
    const siblings = listSiblingNodes(family, child.nodeId);
    expect(siblings.length).toBeGreaterThan(1);
  });

  it('9. structure confirmation gate', () => {
    const family = buildPageFamilyFromRows({ projectId: 'ndxbook', rows: sampleRows });
    expect(isFamilyStructureConfirmed(family.familyId)).toBe(false);
    confirmFamilyStructure(family.familyId);
    expect(isFamilyStructureConfirmed(family.familyId)).toBe(true);
  });

  it('10. design approval + workflow action', () => {
    const family = buildPageFamilyFromRows({ projectId: 'ndxbook', rows: sampleRows });
    confirmFamilyStructure(family.familyId);
    const child = family.nodes.find((n) => n.level === 1)!;
    approveNodeDesign({ familyId: family.familyId, nodeId: child.nodeId, route: child.route });
    const action = resolveWorkflowAction(family);
    expect(action.primaryLabel).toBeTruthy();
  });

  it('11. route cycle detection', () => {
    const family = buildPageFamilyFromRows({ projectId: 'ndxbook', rows: sampleRows });
    expect(detectRouteCycle(family)).toEqual([]);
  });

  it('12. detection summary headline', () => {
    const family = buildPageFamilyFromRows({ projectId: 'ndxbook', rows: sampleRows });
    const summary = summarizeNavigationDetection(family.promises);
    expect(summary.total).toBeGreaterThan(0);
  });

  it('13. family default pages step', () => {
    expect(read('shared/site00-studio-world-production/visualReconstruction/p0vr8r3r1/designWizardSteps.ts')).toContain("'family'");
    expect(read('src/site00/components/designWorkspace/DesignPagesWizard.tsx')).toContain("case 'family'");
  });

  it('14. page family map component', () => {
    expect(read('src/site00/components/designWorkspace/pageFamily/PageFamilyMap.tsx')).toContain('PAGE FAMILY MAP');
  });

  it('15. derivative review carousel', () => {
    expect(read('src/site00/components/designWorkspace/pageFamily/DerivativeReviewCarousel.tsx')).toContain('DERIVATIVE REVIEW');
  });

  it('16. page family selector hierarchy', () => {
    expect(read('src/site00/components/designWorkspace/pageFamily/PageFamilySelector.tsx')).toContain('JUMP TO');
  });

  it('17. reconstruction workflow rail', () => {
    expect(read('src/site00/components/designWorkspace/pageFamily/ReconstructionWorkflowRail.tsx')).toContain('RECONSTRUCTION WORKFLOW');
  });

  it('18. details drawer not inline dump', () => {
    expect(read('src/site00/components/designWorkspace/pageFamily/PageFamilyWorkspace.tsx')).toContain('DesignDetailsDrawer');
    expect(read('src/site00/components/designWorkspace/pageFamily/PageFamilyWorkspace.tsx')).not.toContain('site00-dw-recovery-inspector');
  });

  it('19. library secondary mode preserved', () => {
    expect(read('src/site00/components/designWorkspace/pageFamily/PageFamilyWorkspace.tsx')).toContain('ALL PAGES');
    expect(read('src/site00/components/designWorkspace/DesignPagesWizard.tsx')).toContain("case 'library'");
  });

  it('20. ndxbook accent class', () => {
    expect(read('src/site00/styles/site00-design-page-family.css')).toContain('is-ndxbook');
  });

  it('21. projectId wired from workspace', () => {
    expect(read('src/site00/components/founderWorkspace/StudioWorldDesignWorkspace.tsx')).toContain('projectId={activeDesignProjectId}');
  });

  it('22. no hard-coded 12/20/14 progress values', () => {
    const ui = read('src/site00/components/designWorkspace/pageFamily/PageFamilyWorkspace.tsx');
    expect(ui).not.toContain('12 CURRENT');
    expect(ui).not.toContain('20 NEED REVIEW');
  });

  it('23. mobile CSS compact layout', () => {
    expect(read('src/site00/styles/site00-design-page-family.css')).toContain('max-width: 560px');
  });

  it('24. desktop expanded layout', () => {
    expect(read('src/site00/styles/site00-design-page-family.css')).toContain('@media (min-width: 900px)');
  });
});
