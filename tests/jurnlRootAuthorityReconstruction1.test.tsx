/**
 * P0.JURNL.ROOT-PARENTS.REFERENCE-PLUS-SHELL-OPUS-RECONSTRUCTION1
 * TODAY, MONEY, PLAN and CREDIT: the clean shell is the only plate, the live layer follows the founder reference.
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import JurnlRuntimeRoot from '../src/projects/jurnl/runtime/JurnlRuntimeRoot';
import { rootFit } from '../src/projects/jurnl/runtime/components/RootAuthorityStage';
import { RA_CREDIT, RA_MONEY, RA_PLAN, RA_TODAY } from '../src/projects/jurnl/runtime/layout/rootAuthorityLayout';
import { CREDIT_SCENE, MONEY_SCENE, PLAN_SCENE, TODAY_SCENE } from '../src/projects/jurnl/runtime/layout/rootAuthorityScene';

const BASE = '/production/jurnl/runtime';
const render = (route: string, query = '') =>
  renderToStaticMarkup(
    createElement(
      MemoryRouter,
      { initialEntries: [`${BASE}/${route}${query ? `?${query}` : ''}`] },
      createElement(Routes, null, createElement(Route, { path: '/production/:projectSlug/runtime/*', element: createElement(JurnlRuntimeRoot, { basePath: BASE, mode: 'design-preview' }) })),
    ),
  );
const visible = (html: string) => html.replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

const HUBS = [
  { route: 'today', screen: 'F03.00', family: 'F03', asset: 'TODAY.ENVIRONMENT.DAY.001', nav: 'nav-home', copy: ['TODAY', 'WHAT IS TRUE.', 'SAFE TO SPEND', 'A COMPUTED SIGNAL. PREVIEW.', 'SEE WHY', 'COMING', 'MOVED', 'ACTIVITY', 'UPCOMING', 'MORE'] },
  { route: 'money', screen: 'F05.00', family: 'F05', asset: 'MONEY.ENVIRONMENT.CABINET.001', nav: 'nav-money', copy: ['MONEY', 'HELD', 'OWED', 'WHAT DO I HAVE, AND WHERE IS IT?', 'EVERYDAY', 'ADD A PLACE', 'SEE ALL PLACES.', 'NO BANK CONNECTED.', 'NEXT'] },
  { route: 'plan', screen: 'F08.00', family: 'F08', asset: 'PLAN.ENVIRONMENT.FOLIO.001', nav: 'nav-plan', copy: ['PLAN.', 'YOUR MONEY HAS A PLAN.', 'HERE IS WHAT YOU ARE ARRANGING.', 'NOTHING IS', 'ARRANGED YET.', 'ADD AN INTENTION', 'GOALS', 'PURCHASES', 'TRIPS', 'AHEAD'] },
  { route: 'credit', screen: 'F12.00', family: 'F12', asset: 'CREDIT.ENVIRONMENT.DOSSIER.001', nav: 'nav-credit', copy: ['CREDIT', 'WHAT IS HAPPENING,', 'AND WHAT MATTERS?', 'ADD A CARD OR LOAN', 'PAYDOWN'] },
] as const;

describe('root hubs: reference + clean shell', () => {
  for (const hub of HUBS) {
    it(`${hub.route}: one shell plate, live layer on it, locked nav`, () => {
      const html = render(hub.route);
      expect(html).toContain(`data-jrn-screen="${hub.screen}"`);
      expect(html).toContain(`data-jrn-parent-authority="${hub.family}"`);
      // L0: the clean shell is the only photograph. No calm copy, no reference image as the page.
      expect(html.match(/class="jrn-plate"/g)?.length).toBe(1);
      expect(html).toContain(`data-asset-id="${hub.asset}"`);
      expect(html).not.toContain('jrn-env__calm');
      expect(html).not.toMatch(/_REFERENCE\.png/);
      // L2–L4 are live type, not baked into the plate.
      expect(html).toContain('class="jrn-ra"');
      for (const line of hub.copy) expect(visible(html), line).toContain(line);
      // ALL UI COPY UPPERCASE
      expect(visible(html).match(/[a-z]/g)).toBeNull();
      // L5: the parent dock, five items, the hub's own item active, ADD in the centre with its label.
      expect(html).toContain('data-jrn-nav="parent"');
      const nav = html.match(/<nav class="jrn-nav"[\s\S]*?<\/nav>/)?.[0] ?? '';
      expect(nav.match(/data-jrn-trigger="nav-/g)?.length).toBe(5);
      expect(nav).toMatch(new RegExp(`data-active="true"[^>]*data-jrn-trigger="${hub.nav}"`));
      expect(nav.match(/data-active="true"/g)?.length).toBe(1);
      expect(visible(nav)).toContain('ADD');
      // Root hubs keep the menu chip (account drawer) but no back chip: the reference draws the lockup in that corner.
      expect(html).toContain('data-jrn-trigger="f09-menu"');
      expect(html).not.toContain('data-jrn-trigger="f09-back"');
    });
  }

  it('keeps every functional binding of the replaced hubs', () => {
    const triggers = (h: string) => new Set([...h.matchAll(/data-jrn-trigger="([^"]+)"/g)].map((m) => m[1]));
    const today = triggers(render('today'));
    for (const t of ['today-why', 'today-upcoming', 'today-activity', 'discovery-F03-F07', 'discovery-F03-F09']) expect(today.has(t), t).toBe(true);
    const money = triggers(render('money'));
    for (const t of ['money-open-places', 'money-next', 'money-add-place-slot', 'money-open-income', 'money-open-activity', 'discovery-F05-F16']) expect(money.has(t), t).toBe(true);
    const plan = triggers(render('plan'));
    for (const t of ['plan-add-intention', 'plan-open-goals', 'discovery-F08-F10', 'discovery-F08-F11', 'discovery-F08-F15']) expect(plan.has(t), t).toBe(true);
    const creditHtml = render('credit');
    const credit = triggers(creditHtml);
    for (const t of ['credit-add', 'credit-paydown']) expect(credit.has(t), t).toBe(true);
    // With cards: count, total, the dossier's lead card and HOW MUCH IS USED. Without: the honest empty copy.
    if (visible(creditHtml).includes('USED IN TOTAL.')) {
      expect(credit.has('credit-utilization')).toBe(true);
      expect(visible(creditHtml)).toContain('OPEN ONE TO SET ITS');
    } else {
      expect(visible(creditHtml)).toContain('NO CARDS OR LOANS');
      expect(credit.has('credit-utilization')).toBe(false);
    }
    expect(render('today', 'state=error')).toContain('data-jrn-trigger="today-retry"');
    expect(render('today', 'state=empty')).toContain('data-jrn-trigger="today-empty-setup"');
    expect(render('today', 'state=stale')).toContain('data-jrn-trigger="today-refresh"');
  });

  it('measured layouts and scenes are complete', () => {
    expect(Object.keys(RA_TODAY.sheet.text)).toEqual(expect.arrayContaining(['coming', 'moved', 'n1', 'a1', 'n3', 'a3', 'f1', 'f2', 'f3']));
    expect(Object.keys(RA_MONEY.wall.text)).toEqual(expect.arrayContaining(['title', 'held', 'owed', 'name1', 'amt1', 'front3', 'next']));
    expect(Object.keys(RA_PLAN.right.text)).toEqual(expect.arrayContaining(['l1', 'l2', 'q1', 'q2', 'add', 'goals', 'ahead']));
    expect(Object.keys(RA_CREDIT.wall.text)).toEqual(expect.arrayContaining(['title', 'card', 'util', 'amount', 'b1', 'b2', 'pay']));
    for (const scene of [TODAY_SCENE, MONEY_SCENE, PLAN_SCENE, CREDIT_SCENE]) {
      expect(scene.framing.px).toBeGreaterThanOrEqual(0);
      expect(scene.framing.px).toBeLessThanOrEqual(1);
    }
    // Cover fit: at a phone the shell fills the screen with no letterbox.
    const f = rootFit(402, 874, TODAY_SCENE.framing);
    expect(2016 * f.s).toBeGreaterThanOrEqual(402);
    expect(3584 * f.s).toBeGreaterThanOrEqual(874);
    expect(f.x0).toBeLessThanOrEqual(0);
    expect(f.y0).toBeLessThanOrEqual(0);
  });

  it('references and lifted objects are in the repo', () => {
    for (const f of ['01_TODAY_REFERENCE.png', '02_MONEY_REFERENCE.png', '03_PLAN_REFERENCE.png', '04_CREDIT_REFERENCE.png']) {
      expect(existsSync(path.resolve('JURNL/ROOT_PARENTS_REFERENCE_PLUS_SHELL1/REFERENCES', f)), f).toBe(true);
    }
    expect(existsSync(path.resolve('src/projects/jurnl/families/F03_TODAY/ROOT_AUTHORITY/TODAY_ATTENTION_SLIP.png'))).toBe(true);
    expect(existsSync(path.resolve('src/projects/jurnl/families/F12_CREDIT/ROOT_AUTHORITY/CREDIT_DOSSIER.png'))).toBe(true);
    const css = readFileSync(path.resolve('src/projects/jurnl/runtime/jurnl-root-authority.css'), 'utf8');
    expect(css).not.toMatch(/filter:\s*blur/);
  });
});
