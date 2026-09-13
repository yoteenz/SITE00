/**
 * P0.VR.TWINV2.2R2R1 — Sanitized blueprint binding + host preview UI recovery.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  createConceptDirectedTwinSession,
  mergeVisualConceptApiResult,
  assertV1Isolation,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV21/index.js';
import {
  ensureConceptGallery,
  getActiveConceptCandidate,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV22/conceptGalleryState.js';
import {
  repairConceptGalleryHostBoundary,
  buildBlueprintRegionInspectionRows,
  resolveActiveConceptBlueprintTrace,
  assertActiveConceptUsesExecutionBlueprint,
  TWIN_V2_STALE_UNSANITIZED_BLUEPRINT,
  computeExecutableConceptPackageReadiness,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV22R2/index.js';
import { P0_VR_TWIN_V22_BUILD } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV22/constants.js';
import { canBuildConcept } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV22/computeConceptBuildReadiness.js';

const read = (rel: string) => readFileSync(join(import.meta.dirname, '..', rel), 'utf8');

describe('P0.VR.TWINV2.2R2R1 sanitized blueprint binding', () => {
  it('root cause: stale gallery without execution blueprint is repaired on hydrate', () => {
    let session = mergeVisualConceptApiResult(
      createConceptDirectedTwinSession({ projectId: 'ndxbook', pageId: 'overview', sessionId: 'stale-1' }),
      { action: 'generate', imageUrl: '/c.jpg', imageStorageRef: 'ref' },
    );
    session = ensureConceptGallery(session);
    const gallery = session.conceptGallery!;
    const stale = {
      ...gallery,
      sanitizedBlueprints: {},
      generatedHostArtifacts: {},
      hostBoundarySanitizationReceipts: {},
      candidates: gallery.candidates.map((c) => ({
        ...c,
        executionBlueprintId: undefined,
        originalBlueprintId: undefined,
        buildReadiness: { ...c.buildReadiness, hostBoundaryReady: false },
      })),
    };
    const repaired = repairConceptGalleryHostBoundary(session, stale);
    const c = repaired.candidates[0]!;
    expect(c.executionBlueprintId).toBeTruthy();
    expect(repaired.sanitizedBlueprints[c.executionBlueprintId!]).toBeDefined();
    expect(c.buildReadiness.hostBoundaryReady).toBe(true);
    expect(repaired.generatedHostArtifacts[c.conceptId]?.length).toBeGreaterThan(0);
  });

  it('1–4 active concept execution vs original blueprint ids', () => {
    const session = ensureConceptGallery(
      mergeVisualConceptApiResult(
        createConceptDirectedTwinSession({ projectId: 'ndxbook', pageId: 'overview', sessionId: 'trace-1' }),
        { action: 'generate', imageUrl: '/c.jpg', imageStorageRef: null },
      ),
    );
    const c = getActiveConceptCandidate(session)!;
    const trace = resolveActiveConceptBlueprintTrace({ candidate: c, gallery: session.conceptGallery! });
    expect(trace.originalConceptBlueprintId).toBe(c.conceptBlueprintId);
    expect(trace.executionBlueprintId).toBeTruthy();
    expect(trace.activeBlueprintIdUsedByBuild).toBe(trace.executionBlueprintId);
  });

  it('5–7 host bottom nav labeled excluded in blueprint inspection rows', () => {
    const session = ensureConceptGallery(
      mergeVisualConceptApiResult(
        createConceptDirectedTwinSession({ projectId: 'ndxbook', pageId: 'overview', sessionId: 'bp-1' }),
        { action: 'generate', imageUrl: '/c.jpg', imageStorageRef: null },
      ),
    );
    const c = getActiveConceptCandidate(session)!;
    const g = session.conceptGallery!;
    const rows = buildBlueprintRegionInspectionRows({
      originalBlueprint: g.blueprints[c.conceptBlueprintId],
      executionBlueprint: g.sanitizedBlueprints[c.executionBlueprintId!],
      generatedHostArtifacts: g.generatedHostArtifacts[c.conceptId],
      hostShellContract: g.hostShellContracts[c.conceptId],
    });
    const hostNav =
      rows.find((r) => r.regionId === 'obj-generated-host-bottom-nav') ??
      rows.find((r) => r.label.toLowerCase().includes('host bottom nav'));
    expect(hostNav?.ownership).toBe('GENERATED_HOST_ARTIFACT');
    expect(hostNav?.generatedSource).toBe('GENERATED_HOST_ARTIFACT');
    expect(hostNav?.executionStatus).toBe('EXCLUDED_FROM_CLIENT_BUILD');
    expect(hostNav?.runtimeSource).toBe('TwinSite00HostBottomNav');
  });

  it('8–14 UI wiring + build gate + stale guard', () => {
    expect(read('src/site00/components/designWorkspace/pageFamily/ConceptDirectedTwinGallery.tsx')).toContain(
      'HOST PREVIEW',
    );
    expect(read('src/site00/components/designWorkspace/pageFamily/ConceptDirectedTwinGallery.tsx')).toContain(
      'HOST BOUNDARY',
    );
    expect(read('src/site00/components/designWorkspace/pageFamily/ConceptDirectedTwinGallery.tsx')).toContain(
      'GENERATED HOST ARTIFACT',
    );
    expect(read('src/site00/components/designWorkspace/pageFamily/ConceptDirectedTwinGallery.tsx')).toContain(
      'data-view-tab={mode}',
    );
    expect(read('src/site00/components/designWorkspace/pageFamily/ConceptDirectedTwinGallery.tsx')).toContain(
      "case 'HOST_PREVIEW':",
    );

    const session = ensureConceptGallery(
      mergeVisualConceptApiResult(
        createConceptDirectedTwinSession({ projectId: 'ndxbook', pageId: 'overview', sessionId: 'gate-1' }),
        { action: 'generate', imageUrl: '/c.jpg', imageStorageRef: null },
      ),
    );
    const c = getActiveConceptCandidate(session)!;
    expect(c.buildReadiness.hostBoundaryReady).toBe(true);
    expect(canBuildConcept(c.buildReadiness, false)).toBe(false);
    const pkg = computeExecutableConceptPackageReadiness({ candidate: c, readiness: c.buildReadiness });
    expect(pkg.hostBoundary).toBe(true);
    expect(pkg.readyToBuild).toBe(false);

    assertActiveConceptUsesExecutionBlueprint({ candidate: c, gallery: session.conceptGallery! });
    const badGallery = { ...session.conceptGallery!, sanitizedBlueprints: {} };
    expect(() => assertActiveConceptUsesExecutionBlueprint({ candidate: c, gallery: badGallery })).toThrow(
      TWIN_V2_STALE_UNSANITIZED_BLUEPRINT,
    );
  });

  it('19–21 v1/live isolation + build ref', () => {
    expect(assertV1Isolation().v1PipelineUntouched).toBe(true);
    expect(read('shared/site00-studio-world-production/visualReconstruction/p0vrTwinV22/composeFromExecutablePackage.ts')).not.toContain(
      'promoteTwinToLive',
    );
    expect(P0_VR_TWIN_V22_BUILD).toBe('v363');
  });
});
