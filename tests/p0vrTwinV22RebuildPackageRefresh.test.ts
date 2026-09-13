/**
 * Twin V2 — rebuild must use current gallery visual, not stale ExecutableConceptPackage lock.
 */

import { describe, expect, it } from 'vitest';
import {
  approveActiveConceptCandidate,
  composeConceptDirectedTwinV2,
  createConceptDirectedTwinSession,
  mergeVisualConceptApiResult,
  prepareConceptDirectedTwinV2Build,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV21/index.js';
import { beginDualOutputConceptGeneration } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV25/buildDualOutputPreGeneration.js';
import {
  ensureConceptGallery,
  getActiveConceptCandidate,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV22/conceptGalleryState.js';
import {
  executablePackageVisualDrift,
  refreshExecutablePackageForActiveCandidate,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV22/approveConceptCandidate.js';

describe('Twin V2 rebuild package visual refresh', () => {
  it('detects drift when candidate visual URL changes after approve', () => {
    let session = createConceptDirectedTwinSession({ projectId: 'ndxbook', pageId: 'overview', sessionId: 'rb-1' });
    session = ensureConceptGallery(session);
    session = beginDualOutputConceptGeneration(session, { generationType: 'INITIAL' }).session;
    session = mergeVisualConceptApiResult(session, {
      action: 'generate',
      imageUrl: '/visual-a.jpg',
      imageStorageRef: 'ref-a',
    });
    session = approveActiveConceptCandidate(session);
    expect(executablePackageVisualDrift(session)).toBe(false);

    const active = getActiveConceptCandidate(session)!;
    session = {
      ...session,
      conceptGallery: {
        ...session.conceptGallery!,
        candidates: session.conceptGallery!.candidates.map((c) =>
          c.conceptId === active.conceptId
            ? { ...c, visualAssetUrl: '/visual-b.jpg', visualAsset: 'ref-b', updatedAt: new Date().toISOString() }
            : c,
        ),
      },
    };
    expect(executablePackageVisualDrift(session)).toBe(true);

    const refreshed = refreshExecutablePackageForActiveCandidate(session);
    const activeAfter = getActiveConceptCandidate(refreshed)!;
    const pkg = Object.values(refreshed.conceptGallery!.packages).find((p) => p.conceptId === activeAfter.conceptId)!;
    expect(pkg.visualAuthority.imageUrl).toBe('/visual-b.jpg');
    expect(pkg.status).toBe('READY');
  });

  it('prepareConceptDirectedTwinV2Build refreshes package before compose', () => {
    let session = createConceptDirectedTwinSession({ projectId: 'ndxbook', pageId: 'overview', sessionId: 'rb-2' });
    session = ensureConceptGallery(session);
    session = beginDualOutputConceptGeneration(session, { generationType: 'INITIAL' }).session;
    session = mergeVisualConceptApiResult(session, {
      action: 'generate',
      imageUrl: '/first.jpg',
      imageStorageRef: 'ref-1',
    });
    session = approveActiveConceptCandidate(session);
    const id = getActiveConceptCandidate(session)!.conceptId;
    session = {
      ...session,
      conceptGallery: {
        ...session.conceptGallery!,
        candidates: session.conceptGallery!.candidates.map((c) =>
          c.conceptId === id ? { ...c, visualAssetUrl: '/second.jpg', visualAsset: 'ref-2' } : c,
        ),
      },
    };
    expect(executablePackageVisualDrift(session)).toBe(true);
    const prepared = prepareConceptDirectedTwinV2Build(session);
    const pkg = Object.values(prepared.conceptGallery!.packages).find((p) => p.conceptId === id)!;
    expect(pkg.visualAuthority.imageUrl).toBe('/second.jpg');
    const { sessionPatch } = composeConceptDirectedTwinV2(prepared);
    expect(sessionPatch.twinV2VisualCompiler?.visualAuthority.assetUrl).toBe('/second.jpg');
  });
});
