/**
 * P0.PCI.3R1 — Page Family Workspace authority + capture decoupling.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  DEFAULT_PAGES_WIZARD_STEP,
  captureSubflowReturnStep,
  isCaptureSubflowStep,
  resolveDefaultPagesStep,
} from '../shared/site00-studio-world-production/pageFamilyWorkspace/pagesWorkspaceController.js';
import {
  canApproveDesign,
  canConfirmFamily,
  canRunLiveCapture,
  canVerifyWiring,
  deriveCaptureDimensionStatus,
  isCaptureBlockingFamilyWork,
} from '../shared/site00-studio-world-production/pageFamilyWorkspace/pageFamilyDependencyPolicy.js';
import { derivePageFamilyReadiness } from '../shared/site00-studio-world-production/pageFamilyWorkspace/pageFamilyReadiness.js';
import { buildPageFamilyFromRows } from '../shared/site00-studio-world-production/pageFamilyWorkspace/pageFamilyBuilder.js';
import { P0_PCI_3R1_BUILD } from '../shared/site00-studio-world-production/pageFamilyWorkspace/types.js';
import { resolvePagesWizardResumeStep } from '../shared/site00-studio-world-production/visualReconstruction/p0vr8r3r1/designWizardSteps.js';

const ROOT = join(import.meta.dirname, '..');

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

const degradedCapture = {
  apiConnected: true,
  workerHealthy: false,
  browserReady: false,
  contractValid: true,
  testJobPassed: false,
  testingWorker: false,
  testWorkerFailed: false,
  isRefreshing: false,
  run: null,
  summary: { totalPages: 46, current: 0, neverCaptured: 46, queued: 0, capturing: 0, failed: 0, stale: 0 },
};

const sampleRows = [
  { screenId: 'overview', displayName: 'Overview', route: '/projects/ndxbook/overview', normalizedRoute: '/projects/ndxbook/overview' },
  { screenId: 'child', displayName: 'Child', route: '/projects/ndxbook/content-operations', normalizedRoute: '/projects/ndxbook/content-operations', neverCaptured: true },
];

describe('P0.PCI.3R1 — Page family authority + capture decoupling', () => {
  it('1. PagesWorkspaceController module', () => {
    expect(read('shared/site00-studio-world-production/pageFamilyWorkspace/pagesWorkspaceController.ts')).toContain(
      'PagesWorkspaceController',
    );
  });

  it('2. pages default to family workspace', () => {
    expect(DEFAULT_PAGES_WIZARD_STEP).toBe('family');
    expect(resolveDefaultPagesStep(undefined, degradedCapture)).toBe('family');
  });

  it('3. capture not root state when service degraded', () => {
    expect(resolvePagesWizardResumeStep(undefined, degradedCapture)).toBe('family');
    expect(resolvePagesWizardResumeStep(undefined, degradedCapture)).not.toBe('service-check');
  });

  it('4. capture service degraded does not block family confirm policy', () => {
    expect(isCaptureBlockingFamilyWork()).toBe(false);
    expect(canConfirmFamily()).toBe(true);
  });

  it('5. family map component does not require capture', () => {
    expect(read('src/site00/components/designWorkspace/pageFamily/PageFamilyMap.tsx')).toContain('PageFamilyMap');
    expect(read('src/site00/components/designWorkspace/pageFamily/PageFamilyMap.tsx')).not.toContain('browserReady');
  });

  it('6. derivative review renders without capture', () => {
    expect(read('src/site00/components/designWorkspace/pageFamily/DerivativeReviewCarousel.tsx')).toContain(
      'LIVE CAPTURE UNAVAILABLE',
    );
  });

  it('7. structure confirmation allowed without capture', () => {
    expect(canConfirmFamily()).toBe(true);
  });

  it('8. design approval depends on structure not capture', () => {
    expect(canApproveDesign(true)).toBe(true);
    expect(canApproveDesign(false)).toBe(false);
  });

  it('9. wiring review allowed without capture', () => {
    expect(canVerifyWiring()).toBe(true);
  });

  it('10. capture status secondary chip', () => {
    expect(read('src/site00/components/designWorkspace/pageFamily/CaptureServiceStatusChip.tsx')).toContain('LIVE CAPTURE');
  });

  it('11. capture subflow entry from family workspace', () => {
    expect(read('src/site00/components/designWorkspace/pageFamily/PageFamilyWorkspace.tsx')).toContain('onOpenCaptureService');
  });

  it('12. capture subflow return to family', () => {
    expect(captureSubflowReturnStep()).toBe('family');
    expect(read('src/site00/components/designWorkspace/DesignPagesWizard.tsx')).toContain('captureSubflowReturnStep');
  });

  it('13. PageFamilyDependencyPolicy module', () => {
    expect(read('shared/site00-studio-world-production/pageFamilyWorkspace/pageFamilyDependencyPolicy.ts')).toContain(
      'PageFamilyDependencyPolicy',
    );
  });

  it('14. separate structure design wiring capture statuses', () => {
    const family = buildPageFamilyFromRows({ projectId: 'ndxbook', rows: sampleRows });
    const readiness = derivePageFamilyReadiness(family, {
      apiConnected: true,
      workerHealthy: false,
      browserReady: false,
      contractValid: true,
    });
    expect(readiness.dimensions.structure).toBeTruthy();
    expect(readiness.dimensions.capture).toBe('UNAVAILABLE');
  });

  it('15. PageFamilyReadiness capture UNAVAILABLE not BLOCKED', () => {
    const family = buildPageFamilyFromRows({ projectId: 'ndxbook', rows: sampleRows });
    const readiness = derivePageFamilyReadiness(family, {
      apiConnected: false,
      workerHealthy: false,
      browserReady: false,
      contractValid: false,
    });
    expect(readiness.captureStatus).toBe('UNAVAILABLE');
    expect(readiness.structureStatus).not.toBe('BLOCKED');
  });

  it('16. no global BLOCKED from capture in readiness', () => {
    const family = buildPageFamilyFromRows({ projectId: 'ndxbook', rows: sampleRows });
    const readiness = derivePageFamilyReadiness(family, {
      apiConnected: true,
      workerHealthy: false,
      browserReady: false,
      contractValid: true,
    });
    expect(readiness.summaryLabel).not.toBe('BLOCKED');
  });

  it('17. Family | All Pages mode', () => {
    expect(read('src/site00/components/designWorkspace/pageFamily/PageFamilyWorkspace.tsx')).toContain('ALL PAGES');
  });

  it('18. page library secondary via wizard step', () => {
    expect(read('src/site00/components/designWorkspace/DesignPagesWizard.tsx')).toContain("goTo('library')");
  });

  it('19. PCI.1 preserved — inheritance in details', () => {
    expect(read('src/site00/components/designWorkspace/pageFamily/PageFamilyWorkspace.tsx')).toContain('INHERITANCE');
  });

  it('20. PCI.2 preserved — navigation promises', () => {
    expect(read('src/site00/components/designWorkspace/pageFamily/PageFamilyWorkspace.tsx')).toContain('NAVIGATION PROMISES');
  });

  it('21. PCI.3 preserved — PageFamilyWorkspace primary', () => {
    expect(read('src/site00/components/designWorkspace/DesignPagesWizard.tsx')).toContain('PageFamilyWorkspace');
  });

  it('22. mobile default family step in wizard', () => {
    expect(read('src/site00/components/designWorkspace/DesignPagesWizard.tsx')).toContain('DEFAULT_PAGES_WIZARD_STEP');
  });

  it('23. desktop default family workspace', () => {
    expect(resolveDefaultPagesStep(undefined, degradedCapture)).toBe('family');
  });

  it('24. deep-link capture subflow honored', () => {
    expect(resolveDefaultPagesStep('service-check', degradedCapture)).toBe('service-check');
    expect(isCaptureSubflowStep('service-check')).toBe(true);
  });

  it('25. landing redirects to family', () => {
    expect(resolveDefaultPagesStep('landing', degradedCapture)).toBe('family');
  });

  it('26. existing capture engine preserved', () => {
    expect(read('src/site00/components/designWorkspace/DesignPagesWizard.tsx')).toContain("'service-check'");
    expect(read('src/site00/components/designWorkspace/DesignPagesWizard.tsx')).toContain("'test-worker'");
  });

  it('27. capture dimension unavailable when browser down', () => {
    expect(
      deriveCaptureDimensionStatus({
        apiConnected: true,
        workerHealthy: true,
        browserReady: false,
        contractValid: true,
      }),
    ).toBe('UNAVAILABLE');
  });

  it('28. build v269', () => {
    expect(P0_PCI_3R1_BUILD).toBe('v269');
  });
});
