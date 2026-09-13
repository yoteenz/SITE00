/**
 * P0.VR.TWINV2.2R1 — Gallery hydration + legacy backfill recovery.
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
  P0_VR_TWIN_V22_BUILD,
  discoverExistingV2ConceptGenerations,
  ensureConceptGallery,
  emptyConceptGallery,
  getConceptCandidates,
  shouldShowV2EmptyState,
  assertConceptGalleryEmptyState,
  hydrateConceptGallerySession,
} from '../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV22/index.js';

const read = (rel: string) => readFileSync(join(import.meta.dirname, '..', rel), 'utf8');

function sessionWithFiveConcepts() {
  let session = createConceptDirectedTwinSession({
    projectId: 'ndxbook',
    pageId: 'ndxbook:/projects/ndxbook',
    sessionId: 'hydrate-5',
  });
  for (let i = 0; i < 5; i++) {
    session = mergeVisualConceptApiResult(session, {
      action: i === 0 ? 'generate' : 'regenerate',
      imageUrl: `/concept-${i + 1}.jpg`,
      imageStorageRef: `site00/twin-v2/hydrate-5/${1000 + i}.webp`,
    });
  }
  return session;
}

describe('P0.VR.TWINV2.2R1 concept gallery hydration', () => {
  it('1–3 discoverExistingV2ConceptGenerations dedupes history + visualConcept', () => {
    let session = sessionWithFiveConcepts();
    const discovered = discoverExistingV2ConceptGenerations({ session });
    expect(discovered.length).toBeGreaterThanOrEqual(5);
    const urls = new Set(discovered.map((d) => d.imageUrl));
    expect(urls.size).toBe(discovered.length);
  });

  it('4–7 backfill stale empty conceptGallery with buildRef (root cause fix)', () => {
    const session = sessionWithFiveConcepts();
    const stale: typeof session = {
      ...session,
      conceptGallery: {
        ...emptyConceptGallery(),
        buildRef: P0_VR_TWIN_V22_BUILD,
        candidates: [],
      },
    };
    const hydrated = hydrateConceptGallerySession(stale);
    expect(hydrated.conceptGallery!.candidates.length).toBe(5);
    expect(hydrated.conceptGallery!.activeConceptId).toBe(hydrated.conceptGallery!.candidates[0].conceptId);
    expect(hydrated.conceptGallery!.backfillReceipt?.backfilledCount).toBe(5);
  });

  it('8–9 getConceptCandidates + empty state guard', () => {
    const session = hydrateConceptGallerySession(sessionWithFiveConcepts());
    const query = getConceptCandidates({
      projectId: 'ndxbook',
      pageId: session.pageId,
      viewport: 'mobile',
      mode: 'CONCEPT_DIRECTED_V2',
      session,
    });
    expect(query.canonicalConceptCount).toBe(5);
    expect(query.activeConceptId).not.toBeNull();
    expect(shouldShowV2EmptyState(5, 5)).toBe(false);
    expect(() =>
      assertConceptGalleryEmptyState({
        emptyStateShown: true,
        discoverableGenerationCount: 5,
        canonicalConceptCount: 5,
      }),
    ).toThrow(/STALE_V2_EMPTY_STATE/);
  });

  it('10–12 UI wiring: gallery primary, no empty when concepts exist', () => {
    expect(read('src/site00/components/designWorkspace/pageFamily/PageConceptDirectedTwinV2Experience.tsx')).toContain(
      'shouldShowV2EmptyState',
    );
    expect(read('src/site00/components/designWorkspace/pageFamily/PageConceptDirectedTwinV2Experience.tsx')).toContain(
      'showEmptyState',
    );
    expect(read('src/site00/components/designWorkspace/pageFamily/PageConceptDirectedTwinV2Experience.tsx')).toContain(
      'GENERATE NEW CONCEPT',
    );
    expect(read('src/site00/components/designWorkspace/pageFamily/ConceptDirectedTwinGallery.tsx')).toContain(
      'CONCEPT {active.versionNumber} OF',
    );
    expect(read('src/site00/components/designWorkspace/pageFamily/ConceptDirectedTwinGallery.tsx')).toContain('onTouchEnd');
  });

  it('13 sibling session discovery merges five concepts', () => {
    const primary = createConceptDirectedTwinSession({
      projectId: 'ndxbook',
      pageId: 'ndxbook:/projects/ndxbook/overview',
      sessionId: 'primary-empty',
    });
    const sibling = sessionWithFiveConcepts();
    const hydrated = hydrateConceptGallerySession(primary, { siblingSessions: [sibling] });
    expect(hydrated.history.length).toBeGreaterThanOrEqual(5);
    expect(hydrated.conceptGallery!.candidates.length).toBe(5);
  });

  it('14 remote storage records hydrate without paid generation', () => {
    const session = createConceptDirectedTwinSession({
      projectId: 'ndxbook',
      pageId: 'overview',
      sessionId: 'remote-session',
    });
    const hydrated = hydrateConceptGallerySession(session, {
      remoteStorageRecords: [
        {
          generationId: 'storage-1',
          imageUrl: 'https://cdn.example/a.webp',
          imageStorageRef: 'site00/twin-v2/remote-session/1.webp',
          createdAt: '2026-09-01T00:00:00.000Z',
          sessionId: 'remote-session',
        },
        {
          generationId: 'storage-2',
          imageUrl: 'https://cdn.example/b.webp',
          imageStorageRef: 'site00/twin-v2/remote-session/2.webp',
          createdAt: '2026-09-02T00:00:00.000Z',
          sessionId: 'remote-session',
        },
      ],
    });
    expect(hydrated.conceptGallery!.candidates.length).toBe(2);
    expect(hydrated.conceptGallery!.galleryHydrationReceipt?.backfillTriggered).toBe(true);
  });

  it('15–16 V1 isolation + discovery API route (no image gen in backfill)', () => {
    expect(assertV1Isolation().v1PipelineUntouched).toBe(true);
    expect(read('api/site00/twin-v2-concept-generations.ts')).not.toContain('fal.subscribe');
    expect(read('server/routes.ts')).toContain('twin-v2-concept-generations');
    expect(P0_VR_TWIN_V22_BUILD).toBe('v346');
  });

  it('regenerate appends concept 6 without reset', () => {
    let session = hydrateConceptGallerySession(sessionWithFiveConcepts());
    session = mergeVisualConceptApiResult(session, {
      action: 'regenerate',
      imageUrl: '/concept-6.jpg',
      imageStorageRef: null,
    });
    session = ensureConceptGallery(session);
    expect(session.conceptGallery!.candidates.length).toBe(6);
  });
});
