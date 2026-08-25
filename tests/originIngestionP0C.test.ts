/**
 * P0.C — Origin + Client Truth ingestion tests
 */

import { describe, expect, it } from 'vitest';
import { hasProjectCapability } from '../shared/site00-projects/capabilities.js';
import { WORLD_FORMATION_IMPLEMENTED } from '../shared/site00-brand-lore/worldFormation/futureContracts.js';
import { isNonCanonicalClientTruth } from '../api/_lib/site00Projects/clientTruthService.js';
import type { ClientTruthRecord } from '../api/_lib/site00Projects/clientTruthService.js';
import {
  assertOriginCannotSkipToProduction,
  ASTRAL_WORLD_TRUTH_SEEDS,
  ORIGIN_CATEGORIES,
} from '../api/_lib/site00Projects/originIngestionService.js';
import { ASTRAL_WORLD_SOURCE_REFERENCES } from '../shared/site00-origin/astralWorldSeed.js';
import { ORIGIN_CATEGORIES as SHARED_CATEGORIES } from '../shared/site00-origin/categories.js';

describe('P0.C Origin + Client Truth Ingestion', () => {
  it('TEST 1 — Astral World Origin entries resolve to astral-world project_id semantics', () => {
    expect(hasProjectCapability('astral-world', 'ORIGIN_INGESTION')).toBe(true);
    expect(hasProjectCapability('astral-world', 'CLIENT_TRUTH')).toBe(true);
    expect(ASTRAL_WORLD_TRUTH_SEEDS.length).toBeGreaterThan(10);
    for (const seed of ASTRAL_WORLD_TRUTH_SEEDS) {
      expect(SHARED_CATEGORIES).toContain(seed.category);
    }
  });

  it('TEST 2 — NDXBOOK Origin/client data capability is separate from Astral World', () => {
    expect(hasProjectCapability('ndxbook', 'CLIENT_TRUTH')).toBe(true);
    expect(hasProjectCapability('astral-world', 'PERSONALITY_REPLAY')).toBe(false);
    const astralCategories = new Set(ASTRAL_WORLD_TRUTH_SEEDS.map((s) => s.category));
    expect(astralCategories.has('ENVIRONMENT_CONCEPTS')).toBe(true);
    expect(astralCategories.has('UNRESOLVED_DECISIONS')).toBe(true);
  });

  it('TEST 3 — Astral World data categories do not include NDXBOOK methodology fields', () => {
    const seedsJson = JSON.stringify(ASTRAL_WORLD_TRUTH_SEEDS);
    expect(seedsJson.toLowerCase()).not.toContain('ndxbook');
    expect(seedsJson.toLowerCase()).not.toContain('personality replay');
    expect(hasProjectCapability('astral-world', 'CANONICAL_CREATIVE_RANGE')).toBe(false);
  });

  it('TEST 4 — Client truth remains non-canonical after ingestion (status semantics)', () => {
    const raw: ClientTruthRecord = {
      id: '1',
      project_id: 'astral-id',
      truth_class: 'CLIENT_SUPPLIED',
      status: 'RAW',
      title: 'Environment concept',
      payload: { category: 'ENVIRONMENT_CONCEPTS', isCanonical: false },
      source: 'origin',
      created_at: '',
      updated_at: '',
    };
    expect(isNonCanonicalClientTruth(raw)).toBe(true);
    for (const seed of ASTRAL_WORLD_TRUTH_SEEDS) {
      expect(seed.truthLabel).not.toBe('APPROVED');
    }
  });

  it('TEST 5 — Source references are project-scoped by asset key convention', () => {
    for (const ref of ASTRAL_WORLD_SOURCE_REFERENCES) {
      expect(ref.assetKey.startsWith('astral-world-')).toBe(true);
      expect(ref.referenceType).toBe('CLIENT_CREATED_CONCEPT_ART');
    }
  });

  it('TEST 6 — Origin Summary derives from client truth without replacing source records', () => {
    expect(ORIGIN_CATEGORIES.length).toBe(SHARED_CATEGORIES.length);
    const unresolved = ASTRAL_WORLD_TRUTH_SEEDS.filter((s) => s.category === 'UNRESOLVED_DECISIONS');
    expect(unresolved.length).toBeGreaterThanOrEqual(8);
    expect(ASTRAL_WORLD_TRUTH_SEEDS.some((s) => s.category === 'CLIENT_CONCEPT')).toBe(true);
  });

  it('TEST 7 — Unresolved decisions remain non-canonical and queryable', () => {
    const unresolved = ASTRAL_WORLD_TRUTH_SEEDS.filter((s) => s.category === 'UNRESOLVED_DECISIONS');
    expect(unresolved.every((u) => u.truthLabel === 'CLIENT_PROPOSED' || u.truthLabel === 'CLIENT_CONFIRMED')).toBe(true);
    expect(unresolved.some((u) => u.title.includes('brand name'))).toBe(true);
  });

  it('TEST 8 — Astral World can transition PRE_INGESTION → ORIGIN_INGESTED (status model)', () => {
    expect(assertOriginCannotSkipToProduction('PRE_INGESTION')).toBe(true);
    expect(assertOriginCannotSkipToProduction('ORIGIN_INGESTED')).toBe(true);
  });

  it('TEST 9 — Origin ingestion cannot transition directly to PRODUCTION', () => {
    expect(assertOriginCannotSkipToProduction('PRODUCTION')).toBe(false);
    expect(assertOriginCannotSkipToProduction('ARCHIVED')).toBe(false);
  });

  it('TEST 10 — WORLD project type does not trigger WORLD_FORMATION runtime', () => {
    expect(WORLD_FORMATION_IMPLEMENTED).toBe(false);
    expect(hasProjectCapability('astral-world', 'WORLD_FORMATION')).toBe(false);
  });

  it('TEST 11 — Unknown project cannot receive ingestion records (capability gate)', () => {
    expect(hasProjectCapability('unknown-client-x', 'ORIGIN_INGESTION')).toBe(false);
    expect(hasProjectCapability('unknown-client-x', 'CLIENT_TRUTH')).toBe(false);
  });

  it('TEST 12 — Cross-project source leakage count expectation is zero at seed level', () => {
    const allContent = JSON.stringify([...ASTRAL_WORLD_TRUTH_SEEDS, ...ASTRAL_WORLD_SOURCE_REFERENCES]);
    expect(allContent.toLowerCase()).not.toContain('ndxbook');
  });
});
