/**
 * P0.STUDIOOS.PRODUCTION.EXPRESSION.ACTOR-CATALOGUE.RESIDENT-AUTHORITY-CONVERGENCE1
 */

import { describe, expect, it } from 'vitest';
import { listFabricationActors, findFabricationActor } from '../shared/site00-character-fabrication/actors.js';
import { characterAssetUrl } from '../shared/site00-character-fabrication/assets.js';
import {
  getProductionStudioWorldActorCatalogue,
  PRODUCTION_ACTING_CATALOGUE_SOURCE,
} from '../shared/site00-studio-world/acting-catalogue/index.js';
import { getStudioWorldActorCatalogue as getSeedCatalogue } from '../shared/site00-studio-world/acting-catalogue/seedCatalogue.js';
import { resolveCastingCardImage } from '../shared/site00-studio-world/resident-intelligence/season1-ensemble/visualAuthority.js';

const CANONICAL_RESIDENT_IDS = [
  'SW-RESIDENT-001',
  'SW-RESIDENT-002',
  'SW-RESIDENT-003',
  'SW-RESIDENT-004',
  'SW-RESIDENT-005',
  'SW-RESIDENT-006',
  'SW-RESIDENT-007',
  'SW-RESIDENT-008',
] as const;

const CANONICAL_NAMES = [
  'ETTA VALE',
  'ZURI XU',
  'JULES MERCER',
  'NOA KLINE',
  'CASPIAN REED',
  'IONA WELLS',
  'MARLOWE SAINT',
  'ELIO "EV" VAHN',
];

describe('P0 expression actor catalogue resident authority convergence', () => {
  it('production catalogue exposes 8 resident projections with no legacy stock SW-017 roster', () => {
    const cat = getProductionStudioWorldActorCatalogue();
    expect(cat.actors).toHaveLength(8);
    const numbers = cat.actors.map((a) => a.catalogueNumber);
    expect(numbers).toEqual(['SW-001', 'SW-002', 'SW-003', 'SW-004', 'SW-005', 'SW-006', 'SW-007', 'SW-008']);
    expect(numbers.some((n) => n === 'SW-017' || n === 'SW-044')).toBe(false);
    expect(new Set(cat.actors.map((a) => a.actorId)).size).toBe(8);
  });

  it('character fabrication list uses production resident catalogue not seed mock', () => {
    const actors = listFabricationActors();
    expect(actors).toHaveLength(8);
    expect(actors.every((a) => a.dataSource === PRODUCTION_ACTING_CATALOGUE_SOURCE)).toBe(true);
    expect(actors.some((a) => a.catalogueNumber === 'SW-017')).toBe(false);
    expect(actors.map((a) => a.stageName)).toEqual(CANONICAL_NAMES);
  });

  it('resolves casting thumbnail authority for all eight residents', () => {
    for (const id of CANONICAL_RESIDENT_IDS) {
      const url = resolveCastingCardImage(id);
      expect(url, id).toMatch(/casting-thumbnails-v1/);
      const actor = listFabricationActors().find((a) => a.sourceResidentId === id);
      expect(actor?.portraitUrl).toBe(url);
      expect(characterAssetUrl(actor!.portraitSlotId)).toBe(url);
    }
  });

  it('legacy seed catalogue remains available but separate from fabrication path', () => {
    const seed = getSeedCatalogue();
    expect(seed.actors.some((a) => a.catalogueNumber === 'SW-017')).toBe(true);
    const legacy = findFabricationActor('sw-actor-017');
    expect(legacy?.dataSource).toBe('LEGACY_SEED');
    expect(listFabricationActors().some((a) => a.actorId === 'sw-actor-017')).toBe(false);
  });

  it('preserves resident ≠ actor ontology fields on projections', () => {
    const cat = getProductionStudioWorldActorCatalogue();
    for (const a of cat.actors) {
      expect(a.talentClassification).toBe('STUDIO_WORLD_RESIDENT');
      expect(a.sourceResidentId).toMatch(/^SW-RESIDENT-/);
      expect(a.catalogueNumber).toMatch(/^SW-\d{3}$/);
      expect(a.sourceResidentId).not.toBe(a.catalogueNumber);
    }
  });
});
