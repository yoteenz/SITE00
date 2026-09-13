/**
 * P0.VR.TWINV2.2R2R2 — Client canvas bottom-boundary trim.
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
  computeClientCanvasBoundary,
  computeLastClientContentBottom,
  assertClientCanvasExcludesHostArtifactExtent,
  CLIENT_CANVAS_HOST_ARTIFACT_HEIGHT_LEAK,
  buildClientCanvasTrimReceipt,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV22R2/index.js';
import { P0_VR_TWIN_V22_BUILD } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV22/constants.js';

const read = (rel: string) => readFileSync(join(import.meta.dirname, '..', rel), 'utf8');

describe('P0.VR.TWINV2.2R2R2 client canvas trim', () => {
  it('trims below generated host nav and preserves activity extent', () => {
    const session = ensureConceptGallery(
      mergeVisualConceptApiResult(
        createConceptDirectedTwinSession({ projectId: 'ndxbook', pageId: 'overview', sessionId: 'trim-1' }),
        { action: 'generate', imageUrl: '/c.jpg', imageStorageRef: null },
      ),
    );
    const c = getActiveConceptCandidate(session)!;
    const g = session.conceptGallery!;
    const boundary = g.clientCanvasBoundaries![c.conceptId];
    expect(boundary).toBeDefined();
    expect(boundary!.generatedHostNavBounds?.y).toBeGreaterThanOrEqual(0.88);
    expect(boundary!.sanitizedCanvasBottom).toBeLessThan(boundary!.generatedHostNavBounds!.y);
    expect(boundary!.lastClientContentBottom).toBeGreaterThan(0.2);
    const receipt = g.clientCanvasTrimReceipts![c.conceptId];
    expect(receipt?.finalClientCanvasHeight).toBe(boundary!.sanitizedCanvasHeight);
    expect(receipt?.safeAreaOwner).toBe('HOST_SHELL');
  });

  it('assertClientCanvasExcludesHostArtifactExtent regression guard', () => {
    const session = ensureConceptGallery(
      mergeVisualConceptApiResult(
        createConceptDirectedTwinSession({ projectId: 'ndxbook', pageId: 'overview', sessionId: 'trim-2' }),
        { action: 'generate', imageUrl: '/c.jpg', imageStorageRef: null },
      ),
    );
    const c = getActiveConceptCandidate(session)!;
    const g = session.conceptGallery!;
    const boundary = g.clientCanvasBoundaries![c.conceptId]!;
    expect(() =>
      assertClientCanvasExcludesHostArtifactExtent({
        boundary,
        generatedHostArtifacts: g.generatedHostArtifacts[c.conceptId],
      }),
    ).not.toThrow();
    const leaky = { ...boundary, sanitizedCanvasBottom: 0.95 };
    expect(() =>
      assertClientCanvasExcludesHostArtifactExtent({
        boundary: leaky,
        generatedHostArtifacts: g.generatedHostArtifacts[c.conceptId],
      }),
    ).toThrow(CLIENT_CANVAS_HOST_ARTIFACT_HEIGHT_LEAK);
  });

  it('UI uses semantic translate frame not fixed 12% clip', () => {
    expect(read('src/site00/components/designWorkspace/pageFamily/TwinV2ExecutionClientCanvasFrame.tsx')).toContain(
      'translateY',
    );
    expect(read('src/site00/components/designWorkspace/pageFamily/TwinV2ExecutionClientCanvasFrame.tsx')).not.toContain(
      'clipPath',
    );
    expect(read('src/site00/styles/site00-twin-v2-concept.css')).not.toContain('inset(7% 0 12% 0)');
    expect(read('src/site00/styles/site00-twin-v2-concept.css')).not.toContain('min-height: 520px');
  });

  it('original visual preserved; v1/live isolation', () => {
    const session = mergeVisualConceptApiResult(
      createConceptDirectedTwinSession({ projectId: 'ndxbook', pageId: 'overview', sessionId: 'trim-3' }),
      { action: 'generate', imageUrl: '/orig.jpg', imageStorageRef: 'keep' },
    );
    expect(session.history[0].imageUrl).toBe('/orig.jpg');
    const exec = ensureConceptGallery(session);
    const c = getActiveConceptCandidate(exec)!;
    const { lastClientContentBottom } = computeLastClientContentBottom(
      exec.conceptGallery!.sanitizedBlueprints[c.executionBlueprintId!],
    );
    expect(lastClientContentBottom).toBeGreaterThan(0);
    expect(assertV1Isolation().v1PipelineUntouched).toBe(true);
    expect(P0_VR_TWIN_V22_BUILD).toBe('v358');
  });

  it('computeClientCanvasBoundary receipt fields', () => {
    const session = ensureConceptGallery(
      mergeVisualConceptApiResult(
        createConceptDirectedTwinSession({ projectId: 'ndxbook', pageId: 'overview', sessionId: 'trim-4' }),
        { action: 'generate', imageUrl: '/c.jpg', imageStorageRef: null },
      ),
    );
    const c = getActiveConceptCandidate(session)!;
    const g = session.conceptGallery!;
    const boundary = computeClientCanvasBoundary({
      conceptId: c.conceptId,
      executionBlueprint: g.sanitizedBlueprints[c.executionBlueprintId!],
      generatedHostArtifacts: g.generatedHostArtifacts[c.conceptId],
    });
    const receipt = buildClientCanvasTrimReceipt(boundary);
    expect(receipt.excludedHostArtifactHeight).toBeGreaterThan(0);
    expect(boundary.sanitizedCanvasHeight).toBeLessThan(1);
  });
});
