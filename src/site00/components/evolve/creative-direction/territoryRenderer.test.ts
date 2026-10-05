import { describe, expect, it } from 'vitest';
import {
  TERRITORY_RENDERER_KEYS,
  resolveTerritoryRenderer,
  territoryRendererKeyFromIndex,
} from './TerritoryRendererRegistry';

describe('Territory renderer registry', () => {
  it('maps each territory index to a distinct renderer key', () => {
    const keys = [1, 2, 3].map((i) => territoryRendererKeyFromIndex(i));
    expect(new Set(keys).size).toBe(3);
    expect(keys).toEqual(['index_signal', 'editorial_utility', 'kinetic_field']);
  });

  it('resolves three different renderer functions', () => {
    const r1 = resolveTerritoryRenderer(1);
    const r2 = resolveTerritoryRenderer(2);
    const r3 = resolveTerritoryRenderer(3);
    expect(r1).not.toBe(r2);
    expect(r2).not.toBe(r3);
    expect(r1).not.toBe(r3);
  });

  it('registry exposes all renderer keys', () => {
    expect(TERRITORY_RENDERER_KEYS).toEqual(['index_signal', 'editorial_utility', 'kinetic_field']);
  });
});
