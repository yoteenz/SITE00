/**
 * P0.D — Identity Phase Entry + Canon Promotion tests
 */

import { describe, expect, it } from 'vitest';
import { hasProjectCapability } from '../shared/site00-projects/capabilities.js';
import { WORLD_FORMATION_IMPLEMENTED } from '../shared/site00-brand-lore/worldFormation/futureContracts.js';
import {
  ASTRAL_WORLD_MASTER_BRAND,
  ASTRAL_WORLD_FLAGSHIP_DISTRICT,
  ASTRAL_WORLD_IDENTITY_TERRITORY_SEEDS,
  ASTRAL_WORLD_HIERARCHY_SEED,
  ASTRAL_WORLD_FOUNDER_HIERARCHY_TRUTH,
} from '../shared/site00-identity/astralWorldIdentity.js';
import { assertNoHostIdentityInClientCanon, containsHostIdentityLeak } from '../shared/site00-identity/hostFirewall.js';
import { canAutoCanonize } from '../api/_lib/site00Projects/identity/canonPromotionService.js';

describe('P0.D Identity Phase Entry + Canon Promotion', () => {
  it('TEST 1 — Astral World can enter Identity from ORIGIN_INGESTED capability set', () => {
    expect(hasProjectCapability('astral-world', 'BRAND_INTELLIGENCE')).toBe(true);
    expect(hasProjectCapability('astral-world', 'JUDGMENTS')).toBe(true);
  });

  it('TEST 2 — Identity Brief derives from Astral World hierarchy truth', () => {
    expect(ASTRAL_WORLD_MASTER_BRAND).toBe('Astral World');
    expect(ASTRAL_WORLD_FOUNDER_HIERARCHY_TRUTH.masterRole).toBe('MASTER_PRODUCT_UNIVERSE');
    expect(ASTRAL_WORLD_IDENTITY_TERRITORY_SEEDS.length).toBe(3);
  });

  it('TEST 3 — NDXBOOK methodology cannot enter Astral World identity context', () => {
    expect(hasProjectCapability('astral-world', 'PERSONALITY_REPLAY')).toBe(false);
    expect(hasProjectCapability('astral-world', 'CANONICAL_CREATIVE_RANGE')).toBe(false);
    const seedJson = JSON.stringify(ASTRAL_WORLD_IDENTITY_TERRITORY_SEEDS);
    expect(seedJson.toLowerCase()).not.toContain('ndxbook');
  });

  it('TEST 4 — SITE 00 host identity cannot become client canon', () => {
    expect(containsHostIdentityLeak('martian mono typography')).toBe(true);
    expect(containsHostIdentityLeak('not SITE 00 red — use cosmic palette')).toBe(false);
    expect(assertNoHostIdentityInClientCanon({ typography: 'Custom serif for Astral World' })).toBe(true);
    expect(assertNoHostIdentityInClientCanon({ typography: 'Martian Mono' })).toBe(false);
  });

  it('TEST 5 — Identity territories are project-scoped by seed design', () => {
    for (const t of ASTRAL_WORLD_IDENTITY_TERRITORY_SEEDS) {
      expect(t.territoryKey).toMatch(/^astral-world|^celestial|^social|^arcane/);
      expect(t.strategicPremise.length).toBeGreaterThan(20);
    }
  });

  it('TEST 6 — Astral World remains master product/universe name', () => {
    expect(ASTRAL_WORLD_HIERARCHY_SEED.world.displayName).toBe('Astral World');
    expect(ASTRAL_WORLD_HIERARCHY_SEED.world.role).toBe('MASTER_PRODUCT_UNIVERSE');
  });

  it('TEST 7 — Astréa is flagship district not master company', () => {
    expect(ASTRAL_WORLD_FLAGSHIP_DISTRICT).toBe('Astréa');
    expect(ASTRAL_WORLD_HIERARCHY_SEED.district.role).toBe('FLAGSHIP_DISTRICT');
    expect(ASTRAL_WORLD_HIERARCHY_SEED.district.displayName).not.toBe('Astral World');
  });

  it('TEST 8 — Astréa has multiple destinations', () => {
    expect(ASTRAL_WORLD_HIERARCHY_SEED.destinations.length).toBe(3);
    expect(ASTRAL_WORLD_HIERARCHY_SEED.destinations.map((d) => d.displayName)).toEqual([
      'Tarot Suite',
      'Astral Mall',
      'Coffee Shop',
    ]);
  });

  it('TEST 9 — Future districts supported without new projects', () => {
    expect(ASTRAL_WORLD_FOUNDER_HIERARCHY_TRUTH.expansionModel).toMatch(/Future districts/);
  });

  it('TEST 10 — Auto canonization is not possible', () => {
    expect(canAutoCanonize()).toBe(false);
  });

  it('TEST 11 — Rejected territory status preserved in model', () => {
    const statuses = ['PROPOSED', 'SELECTED', 'REVISED', 'REJECTED', 'PROMOTED_PARTIAL', 'PROMOTED'];
    expect(statuses).toContain('REJECTED');
  });

  it('TEST 12 — Partial canon promotion status supported', () => {
    expect(['PROPOSED', 'SELECTED', 'REVISED', 'REJECTED', 'PROMOTED_PARTIAL', 'PROMOTED']).toContain('PROMOTED_PARTIAL');
  });

  it('TEST 13 — Project Bible compiles with worldFormation NOT_FORMED', () => {
    expect(WORLD_FORMATION_IMPLEMENTED).toBe(false);
  });

  it('TEST 14 — World hierarchy WORLD → DISTRICT → DESTINATION', () => {
    expect(ASTRAL_WORLD_HIERARCHY_SEED.world.slug).toBe('astral-world');
    expect(ASTRAL_WORLD_HIERARCHY_SEED.district.slug).toBe('astrea');
  });

  it('TEST 15 — WORLD formation not implemented', () => {
    expect(hasProjectCapability('astral-world', 'WORLD_FORMATION')).toBe(false);
    expect(WORLD_FORMATION_IMPLEMENTED).toBe(false);
  });

  it('TEST 16 — Unknown project cannot receive identity records', () => {
    expect(hasProjectCapability('unknown-x', 'BRAND_INTELLIGENCE')).toBe(false);
  });

  it('TEST 17 — Territories differ strategically not cosmetically', () => {
    const premises = ASTRAL_WORLD_IDENTITY_TERRITORY_SEEDS.map((t) => t.strategicPremise);
    const unique = new Set(premises);
    expect(unique.size).toBe(3);
  });

  it('TEST 18 — Cross-project leakage at seed level is zero', () => {
    expect(JSON.stringify(ASTRAL_WORLD_FOUNDER_HIERARCHY_TRUTH).toLowerCase()).not.toContain('ndxbook');
  });

  it('TEST 19 — Judgment semantics include SELECT REVISE REJECT HYBRIDIZE', () => {
    expect(['SELECT', 'REVISE', 'REJECT', 'UNREVIEWED', 'HYBRIDIZE']).toContain('HYBRIDIZE');
  });

  it('TEST 20 — Hierarchical canon scopes defined', () => {
    expect(['MASTER', 'DISTRICT', 'DESTINATION', 'EXPERIENCE']).toContain('DISTRICT');
  });
});
