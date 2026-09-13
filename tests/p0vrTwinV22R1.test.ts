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
  resolveTwinV2SessionForOpen,
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
  importExistingV2ConceptsFromUrls,
  readTwinV2UiPersist,
  writeTwinV2UiPersist,
  clearTwinV2UiPersist,
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

  it('resolveTwinV2SessionForOpen returns a session shell for ndxbook', () => {
    const s = resolveTwinV2SessionForOpen({ projectId: 'ndxbook', pageId: 'ndxbook:/projects/ndxbook' });
    expect(s.projectId).toBe('ndxbook');
    expect(s.creativeDirection).toBeTruthy();
  });

  it('15–16 V1 isolation + discovery API route (no image gen in backfill)', () => {
    expect(assertV1Isolation().v1PipelineUntouched).toBe(true);
    expect(read('api/site00/twin-v2-concept-generations.ts')).not.toContain('fal.subscribe');
    expect(read('api/site00/twin-v2-concept-generations.ts')).toContain('projectId');
    expect(read('api/site00/twin-v2-visual-concept.ts')).toContain('appendTwinV2ConceptLedger');
    expect(read('server/routes.ts')).toContain('twin-v2-concept-generations');
    expect(P0_VR_TWIN_V22_BUILD).toBe('v365');
  });

  it('twinV2UiPersistence round-trips import draft in sessionStorage', () => {
    const store = new Map<string, string>();
    (globalThis as { sessionStorage?: Storage }).sessionStorage = {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => store.set(k, v),
      removeItem: (k: string) => store.delete(k),
      clear: () => store.clear(),
      key: () => null,
      length: store.size,
    } as Storage;
    clearTwinV2UiPersist('ndxbook');
    writeTwinV2UiPersist({
      projectId: 'ndxbook',
      pageId: 'p1',
      upgradeOpen: true,
      twinV2Open: true,
      importUrlsDraft: 'https://example.com/a.jpg',
    });
    const ui = readTwinV2UiPersist('ndxbook');
    expect(ui?.importUrlsDraft).toContain('example.com');
  });

  it('import works when creativeDirection missing on legacy session', () => {
    let session = createConceptDirectedTwinSession({ projectId: 'ndxbook', pageId: 'p', sessionId: 'legacy-1' });
    session = { ...session, creativeDirection: undefined as unknown as typeof session.creativeDirection };
    session = importExistingV2ConceptsFromUrls(session, ['https://example.com/legacy.jpg']);
    expect(session.conceptGallery?.candidates.length).toBe(1);
    expect(session.creativeDirection).toBeTruthy();
  });

  it('importExistingV2ConceptsFromUrls builds gallery without API', () => {
    let session = createConceptDirectedTwinSession({ projectId: 'ndxbook', pageId: 'p', sessionId: 'imp-1' });
    session = importExistingV2ConceptsFromUrls(session, [
      'https://example.com/c1.jpg',
      'https://example.com/c2.jpg',
    ]);
    expect(session.conceptGallery?.candidates.length).toBe(2);
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
