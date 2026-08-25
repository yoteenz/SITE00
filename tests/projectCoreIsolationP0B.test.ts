/**
 * P0.B — Project isolation tests
 */
import { describe, expect, it } from 'vitest';
import {
  hasProjectCapability,
  getCapabilitiesForSlug,
  capabilityForAction,
  NDXBOOK_METHODOLOGY_CAPABILITIES,
  ASTRAL_WORLD_CAPABILITIES,
} from '../shared/site00-projects/capabilities.js';
import { WORLD_FORMATION_IMPLEMENTED } from '../shared/site00-brand-lore/worldFormation/futureContracts.js';
import {
  normalizeProjectType,
  projectTypeToDefaultExperienceClass,
} from '../shared/site00-projects/projectTypes.js';
import { isNonCanonicalClientTruth } from '../api/_lib/site00Projects/clientTruthService.js';
import type { ClientTruthRecord } from '../api/_lib/site00Projects/clientTruthService.js';
import { isNdxbookArchitecturalGuardPattern } from '../api/_lib/site00Projects/projectCapabilityGuard.js';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('P0.B project core isolation', () => {
  it('TEST 1 — NDXBOOK resolves with methodology capabilities', () => {
    const caps = getCapabilitiesForSlug('ndxbook');
    expect(caps).toContain('PERSONALITY_REPLAY');
    expect(caps).toContain('CHARACTER_VISUAL_CASTING');
    expect(caps.length).toBeGreaterThan(20);
    for (const cap of NDXBOOK_METHODOLOGY_CAPABILITIES) {
      if (cap !== 'WORLD_FORMATION' && cap !== 'PRODUCTION_HANDOFF') {
        expect(caps).toContain(cap);
      }
    }
  });

  it('TEST 2 — Astral World resolves as distinct project with minimal capabilities', () => {
    const caps = getCapabilitiesForSlug('astral-world');
    expect(caps).toEqual(expect.arrayContaining([...ASTRAL_WORLD_CAPABILITIES]));
    expect(caps).not.toContain('PERSONALITY_REPLAY');
    expect(caps).not.toContain('CHARACTER_VISUAL_CASTING');
  });

  it('TEST 3 — NDXBOOK retains previously supported capabilities', () => {
    expect(hasProjectCapability('ndxbook', 'CONTENT_OPERATIONS')).toBe(true);
    expect(hasProjectCapability('ndxbook', 'EXPERIMENT_D' as never)).toBe(false);
    expect(hasProjectCapability('ndxbook', 'CREATIVE_CONCEPT_TERRITORIES')).toBe(true);
  });

  it('TEST 4 — Astral World does not inherit NDXBOOK-only capabilities', () => {
    expect(hasProjectCapability('astral-world', 'CONTENT_OPERATIONS')).toBe(false);
    expect(hasProjectCapability('astral-world', 'BRAND_CHARACTER')).toBe(false);
    expect(hasProjectCapability('astral-world', 'CLIENT_TRUTH')).toBe(true);
  });

  it('TEST 5/6 — capability gate prevents cross-project API semantics (unit)', () => {
    expect(hasProjectCapability('astral-world', 'CHARACTER_VISUAL_CASTING')).toBe(false);
    expect(hasProjectCapability('ndxbook', 'CHARACTER_VISUAL_CASTING')).toBe(true);
  });

  it('TEST 7 — client truth records remain non-canonical in RAW/UNAPPROVED states', () => {
    const raw: ClientTruthRecord = {
      id: '1',
      project_id: 'p1',
      truth_class: 'CLIENT_SUPPLIED',
      status: 'RAW',
      title: null,
      payload: {},
      source: null,
      created_at: '',
      updated_at: '',
    };
    expect(isNonCanonicalClientTruth(raw)).toBe(true);
    expect(isNonCanonicalClientTruth({ ...raw, status: 'REVIEW' })).toBe(false);
  });

  it('TEST 8 — ingestion action maps to resolvable capability layer', () => {
    expect(capabilityForAction('personality_replay_bootstrap')).toBe('PERSONALITY_REPLAY');
    expect(capabilityForAction('client_truth_store')).toBe(null);
  });

  it('TEST 9 — unknown project has only PROJECT_CORE by default', () => {
    const caps = getCapabilitiesForSlug('unknown-client-x');
    expect(caps).toEqual(['PROJECT_CORE']);
    expect(hasProjectCapability('unknown-client-x', 'CLIENT_TRUTH')).toBe(false);
  });

  it('TEST 10 — WORLD project type does not imply WORLD_FORMATION capability', () => {
    expect(WORLD_FORMATION_IMPLEMENTED).toBe(false);
    expect(hasProjectCapability('astral-world', 'WORLD_FORMATION')).toBe(false);
    expect(normalizeProjectType('WORLD')).toBe('WORLD');
    expect(projectTypeToDefaultExperienceClass('WORLD')).toBe('WORLD');
  });

  it('API architectural ndxbook guards removed from projects.ts', () => {
    const src = readFileSync(join(process.cwd(), 'api/site00/projects.ts'), 'utf8');
    const guardLines = src.split('\n').filter(isNdxbookArchitecturalGuardPattern);
    expect(guardLines.length).toBe(0);
  });
});
