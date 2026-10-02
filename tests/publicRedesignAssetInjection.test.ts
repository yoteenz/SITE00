/**
 * P0.SITE00.PUBLIC-REDESIGN.COMPOSER-ASSET-INJECTION1
 */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import registry from '../docs/site00/public-redesign/GROK_ASSET_PACK/ASSET_REGISTRY.json';
import reconciliation from '../docs/site00/public-redesign/OPUS_DERIVED_SURGERY/RECONCILIATION.json';
import {
  PUBLIC_REDESIGN_ASSET_URLS,
  PUBLIC_REDESIGN_ASSET_SLOTS,
} from '../src/site00/authority/publicRedesignAssetSlots';
import {
  PUBLIC_REDESIGN_INJECTED_ASSET_COUNT,
  PUBLIC_REDESIGN_LIVE_CODE_QUARANTINE,
} from '../src/site00/authority/publicRedesignAssetUrls';

describe('composer asset injection registry', () => {
  it('matches Opus reconciliation: 47 eligible, 5 live-code', () => {
    expect(PUBLIC_REDESIGN_INJECTED_ASSET_COUNT).toBe(47);
    expect(reconciliation.production_eligible).toBe(47);
    expect(PUBLIC_REDESIGN_LIVE_CODE_QUARANTINE).toEqual(reconciliation.live_code);
  });

  it('registry URLs resolve to files under public/', () => {
    const ids = Object.keys(PUBLIC_REDESIGN_ASSET_URLS);
    expect(new Set(ids).size).toBe(47);
    for (const url of Object.values(PUBLIC_REDESIGN_ASSET_URLS)) {
      const file = join(process.cwd(), 'public', url);
      expect(existsSync(file), file).toBe(true);
    }
  });

  it('aligns with ASSET_REGISTRY production_eligible entries', () => {
    const eligibleIds = registry.assets.filter((a) => a.production_eligible).map((a) => a.slot_id || a.asset_id);
    expect(eligibleIds.sort()).toEqual(Object.keys(PUBLIC_REDESIGN_ASSET_URLS).sort());
  });

  it('does not register quarantined live-code slots', () => {
    for (const id of PUBLIC_REDESIGN_LIVE_CODE_QUARANTINE) {
      expect(PUBLIC_REDESIGN_ASSET_URLS[id]).toBeUndefined();
      expect(PUBLIC_REDESIGN_ASSET_SLOTS.some((s) => s.id === id)).toBe(true);
    }
  });

  it('handoff doc lists the same 47 eligible asset ids', () => {
    const handoff = readFileSync(
      join(process.cwd(), 'docs/site00/public-redesign/OPUS_DERIVED_SURGERY/COMPOSER_HANDOFF.md'),
      'utf8',
    );
    const eligible = registry.assets.filter((a) => a.production_eligible);
    for (const a of eligible) {
      expect(handoff).toContain(a.asset_id);
    }
  });
});
