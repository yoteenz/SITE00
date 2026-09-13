/**
 * P0.VR.TWINV2.2R2R3 — Client canvas top-boundary recovery.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  createConceptDirectedTwinSession,
  mergeVisualConceptApiResult,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV21/index.js';
import { ensureConceptGallery, getActiveConceptCandidate } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV22/conceptGalleryState.js';
import {
  computeFirstClientContentTop,
  computeClientCanvasBoundary,
  assertClientCanvasIncludesFirstClientObject,
  assertClientCanvasExcludesHostArtifactExtent,
  CLIENT_CANVAS_TOP_CROP_LOSS,
  CLIENT_CANVAS_LEGACY_TOP_NORM,
  buildClientCanvasTopReceipt,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV22R2/index.js';
import { P0_VR_TWIN_V22_BUILD } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV22/constants.js';

const read = (rel: string) => readFileSync(join(import.meta.dirname, '..', rel), 'utf8');

describe('P0.VR.TWINV2.2R2R3 client canvas top recovery', () => {
  it('firstClientContentTop includes masthead band, not fixed 7% only', () => {
    const session = ensureConceptGallery(
      mergeVisualConceptApiResult(
        createConceptDirectedTwinSession({ projectId: 'ndxbook', pageId: 'overview', sessionId: 'top-1' }),
        { action: 'generate', imageUrl: '/c.jpg', imageStorageRef: null },
      ),
    );
    const c = getActiveConceptCandidate(session)!;
    const g = session.conceptGallery!;
    const bp = g.sanitizedBlueprints[c.executionBlueprintId!];
    const first = computeFirstClientContentTop(bp);
    expect(first.firstClientContentTop).toBeLessThanOrEqual(CLIENT_CANVAS_LEGACY_TOP_NORM);
    const boundary = g.clientCanvasBoundaries![c.conceptId]!;
    expect(boundary.canvasTop).toBe(first.firstClientContentTop);
    expect(boundary.firstClientOwnedObjectId).toBeTruthy();
  });

  it('bottom trim unchanged + top/bottom guards both pass', () => {
    const session = ensureConceptGallery(
      mergeVisualConceptApiResult(
        createConceptDirectedTwinSession({ projectId: 'ndxbook', pageId: 'overview', sessionId: 'top-2' }),
        { action: 'generate', imageUrl: '/c.jpg', imageStorageRef: null },
      ),
    );
    const c = getActiveConceptCandidate(session)!;
    const g = session.conceptGallery!;
    const boundary = g.clientCanvasBoundaries![c.conceptId]!;
    expect(() => assertClientCanvasIncludesFirstClientObject(boundary)).not.toThrow();
    expect(() =>
      assertClientCanvasExcludesHostArtifactExtent({
        boundary,
        generatedHostArtifacts: g.generatedHostArtifacts[c.conceptId],
      }),
    ).not.toThrow();
    expect(boundary.sanitizedCanvasBottom).toBeLessThan(boundary.generatedHostNavBounds!.y);
  });

  it('CLIENT_CANVAS_TOP_CROP_LOSS when canvasTop above first object', () => {
    const session = ensureConceptGallery(
      mergeVisualConceptApiResult(
        createConceptDirectedTwinSession({ projectId: 'ndxbook', pageId: 'overview', sessionId: 'top-3' }),
        { action: 'generate', imageUrl: '/c.jpg', imageStorageRef: null },
      ),
    );
    const c = getActiveConceptCandidate(session)!;
    const boundary = session.conceptGallery!.clientCanvasBoundaries![c.conceptId]!;
    const leaky = { ...boundary, canvasTop: (boundary.firstClientOwnedObjectBounds?.y ?? 0) + 0.05 };
    expect(() => assertClientCanvasIncludesFirstClientObject(leaky)).toThrow(CLIENT_CANVAS_TOP_CROP_LOSS);
  });

  it('presentation uses shift + bottom clip (no symmetric 7/12 inset)', () => {
    expect(read('src/site00/components/designWorkspace/pageFamily/TwinV2ExecutionClientCanvasFrame.tsx')).toContain(
      'translateY',
    );
    expect(read('src/site00/components/designWorkspace/pageFamily/TwinV2ExecutionClientCanvasFrame.tsx')).toContain(
      'clipPath',
    );
    expect(read('src/site00/styles/site00-twin-v2-concept.css')).not.toContain('inset(7% 0 12% 0)');
    expect(read('src/site00/styles/site00-twin-v2-concept.css')).not.toContain('object-fit: cover');
  });

  it('sanitizedCanvasBottom respects host safe area (excludes invented nav band)', () => {
    const session = ensureConceptGallery(
      mergeVisualConceptApiResult(
        createConceptDirectedTwinSession({ projectId: 'ndxbook', pageId: 'overview', sessionId: 'top-5' }),
        { action: 'generate', imageUrl: '/c.jpg', imageStorageRef: null },
      ),
    );
    const c = getActiveConceptCandidate(session)!;
    const boundary = session.conceptGallery!.clientCanvasBoundaries![c.conceptId]!;
    expect(boundary.sanitizedCanvasBottom).toBeLessThanOrEqual(0.88);
    expect(boundary.sanitizedCanvasBottom).toBeLessThan(boundary.generatedHostNavBounds!.y);
  });

  it('ClientCanvasTopReceipt + build ref', () => {
    const session = ensureConceptGallery(
      mergeVisualConceptApiResult(
        createConceptDirectedTwinSession({ projectId: 'ndxbook', pageId: 'overview', sessionId: 'top-4' }),
        { action: 'generate', imageUrl: '/c.jpg', imageStorageRef: null },
      ),
    );
    const c = getActiveConceptCandidate(session)!;
    const receipt = session.conceptGallery!.clientCanvasTopReceipts![c.conceptId]!;
    expect(receipt.newCanvasTop).toBeLessThanOrEqual(receipt.previousCanvasTop);
    expect(['RECOVERED', 'UNCHANGED']).toContain(receipt.status);
    expect(P0_VR_TWIN_V22_BUILD).toBe('v359');
    const boundary = computeClientCanvasBoundary({
      conceptId: c.conceptId,
      executionBlueprint: session.conceptGallery!.sanitizedBlueprints[c.executionBlueprintId!],
      generatedHostArtifacts: session.conceptGallery!.generatedHostArtifacts[c.conceptId],
    });
    expect(['RECOVERED', 'UNCHANGED']).toContain(buildClientCanvasTopReceipt(boundary).status);
  });
});
