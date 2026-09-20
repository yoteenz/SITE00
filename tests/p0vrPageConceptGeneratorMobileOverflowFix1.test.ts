/**
 * P0.VR.PAGE-CONCEPT-GENERATOR-MOBILE-OVERFLOW-FIX1 — responsive containment.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  pageConceptGeneratorFootSpendSegments,
} from '../shared/site00-design-workspace-production/designPageConceptGeneratorShell.js';

const ROOT = join(import.meta.dirname, '..');
const CSS = 'src/site00/styles/site00-page-concept-generator.css';
const PANEL = 'src/site00/components/designBench/pageConceptGenerator/PageConceptGeneratorPanel.tsx';

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('P0.VR.PAGE-CONCEPT-GENERATOR-MOBILE-OVERFLOW-FIX1', () => {
  it('stacks plan cost note segments for mobile footer display only', () => {
    const note =
      '1 CGPT creative injection + 1 GPT2 page authority + 3 NBP rendition groups (Mobile + Desktop). Confirm before spend.';
    expect(pageConceptGeneratorFootSpendSegments(note)).toEqual([
      '1 CGPT creative injection',
      '1 GPT2 page authority',
      '3 NBP rendition groups (Mobile + Desktop). Confirm before spend.',
    ]);
  });

  it('uses 2×2 summary grid and scroll-snap cards below 900px', () => {
    const css = read(CSS);
    expect(css).toMatch(/@media \(max-width: 899px\)[\s\S]*grid-template-columns: 36px repeat\(2, minmax\(0, 1fr\)\)/);
    expect(css).toMatch(/@media \(max-width: 899px\)[\s\S]*scroll-snap-type: x mandatory/);
    expect(css).toMatch(/@media \(max-width: 899px\)[\s\S]*-webkit-line-clamp: unset/);
    expect(css).toMatch(/@media \(max-width: 899px\)[\s\S]*flex-direction: column/);
  });

  it('renders foot spend stack in panel without pipeline changes', () => {
    const panel = read(PANEL);
    expect(panel).toContain('s00-pcg__footSpendStack');
    expect(panel).toContain('pageConceptGeneratorFootSpendSegments');
    expect(panel).not.toContain('fetch(');
  });
});
