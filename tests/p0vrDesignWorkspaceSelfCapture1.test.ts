/**
 * P0.VR.DESIGN-WORKSPACE-SELF-CAPTURE1
 */

import { describe, expect, it } from 'vitest';

import { captureLiveDesignWorkspacePair } from '../api/_lib/site00WorkspaceSelfCapture/designWorkspaceCaptureService.js';
import {
  applyWorkspaceSelfCapturePair,
  beginWorkspaceSelfCaptureSet,
  failWorkspaceSelfCaptureSet,
  syncNbpPackageFromCaptures,
} from '../shared/site00-design-workspace-production/workspaceSelfConcept/captureWorkflow.js';
import {
  DEFAULT_WORKSPACE_SELF_SOURCE,
  resolveWorkspaceSelfDesignRoute,
} from '../shared/site00-design-workspace-production/workspaceSelfConcept/sourceContext.js';
import {
  WORKSPACE_SELF_DESKTOP_CAPTURE,
  workspaceSelfViewportSpec,
} from '../shared/site00-design-workspace-production/workspaceSelfConcept/viewports.js';
import { evaluateNbpHandoffReadiness } from '../shared/site00-design-workspace-production/workspaceSelfConcept/readiness.js';
import {
  compileAndFreezeFunctionContract,
  createInitialWorkspaceSelfState,
  createNbpConceptPackage,
} from '../shared/site00-design-workspace-production/workspaceSelfConcept/workflow.js';
import { getViewportSpec } from '../shared/site00-visual-reference/viewportConfig.js';

describe('P0.VR.DESIGN-WORKSPACE-SELF-CAPTURE1', () => {
  it('resolves canonical DESIGN capture route from source context', () => {
    expect(resolveWorkspaceSelfDesignRoute(DEFAULT_WORKSPACE_SELF_SOURCE)).toBe('/projects/design/ndxbook');
  });

  it('uses central viewport dimensions for MOBILE and DESIGN desktop capture', () => {
    const mobile = workspaceSelfViewportSpec('MOBILE');
    expect(mobile.width).toBe(getViewportSpec('MOBILE').width);
    expect(WORKSPACE_SELF_DESKTOP_CAPTURE.width).toBe(1440);
    expect(WORKSPACE_SELF_DESKTOP_CAPTURE.height).toBe(1024);
  });

  it('blocks NBP readiness without mobile or desktop READY captures', () => {
    let s = compileAndFreezeFunctionContract(createInitialWorkspaceSelfState());
    expect(evaluateNbpHandoffReadiness(s)).toBe('BLOCKED_NO_MOBILE_CAPTURE');
    expect(() => createNbpConceptPackage(s)).toThrow(/MOBILE/);

    s = applyWorkspaceSelfCapturePair(s, {
      captureSetId: 'wscs-1',
      build: 'b1',
      createdBy: 'test',
      route: '/projects/design/ndxbook',
      mobile: { captureId: 'm1', artifactPath: 'local://a/m1' },
      desktop: { captureId: 'd1', artifactPath: 'local://a/d1' },
    });
    expect(evaluateNbpHandoffReadiness(s)).toBe('READY_FOR_NBP');
    s = createNbpConceptPackage(s);
    expect(s.nbpPackage?.status).toBe('READY_FOR_NBP');
    expect(s.nbpPackage?.currentMobileCaptureId).toBe('m1');
    expect(s.nbpPackage?.currentDesktopCaptureId).toBe('d1');
  });

  it('recapture is append-only and pairs share capture set + build', () => {
    let s = createInitialWorkspaceSelfState();
    s = beginWorkspaceSelfCaptureSet(s, { build: 'v1', createdBy: 'f' });
    const set1 = s.activeCaptureSetId!;
    s = applyWorkspaceSelfCapturePair(s, {
      captureSetId: set1,
      build: 'v1',
      createdBy: 'f',
      route: '/projects/design/ndxbook',
      mobile: { captureId: 'm-v1', artifactPath: 'local://x/m-v1' },
      desktop: { captureId: 'd-v1', artifactPath: 'local://x/d-v1' },
    });
    const countAfterFirst = s.captures.length;
    s = beginWorkspaceSelfCaptureSet(s, { build: 'v2', createdBy: 'f' });
    const set2 = s.activeCaptureSetId!;
    s = applyWorkspaceSelfCapturePair(s, {
      captureSetId: set2,
      build: 'v2',
      createdBy: 'f',
      route: '/projects/design/ndxbook',
      mobile: { captureId: 'm-v2', artifactPath: 'local://x/m-v2' },
      desktop: { captureId: 'd-v2', artifactPath: 'local://x/d-v2' },
    });
    expect(s.captures.length).toBeGreaterThan(countAfterFirst);
    expect(s.captureSets.find((set) => set.captureSetId === set1)?.status).toBe('SUPERSEDED');
    expect(s.captureSets.find((set) => set.captureSetId === set2)?.status).toBe('READY');
    expect(latestReady(s).mobile?.captureId).toBe('m-v2');
    expect(s.captureSets.find((set) => set.captureSetId === set2)?.sourceBuild).toBe('v2');
  });

  it('failed recapture preserves previous valid pair', () => {
    let s = createInitialWorkspaceSelfState();
    s = beginWorkspaceSelfCaptureSet(s, { build: 'v1', createdBy: 'f' });
    const set1 = s.activeCaptureSetId!;
    s = applyWorkspaceSelfCapturePair(s, {
      captureSetId: set1,
      build: 'v1',
      createdBy: 'f',
      route: '/projects/design/ndxbook',
      mobile: { captureId: 'm-keep', artifactPath: 'local://x/m-keep' },
      desktop: { captureId: 'd-keep', artifactPath: 'local://x/d-keep' },
    });
    s = compileAndFreezeFunctionContract(s);
    s = beginWorkspaceSelfCaptureSet(s, { build: 'v2', createdBy: 'f' });
    const failedSet = s.activeCaptureSetId!;
    s = failWorkspaceSelfCaptureSet(s, { captureSetId: failedSet, reason: 'timeout' });
    expect(evaluateNbpHandoffReadiness(s)).toBe('READY_FOR_NBP');
    expect(latestReady(s).mobile?.captureId).toBe('m-keep');
    expect(s.lastCaptureFailure?.message).toContain('timeout');
  });

  it('capture service returns vitest mock pair without mutating production state flag', async () => {
    const result = await captureLiveDesignWorkspacePair({
      baseUrl: 'http://127.0.0.1:5174',
      source: DEFAULT_WORKSPACE_SELF_SOURCE,
      build: 'vitest',
    });
    expect(result).toMatchObject({
      route: '/projects/design/ndxbook',
      mobile: { captureId: expect.stringMatching(/^wsc-m-/) },
      desktop: { captureId: expect.stringMatching(/^wsc-d-/) },
    });
  });

  it('syncNbpPackageFromCaptures does not fake READY without contract', () => {
    let s = applyWorkspaceSelfCapturePair(createInitialWorkspaceSelfState(), {
      captureSetId: 'wscs-x',
      build: 'b',
      createdBy: 't',
      route: '/projects/design/ndxbook',
      mobile: { captureId: 'm', artifactPath: 'local://m' },
      desktop: { captureId: 'd', artifactPath: 'local://d' },
    });
    s = syncNbpPackageFromCaptures(s);
    expect(s.nbpPackage).toBeNull();
  });
});

function latestReady(state: ReturnType<typeof createInitialWorkspaceSelfState>) {
  const mobile = [...state.captures].reverse().find((c) => c.viewport === 'MOBILE' && c.status === 'READY');
  const desktop = [...state.captures].reverse().find((c) => c.viewport === 'DESKTOP' && c.status === 'READY');
  return { mobile, desktop };
}
