import { describe, expect, it } from 'vitest';
import {
  isWithinAssetEntitlement,
  isWithinCampaignEntitlement,
  isWithinChannelEntitlement,
  resolveEvolveEntitlements,
} from './entitlements.js';

describe('EVOLVE entitlements', () => {
  it('Essential: channel <= 1, one primary campaign, ~8-10 assets', () => {
    const e = resolveEvolveEntitlements('evolve_essential');
    expect(e.channelLimit).toBe(1);
    expect(e.campaignCapacity).toEqual({ min: 1, max: 1 });
    expect(e.assetCapacity).toEqual({ min: 8, max: 10 });
    expect(e.customScopeRequired).toBe(false);
  });

  it('Growth: channel <= 3, ~12-16 assets', () => {
    const e = resolveEvolveEntitlements('evolve_growth');
    expect(e.channelLimit).toBe(3);
    expect(e.assetCapacity).toEqual({ min: 12, max: 16 });
  });

  it('Studio: channel <= 5, ~20-30 assets', () => {
    const e = resolveEvolveEntitlements('evolve_studio');
    expect(e.channelLimit).toBe(5);
    expect(e.assetCapacity).toEqual({ min: 20, max: 30 });
  });

  it('Private: custom scope required, no fabricated limits', () => {
    const e = resolveEvolveEntitlements('evolve_private');
    expect(e.customScopeRequired).toBe(true);
    expect(e.channelLimit).toBeNull();
    expect(e.assetCapacity).toBeNull();
    expect(e.campaignCapacity).toBeNull();
  });

  it('no plan selected returns no entitlements, not a fabricated default', () => {
    const e = resolveEvolveEntitlements(null);
    expect(e.planId).toBeNull();
    expect(e.channelLimit).toBeNull();
    expect(e.assetCapacity).toBeNull();
  });

  it('channel/campaign/asset guideline checks are pure and side-effect free', () => {
    expect(isWithinChannelEntitlement('evolve_essential', 1)).toBe(true);
    expect(isWithinChannelEntitlement('evolve_essential', 2)).toBe(false);
    expect(isWithinCampaignEntitlement('evolve_essential', 1)).toBe(true);
    expect(isWithinCampaignEntitlement('evolve_essential', 2)).toBe(false);
    expect(isWithinAssetEntitlement('evolve_growth', 14)).toBe(true);
    expect(isWithinAssetEntitlement('evolve_growth', 40)).toBe(false);
  });

  it('custom-scope plans (Private) never fail a capacity check — everything is scope-quoted', () => {
    expect(isWithinChannelEntitlement('evolve_private', 999)).toBe(true);
    expect(isWithinAssetEntitlement('evolve_private', 999)).toBe(true);
  });
});

describe('governance separation (static contract)', () => {
  it('the entitlements module has zero import statements pulling in governance/approval modules', async () => {
    const fs = await import('node:fs');
    const source = fs.readFileSync(new URL('./entitlements.ts', import.meta.url), 'utf8');
    const importLines = source
      .split('\n')
      .filter((line) => /^\s*import\b/.test(line));
    const forbidden = [
      'creativeDirection',
      'visualDnaContract',
      'governance.js',
      'campaignLifecycle',
      'pilotReadinessSprint04',
      'productionBridge',
    ];
    for (const line of importLines) {
      for (const term of forbidden) {
        expect(line).not.toContain(term);
      }
    }
    // sanity check the assertion above isn't vacuous
    expect(importLines.length).toBeGreaterThan(0);
  });
});
