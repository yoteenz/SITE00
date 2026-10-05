/**
 * P0.VR.PAGE-CONCEPT-GENERATOR-ROLLBACK-OVERFLOW-FIX2 — layout rollback + containment.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  PAGE_CONCEPT_GENERATOR_FOOTER,
  pageConceptGeneratorFootSpendShowsMicroSummary,
} from '../shared/site00-design-workspace-production/designPageConceptGeneratorShell.js';

const ROOT = join(import.meta.dirname, '..');
const CSS = 'src/site00/styles/site00-page-concept-generator.css';
const PANEL = 'src/site00/components/designBench/pageConceptGenerator/PageConceptGeneratorPanel.tsx';

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('P0.VR.PAGE-CONCEPT-GENERATOR-ROLLBACK-OVERFLOW-FIX2', () => {
  it('detects long plan notes for compact mobile footer only', () => {
    const note =
      '1 CGPT creative injection + 1 GPT2 page authority + 3 NBP rendition groups (Mobile + Desktop). Confirm before spend.';
    expect(pageConceptGeneratorFootSpendShowsMicroSummary(note)).toBe(true);
    expect(PAGE_CONCEPT_GENERATOR_FOOTER.spendMicroSummary).toContain('3 GPT2 MOBILE');
    expect(pageConceptGeneratorFootSpendShowsMicroSummary('CONFIRM BEFORE SEND.')).toBe(false);
  });

  it('keeps horizontal summary and 3-column cards on mobile', () => {
    const css = read(CSS);
    expect(css).toMatch(
      /@media \(max-width: 899px\)[\s\S]*grid-template-columns: 28px repeat\(4, minmax\(0, 1fr\)\)/,
    );
    expect(css).toMatch(/grid-template-columns: repeat\(3, minmax\(0, 1fr\)\)/);
    expect(css).not.toMatch(/@media \(max-width: 899px\)[\s\S]*scroll-snap-type: x mandatory/);
    expect(css).not.toMatch(/grid-template-columns: 36px repeat\(2, minmax\(0, 1fr\)\)/);
  });

  it('uses compact foot spend in panel without pipeline changes', () => {
    const panel = read(PANEL);
    expect(panel).toContain('s00-pcg__footSpendCompact');
    expect(panel).toContain('s00-pcg__footSpendFull');
    expect(panel).toContain('spendMicroSummary');
    expect(panel).not.toContain('footSpendStack');
    expect(panel).not.toContain('fetch(');
  });
});
