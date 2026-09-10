/**
 * P0.VR.8R3R5 — Founder capture workflow UX (presentation layer).
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  buildCaptureFounderGuidance,
  founderPageFilterLabels,
  founderPageStatusLabel,
  founderSummaryChips,
  P0_VR_8R3R5_BUILD,
  resolveFounderCaptureWorkflowStage,
  TEST_WORKER_PROGRESS_STEPS,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vr8r3/client.js';
import { FOUNDER_CAPTURE_WORKFLOW_STAGES } from '../shared/site00-studio-world-production/visualReconstruction/p0vr8r3/founderCaptureWorkflow.js';

const ROOT = join(import.meta.dirname, '..');

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

const baseInput = {
  apiConnected: true,
  workerHealthy: true,
  browserReady: true,
  contractValid: true,
  testJobPassed: false,
  testingWorker: false,
  testWorkerFailed: false,
  isRefreshing: false,
  run: null,
  summary: {
    totalPages: 46,
    current: 0,
    neverCaptured: 46,
    queued: 0,
    capturing: 0,
    failed: 0,
    stale: 0,
  },
  projectName: 'NDXBOOK',
};

describe('P0.VR.8R3R5 — Founder capture UX', () => {
  it('1. FounderCaptureWorkflow module', () => {
    expect(FOUNDER_CAPTURE_WORKFLOW_STAGES.length).toBe(4);
    expect(read('shared/site00-studio-world-production/visualReconstruction/p0vr8r3/founderCaptureWorkflow.ts')).toContain(
      '01_SERVICE_CHECK',
    );
  });

  it('2. CaptureFounderGuidance module', () => {
    expect(read('shared/site00-studio-world-production/visualReconstruction/p0vr8r3/captureFounderGuidance.ts')).toContain(
      'buildCaptureFounderGuidance',
    );
  });

  it('3. service ready prompts test worker', () => {
    const g = buildCaptureFounderGuidance(baseInput);
    expect(g.primaryAction).toBe('TEST_WORKER');
    expect(g.headline).toContain('TEST');
  });

  it('4. service failure plain language', () => {
    const g = buildCaptureFounderGuidance({ ...baseInput, apiConnected: false });
    expect(g.headline).toBe('CONNECTION ISSUE');
    expect(g.primaryAction).toBe('CHECK_AGAIN');
  });

  it('5. test worker progress steps defined', () => {
    expect(TEST_WORKER_PROGRESS_STEPS).toEqual(['CONNECTING', 'STARTING_BROWSER', 'RUNNING_TEST', 'VERIFYING']);
  });

  it('6. worker test success surfaces refresh', () => {
    const g = buildCaptureFounderGuidance({ ...baseInput, testJobPassed: true });
    expect(g.primaryAction).toBe('REFRESH_PROJECT');
    expect(g.headline).toContain('READY');
  });

  it('7. worker test failure', () => {
    const g = buildCaptureFounderGuidance({ ...baseInput, testWorkerFailed: true });
    expect(g.headline).toContain('NEEDS ATTENTION');
    expect(g.primaryAction).toBe('RETRY_TEST');
  });

  it('8. project ready state', () => {
    const stage = resolveFounderCaptureWorkflowStage({ ...baseInput, testJobPassed: true });
    expect(stage).toBe('CAPTURE_PROJECT');
  });

  it('9. capture active state', () => {
    const g = buildCaptureFounderGuidance({
      ...baseInput,
      testJobPassed: true,
      isRefreshing: true,
      run: {
        status: 'CAPTURING',
        contractValid: true,
        totalTargets: 46,
        completedCount: 12,
        failedCount: 0,
        capturingCount: 2,
        queuedCount: 32,
      },
    });
    expect(g.headline).toContain('REFRESHING');
    expect(g.primaryAction).toBe('VIEW_PROGRESS');
  });

  it('10. capture progress counts', () => {
    const chips = founderSummaryChips(
      { totalPages: 46, current: 12, neverCaptured: 32, queued: 2, capturing: 2, failed: 0, stale: 0 },
      true,
    );
    expect(chips.find((c) => c.label === 'WAITING')?.value).toBe(34);
  });

  it('11. current page founder label', () => {
    expect(founderPageStatusLabel('CURRENT')).toBe('CURRENT');
    expect(founderPageStatusLabel('NEVER_CAPTURED')).toBe('NOT CAPTURED YET');
  });

  it('12. failed page founder label', () => {
    expect(founderPageStatusLabel('FAILED')).toBe('NEED REVIEW');
  });

  it('13. completed run', () => {
    const g = buildCaptureFounderGuidance({
      ...baseInput,
      testJobPassed: true,
      run: {
        status: 'COMPLETE',
        contractValid: true,
        totalTargets: 46,
        completedCount: 46,
        failedCount: 0,
        capturingCount: 0,
        queuedCount: 0,
      },
    });
    expect(g.visualState).toBe('success');
    expect(g.primaryAction).toBe('REVIEW_CAPTURES');
  });

  it('14. partial run', () => {
    const g = buildCaptureFounderGuidance({
      ...baseInput,
      testJobPassed: true,
      run: {
        status: 'PARTIAL',
        contractValid: true,
        totalTargets: 46,
        completedCount: 44,
        failedCount: 2,
        capturingCount: 0,
        queuedCount: 0,
      },
    });
    expect(g.visualState).toBe('partial');
    expect(g.primaryAction).toBe('REVIEW_ISSUES');
  });

  it('15. primary action selection', () => {
    expect(buildCaptureFounderGuidance({ ...baseInput, apiConnected: false }).primaryAction).toBe('CHECK_AGAIN');
  });

  it('16. details not in primary panel copy', () => {
    const panel = read('src/site00/components/designWorkspace/DesignPagesWizard.tsx');
    expect(panel).not.toContain('heartbeatAgeMs');
    expect(panel).not.toMatch(/contractVersion.*primary/i);
  });

  it('17. zero counts hidden in summary chips', () => {
    const chips = founderSummaryChips(baseInput.summary, false);
    expect(chips.some((c) => c.label === 'FAILED')).toBe(false);
    expect(chips.some((c) => c.label === 'NOT CAPTURED')).toBe(true);
  });

  it('18. project summary cards component', () => {
    expect(read('src/site00/components/designWorkspace/founderCapture/FounderCaptureExperience.tsx')).toContain(
      'site00-founder-capture__summary-chip',
    );
  });

  it('19. mobile-friendly summary grid', () => {
    expect(read('src/site00/styles/site00-design-workspace-v3.css')).toContain('auto-fit');
  });

  it('20. page card compact layout', () => {
    expect(read('src/site00/components/designWorkspace/DesignPagesWizard.tsx')).toContain('site00-founder-page-card');
  });

  it('21. page completion collapsed', () => {
    expect(read('src/site00/components/designWorkspace/DesignPagesWizard.tsx')).toContain('DesignPageCompletionPanel');
  });

  it('22. diagnostics drawer', () => {
    expect(read('src/site00/components/designWorkspace/founderCapture/FounderCaptureExperience.tsx')).toContain(
      'SYSTEM DETAILS',
    );
  });

  it('23. live/reference compare gating', () => {
    expect(read('src/site00/components/designWorkspace/DesignPagesWizard.tsx')).toContain("m !== 'live' && !hasLiveCapture");
  });

  it('24. overlay diff gating via compare mode', () => {
    expect(read('src/site00/components/designWorkspace/DesignPagesWizard.tsx')).toContain("mode === 'compare'");
  });

  it('25. NDXBOOK lime treatment', () => {
    expect(read('src/site00/styles/site00-design-workspace-v3.css')).toContain('is-ndxbook');
  });

  it('26. no raw telemetry in primary pages panel', () => {
    const panel = read('src/site00/components/designWorkspace/DesignPagesWizard.tsx');
    expect(panel).not.toContain('WORKER_UNAVAILABLE');
    expect(panel).not.toContain('RUN_CONTRACT_INVALID');
  });

  it('27. existing capture hooks preserved', () => {
    expect(read('src/site00/components/designWorkspace/usePageMirror.ts')).toContain('refreshProject');
    expect(read('src/site00/components/designWorkspace/usePageMirror.ts')).toContain('testWorker');
  });

  it('28. build v263', () => {
    expect(P0_VR_8R3R5_BUILD).toBe('v263');
  });
});
