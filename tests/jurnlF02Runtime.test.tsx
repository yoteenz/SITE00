/**
 * F02 SETUP live family: routes, plates, header assets, states, interactions, F01 handoff, F03 boundary.
 * Screen authorities are reference files. They are not the runtime plate.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { evaluateFamilyGate } from '../shared/site00-product-families/familyGate';
import { JURNL_F02_CONTRACT } from '../src/projects/jurnl/data/f02/contract';
import { JURNL_F02_COVERAGE } from '../src/projects/jurnl/data/f02/coverage';
import { F02_SCREENS } from '../src/projects/jurnl/data/f02/screens';
import JurnlRuntimeRoot, { JURNL_F01_SCREEN_COMPONENTS } from '../src/projects/jurnl/runtime/JurnlRuntimeRoot';
import { JURNL_F02_SCREEN_COMPONENTS } from '../src/projects/jurnl/runtime/screens/SetupScreens';
import { resolveJurnlRoute } from '../src/projects/jurnl/runtime/state/store';
import { projectFamilies } from '../src/projects/families';

const BASE = '/production/jurnl/runtime';

function renderRuntime(route: string, query = '') {
  return renderToStaticMarkup(
    createElement(
      MemoryRouter,
      { initialEntries: [`${BASE}/${route}${query ? `?${query}` : ''}`] },
      createElement(Routes, null, createElement(Route, { path: '/production/:projectSlug/runtime/*', element: createElement(JurnlRuntimeRoot, { basePath: BASE, mode: 'design-preview' }) })),
    ),
  );
}

const visibleText = (html: string) => html.replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ');

describe('F02 live routes', () => {
  it('keeps F01 first and registers F02 second', () => {
    const families = projectFamilies('jurnl');
    expect(families[0]!.contract.familyId).toBe('F01');
    expect(families[1]!.contract.familyId).toBe('F02');
    expect(families[1]!.contract.familyName).toBe('SETUP');
    expect(Object.keys(JURNL_F01_SCREEN_COMPONENTS)).toHaveLength(14);
  });

  it('implements 1 parent, 8 children, and 2 grandchildren', () => {
    expect(F02_SCREENS.filter((s) => s.role === 'PARENT')).toHaveLength(1);
    expect(F02_SCREENS.filter((s) => s.role === 'CHILD')).toHaveLength(8);
    expect(F02_SCREENS.filter((s) => s.role === 'GRANDCHILD')).toHaveLength(2);
    expect(Object.keys(JURNL_F02_SCREEN_COMPONENTS)).toEqual(F02_SCREENS.map((s) => s.id));
  });

  for (const s of F02_SCREENS) {
    it(`${s.id} renders on its plate with a live header`, () => {
      const html = renderRuntime(s.route);
      expect(html).toContain(`data-jrn-screen="${s.id}"`);
      expect(html).toContain('data-jrn-family="F02"');
      expect(html).toContain(`data-asset-id="${s.plate === 'ENV.ARRIVAL' ? 'SETUP.ENVIRONMENT.ARRIVAL.001' : s.plate === 'ENV.DESK' ? 'SETUP.ENVIRONMENT.DESK.001' : s.plate === 'ENV.EDIT' ? 'SETUP.ENVIRONMENT.EDIT.001' : 'SETUP.ENVIRONMENT.QUIET.001'}"`);
      expect(html).not.toContain(s.authorityFile.replace(/^public/, ''));
      expect(html).not.toMatch(/AUTHORITIES\/F02/);
      if (s.header === 'LOCKUP') expect(html).toContain(`data-asset-id="${s.lockup}"`);
      if (s.header === 'EMBLEM') expect(html).toContain(`data-asset-id="${s.emblem}"`);
      expect(visibleText(html).match(/[a-z]/g)).toBeNull();
    });
  }

  it('uses four plates and does not paint a screen authority as the plate', () => {
    const plates = new Set(F02_SCREENS.map((s) => s.plate));
    expect(plates).toEqual(new Set(['ENV.ARRIVAL', 'ENV.DESK', 'ENV.EDIT', 'ENV.QUIET']));
    const root = readFileSync(path.resolve('src/projects/jurnl/runtime/screens/SetupScreens.tsx'), 'utf8');
    expect(root).not.toContain('AUTHORITIES');
  });

  it('wires resume, connected, and validation', () => {
    expect(renderRuntime('setup', 'state=resume')).toContain('CONTINUE SETUP');
    expect(renderRuntime('setup', 'state=resume')).toContain('data-asset-id="F02.BOTANICAL.EMBLEM.011"');
    expect(renderRuntime('setup/accounts', 'state=connected')).toContain('data-jrn-state="connected"');
    expect(renderRuntime('setup/accounts', 'state=connected')).toContain('data-asset-id="F02.BOTANICAL.EMBLEM.013"');
    expect(renderRuntime('setup/income', 'state=validation')).toContain('data-jrn-trigger="setup-validation"');
    expect(renderRuntime('setup/income', 'state=validation')).toContain('data-asset-id="F02.BRANDLOCKUP.JURNL_SETUP.001"');
    expect(renderRuntime('setup/protected', 'state=validation')).toContain('data-jrn-trigger="setup-protected-validation"');
    expect(renderRuntime('setup/accounts/name', 'state=validation')).toContain('NEEDS A NAME');
    expect(renderRuntime('setup/priorities/goal', 'state=validation')).toContain('data-jrn-trigger="setup-goal-validation"');
    expect(renderRuntime('setup/commitments', 'state=validation')).toContain('data-jrn-overlay="setup-add"');
  });

  it('opens permission, add, and skip', () => {
    const permission = renderRuntime('setup/accounts', 'overlay=permission');
    expect(permission).toContain('data-jrn-overlay="setup-permission"');
    expect(permission).toContain('data-scene="ENV.QUIET"');
    expect(permission).toContain('data-jrn-icon="close"');
    expect(renderRuntime('setup/commitments', 'overlay=add')).toContain('data-jrn-overlay="setup-add"');
    expect(renderRuntime('setup/accounts', 'overlay=skip')).toContain('data-jrn-overlay="setup-skip"');
    expect(renderRuntime('setup/commitments', 'overlay=skip')).toContain('data-jrn-overlay="setup-skip"');
    expect(renderRuntime('setup/protected', 'overlay=skip')).toContain('data-jrn-overlay="setup-skip"');
  });

  it('resolves all 12 inherited icons on live screens', () => {
    const icons = new Set<string>();
    const pages = [
      renderRuntime('setup/household'),
      renderRuntime('setup/accounts', 'overlay=permission'),
      renderRuntime('setup/income'),
      renderRuntime('setup/commitments'),
      renderRuntime('setup/boundaries'),
      renderRuntime('setup/accounts', 'state=connected'),
      renderRuntime('setup/ready', 'state=resume'),
      renderRuntime('setup/income', 'state=validation'),
    ];
    for (const html of pages) {
      for (const m of html.matchAll(/data-jrn-icon="([^"]+)"/g)) icons.add(m[1]!);
    }
    for (const name of ['back', 'check', 'alert', 'close', 'plus', 'chevron', 'link', 'account', 'shield', 'privacy', 'info', 'clock']) {
      expect(icons, name).toContain(name);
    }
  });

  it('hands F01.13 into F02 and F02.08 into the F03 boundary', () => {
    expect(resolveJurnlRoute('F02')).toBe('setup');
    expect(resolveJurnlRoute('F03')).toBe('today');
    expect(resolveJurnlRoute('F02.08')).toBe('setup/ready');
    const entry = renderRuntime('entry/complete');
    expect(entry).toContain('data-jrn-screen="F01.13"');
    expect(entry).toContain('data-jrn-trigger="complete-continue"');
    const today = renderRuntime('today');
    expect(today).toContain('data-jrn-screen="F03.00"');
    expect(today).toContain('aria-label="BACK TO SETUP"');
    expect(today).toContain('data-jrn-family="F03"');
    expect(today).not.toContain('data-jrn-family="F02"');
  });

  it('gate covers the live family while founder approval stays open', () => {
    const gate = evaluateFamilyGate(JURNL_F02_CONTRACT, JURNL_F02_COVERAGE);
    expect(gate.gate.SCREENS_READY).toBe('PASS');
    expect(gate.gate.STATES_READY).toBe('PASS');
    expect(gate.gate.INTERACTIONS_READY).toBe('PASS');
    expect(gate.gate.ASSET_POLICY_RESOLVED).toBe('PASS');
    expect(gate.familyComplete).toBe(false);
    expect(JURNL_F02_CONTRACT.founderApproval.approved).toBe(false);
    expect(JURNL_F02_CONTRACT.generationBudget!.familyCredits).toBe(9471);
  });
});
