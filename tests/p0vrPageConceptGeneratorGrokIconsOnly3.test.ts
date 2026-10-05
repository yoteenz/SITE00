/**
 * P0.VR.PAGE-CONCEPT-GENERATOR-GROK-ICONS-ONLY3
 *
 * Staged icon family only. Live GENERATE PAGE CONCEPTS panel, copy,
 * chip/button geometry, and pipeline stay locked.
 */

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  PAGE_CONCEPT_GENERATOR_ICONS_ONLY3_PROPOSAL,
  PAGE_CONCEPT_GENERATOR_LIVE_ICON_LOCK,
  S00_PCG_ICON_FAMILY,
  S00_PCG_ICON_IDS,
  S00_PCG_ICON_STATUS,
  S00_PCG_ICON_STROKE,
  S00_PCG_ICON_VERSION,
  S00_PCG_ICON_VIEWBOX,
  getS00PcgIconDef,
  renderS00PcgIconSvg,
} from '../shared/site00-design-workspace-production/pageConceptGeneratorIconsOnly3.js';

const ROOT = join(import.meta.dirname, '..');
const PANEL = 'src/site00/components/designBench/pageConceptGenerator/PageConceptGeneratorPanel.tsx';
const SHELL = 'shared/site00-design-workspace-production/designPageConceptGeneratorShell.ts';
const CSS = 'src/site00/styles/site00-page-concept-generator.css';
const STAGED = 'public/site00/page-concept-generator/staged/icons-only3';

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('P0.VR.PAGE-CONCEPT-GENERATOR-GROK-ICONS-ONLY3', () => {
  it('keeps one construction grid and stays staged', () => {
    expect(S00_PCG_ICON_VIEWBOX).toBe(24);
    expect(S00_PCG_ICON_STROKE).toBe(1.5);
    expect(S00_PCG_ICON_FAMILY).toBe('SITE00_PCG_LINE_V3');
    expect(S00_PCG_ICON_STATUS).toBe('STAGED');
    expect(S00_PCG_ICON_VERSION).toBe('P0.VR.PAGE-CONCEPT-GENERATOR-GROK-ICONS-ONLY3');
  });

  it('defines the preferred site00-*.svg set as currentColor', () => {
    const required: typeof S00_PCG_ICON_IDS[number][] = [
      'site00-cgpt',
      'site00-gpt2',
      'site00-nbp',
      'site00-creative-direction',
      'site00-page-intelligence',
      'site00-brand-context',
      'site00-key-messages',
      'site00-visual-moodboard',
      'site00-authority-placeholder',
      'site00-rendition-placeholder',
      'site00-output-brief',
      'site00-output-authority',
      'site00-output-renditions',
      'site00-mobile',
      'site00-desktop',
      'site00-status-ready',
      'site00-status-pending',
      'site00-status-running',
      'site00-status-complete',
      'site00-status-failed',
      'site00-status-partial',
      'site00-generate',
      'site00-close',
      'site00-chevron-left',
      'site00-chevron-right',
    ];
    expect(S00_PCG_ICON_IDS).toEqual(expect.arrayContaining(required));
    for (const id of S00_PCG_ICON_IDS) {
      const def = getS00PcgIconDef(id);
      expect(def.filename).toBe(`${id}.svg`);
      expect(def.currentColor).toBe(true);
      const svg = renderS00PcgIconSvg(id);
      expect(svg).toContain('viewBox="0 0 24 24"');
      expect(svg).toContain('currentColor');
      expect(svg).toContain(`data-s00-pcg-icon="${id}"`);
      expect(svg).not.toMatch(/sparkle|emoji|gradient|font-awesome|material|light ?bulb|speech|mountain/i);
    }
  });

  it('keeps CGPT / GPT2 / NBP distinct and non-interactive', () => {
    expect(getS00PcgIconDef('site00-cgpt').interactive).toBe(false);
    expect(getS00PcgIconDef('site00-gpt2').interactive).toBe(false);
    expect(getS00PcgIconDef('site00-nbp').interactive).toBe(false);
    expect(renderS00PcgIconSvg('site00-cgpt')).not.toBe(renderS00PcgIconSvg('site00-gpt2'));
    expect(renderS00PcgIconSvg('site00-gpt2')).not.toBe(renderS00PcgIconSvg('site00-nbp'));
  });

  it('keeps status passive and Generate/Close actionable', () => {
    for (const id of [
      'site00-status-ready',
      'site00-status-pending',
      'site00-status-running',
      'site00-status-complete',
      'site00-status-failed',
      'site00-status-partial',
    ] as const) {
      expect(getS00PcgIconDef(id).visualRole).toBe('STATUS');
      expect(getS00PcgIconDef(id).interactive).toBe(false);
      expect(getS00PcgIconDef(id).sizeBand).toBe('XS');
    }
    expect(getS00PcgIconDef('site00-generate').interactive).toBe(true);
    expect(getS00PcgIconDef('site00-close').interactive).toBe(true);
    expect(getS00PcgIconDef('site00-mobile').recommendedSize).toBe(getS00PcgIconDef('site00-desktop').recommendedSize);
  });

  it('does not replace live panel, copy, geometry, or pipeline', () => {
    const panel = read(PANEL);
    const shell = read(SHELL);
    const css = read(CSS);
    expect(panel).not.toContain('pageConceptGeneratorIconsOnly3');
    expect(shell).not.toContain('pageConceptGeneratorIconsOnly3');
    expect(panel).not.toContain('site00-cgpt');
    expect(css).not.toContain('icons-only3');
    expect(css).toContain('height: min(calc(100vh - 104px), 780px)');
    expect(css).toContain('grid-template-columns: repeat(3, minmax(0, 1fr))');
    expect(shell).toContain("tag: 'CGPT'");
    expect(shell).toContain("PAGE_CONCEPT_STATE_LABEL");
    expect(shell).toContain("READY: 'READY'");
    for (const id of PAGE_CONCEPT_GENERATOR_LIVE_ICON_LOCK) {
      expect(`${panel}\n${shell}`).toContain(id);
    }
    const hook = read('src/site00/components/designBench/opusDirect/usePageConceptGeneration.ts');
    expect(hook).toContain('startPageConceptGenerationRunApi');
    expect(hook).toContain('pollPageConceptGenerationRunUntilTerminal');
    expect(hook).not.toContain('runPageConceptGenerationApi');
    expect(hook).not.toContain('pageConceptGeneratorIconsOnly3');
  });

  it('dumps site00-*.svg, manifest, and review surfaces', () => {
    expect(existsSync(join(ROOT, STAGED, 'manifest.json'))).toBe(true);
    expect(existsSync(join(ROOT, STAGED, 'review.html'))).toBe(true);
    for (const id of S00_PCG_ICON_IDS) {
      const svg = read(`${STAGED}/${id}.svg`);
      expect(svg).toContain(`data-s00-pcg-icon="${id}"`);
      expect(svg).toContain(S00_PCG_ICON_VERSION);
    }
    const manifest = JSON.parse(read(`${STAGED}/manifest.json`)) as {
      livePanelMutation: string;
      geometryMutated: string;
      textMutated: string;
      logicMutated: string;
      proposal: Record<string, string>;
      readyForFounderReview: boolean;
    };
    expect(manifest.livePanelMutation).toBe('NONE');
    expect(manifest.geometryMutated).toBe('NO');
    expect(manifest.textMutated).toBe('NO');
    expect(manifest.logicMutated).toBe('NO');
    expect(manifest.readyForFounderReview).toBe(true);
    expect(manifest.proposal).toEqual(PAGE_CONCEPT_GENERATOR_ICONS_ONLY3_PROPOSAL);
    const review = read(`${STAGED}/review.html`);
    expect(review).toContain('id="manifest"');
    expect(review).toContain('id="sheet"');
    expect(review).toContain('id="compare"');
    expect(review).toContain('id="preview"');
    expect(review).toContain('pcg-icons-only3-before');
    expect(review).toContain('pcg-icons-only3-after');
  });
});
