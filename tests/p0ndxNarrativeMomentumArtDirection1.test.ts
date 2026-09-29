/**
 * P0.NDX.NARRATIVE-MOMENTUM-NDXBOOK-ART-DIRECTION-REBUILD1
 */

import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  NDX_NARRATIVE_GENERIC_UI_DRIFT,
  NME_WIZARD_STEP_COUNT,
} from '../src/site00/components/founderWorkspace/expressionEngine/narrativeMomentumWizardModel.js';
import { compileEntry002RetroactiveNarrativeMomentum } from '../shared/site00-expression-engine/narrative-momentum/index.js';

describe('P0.NDX.NARRATIVE-MOMENTUM-NDXBOOK-ART-DIRECTION-REBUILD1', () => {
  const panel = readFileSync(
    join(import.meta.dirname, '../src/site00/components/founderWorkspace/expressionEngine/ExpressionEngineNarrativeMomentumPanel.tsx'),
    'utf8',
  );
  const css = readFileSync(
    join(import.meta.dirname, '../src/site00/styles/site00-narrative-momentum-wizard.css'),
    'utf8',
  );

  it('preserves six-step wizard architecture', () => {
    expect(NME_WIZARD_STEP_COUNT).toBe(6);
    expect(panel).toContain('data-testid="nme-wizard-step-nav"');
    expect(panel).toContain('{step === 1 ?');
    expect(panel).toContain('{step === 6 ?');
  });

  it('uses editorial chapter rail instead of generic step pills', () => {
    expect(panel).toContain('site00-nme-wizard__chapter-rail');
    expect(panel).toContain('site00-nme-wizard__chapter--active');
    expect(panel).not.toContain('site00-nme-wizard__step-pill--active');
  });

  it('implements archival surface vocabulary', () => {
    expect(panel).toContain('site00-nme-wizard__paper-field');
    expect(panel).toContain('site00-nme-wizard__black-field');
    expect(panel).toContain('site00-nme-wizard__archival-plate');
    expect(panel).toContain('site00-nme-wizard__glitch-field');
    expect(panel).toContain('site00-nme-wizard__decision-field');
    expect(css).toContain('--ndx-paper');
  });

  it('does not rely on generic card-grid primary layout', () => {
    expect(panel).not.toContain('site00-nme-wizard__card-grid');
    expect(panel).not.toContain('site00-nme-wizard__format-grid');
    expect(panel).not.toContain('site00-nme-wizard__summary-grid');
  });

  it('registers generic UI drift guard id', () => {
    expect(NDX_NARRATIVE_GENERIC_UI_DRIFT).toBe('NDX_NARRATIVE_GENERIC_UI_DRIFT');
  });

  it('Entry 002 narrative data unchanged', () => {
    const plan = compileEntry002RetroactiveNarrativeMomentum();
    expect(plan.layerMode).toBe('RETROACTIVE_AUTHORITY_LAYER');
    expect(plan.beats.length).toBe(7);
    expect(plan.providerDispatchCount).toBe(0);
  });

  it('inspectors use dossier sheet pattern', () => {
    expect(panel).toContain('site00-nme-wizard__dossier');
    expect(readFileSync(
      join(import.meta.dirname, '../src/site00/components/founderWorkspace/expressionEngine/NarrativeMomentumWizardInspectors.tsx'),
      'utf8',
    )).toContain('dossier-evidence');
  });
});
