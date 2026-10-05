import { describe, expect, it } from 'vitest';
import {
  TERRITORY_VISUAL_STRATEGY,
  NDXBOOK_PRIORITY_ASSET_BRIEFS,
  buildGenerationPrompt,
} from './visualAssetStrategy.js';

describe('NDXBOOK Creative Direction — visual asset strategy (reference-locked pass)', () => {
  it('defines a strategy for all three locked territories', () => {
    expect(Object.keys(TERRITORY_VISUAL_STRATEGY).sort()).toEqual(
      ['editorial_utility', 'index_signal', 'kinetic_field'].sort(),
    );
  });

  it('each territory strategy documents its own prohibited clichés', () => {
    const index = TERRITORY_VISUAL_STRATEGY.index_signal.prohibitedCliches.join('|');
    const editorial = TERRITORY_VISUAL_STRATEGY.editorial_utility.prohibitedCliches.join('|');
    const kinetic = TERRITORY_VISUAL_STRATEGY.kinetic_field.prohibitedCliches.join('|');
    expect(index).not.toBe(editorial);
    expect(editorial).not.toBe(kinetic);
    expect(index).not.toBe(kinetic);
  });

  it('priority brief set covers all three territories', () => {
    const territories = new Set(NDXBOOK_PRIORITY_ASSET_BRIEFS.map((b) => b.territoryKey));
    expect(territories).toEqual(new Set(['index_signal', 'editorial_utility', 'kinetic_field']));
  });

  it('priority brief set includes one hero + one isolated prop per territory', () => {
    for (const territoryKey of ['index_signal', 'editorial_utility', 'kinetic_field'] as const) {
      const briefs = NDXBOOK_PRIORITY_ASSET_BRIEFS.filter((b) => b.territoryKey === territoryKey);
      expect(briefs.some((b) => b.role === 'HERO_TILE')).toBe(true);
      expect(briefs.some((b) => b.role === 'ISOLATED_PROP')).toBe(true);
    }
  });

  it('every brief targets a real specimen type declared in that territory', async () => {
    const { TERRITORY_SPECIMEN_SETS } = await import('./territories.js');
    for (const brief of NDXBOOK_PRIORITY_ASSET_BRIEFS) {
      expect(TERRITORY_SPECIMEN_SETS[brief.territoryKey]).toContain(brief.specimenType);
    }
  });

  it('brief ids are unique', () => {
    const ids = NDXBOOK_PRIORITY_ASSET_BRIEFS.map((b) => b.briefId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('buildGenerationPrompt produces a territory-specific, NDXBOOK-specific prompt', () => {
    const brief = NDXBOOK_PRIORITY_ASSET_BRIEFS[0];
    const { prompt, negativePrompt } = buildGenerationPrompt(brief);
    expect(prompt).toContain(brief.subject);
    expect(prompt).toContain('Negative space requirement');
    expect(prompt.toLowerCase()).not.toContain('futuristic abstract image');
    expect(negativePrompt.length).toBeGreaterThan(0);
  });

  it('prompts never request rendered text/logos/watermarks or real personal data', () => {
    for (const brief of NDXBOOK_PRIORITY_ASSET_BRIEFS) {
      const { prompt } = buildGenerationPrompt(brief);
      expect(prompt).toMatch(/No rendered words, letters, numerals, logos, watermarks, or captions/);
    }
  });
});
