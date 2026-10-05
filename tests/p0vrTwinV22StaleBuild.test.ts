/**
 * Twin V2 — stale compiled twin cleared when active concept changes after generation.
 */

import { describe, expect, it } from 'vitest';
import {
  createConceptDirectedTwinSession,
  mergeVisualConceptApiResult,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV21/index.js';
import { beginDualOutputConceptGeneration } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV25/buildDualOutputPreGeneration.js';
import { ensureConceptGallery } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV22/conceptGalleryState.js';
import { invalidateStaleTwinBuildForActiveConcept } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV22/invalidateStaleTwinBuildForConcept.js';

describe('Twin V2 stale build invalidation', () => {
  it('clears renderedTwin when new concept becomes active', () => {
    let session = createConceptDirectedTwinSession({ projectId: 'ndxbook', pageId: 'overview', sessionId: 'stale-1' });
    session = ensureConceptGallery(session);
    session = beginDualOutputConceptGeneration(session, { generationType: 'INITIAL' }).session;
    session = mergeVisualConceptApiResult(session, {
      action: 'generate',
      imageUrl: '/first.jpg',
      imageStorageRef: 'ref-1',
    });
    const firstId = session.conceptGallery!.activeConceptId!;
    session = {
      ...session,
      renderedTwin: {
        renderMode: 'TWIN_V2_VISUAL_COMPILER_NDX_OVERVIEW',
        componentRef: 'ConceptVisualCompilerTwinV2',
        builtAt: new Date().toISOString(),
        sourceConceptId: firstId,
        buildMode: 'VISUAL_TO_CODE_COMPILER',
      },
      twinV2VisualCompiler: { strategy: 'VISUAL_TO_CODE_COMPILER' } as never,
    };

    session = beginDualOutputConceptGeneration(session, { generationType: 'REGENERATED' }).session;
    session = mergeVisualConceptApiResult(session, {
      action: 'regenerate',
      imageUrl: '/second.jpg',
      imageStorageRef: 'ref-2',
    });

    expect(session.conceptGallery!.activeConceptId).not.toBe(firstId);
    expect(session.renderedTwin).toBeNull();
    expect(session.twinV2VisualCompiler).toBeNull();
    expect(session.conceptGallery!.candidates.at(-1)?.visualAssetUrl).toBe('/second.jpg');
  });

  it('clears compiler when visual URL changes but concept id matches (regenerate in session)', () => {
    let session = createConceptDirectedTwinSession({ projectId: 'ndxbook', pageId: 'overview', sessionId: 'stale-3' });
    session = ensureConceptGallery(session);
    session = beginDualOutputConceptGeneration(session, { generationType: 'INITIAL' }).session;
    session = mergeVisualConceptApiResult(session, {
      action: 'generate',
      imageUrl: '/old.jpg',
      imageStorageRef: 'ref-old',
    });
    const id = session.conceptGallery!.activeConceptId!;
    session = {
      ...session,
      conceptGallery: {
        ...session.conceptGallery!,
        candidates: session.conceptGallery!.candidates.map((c) =>
          c.conceptId === id ? { ...c, visualAssetUrl: '/new.jpg', updatedAt: new Date().toISOString() } : c,
        ),
      },
      renderedTwin: {
        renderMode: 'TWIN_V2_VISUAL_COMPILER_NDX_OVERVIEW',
        componentRef: 'ConceptVisualCompilerTwinV2',
        builtAt: new Date().toISOString(),
        sourceConceptId: id,
        buildMode: 'VISUAL_TO_CODE_COMPILER',
      },
      twinV2VisualCompiler: {
        visualAuthority: { assetUrl: '/old.jpg' },
        compilerInvocationReceipt: { conceptId: id },
      } as never,
    };
    const out = invalidateStaleTwinBuildForActiveConcept(session);
    expect(out.renderedTwin).toBeNull();
    expect(out.twinV2VisualCompiler).toBeNull();
  });

  it('invalidate helper is no-op when build matches active', () => {
    let session = createConceptDirectedTwinSession({ projectId: 'ndxbook', pageId: 'overview', sessionId: 'stale-2' });
    session = ensureConceptGallery(session);
    session = beginDualOutputConceptGeneration(session, { generationType: 'INITIAL' }).session;
    session = mergeVisualConceptApiResult(session, {
      action: 'generate',
      imageUrl: '/only.jpg',
      imageStorageRef: 'ref',
    });
    const id = session.conceptGallery!.activeConceptId!;
    session = {
      ...session,
      renderedTwin: {
        renderMode: 'TWIN_V2_VISUAL_COMPILER_NDX_OVERVIEW',
        componentRef: 'ConceptVisualCompilerTwinV2',
        builtAt: new Date().toISOString(),
        sourceConceptId: id,
      },
    };
    const out = invalidateStaleTwinBuildForActiveConcept(session);
    expect(out.renderedTwin).not.toBeNull();
  });
});
