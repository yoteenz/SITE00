/**
 * P0.VR.PAGE-CONCEPT-GENERATOR-GROK-ICON-CLEANUP1 — staged PCG icon family.
 *
 * These drawings stay STAGED. The live GENERATE PAGE CONCEPTS panel must
 * keep its existing AiConsoleIcon bindings until founder approval.
 */

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  PAGE_CONCEPT_GENERATOR_ICON_PROPOSAL,
  PAGE_CONCEPT_GENERATOR_LIVE_ICON_LOCK,
  PCG_ICON_FAMILY,
  PCG_ICON_IDS,
  PCG_ICON_STATUS,
  PCG_ICON_STROKE,
  PCG_ICON_VERSION,
  PCG_ICON_VIEWBOX,
  getPcgIconDef,
  renderPcgIconSvg,
} from '../shared/site00-design-workspace-production/pageConceptGeneratorIconography.js';

const ROOT = join(import.meta.dirname, '..');
const PANEL = 'src/site00/components/designBench/pageConceptGenerator/PageConceptGeneratorPanel.tsx';
const SHELL = 'shared/site00-design-workspace-production/designPageConceptGeneratorShell.ts';
const CSS = 'src/site00/styles/site00-page-concept-generator.css';
const STAGED = 'public/site00/page-concept-generator/staged';

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('P0.VR.PAGE-CONCEPT-GENERATOR-GROK-ICON-CLEANUP1', () => {
  it('keeps one construction grid and stays staged', () => {
    expect(PCG_ICON_VIEWBOX).toBe(24);
    expect(PCG_ICON_STROKE).toBe(1.5);
    expect(PCG_ICON_FAMILY).toBe('SITE00_PCG_LINE_V1');
    expect(PCG_ICON_STATUS).toBe('STAGED');
    expect(PCG_ICON_VERSION).toBe('P0.VR.PAGE-CONCEPT-GENERATOR-GROK-ICON-CLEANUP1');
  });

  it('defines every requested semantic icon as currentColor SVG', () => {
    expect(PCG_ICON_IDS).toEqual(
      expect.arrayContaining([
        'pcg-system',
        'pcg-cgpt',
        'pcg-gpt2',
        'pcg-nbp',
        'pcg-viewport',
        'pcg-creative-direction',
        'pcg-page-intelligence',
        'pcg-brand-context',
        'pcg-key-messages',
        'pcg-visual-moodboard',
        'pcg-output-brief',
        'pcg-authority-empty',
        'pcg-output-authority',
        'pcg-mobile',
        'pcg-desktop',
        'pcg-output-rendition',
        'pcg-prev',
        'pcg-next',
        'pcg-status-ready',
        'pcg-status-pending',
        'pcg-status-running',
        'pcg-status-complete',
        'pcg-status-failed',
        'pcg-status-partial',
        'pcg-info',
        'pcg-generate',
        'pcg-close',
        'pcg-error',
      ]),
    );
    for (const id of PCG_ICON_IDS) {
      const def = getPcgIconDef(id);
      expect(def.primitives.length).toBeGreaterThan(0);
      const svg = renderPcgIconSvg(id);
      expect(svg).toContain('viewBox="0 0 24 24"');
      expect(svg).toContain('currentColor');
      expect(svg).toContain(`data-pcg-icon="${id}"`);
      expect(svg).toContain('data-pcg-icon-status="STAGED"');
      expect(svg).not.toMatch(/sparkle|emoji|gradient|font-awesome|material/i);
    }
  });

  it('keeps CGPT, GPT2 and NBP marks distinguishable', () => {
    const cgpt = renderPcgIconSvg('pcg-cgpt');
    const gpt2 = renderPcgIconSvg('pcg-gpt2');
    const nbp = renderPcgIconSvg('pcg-nbp');
    expect(cgpt).not.toBe(gpt2);
    expect(gpt2).not.toBe(nbp);
    expect(cgpt).not.toBe(nbp);
  });

  it('matches mobile and desktop as one device pair', () => {
    const mobile = getPcgIconDef('pcg-mobile');
    const desktop = getPcgIconDef('pcg-desktop');
    expect(mobile.recommendedSize).toBe(desktop.recommendedSize);
    expect(renderPcgIconSvg('pcg-mobile')).not.toBe(renderPcgIconSvg('pcg-desktop'));
  });

  it('does not replace live panel or shell icon bindings', () => {
    const panel = read(PANEL);
    const shell = read(SHELL);
    expect(panel).not.toContain('pageConceptGeneratorIconography');
    expect(shell).not.toContain('pageConceptGeneratorIconography');
    expect(panel).not.toContain('pcg-generate');
    expect(panel).not.toContain('pcg-creative-direction');
    for (const id of PAGE_CONCEPT_GENERATOR_LIVE_ICON_LOCK) {
      expect(`${panel}\n${shell}`).toContain(id);
    }
  });

  it('does not mutate generator CSS geometry or pipeline files', () => {
    const css = read(CSS);
    expect(css).toContain('.s00-pcg__title');
    expect(css).toContain('.s00-pcg__generate');
    const overlay = read('src/site00/components/designBench/opusDirect/PageConceptGenerationOverlay.tsx');
    const hook = read('src/site00/components/designBench/opusDirect/usePageConceptGeneration.ts');
    expect(overlay).not.toContain('pageConceptGeneratorIconography');
    expect(hook).not.toContain('pageConceptGeneratorIconography');
    expect(hook).toContain('startPageConceptGenerationRunApi');
    expect(hook).not.toContain('runPageConceptGenerationApi');
  });

  it('dumps staged SVGs, manifest, and review surfaces', () => {
    expect(existsSync(join(ROOT, STAGED, 'manifest.json'))).toBe(true);
    expect(existsSync(join(ROOT, STAGED, 'review.html'))).toBe(true);
    for (const id of PCG_ICON_IDS) {
      const svg = read(`${STAGED}/${id}.svg`);
      expect(svg).toContain(`data-pcg-icon="${id}"`);
      expect(svg).toContain('currentColor');
    }
    const manifest = JSON.parse(read(`${STAGED}/manifest.json`)) as {
      livePanelMutation: string;
      composerIntegration: string;
      proposal: Record<string, string>;
    };
    expect(manifest.livePanelMutation).toBe('NONE');
    expect(manifest.composerIntegration).toBe('PENDING_FOUNDER_APPROVAL');
    expect(manifest.proposal).toEqual(PAGE_CONCEPT_GENERATOR_ICON_PROPOSAL);
    const review = read(`${STAGED}/review.html`);
    expect(review).toContain('id="sheet"');
    expect(review).toContain('id="compare"');
    expect(review).toContain('id="preview"');
    expect(review).toContain('pcg-icon-preview');
  });
});
