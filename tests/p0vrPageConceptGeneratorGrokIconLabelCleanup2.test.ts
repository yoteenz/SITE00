/**
 * P0.VR.PAGE-CONCEPT-GENERATOR-GROK-ICON-LABEL-CLEANUP2
 *
 * Staged second pass: icon family + model-tag / status-chip styles.
 * Live GENERATE PAGE CONCEPTS panel, geometry, and pipeline stay locked.
 */

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  PAGE_CONCEPT_GENERATOR_ICON_PROPOSAL,
  PAGE_CONCEPT_GENERATOR_LIVE_ICON_LOCK,
  PAGE_CONCEPT_GENERATOR_OUTPUT_ICON_FAMILY,
  PAGE_CONCEPT_GENERATOR_PLACEHOLDER_SET,
  PCG_ICON_FAMILY,
  PCG_ICON_IDS,
  PCG_ICON_STATUS,
  PCG_ICON_STROKE,
  PCG_ICON_VERSION,
  PCG_ICON_VIEWBOX,
  PCG_INTERACTION_CLASSIFICATION,
  PCG_MODEL_TAG_STYLE,
  PCG_PREVIOUS_PASS,
  PCG_STATUS_CHIP_STYLE,
  getPcgIconDef,
  renderPcgIconSvg,
} from '../shared/site00-design-workspace-production/pageConceptGeneratorIconography.js';

const ROOT = join(import.meta.dirname, '..');
const PANEL = 'src/site00/components/designBench/pageConceptGenerator/PageConceptGeneratorPanel.tsx';
const SHELL = 'shared/site00-design-workspace-production/designPageConceptGeneratorShell.ts';
const CSS = 'src/site00/styles/site00-page-concept-generator.css';
const STAGED = 'public/site00/page-concept-generator/staged';
const STAGED_CSS = `${STAGED}/s00-pcg-cleanup2.css`;

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('P0.VR.PAGE-CONCEPT-GENERATOR-GROK-ICON-LABEL-CLEANUP2', () => {
  it('keeps one construction grid and stays staged as cleanup2', () => {
    expect(PCG_ICON_VIEWBOX).toBe(24);
    expect(PCG_ICON_STROKE).toBe(1.5);
    expect(PCG_ICON_FAMILY).toBe('SITE00_PCG_LINE_V2');
    expect(PCG_ICON_STATUS).toBe('STAGED');
    expect(PCG_ICON_VERSION).toBe('P0.VR.PAGE-CONCEPT-GENERATOR-GROK-ICON-LABEL-CLEANUP2');
    expect(PCG_PREVIOUS_PASS).toBe('P0.VR.PAGE-CONCEPT-GENERATOR-GROK-ICON-CLEANUP1');
  });

  it('defines the cleanup2 set as currentColor SVG with interaction roles', () => {
    expect(PCG_ICON_IDS).toEqual(
      expect.arrayContaining([
        'pcg-system',
        'pcg-cgpt',
        'pcg-gpt2',
        'pcg-nbp',
        'pcg-creative-direction',
        'pcg-page-intelligence',
        'pcg-brand-context',
        'pcg-key-messages',
        'pcg-visual-moodboard',
        'pcg-output-brief',
        'pcg-output-authority',
        'pcg-output-rendition',
        'pcg-authority-empty',
        'pcg-rendition-empty',
        'pcg-dot-active',
        'pcg-dot-inactive',
        'pcg-status-ready',
        'pcg-status-pending',
        'pcg-generate',
        'pcg-close',
      ]),
    );
    for (const id of PCG_ICON_IDS) {
      const def = getPcgIconDef(id);
      expect(def.primitives.length).toBeGreaterThan(0);
      expect(['ACTION', 'STATUS', 'MODEL_TAG', 'ICON', 'PLACEHOLDER', 'CAROUSEL']).toContain(def.visualRole);
      const svg = renderPcgIconSvg(id);
      expect(svg).toContain('viewBox="0 0 24 24"');
      expect(svg).toContain('currentColor');
      expect(svg).toContain(`data-pcg-icon="${id}"`);
      expect(svg).toContain('data-pcg-icon-status="STAGED"');
      expect(svg).toContain(PCG_ICON_VERSION);
      expect(svg).not.toMatch(/sparkle|emoji|gradient|font-awesome|material|broken-image/i);
    }
  });

  it('keeps CGPT / GPT2 / NBP marks distinguishable and classified as model tags', () => {
    expect(getPcgIconDef('pcg-cgpt').visualRole).toBe('MODEL_TAG');
    expect(getPcgIconDef('pcg-gpt2').visualRole).toBe('MODEL_TAG');
    expect(getPcgIconDef('pcg-nbp').visualRole).toBe('MODEL_TAG');
    expect(getPcgIconDef('pcg-cgpt').interactive).toBe(false);
    expect(renderPcgIconSvg('pcg-cgpt')).not.toBe(renderPcgIconSvg('pcg-gpt2'));
    expect(renderPcgIconSvg('pcg-gpt2')).not.toBe(renderPcgIconSvg('pcg-nbp'));
  });

  it('keeps status chips non-interactive and actions interactive', () => {
    for (const id of [
      'pcg-status-ready',
      'pcg-status-pending',
      'pcg-status-running',
      'pcg-status-complete',
      'pcg-status-failed',
      'pcg-status-partial',
    ] as const) {
      expect(getPcgIconDef(id).visualRole).toBe('STATUS');
      expect(getPcgIconDef(id).interactive).toBe(false);
    }
    expect(getPcgIconDef('pcg-generate').visualRole).toBe('ACTION');
    expect(getPcgIconDef('pcg-generate').interactive).toBe(true);
    expect(getPcgIconDef('pcg-close').interactive).toBe(true);
  });

  it('defines output family, placeholders, and carousel controls', () => {
    expect(PAGE_CONCEPT_GENERATOR_OUTPUT_ICON_FAMILY).toEqual({
      CGPT: 'pcg-output-brief',
      GPT2: 'pcg-output-authority',
      NBP: 'pcg-output-rendition',
    });
    expect(PAGE_CONCEPT_GENERATOR_PLACEHOLDER_SET).toEqual({
      AUTHORITY_CONCEPT_PENDING: 'pcg-authority-empty',
      RENDITION_PENDING: 'pcg-rendition-empty',
    });
    expect(renderPcgIconSvg('pcg-authority-empty')).not.toBe(renderPcgIconSvg('pcg-rendition-empty'));
    expect(getPcgIconDef('pcg-prev').visualRole).toBe('CAROUSEL');
    expect(getPcgIconDef('pcg-dot-active').visualRole).toBe('CAROUSEL');
  });

  it('declares tag and chip styles that are not button-like', () => {
    expect(PCG_MODEL_TAG_STYLE.border).toBe('none');
    expect(PCG_MODEL_TAG_STYLE.background).toBe('transparent');
    expect(PCG_MODEL_TAG_STYLE.shadow).toBe('none');
    expect(PCG_MODEL_TAG_STYLE.hover).toBe('none');
    expect(PCG_MODEL_TAG_STYLE.pointerEvents).toBe('none');
    expect(PCG_STATUS_CHIP_STYLE.pointerEvents).toBe('none');
    expect(PCG_STATUS_CHIP_STYLE.READY.background).toContain('28%');
    expect(PCG_STATUS_CHIP_STYLE.READY.border).not.toContain('#0a0a0a');
    expect(PCG_INTERACTION_CLASSIFICATION.some((row) => row.semanticName === 'CGPT' && row.interactive === false)).toBe(
      true,
    );
    expect(PCG_INTERACTION_CLASSIFICATION.some((row) => row.semanticName === 'GENERATE' && row.interactive === true)).toBe(
      true,
    );
  });

  it('does not replace live panel, shell, or CSS geometry', () => {
    const panel = read(PANEL);
    const shell = read(SHELL);
    const css = read(CSS);
    expect(panel).not.toContain('pageConceptGeneratorIconography');
    expect(shell).not.toContain('pageConceptGeneratorIconography');
    expect(panel).not.toContain('pcg-generate');
    expect(panel).not.toContain('s00-pcg-cleanup2');
    expect(css).not.toContain('s00-pcg-cleanup2');
    expect(css).toContain('height: min(calc(100vh - 104px), 780px)');
    expect(css).toContain('grid-template-columns: repeat(3, minmax(0, 1fr))');
    expect(css).toContain("font-family: var(--pcg-mono)");
    expect(css).toContain('.s00-pcg__generate');
    expect(css).toContain('border-radius: 999px');
    expect(css).toContain("background: var(--pcg-lime)");
    for (const id of PAGE_CONCEPT_GENERATOR_LIVE_ICON_LOCK) {
      expect(`${panel}\n${shell}`).toContain(id);
    }
    const overlay = read('src/site00/components/designBench/opusDirect/PageConceptGenerationOverlay.tsx');
    const hook = read('src/site00/components/designBench/opusDirect/usePageConceptGeneration.ts');
    expect(overlay).not.toContain('pageConceptGeneratorIconography');
    expect(hook).not.toContain('pageConceptGeneratorIconography');
    expect(hook).toContain('runPageConceptGenerationApi');
  });

  it('dumps staged SVGs, cleanup2 CSS, manifest, and review surfaces', () => {
    expect(existsSync(join(ROOT, STAGED, 'manifest.json'))).toBe(true);
    expect(existsSync(join(ROOT, STAGED, 'review.html'))).toBe(true);
    expect(existsSync(join(ROOT, STAGED_CSS))).toBe(true);
    const stagedCss = read(STAGED_CSS);
    expect(stagedCss).toContain('pointer-events: none');
    expect(stagedCss).toContain('.s00-pcg__tag');
    expect(stagedCss).toContain('.s00-pcg__chip');
    expect(stagedCss).toContain('.s00-pcg__generate');
    expect(stagedCss).not.toContain('88vh');
    expect(stagedCss).not.toContain('780px');
    for (const id of PCG_ICON_IDS) {
      const svg = read(`${STAGED}/${id}.svg`);
      expect(svg).toContain(`data-pcg-icon="${id}"`);
      expect(svg).toContain(PCG_ICON_VERSION);
    }
    const manifest = JSON.parse(read(`${STAGED}/manifest.json`)) as {
      livePanelMutation: string;
      geometryMutated: string;
      logicMutated: string;
      composerIntegration: string;
      proposal: Record<string, string>;
      readyForFounderReview: boolean;
    };
    expect(manifest.livePanelMutation).toBe('NONE');
    expect(manifest.geometryMutated).toBe('NO');
    expect(manifest.logicMutated).toBe('NO');
    expect(manifest.composerIntegration).toBe('PENDING_FOUNDER_APPROVAL');
    expect(manifest.readyForFounderReview).toBe(true);
    expect(manifest.proposal).toEqual(PAGE_CONCEPT_GENERATOR_ICON_PROPOSAL);
    const review = read(`${STAGED}/review.html`);
    expect(review).toContain('id="sheet"');
    expect(review).toContain('id="compare"');
    expect(review).toContain('id="preview"');
    expect(review).toContain('id="classify"');
    expect(review).toContain('id="tags"');
    expect(review).toContain('pcg-icon-preview');
    expect(review).toContain('pcg-icon-preview-before');
    expect(review).toContain('s00-pcg-cleanup2.css');
  });
});
