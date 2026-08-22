import { describe, expect, it } from 'vitest';
import {
  NDXBOOK_VOLUMES,
  TERRITORY_VISUAL_STRATEGY,
  NDXBOOK_CREATIVE_ASSET_BRIEFS,
  buildGenerationPrompt,
} from './visualAssetStrategy.js';

describe('NDXBOOK Creative Direction — visual asset strategy', () => {
  it('defines a strategy for all three locked territories', () => {
    expect(Object.keys(TERRITORY_VISUAL_STRATEGY).sort()).toEqual(
      ['editorial_utility', 'index_signal', 'kinetic_field'].sort(),
    );
  });

  it('each territory strategy documents all five NDXBOOK volumes', () => {
    for (const strategy of Object.values(TERRITORY_VISUAL_STRATEGY)) {
      for (const volume of NDXBOOK_VOLUMES) {
        expect(strategy.volumeTreatment[volume]).toBeTruthy();
      }
    }
  });

  it('each territory strategy documents its own prohibited clichés (structural distinctness of language, not just palette)', () => {
    const index = TERRITORY_VISUAL_STRATEGY.index_signal.prohibitedCliches.join('|');
    const editorial = TERRITORY_VISUAL_STRATEGY.editorial_utility.prohibitedCliches.join('|');
    const kinetic = TERRITORY_VISUAL_STRATEGY.kinetic_field.prohibitedCliches.join('|');
    expect(index).not.toBe(editorial);
    expect(editorial).not.toBe(kinetic);
    expect(index).not.toBe(kinetic);
  });

  it('curated brief set covers all three territories', () => {
    const territories = new Set(NDXBOOK_CREATIVE_ASSET_BRIEFS.map((b) => b.territoryKey));
    expect(territories).toEqual(new Set(['index_signal', 'editorial_utility', 'kinetic_field']));
  });

  it('curated brief set includes a Page 001 (MONEY) treatment for every territory', () => {
    for (const territoryKey of ['index_signal', 'editorial_utility', 'kinetic_field'] as const) {
      const page001 = NDXBOOK_CREATIVE_ASSET_BRIEFS.filter(
        (b) => b.territoryKey === territoryKey && (b.role === 'PAGE_001_PRIMARY' || b.role === 'PAGE_001_SECONDARY'),
      );
      expect(page001.length).toBeGreaterThan(0);
      expect(page001.every((b) => b.volume === 'MONEY')).toBe(true);
    }
  });

  it('curated brief set proves at least four non-MONEY volumes across the system', () => {
    const nonMoney = new Set(NDXBOOK_CREATIVE_ASSET_BRIEFS.filter((b) => b.volume !== 'MONEY').map((b) => b.volume));
    expect(nonMoney.size).toBeGreaterThanOrEqual(4);
  });

  it('every brief targets a real specimen type declared in that territory (no orphaned briefs)', async () => {
    const { TERRITORY_SPECIMEN_SETS } = await import('./territories.js');
    for (const brief of NDXBOOK_CREATIVE_ASSET_BRIEFS) {
      expect(TERRITORY_SPECIMEN_SETS[brief.territoryKey]).toContain(brief.specimenType);
    }
  });

  it('brief ids are unique', () => {
    const ids = NDXBOOK_CREATIVE_ASSET_BRIEFS.map((b) => b.briefId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('buildGenerationPrompt produces a territory-specific, NDXBOOK-specific prompt (not a generic placeholder)', () => {
    const brief = NDXBOOK_CREATIVE_ASSET_BRIEFS[0];
    const { prompt, negativePrompt } = buildGenerationPrompt(brief);
    expect(prompt).toContain(brief.subject);
    expect(prompt).toContain(brief.visualMetaphor);
    expect(prompt).toContain('Negative space requirement');
    expect(prompt).toContain('Text-safe zone');
    expect(prompt.toLowerCase()).not.toContain('futuristic abstract image');
    expect(prompt.toLowerCase()).not.toContain('editorial magazine photo');
    expect(prompt.toLowerCase()).not.toContain('minimal finance image');
    expect(negativePrompt.length).toBeGreaterThan(0);
  });

  it('prompts never request rendered text/logos/watermarks or real personal data', () => {
    for (const brief of NDXBOOK_CREATIVE_ASSET_BRIEFS) {
      const { prompt } = buildGenerationPrompt(brief);
      expect(prompt).toMatch(/No rendered words, letters, numerals, logos, watermarks/);
      expect(prompt).toMatch(/No visible real personal information/);
    }
  });
});
