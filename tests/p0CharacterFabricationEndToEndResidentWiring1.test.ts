import { describe, expect, it } from 'vitest';
import {
  buildFabricationSubjectSnapshot,
  fabricationReducer,
  findFabricationActor,
  initialFabricationState,
  libraryCharacterDetailHref,
  listFabricationActors,
  publicResidentCatalogueId,
  resolveFabricationSlotUrl,
} from '../shared/site00-character-fabrication/index.js';
import { characterAssetUrl } from '../shared/site00-character-fabrication/assets.js';

describe('p0CharacterFabricationEndToEndResidentWiring1', () => {
  const jules = listFabricationActors().find((a) => a.catalogueNumber === 'SW-003')!;

  it('View Full Profile path targets Library SW-003 not fabrication surface', () => {
    let s = initialFabricationState();
    s = fabricationReducer(s, { type: 'SELECT_ACTOR', actorId: jules.actorId });
    const before = s.activeStation;
    s = fabricationReducer(s, { type: 'SET_SURFACE', surface: 'ACTOR_PROFILE' });
    expect(s.surface).toBe('ACTOR_PROFILE');
    expect(s.activeStation).toBe(before);
    expect(libraryCharacterDetailHref('ndxbook', 'SW-003')).toBe(
      '/production/libraries/characters/detail/SW-003?returnTo=expression-character-fabrication',
    );
  });

  it('CONFIRM_ACTOR creates fabricationSubject and does not advance station', () => {
    let s = initialFabricationState();
    s = fabricationReducer(s, { type: 'SELECT_ACTOR', actorId: jules.actorId });
    s = fabricationReducer(s, { type: 'CONFIRM_ACTOR', at: new Date().toISOString() });
    expect(s.activeStation).toBe('identity');
    expect(s.fabricationSubject?.catalogueNumber).toBe('SW-003');
    expect(s.fabricationSubject?.displayName).toBe('JULES MERCER');
    expect(s.fabricationSubject?.portraitUrl).toMatch(/casting-thumbnails-v1|studio-world-residents/);
  });

  it('resident-backed actor blocks SW-017 stock slot fallback', () => {
    const actor = findFabricationActor(jules.actorId)!;
    const subject = buildFabricationSubjectSnapshot(actor, new Date().toISOString());
    const stock = resolveFabricationSlotUrl(
      'actor.sw017.portrait.primary',
      actor,
      subject,
      'identity',
      {},
      (id) => characterAssetUrl(id),
    );
    expect(stock).toMatch(/SW-RESIDENT-003|studio-world-residents/);
    expect(stock).not.toMatch(/sw017/i);
  });

  it('all 8 residents resolve catalogue id and portrait', () => {
    for (const a of listFabricationActors()) {
      expect(a.sourceResidentId).toBeTruthy();
      const pub = publicResidentCatalogueId(a.sourceResidentId!);
      expect(pub).toMatch(/^SW-00[1-8]$/);
      const sub = buildFabricationSubjectSnapshot(a, null);
      expect(sub.portraitUrl).toBeTruthy();
    }
  });

  it('RESTORE_AFTER_LIBRARY preserves catalogue selection context', () => {
    let s = initialFabricationState();
    s = fabricationReducer(s, {
      type: 'RESTORE_AFTER_LIBRARY',
      selectedActorId: jules.actorId,
      selectedActorCandidateId: jules.actorId,
      activeStation: 'identity',
      actorCatalogueOpen: true,
    });
    expect(s.actorCatalogueOpen).toBe(true);
    expect(s.selectedActorCandidateId).toBe(jules.actorId);
    expect(s.surface).toBe('STATION');
  });
});
