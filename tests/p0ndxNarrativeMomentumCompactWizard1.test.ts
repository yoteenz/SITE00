/**
 * P0.NDX.NARRATIVE-MOMENTUM-COMPACT-WIZARD-WORKSPACE1
 */

import { describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { compileEntry002RetroactiveNarrativeMomentum } from '../shared/site00-expression-engine/narrative-momentum/index.js';
import {
  deriveNarrativeApprovalReadiness,
  NME_WIZARD_STEP_COUNT,
  NME_WIZARD_STEPS,
} from '../src/site00/components/founderWorkspace/expressionEngine/narrativeMomentumWizardModel.js';
import {
  defaultWizardState,
  loadNmeWizardState,
  saveNmeWizardState,
} from '../src/site00/components/founderWorkspace/expressionEngine/narrativeMomentumWizardPersistence.js';

describe('P0.NDX.NARRATIVE-MOMENTUM-COMPACT-WIZARD-WORKSPACE1', () => {
  const panelPath = join(
    import.meta.dirname,
    '../src/site00/components/founderWorkspace/expressionEngine/ExpressionEngineNarrativeMomentumPanel.tsx',
  );
  const panel = readFileSync(panelPath, 'utf8');

  it('defines six wizard stages', () => {
    expect(NME_WIZARD_STEP_COUNT).toBe(6);
    expect(NME_WIZARD_STEPS).toHaveLength(6);
    expect(NME_WIZARD_STEPS.map((s) => s.slug)).toEqual([
      'story-shift',
      'beat-map',
      'tension-proof',
      'reframe-loop',
      'formats',
      'review',
    ]);
  });

  it('maps narrative sections to wizard stages (no legacy all-in-one document markers)', () => {
    expect(panel).toContain('data-nme-section="story-shift"');
    expect(panel).toContain('data-nme-section="beat-map"');
    expect(panel).toContain('data-nme-section="tension-proof"');
    expect(panel).toContain('data-nme-section="reframe-loop"');
    expect(panel).toContain('data-nme-section="formats"');
    expect(panel).toContain('data-nme-section="review"');
    expect(panel).not.toContain('site00-nme-review__snapshot');
    expect(panel).toContain('site00-nme-wizard__chapter-rail');
  });

  it('does not render all sections simultaneously in JSX', () => {
    expect(panel).toContain('{step === 1 ?');
    expect(panel).toContain('{step === 2 ?');
    expect(panel).toContain('{step === 6 ?');
    expect(panel).not.toContain('site00-nme-wizard__card-grid');
    expect(panel.split('data-nme-section=').length - 1).toBeGreaterThanOrEqual(6);
  });

  it('uses beat inspector sheet instead of inline beat paragraphs', () => {
    expect(panel).toContain('nme-beat-inspector');
    expect(panel).toContain('BeatInspectorDetail');
    expect(panel).not.toMatch(/beat-row[\s\S]*whatChangesInThisBeat[\s\S]*beat-row/);
  });

  it('uses proof inspector sheet', () => {
    expect(panel).toContain('nme-proof-inspector');
    expect(panel).toContain('ProofInspectorDetail');
  });

  it('uses reel/carousel tabs with single active format content', () => {
    expect(panel).toContain("formatTab === 'REEL'");
    expect(panel).toContain("formatTab === 'CAROUSEL'");
    expect(panel).toContain('data-testid="narrative-momentum-reel-tab"');
    expect(panel).toContain('data-testid="narrative-momentum-carousel-tab"');
  });

  it('persists wizard step state', () => {
    const mem: Record<string, string> = {};
    const ls = {
      getItem: (k: string) => mem[k] ?? null,
      setItem: (k: string, v: string) => {
        mem[k] = v;
      },
    };
    vi.stubGlobal('window', { localStorage: ls });
    const keyPlan = 'test-plan-wizard-persist';
    saveNmeWizardState(keyPlan, {
      ...defaultWizardState('beat-1'),
      currentWizardStep: 4,
      completedSteps: [1, 2, 3],
    });
    const loaded = loadNmeWizardState(keyPlan);
    expect(loaded?.currentWizardStep).toBe(4);
    expect(loaded?.completedSteps).toEqual([1, 2, 3]);
    vi.unstubAllGlobals();
  });

  it('surfaces approval blockers on Entry 002 when primary proof needs source', () => {
    const plan = compileEntry002RetroactiveNarrativeMomentum();
    const readiness = deriveNarrativeApprovalReadiness(plan, plan.validationIssues ?? []);
    expect(readiness.ready).toBe(false);
    expect(readiness.blockers.some((b) => /PRIMARY PROOF SOURCE REQUIRED/i.test(b))).toBe(true);
  });

  it('Entry 002 compile unchanged (UI migration only)', () => {
    const plan = compileEntry002RetroactiveNarrativeMomentum();
    expect(plan.layerMode).toBe('RETROACTIVE_AUTHORITY_LAYER');
    expect(plan.selectedGrammarId).toBe('CULTURAL_GLITCH');
    expect(plan.beats.length).toBe(7);
  });

  it('has persistent action bar and step nav test ids', () => {
    expect(panel).toContain('data-testid="nme-wizard-action-bar"');
    expect(panel).toContain('data-testid="nme-wizard-step-nav"');
    expect(panel).toContain('data-testid="narrative-momentum-wizard"');
  });

  it('recesses technical details', () => {
    expect(panel).toContain('Technical index');
    expect(panel).toContain('showTechnical');
  });

  it('bounds primary stage height in wizard CSS', () => {
    const css = readFileSync(
      join(import.meta.dirname, '../src/site00/styles/site00-narrative-momentum-wizard.css'),
      'utf8',
    );
    expect(css).toContain('site00-nme-wizard__stage');
    expect(css).toMatch(/max-height/);
  });

  it('no provider dispatch in wizard UI layer', () => {
    expect(panel).not.toContain('postCompileNarrativeMomentum');
    expect(panel).not.toContain('dispatchFal');
    expect(compileEntry002RetroactiveNarrativeMomentum().providerDispatchCount).toBe(0);
  });
});
