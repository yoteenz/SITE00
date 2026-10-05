import { describe, expect, it } from 'vitest';
import {
  createConceptDirectedTwinSession,
  mergeVisualConceptApiResult,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV21/index.js';
import { beginDualOutputConceptGeneration } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV25/buildDualOutputPreGeneration.js';
import { ensureConceptGallery, getActiveConceptCandidate } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV22/conceptGalleryState.js';
import { conceptImageDisplayUrl } from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV22/conceptImageDisplayUrl.js';

describe('Twin V2 gallery image update after generate', () => {
  it('merge keeps new active candidate visual after dual-output finalize (no post-merge hydrate wipe)', () => {
    let session = createConceptDirectedTwinSession({ projectId: 'ndxbook', pageId: 'overview', sessionId: 'gal-1' });
    session = ensureConceptGallery(session);
    session = beginDualOutputConceptGeneration(session, { generationType: 'INITIAL' }).session;
    session = mergeVisualConceptApiResult(session, {
      action: 'generate',
      imageUrl: 'https://cdn.example/first.webp',
      imageStorageRef: 'ref-1',
    });
    const firstActive = getActiveConceptCandidate(session)!;
    expect(firstActive.visualAssetUrl).toBe('https://cdn.example/first.webp');

    session = beginDualOutputConceptGeneration(session, { generationType: 'REGENERATED' }).session;
    session = mergeVisualConceptApiResult(session, {
      action: 'regenerate',
      imageUrl: 'https://cdn.example/second.webp',
      imageStorageRef: 'ref-2',
    });
    const active = getActiveConceptCandidate(session)!;
    expect(active.visualAssetUrl).toBe('https://cdn.example/second.webp');
    expect(session.conceptGallery!.candidates.length).toBe(2);
    expect(session.conceptGallery!.activeConceptId).toBe(active.conceptId);
  });

  it('conceptImageDisplayUrl cache-busts repeated host paths', () => {
    const url = conceptImageDisplayUrl({
      conceptId: 'c1',
      visualAssetUrl: 'https://cdn.example/same.webp',
      updatedAt: '2026-09-13T16:00:00.000Z',
    });
    expect(url).toContain('site00ConceptRev');
    expect(url).not.toBe('https://cdn.example/same.webp');
  });
});
