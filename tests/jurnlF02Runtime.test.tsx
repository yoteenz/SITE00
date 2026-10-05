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
import { JurnlChoice } from '../src/projects/jurnl/runtime/components/primitives';
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
    expect(today).toContain('data-jrn-screen="F03.BOUNDARY"');
    expect(today).toContain('BACK TO SETUP');
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

/* P0.JURNL.F02-OPUS-FINAL-…-AUDIT1 — left rail, icon rows, lockup, semantics. */
describe('F02 OPUS final audit repairs', () => {
  const css = readFileSync(path.resolve('src/projects/jurnl/runtime/jurnl-setup.css'), 'utf8');

  it('bounds content with a per-plate left rail mapped from the plate, not one global width', () => {
    expect(css).toContain('container-type: size');
    for (const plate of ['ENV.ARRIVAL', 'ENV.DESK', 'ENV.EDIT', 'ENV.QUIET']) expect(css).toMatch(new RegExp(`data-jrn-plate='${plate}'\\]\\s*\\{\\s*--f02-edge-f: 0\\.\\d+`));
    expect(css).toMatch(/\.jrn-setup \{[^}]*max-width: var\(--f02-rail\)/);
    // tablet keeps the rail on the left grid; no centring, scaling, masking or new overflow clipping
    expect(css).not.toMatch(/\.jrn-col \{[^}]*margin-left: auto/);
    expect(css).not.toMatch(/transform:\s*scale|mask|overflow:\s*hidden/);
    for (const s of F02_SCREENS) expect(renderRuntime(s.route)).toContain(`data-jrn-plate="${s.plate}"`);
    expect(renderRuntime('entry')).not.toContain('data-jrn-plate');
  });

  it('renders icon rows as [ICON][LABEL][MARK] with the icon outside the label column', () => {
    const html = renderRuntime('setup/accounts');
    for (const label of ['CONNECT AN ACCOUNT', 'NAME AN ACCOUNT']) {
      expect(html).toMatch(new RegExp(`class="jrn-row jrn-choice jrn-choice--icon"[^>]*>\\s*<span class="jrn-choice__icon" aria-hidden="true"><svg[^>]*>.*?</svg></span><span class="jrn-row__copy">${label}</span>`));
    }
    expect(html).not.toMatch(/jrn-row__copy"><svg/);
    expect(renderRuntime('setup/income')).not.toMatch(/jrn-row__copy"><svg/);
    expect(renderRuntime('setup/commitments', 'overlay=add')).not.toMatch(/jrn-row__copy"><svg/);
    // the voice rows no longer insert a glyph on selection
    expect(renderRuntime('setup/ready')).not.toMatch(/setup-voice-[A-Z]+"[^>]*>(?:(?!<\/button>).)*data-jrn-icon/);
  });

  it('keeps the icon-less JurnlChoice markup that F01 uses unchanged', () => {
    const html = renderToStaticMarkup(createElement(JurnlChoice, { selected: false, onSelect: () => {}, trigger: 'x' }, 'A'));
    expect(html).toBe('<button type="button" role="radio" aria-checked="false" class="jrn-row jrn-choice" data-jrn-trigger="x"><span class="jrn-row__copy">A</span><span class="jrn-choice__mark" aria-hidden="true"></span></button>');
  });

  it('exposes pick-several as checkboxes and one-of-many as labelled radiogroups', () => {
    const priorities = renderRuntime('setup/priorities');
    expect(priorities).toContain('role="group" aria-label="PRIORITIES"');
    expect(priorities).toMatch(/role="checkbox"[^>]*data-jrn-trigger="setup-priority-A GOAL"/);
    expect(priorities).not.toMatch(/role="radio"[^>]*data-jrn-trigger="setup-priority-/);
    expect(renderRuntime('setup/accounts')).toContain('role="radiogroup" aria-label="ACCOUNT SOURCE"');
    expect(renderRuntime('setup/commitments', 'overlay=add')).toContain('role="radiogroup" aria-label="CADENCE"');
    const income = renderRuntime('setup/income', 'state=validation');
    expect(income).toMatch(/aria-describedby="([^"]+)-error"/);
    expect(renderRuntime('setup/boundaries')).toMatch(/aria-controls="[^"]+"/);
  });

  it('keeps one header mark: no second SETUP label beside the SETUP lockup', () => {
    for (const route of ['setup/income', 'setup/accounts/name', 'setup/priorities/goal', 'setup/protected']) {
      const html = renderRuntime(route, 'state=validation');
      expect(html).toContain('data-asset-id="F02.BRANDLOCKUP.JURNL_SETUP.001"');
      expect(html).not.toContain('<span class="jrn-eyebrow">SETUP</span>');
      expect(html).not.toContain('jrn-setup__word');
    }
    const parent = renderRuntime('setup');
    expect(parent).toContain('data-asset-id="F02.BRANDLOCKUP.JURNL.001"');
    expect(parent).toContain('<span class="jrn-eyebrow">SETUP</span>');
    expect(parent).not.toContain('jrn-setup__emblem');
  });

  it('keeps progress, foot and secondary actions on the left grid', () => {
    const parent = renderRuntime('setup');
    expect(parent).toMatch(/<div class="jrn-setup__meta"><span class="jrn-eyebrow">SETUP<\/span><span class="jrn-setup__segs"/);
    // the reassurance line sits with the content, before the CTA group
    expect(parent.indexOf('A FEW QUIET MINUTES.')).toBeLessThan(parent.indexOf('class="jrn-cta"'));
    expect(parent).not.toContain('jrn-setup__top');
    expect(renderRuntime('setup/household')).toContain('<div class="jrn-setup__top">');
    expect(css).toMatch(/\.jrn-btn--quiet \{[^}]*align-self: flex-start;[^}]*background: rgba\(249, 246, 239/);
  });
});

