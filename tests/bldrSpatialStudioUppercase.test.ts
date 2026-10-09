/**
 * BLDR Hybrid Spatial Studio (/bldr/studio) — all visible copy is uppercase.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { FEEL_OPTIONS, PLACE_OPTIONS, WORK_OPTIONS } from '../src/site00/builder-experience/spatialStudio/types';

const root = path.resolve(__dirname, '..');

describe('BLDR Spatial Studio uppercase', () => {
  it('applies text-transform uppercase at the page shell (economics, disclaimers, registry labels, notes)', () => {
    const css = readFileSync(path.join(root, 'src/site00/styles/site00-builder-spatial-studio.css'), 'utf8');
    expect(css).toMatch(/\.bldr-spatial-page\s*\{[\s\S]*?text-transform:\s*uppercase/);
    expect(css).toMatch(/\.bldr-spatial-disabled[\s\S]*text-transform:\s*uppercase/);
  });

  it('keeps option hints in uppercase at the source', () => {
    for (const opt of [...PLACE_OPTIONS, ...FEEL_OPTIONS, ...WORK_OPTIONS]) {
      expect(opt.label, opt.id).toBe(opt.label.toUpperCase());
      expect(opt.hint, opt.id).toBe(opt.hint.toUpperCase());
    }
  });

  it('does not ship sentence-case blueprint metric copy in the studio page', () => {
    const page = readFileSync(path.join(root, 'src/site00/pages/bldr/BldrSpatialStudioPage.tsx'), 'utf8');
    expect(page).not.toMatch(/Refine an established system/);
    expect(page).toContain('FROM THE SITE 00 ESTIMATOR — NOT A GUARANTEED DELIVERY DATE.');
  });
});
