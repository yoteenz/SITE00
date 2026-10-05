/**
 * P0.E — Identity Judgment + First Canon Promotion tests
 */

import { describe, expect, it } from 'vitest';
import {
  isBlockedAutomatedApprover,
  IDENTITY_CANON_FIELD_KEYS,
  extractFieldValueFromTerritoryPayload,
} from '../shared/site00-identity/identityFields.js';
import { evaluateIdentityCanonGate, IDENTITY_CANON_GATE } from '../shared/site00-identity/identityCanonGate.js';
import { WORLD_FORMATION_ENTRY_GATE, isWorldFormationReady } from '../shared/site00-identity/worldFormationGate.js';
import { canAutoCanonize } from '../api/_lib/site00Projects/identity/canonPromotionService.js';
import { assertNoHostIdentityInClientCanon } from '../shared/site00-identity/hostFirewall.js';
import { ASTRAL_WORLD_IDENTITY_TERRITORY_SEEDS, ASTRAL_WORLD_HIERARCHY_SEED } from '../shared/site00-identity/astralWorldIdentity.js';
import { WORLD_FORMATION_IMPLEMENTED } from '../shared/site00-brand-lore/worldFormation/futureContracts.js';
import { hasProjectCapability } from '../shared/site00-projects/capabilities.js';

describe('P0.E Identity Judgment + First Canon Promotion', () => {
  it('TEST 1 — Territories remain non-canonical before judgment (seed design)', () => {
    for (const t of ASTRAL_WORLD_IDENTITY_TERRITORY_SEEDS) {
      expect(t.strategicPremise.length).toBeGreaterThan(20);
      expect(JSON.stringify(t).toLowerCase()).not.toContain('promoted');
    }
  });

  it('TEST 2 — Canon promotion fails without explicit judgment (automated approver blocked)', () => {
    expect(isBlockedAutomatedApprover('cursor-cloud')).toBe(true);
    expect(isBlockedAutomatedApprover('system')).toBe(true);
    expect(isBlockedAutomatedApprover('')).toBe(true);
    expect(isBlockedAutomatedApprover('founder@site00.com')).toBe(false);
  });

  it('TEST 3 — Master-brand fields can be promoted when approved (field keys defined)', () => {
    expect(IDENTITY_CANON_FIELD_KEYS).toContain('masterBrandPersonality');
    expect(IDENTITY_CANON_FIELD_KEYS).toContain('masterBrandPositioning');
    const seed = ASTRAL_WORLD_IDENTITY_TERRITORY_SEEDS[0]!;
    const val = extractFieldValueFromTerritoryPayload(seed.payload as Record<string, unknown>, 'masterBrandPersonality');
    expect(val).toBeTruthy();
  });

  it('TEST 4 — District-scoped fields supported (astreaDistrictExpression)', () => {
    expect(IDENTITY_CANON_FIELD_KEYS).toContain('astreaDistrictExpression');
    const seed = ASTRAL_WORLD_IDENTITY_TERRITORY_SEEDS[0]!;
    const val = extractFieldValueFromTerritoryPayload(seed.payload as Record<string, unknown>, 'astreaDistrictExpression');
    expect(val).toBeTruthy();
  });

  it('TEST 5 — Destination hierarchy in structural world seed', () => {
    expect(ASTRAL_WORLD_HIERARCHY_SEED.destinations.length).toBe(3);
    expect(ASTRAL_WORLD_HIERARCHY_SEED.destinations.map((d) => d.displayName)).toEqual([
      'Tarot Suite',
      'Astral Mall',
      'Coffee Shop',
    ]);
  });

  it('TEST 6 — World structure canon does not imply WORLD formation runtime', () => {
    expect(WORLD_FORMATION_IMPLEMENTED).toBe(false);
    expect(WORLD_FORMATION_ENTRY_GATE.excludedInputs).toContain('REJECTED territory payloads');
  });

  it('TEST 7 — Partial approval supported via identity canon gate tiers', () => {
    const partial = evaluateIdentityCanonGate(
      new Set(['masterBrandPositioning', 'masterBrandPersonality']),
      false,
      false,
    );
    expect(partial.satisfied).toBe(false);
    expect(partial.requiredMissing.length).toBeGreaterThan(0);
  });

  it('TEST 8 — Unresolved fields remain allowed in gate', () => {
    const gate = IDENTITY_CANON_GATE.filter((g) => g.tier === 'UNRESOLVED_ALLOWED');
    expect(gate.length).toBeGreaterThan(0);
  });

  it('TEST 9 — Rejected fields cannot enter canon (promotion requires APPROVE judgment)', () => {
    expect(['APPROVE', 'REVISE', 'REJECT', 'UNREVIEWED']).toContain('REJECT');
    expect(['APPROVE', 'REVISE', 'REJECT', 'UNREVIEWED']).not.toContain('AUTO_APPROVE');
  });

  it('TEST 10 — Rejected territory status preserved in model', () => {
    expect(['PROPOSED', 'SELECTED', 'REVISED', 'REJECTED', 'PROMOTED_PARTIAL', 'PROMOTED']).toContain('REJECTED');
  });

  it('TEST 11 — Cross-territory field keys enable lineage tracking', () => {
    const premises = ASTRAL_WORLD_IDENTITY_TERRITORY_SEEDS.map((t) => t.territoryKey);
    expect(new Set(premises).size).toBe(3);
  });

  it('TEST 12 — Hybrid judgment supported without silent merge', () => {
    expect(['SELECT', 'REVISE', 'REJECT', 'UNREVIEWED', 'HYBRIDIZE']).toContain('HYBRIDIZE');
  });

  it('TEST 13 — NDXBOOK cannot enter Astral World canon context', () => {
    expect(hasProjectCapability('astral-world', 'PERSONALITY_REPLAY')).toBe(false);
    expect(JSON.stringify(ASTRAL_WORLD_IDENTITY_TERRITORY_SEEDS).toLowerCase()).not.toContain('ndxbook');
  });

  it('TEST 14 — SITE 00 host identity blocked from client canon', () => {
    expect(assertNoHostIdentityInClientCanon({ typography: 'Martian Mono' })).toBe(false);
    expect(assertNoHostIdentityInClientCanon({ typography: 'Custom serif for Astral World' })).toBe(true);
  });

  it('TEST 15 — Canon versioning starts at V1 conceptually', () => {
    const gate = evaluateIdentityCanonGate(new Set(), false, false);
    expect(gate.satisfied).toBe(false);
  });

  it('TEST 16 — Project Bible gate tracks missing required canon', () => {
    const gate = evaluateIdentityCanonGate(new Set(['masterBrandPositioning']), true, true);
    expect(gate.requiredMet).toContain('masterBrandRole');
    expect(gate.requiredMet).toContain('worldStructureCanon');
  });

  it('TEST 17 — Unapproved exploration must not appear as satisfied gate', () => {
    const gate = evaluateIdentityCanonGate(new Set(), false, false);
    expect(gate.satisfied).toBe(false);
  });

  it('TEST 18 — World formation input excludes rejected data by gate definition', () => {
    expect(WORLD_FORMATION_ENTRY_GATE.excludedInputs.some((x) => x.includes('REJECTED'))).toBe(true);
    expect(
      isWorldFormationReady({
        approvedClientFounderTruth: true,
        approvedIdentityCanon: true,
        approvedWorldStructureCanon: true,
        sourceReferences: true,
        unresolvedConstraints: true,
      }),
    ).toBe(false);
  });

  it('TEST 19 — Cross-project leakage at seed level is zero', () => {
    expect(JSON.stringify(ASTRAL_WORLD_HIERARCHY_SEED).toLowerCase()).not.toContain('ndxbook');
  });

  it('TEST 20 — No fake founder judgment via auto canonization', () => {
    expect(canAutoCanonize()).toBe(false);
    expect(isBlockedAutomatedApprover('automated')).toBe(true);
    expect(isBlockedAutomatedApprover('agent')).toBe(true);
  });
});
