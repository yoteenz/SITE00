/**
 * P0.VR.PAGE-CONCEPT-GENERATOR-OPUS-SHELL1 — GENERATE PAGE CONCEPTS visual shell.
 *
 * The shell is design authority, so the guards are structural: the stages, the
 * result slots, the typography lock and the firewall (no provider calls, no
 * generation logic in the shell files).
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  PAGE_CONCEPT_DEFAULT_STAGE_STATE,
  PAGE_CONCEPT_GENERATOR_HOOK_MAP,
  PAGE_CONCEPT_GENERATOR_STAGES,
  PAGE_CONCEPT_GENERATOR_SUMMARY,
  PAGE_CONCEPT_STAGE_STATES,
  PAGE_CONCEPT_STATE_LABEL,
  pageConceptGeneratorNoticeLines,
  pageConceptGeneratorTargetLine,
  pageConceptStageStatesForRun,
} from '../shared/site00-design-workspace-production/designPageConceptGeneratorShell.js';

const ROOT = join(import.meta.dirname, '..');

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

const PANEL = 'src/site00/components/designBench/pageConceptGenerator/PageConceptGeneratorPanel.tsx';
const OVERLAY = 'src/site00/components/designBench/opusDirect/PageConceptGenerationOverlay.tsx';
const CSS = 'src/site00/styles/site00-page-concept-generator.css';

describe('P0.VR.PAGE-CONCEPT-GENERATOR-OPUS-SHELL1', () => {
  it('describes the three reference stages in order with their output promises', () => {
    expect(PAGE_CONCEPT_GENERATOR_STAGES.map((s) => s.id)).toEqual(['CGPT', 'GPT2', 'NBP']);
    expect(PAGE_CONCEPT_GENERATOR_STAGES.map((s) => s.step)).toEqual([1, 2, 3]);
    expect(PAGE_CONCEPT_GENERATOR_STAGES[0].title).toBe('CREATIVE INJECTION');
    expect(PAGE_CONCEPT_GENERATOR_STAGES[1].title).toBe('AUTHORITY CONCEPT');
    expect(PAGE_CONCEPT_GENERATOR_STAGES[2].title).toBe('RENDITIONS');
    expect(PAGE_CONCEPT_GENERATOR_STAGES[2].outputNote).toContain('MOBILE + DESKTOP');
  });

  it('reserves mobile and desktop A/B/C rendition slots', () => {
    const nbp = PAGE_CONCEPT_GENERATOR_STAGES.find((s) => s.id === 'NBP');
    const groups = nbp?.renditionGroups ?? [];
    expect(groups.map((g) => g.id)).toEqual(['MOBILE', 'DESKTOP']);
    for (const group of groups) {
      expect(group.slots.map((s) => s.label)).toEqual(['A', 'B', 'C']);
    }
    expect(groups.flatMap((g) => g.slots).map((s) => s.id)).toEqual([
      'nbp.mobile.a',
      'nbp.mobile.b',
      'nbp.mobile.c',
      'nbp.desktop.a',
      'nbp.desktop.b',
      'nbp.desktop.c',
    ]);
  });

  it('formats blocked capture notices for compact footer display only', () => {
    expect(pageConceptGeneratorNoticeLines('BLOCKED_NO_SOURCE_CAPTURE')).toEqual({
      headline: 'BLOCKED · SOURCE CAPTURE REQUIRED',
      hint: 'CAPTURE MOBILE + DESKTOP BEFORE GENERATION',
    });
  });

  it('carries the reference summary strip and target line', () => {
    expect(PAGE_CONCEPT_GENERATOR_SUMMARY.map((m) => m.count)).toEqual([
      '1 CGPT',
      '1 GPT2',
      '3 NBP',
      '6 VIEWPORT',
    ]);
    expect(pageConceptGeneratorTargetLine('ndxbook', 'overview')).toBe('TARGET · NDXBOOK / OVERVIEW');
  });

  it('defines every required visual state, all uppercase', () => {
    for (const state of ['READY', 'ACTIVE', 'COMPLETE', 'PENDING', 'FAILED', 'PARTIAL'] as const) {
      expect(PAGE_CONCEPT_STAGE_STATES).toContain(state);
      const label = PAGE_CONCEPT_STATE_LABEL[state];
      expect(label).toBe(label.toUpperCase());
    }
    expect(PAGE_CONCEPT_DEFAULT_STAGE_STATE).toEqual({ CGPT: 'READY', GPT2: 'PENDING', NBP: 'PENDING' });
  });

  it('renders result slots the hook map points at', () => {
    const panel = read(PANEL);
    const stageSlots = PAGE_CONCEPT_GENERATOR_STAGES.map((s) => s.resultSlotId);
    for (const hook of PAGE_CONCEPT_GENERATOR_HOOK_MAP) {
      if (!hook.selector.includes('data-result-slot="')) continue;
      expect(stageSlots).toContain(hook.selector.split('"')[1]);
    }
    expect(panel).toContain('data-result-slot={stage.resultSlotId}');
    expect(panel).toContain('data-result-slot');
    expect(panel).toContain('data-interaction-id="page-concepts-generate"');
    expect(panel).toContain('data-interaction-id="page-concepts-cancel"');
    expect(panel).toContain('data-stage-state');
  });

  it('keeps swipe/paging affordances as shell only', () => {
    const panel = read(PANEL);
    expect(panel).toContain('s00-pcg__paging');
    expect(panel).toContain('s00-pcg__dots');
    expect(panel).toContain('preview-prev');
    expect(panel).toContain('preview-next');
    const css = read(CSS);
    expect(css).toContain('.s00-pcg__dot[data-active');
    expect(css).toContain('scroll-snap-type');
  });

  it('locks typography to uppercase Martian Mono', () => {
    const css = read(CSS);
    expect(css).toContain("'Martian Mono'");
    expect(css).toContain('text-transform: uppercase');
    expect(css).toMatch(/\.s00-pcg \*[\s\S]*?text-transform: uppercase/);
  });

  it('composes mobile sheet and desktop workbench separately', () => {
    const css = read(CSS);
    expect(css).toContain('@media (min-width: 900px)');
    expect(css).toMatch(/grid-auto-flow: column/);
    expect(css).toMatch(/grid-template-columns: repeat\(3, minmax\(0, 1fr\)\)/);
    expect(css).toMatch(/max-height: min\(88vh/);
  });

  it('holds no provider, generation or persistence logic in shell files', () => {
    for (const file of [PANEL, 'shared/site00-design-workspace-production/designPageConceptGeneratorShell.ts']) {
      const source = read(file);
      expect(source).not.toContain('fetch(');
      expect(source).not.toContain('/api/');
      expect(source).not.toContain('localStorage');
      expect(source).not.toContain('supabase');
      expect(source).not.toContain('useState');
    }
    const overlay = read(OVERLAY);
    expect(overlay).not.toContain('fetch(');
    expect(overlay).not.toContain('/api/');
    expect(overlay).not.toContain('localStorage');
    expect(overlay).not.toContain('supabase');
    expect(overlay).not.toContain('runPageConceptGeneration');
  });

  it('is the presentation of the existing pipeline pop-up, with its props intact', () => {
    const overlay = read(OVERLAY);
    expect(overlay).toContain('PageConceptGeneratorPanel');
    expect(overlay).toContain('data-testid="page-concept-generation-overlay"');
    expect(overlay).toContain('page-concept-generation-blocked');
    for (const prop of ['plan', 'generationState', 'error', 'generating', 'confirmReady', 'onCancel', 'onConfirm']) {
      expect(overlay).toContain(prop);
    }
    const workspace = read('src/site00/components/designBench/opusDirect/twinOpusDirectWorkspace.ts');
    expect(workspace).toContain('openGenerationConfirm');
  });

  it('projects run status onto stage states without inventing progress', () => {
    expect(pageConceptStageStatesForRun({ status: 'IDLE' })).toEqual({
      CGPT: 'READY',
      GPT2: 'PENDING',
      NBP: 'PENDING',
    });
    expect(pageConceptStageStatesForRun({ status: 'GPT2_RUNNING' })).toEqual({
      CGPT: 'COMPLETE',
      GPT2: 'ACTIVE',
      NBP: 'PENDING',
    });
    expect(pageConceptStageStatesForRun({ status: 'PARTIAL_GENERATION' }).NBP).toBe('PARTIAL');
    expect(pageConceptStageStatesForRun({ status: 'READY_FOR_FOUNDER_REVIEW' })).toEqual({
      CGPT: 'COMPLETE',
      GPT2: 'COMPLETE',
      NBP: 'COMPLETE',
    });
    expect(pageConceptStageStatesForRun({ status: 'NBP_RUNNING', failed: true }).NBP).toBe('FAILED');
  });
});
