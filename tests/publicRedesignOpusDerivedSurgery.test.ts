/**
 * Recovery contract: Opus-derived surgery pack vs transplanted Grok pixels.
 * Does not generate images.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (path: string) => JSON.parse(readFileSync(join(root, path), 'utf8'));

const LIVE = [
  'MACHINE.IDNTY.FOUNDATION.ORB',
  'MACHINE.IDNTY.PARTIAL.LATTICE',
  'MACHINE.IDNTY.EVOLUTION.WAVES',
  'MACHINE.IDNTY.AUTHORITY.STAR',
  'ILLUSTRATION.BLDR.FRAMEWORK.STEP',
];

describe('Opus-derived visual asset surgery', () => {
  const pack = read('docs/site00/public-redesign/OPUS_DERIVED_SURGERY/PACK_SOURCE.json');
  const recon = read('docs/site00/public-redesign/OPUS_DERIVED_SURGERY/RECONCILIATION.json');
  const registry = read('docs/site00/public-redesign/GROK_ASSET_PACK/ASSET_REGISTRY.json');
  const manifest = read('docs/site00/public-redesign/OPUS-ASSET-SLOT-MANIFEST.json');

  it('identifies the pack as actual Opus geometry, not the MAP2 fixture', () => {
    expect(pack.pack_source).toBe('ACTUAL_SITE00_OPUS_DERIVED');
    expect(pack.not).toBe('FIXTURE');
    expect(recon.fixture_used_as_production_authority).toBe(false);
    expect(recon.pixel_generation_source).toBe('MIXED_MAP2_FIXTURE_V1_AND_ACTUAL_SITE00_OPUS_DERIVED');
    expect(recon.assets_regenerated).toBe(12);
  });

  it('reconciles the 47 Grok-required slots and quarantines the five live-code slots', () => {
    expect(manifest.totals.grokRequired).toBe(47);
    expect(recon.grok_required).toBe(47);
    expect(recon.live_code).toEqual(LIVE);
    expect(recon.results).toHaveLength(47);
    const sum = Object.values(recon.classifications as Record<string, number>).reduce((a, b) => a + b, 0);
    expect(sum).toBe(47);
  });

  it('keeps fabricated files and writes real crop and safe-zone pixels', () => {
    const outputs = readdirSync(join(root, 'docs/site00/public-redesign/GROK_ASSET_PACK/outputs'));
    expect(outputs).toHaveLength(52);
    expect(readdirSync(join(root, 'docs/site00/public-redesign/OPUS_DERIVED_SURGERY/reference-crops'))).toHaveLength(47);
    expect(readdirSync(join(root, 'docs/site00/public-redesign/OPUS_DERIVED_SURGERY/safe-zones'))).toHaveLength(47);
    expect(readdirSync(join(root, 'docs/site00/public-redesign/OPUS_DERIVED_SURGERY/composite-previews'))).toHaveLength(47);
  });

  it('marks live-code registry rows ineligible and blocks regeneration rows', () => {
    for (const id of LIVE) {
      const row = registry.assets.find((asset: { asset_id: string }) => asset.asset_id === id);
      expect(row.validation_status).toBe('SUPERSEDED_BY_LIVE_CODE');
      expect(row.production_eligible).toBe(false);
      expect(row.regeneration_required).toBe(false);
    }
    const regen = registry.assets.filter((asset: { regeneration_required?: boolean }) => asset.regeneration_required);
    expect(regen.length).toBe(recon.blocked);
    expect(recon.production_eligible + recon.blocked).toBe(47);
  });

  it('keeps Locations cards in the Locations continuity group', () => {
    const bldr = read('docs/site00/public-redesign/OPUS_DERIVED_SURGERY/fabrication-specs/CARD_LOCATIONS_BLDR.json');
    const evolve = read('docs/site00/public-redesign/OPUS_DERIVED_SURGERY/fabrication-specs/CARD_LOCATIONS_EVOLVE.json');
    expect(bldr.continuity_group).toBe('SITE00_LOCATIONS_UNIVERSE_V1');
    expect(evolve.continuity_group).toBe('SITE00_LOCATIONS_UNIVERSE_V1');
  });

  it('marks the opus composer handoff ready only when all 47 are eligible', () => {
    const text = readFileSync(join(root, 'docs/site00/public-redesign/OPUS_DERIVED_SURGERY/COMPOSER_HANDOFF.md'), 'utf8');
    const ready = recon.production_eligible === 47 && recon.blocked === 0;
    expect(text.includes(ready ? 'STATUS: READY' : 'STATUS: NOT_READY')).toBe(true);
    expect(text.includes(ready ? 'STATUS: NOT_READY' : 'STATUS: READY')).toBe(false);
    const old = readFileSync(join(root, 'docs/site00/public-redesign/GROK_ASSET_PACK/COMPOSER_INTEGRATION_HANDOFF.md'), 'utf8');
    expect(old.startsWith('STATUS: HISTORICAL_FIXTURE_HANDOFF')).toBe(true);
    expect(old.includes('Do not inject from it.')).toBe(true);
  });
});
