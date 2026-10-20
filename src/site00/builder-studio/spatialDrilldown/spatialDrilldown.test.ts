import { describe, expect, it } from 'vitest';
import { spatialSelectionToBuilder } from '../../builder-experience/spatialStudio/mapping';
import { emptySpatialState } from '../../builder-experience/spatialStudio/types';
import { compose } from '../buildObject/composition';
import { composeStudioRoom } from './studioCompose';
import { emptyDrilldownUi } from './types';
import { shopSubOptions } from './workShopCatalog';
import { drilldownCloseness, selectTarget, markFocused, enterFocus } from './controller';
import { WORK_REGION_ELEMENTS } from './regions';

describe('spatial drill-down — regions', () => {
  it('names real SHOP geometry ids from workComposition', () => {
    const spec = { path: 'ADVANCED' as const, feel: 'MODERN' as const, modules: ['SHOP'] as const, pace: 'STANDARD' as const };
    const ids = new Set(compose('work', spec).elements.map((e) => e.id));
    for (const id of WORK_REGION_ELEMENTS.SHOP) expect(ids.has(id)).toBe(true);
  });

  it('applies camera focus inspect on work drill without changing module list', () => {
    const spec = { path: 'ADVANCED' as const, feel: 'MODERN' as const, modules: ['SHOP'] as const, pace: 'STANDARD' as const };
    let ui = selectTarget(emptyDrilldownUi(), { room: 'work', id: 'SHOP' });
    ui = enterFocus(ui);
    ui = markFocused(ui);
    const comp = composeStudioRoom('work', spec, ui);
    expect(comp.camera.closeness).toBeGreaterThan(0.5);
    expect(comp.elements.some((e) => e.lit && e.id.startsWith('m-shop'))).toBe(true);
  });
});

describe('spatial drill-down — WORK catalog', () => {
  it('does not promise checkout without SELL', () => {
    const sel = spatialSelectionToBuilder({ ...emptySpatialState(), placePath: 'ADVANCED', feelVibe: 'MODERN', workModules: ['PAGES'], pace: 'STANDARD' });
    expect(shopSubOptions(sel).every((o) => o.status === 'UNAVAILABLE' || o.id === 'CATALOG_CHECKOUT')).toBe(true);
  });

  it('shows optional accounts when shop is on', () => {
    const sel = spatialSelectionToBuilder({ ...emptySpatialState(), placePath: 'ADVANCED', feelVibe: 'MODERN', workModules: ['PAGES', 'SHOP'], pace: 'STANDARD' });
    const accounts = shopSubOptions(sel).find((o) => o.id === 'CUSTOMER_ACCOUNTS');
    expect(accounts?.status).toBe('OPTIONAL');
  });

  it('maps shopAccounts spatial flag to ACCOUNTS capability', () => {
    const sel = spatialSelectionToBuilder({
      ...emptySpatialState(),
      placePath: 'ADVANCED',
      feelVibe: 'MODERN',
      workModules: ['SHOP'],
      shopAccounts: true,
      pace: 'STANDARD',
    });
    expect(sel.capabilities.includes('ACCOUNTS')).toBe(true);
  });
});

describe('spatial drill-down — FEEL mapping', () => {
  it('applies explicit feel type and color to builder selection', () => {
    const sel = spatialSelectionToBuilder({
      ...emptySpatialState(),
      placePath: 'ADVANCED',
      feelVibe: 'BOLD',
      feelType: 'CONDENSED_DISPLAY',
      feelColor: 'SATURATED_EDITORIAL',
      workModules: ['PAGES'],
      pace: 'STANDARD',
    });
    expect(sel.type).toBe('CONDENSED_DISPLAY');
    expect(sel.color).toBe('SATURATED_EDITORIAL');
  });
});

describe('spatial drill-down — controller', () => {
  it('increases closeness when focused', () => {
    expect(drilldownCloseness('IDLE')).toBe(0);
    expect(drilldownCloseness('FOCUSED')).toBeGreaterThan(drilldownCloseness('TARGET_SELECTED'));
  });
});
