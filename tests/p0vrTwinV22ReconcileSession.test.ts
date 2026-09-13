import { describe, expect, it } from 'vitest';
import {
  approveActiveConceptCandidate,
  createConceptDirectedTwinSession,
  mergeVisualConceptApiResult,
  resolveTwinV2SessionForOpen,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV21/index.js';
import { saveConceptDirectedTwinSession } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV21/conceptDirectedTwinSessionStore.js';
import { beginDualOutputConceptGeneration } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV25/buildDualOutputPreGeneration.js';
import { ensureConceptGallery, getActiveConceptCandidate } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV22/conceptGalleryState.js';
import { reconcileTwinV2SessionState } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV22/reconcileTwinV2SessionState.js';

describe('Twin V2 session reconcile', () => {
  it('syncs package visual from candidate and clears stale compiler', () => {
    let session = createConceptDirectedTwinSession({ projectId: 'ndxbook', pageId: 'overview', sessionId: 'rec-1' });
    session = ensureConceptGallery(session);
    session = beginDualOutputConceptGeneration(session, { generationType: 'INITIAL' }).session;
    session = mergeVisualConceptApiResult(session, {
      action: 'generate',
      imageUrl: '/a.jpg',
      imageStorageRef: 'ref-a',
    });
    session = approveActiveConceptCandidate(session);
    const id = getActiveConceptCandidate(session)!.conceptId;
    session = {
      ...session,
      renderedTwin: {
        renderMode: 'TWIN_V2_VISUAL_COMPILER_NDX_OVERVIEW',
        componentRef: 'ConceptVisualCompilerTwinV2',
        builtAt: new Date().toISOString(),
        sourceConceptId: id,
        buildMode: 'VISUAL_TO_CODE_COMPILER',
      },
      twinV2VisualCompiler: {
        visualAuthority: { assetUrl: '/a.jpg' },
        compilerInvocationReceipt: { conceptId: id },
      } as never,
      conceptGallery: {
        ...session.conceptGallery!,
        candidates: session.conceptGallery!.candidates.map((c) =>
          c.conceptId === id ? { ...c, visualAssetUrl: '/b.jpg', visualAsset: 'ref-b' } : c,
        ),
      },
    };
    const out = reconcileTwinV2SessionState(session);
    const pkg = Object.values(out.conceptGallery!.packages).find((p) => p.conceptId === id)!;
    expect(pkg.visualAuthority.imageUrl).toBe('/b.jpg');
    expect(out.renderedTwin).toBeNull();
    expect(out.twinV2VisualCompiler).toBeNull();
  });

  it('resolveTwinV2SessionForOpen prefers direct page session over richer sibling', () => {
    if (typeof localStorage === 'undefined') return;
    const pageId = 'ndxbook-overview-direct';
    let direct = createConceptDirectedTwinSession({ projectId: 'ndxbook', pageId, sessionId: 'direct-session' });
    direct = mergeVisualConceptApiResult(ensureConceptGallery(direct), {
      action: 'generate',
      imageUrl: '/direct-only.jpg',
      imageStorageRef: 'direct-ref',
    });
    saveConceptDirectedTwinSession(direct);

    let sibling = createConceptDirectedTwinSession({
      projectId: 'ndxbook',
      pageId: 'overview-sibling',
      sessionId: 'sibling-rich',
    });
    sibling = ensureConceptGallery(sibling);
    for (let i = 0; i < 3; i++) {
      sibling = beginDualOutputConceptGeneration(sibling, { generationType: 'INITIAL' }).session;
      sibling = mergeVisualConceptApiResult(sibling, {
        action: 'generate',
        imageUrl: `/s-${i}.jpg`,
        imageStorageRef: `s-ref-${i}`,
      });
    }
    saveConceptDirectedTwinSession(sibling);

    const opened = resolveTwinV2SessionForOpen({ projectId: 'ndxbook', pageId });
    expect(opened.sessionId).toBe(direct.sessionId);
    expect(getActiveConceptCandidate(opened)?.visualAssetUrl).toBe('/direct-only.jpg');
  });
});
