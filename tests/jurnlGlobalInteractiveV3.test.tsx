/**
 * P0.JURNL.GLOBAL-INTERACTIVE-SURFACES.V3-AUTHORITY-AND-ALL-FAMILY-COMPONENT-CONVERGENCE.OPUS1 — the V3 interactive layer:
 * the global menu is secondary navigation only, membership reads only the entitlement contract (no price, no checkout,
 * nothing AVAILABLE that cannot be obtained), FOUNDER_FULL suppresses upsell, typography stays uppercase / lowercase-script.
 */
import { createElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { resolveEntitlements, type ResolvedEntitlements } from '../shared/site00-monetization/entitlements.js';
import { JURNL_MONETIZATION_CONTRACT as CONTRACT } from '../src/projects/jurnl/data/monetization/contract';
import { AddOnCollection, GlobalMenu, MembershipFolio, UnlockFolio, addOnState, hasFounderAccess, planDisplayName } from '../src/projects/jurnl/runtime/global/GlobalMenu';
import { JurnlEntitlementsProvider } from '../src/projects/jurnl/runtime/monetization/JurnlEntitlements';
import { JurnlStoreProvider } from '../src/projects/jurnl/runtime/state/store';
import { tornClip } from '../src/projects/jurnl/runtime/surfaces/v3/V3Surfaces';

const BASE = '/production/jurnl/runtime';
const free = resolveEntitlements(CONTRACT, { source: 'DESIGN_PREVIEW', subscription: null });
const founder = { ...free, internalGrants: { active: ['FOUNDER_FULL'], enforcementSource: 'INTERNAL_GRANT' } } as ResolvedEntitlements;
const noop = () => undefined;
function render(node: ReactNode, value: ResolvedEntitlements | undefined = free) {
  return renderToStaticMarkup(
    createElement(
      MemoryRouter,
      { initialEntries: [`${BASE}/today`] },
      createElement(Routes, null, createElement(Route, { path: '/production/:projectSlug/runtime/*', element: createElement(JurnlStoreProvider, { basePath: BASE, mode: 'design-preview' }, createElement(JurnlEntitlementsProvider, { mode: 'design-preview', value }, node)) })),
    ),
  );
}
const visible = (html: string) => html.replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ');
/** non-cursive text nodes (everything outside a .jv3-t-script element) */
const nonScript = (html: string) => visible(html.replace(/<p class="jv3-t-script"[^>]*>[\s\S]*?<\/p>/g, ' '));

describe('global menu (V3 · A editorial navigation drawer)', () => {
  const html = render(createElement(GlobalMenu, { onClose: noop, onOpen: noop }));
  it('M1 is secondary navigation: the dock destinations HOME · MONEY · ADD · PLAN · CREDIT never appear', () => {
    const text = visible(html);
    for (const dock of [' HOME ', ' MONEY ', ' ADD ', ' PLAN ', ' CREDIT ']) expect(text, dock).not.toContain(dock);
    for (const t of ['nav-home', 'nav-money', 'nav-add', 'nav-plan', 'nav-credit']) expect(html).not.toContain(`data-jrn-trigger="${t}"`);
  });
  // OPUS2 menu recovery (FD-01): three sections replace the four V3 groups; PRIVACY & DATA is PRIVACY & CONSENTS again,
  // and the financial capabilities PREFERENCES used to hide have their own rows. Every V3 trigger is still present.
  it('M2 has the three sections and every item routes to an existing surface (or says honestly that it is not built)', () => {
    const text = visible(html);
    for (const s of ['YOUR FINANCES', 'YOUR INTELLIGENCE', 'YOUR ACCOUNT', 'CONNECTED ACCOUNTS & SYNC', 'CURRENCY & EXCHANGE', 'SAFE TO SPEND BUFFER', 'ASK JURNL', 'CLASSIFICATION & LEARNING RULES', 'ACCOUNT & PROFILE', 'PREFERENCES', 'PRIVACY & CONSENTS', 'MY MEMBERSHIP', 'EXPLORE ADD-ONS', 'HELP & SUPPORT', 'SIGN OUT']) expect(text, s).toContain(s);
    for (const t of ['menu-connections', 'menu-currency', 'menu-buffer', 'menu-ask', 'menu-rules', 'menu-account', 'menu-preferences', 'menu-privacy', 'menu-membership', 'menu-add-ons', 'menu-help', 'menu-sign-out', 'global-menu-close']) expect(html, t).toContain(`data-jrn-trigger="${t}"`);
    expect(html).toContain('data-jv3-family="A_NAVIGATION_DRAWER"');
    expect(html).toMatch(/role="dialog" aria-modal="true" aria-label="MENU"/);
  });
  it('M3 every non-cursive label is uppercase', () => {
    expect(nonScript(html).match(/[a-z]/g)).toBeNull();
  });
});

describe('membership, add-ons, unlock (V3 · G / H / I) — real entitlement contract only', () => {
  it('E1 MY MEMBERSHIP shows the resolved plan and what it includes; billing is honestly not set up; no price anywhere', () => {
    const html = render(createElement(MembershipFolio, { onClose: noop, onOpen: noop }));
    const text = visible(html);
    expect(text).toContain(planDisplayName(free.effectivePlanId));
    expect(text).toContain(`${free.capabilities.length} CAPABILITIES INCLUDED`);
    expect(html).toContain('data-testid="membership-billing"');
    expect(text).not.toMatch(/\$\s?\d/);
    expect(text).not.toContain('FOUNDER');
    expect(html).toContain('data-jv3-family="G_MEMBERSHIP_FOLIO"');
    expect(nonScript(html).match(/[a-z]/g)).toBeNull();
  });
  it('E2 FOUNDER_FULL (server-resolved) reads FOUNDER ACCESS and suppresses the billing / upgrade prompts', () => {
    const html = render(createElement(MembershipFolio, { onClose: noop, onOpen: noop }), founder);
    expect(visible(html)).toContain('FOUNDER ACCESS');
    expect(html).not.toContain('data-testid="membership-billing"');
    expect(html).not.toContain('data-jrn-trigger="membership-add-ons"');
  });
  it('E3 unknown entitlement state withholds (fail closed): no plan is claimed', () => {
    const html = render(createElement(MembershipFolio, { onClose: noop, onOpen: noop }), { ...free, status: 'FALLBACK', failure: 'ENTITLEMENT_LOAD_FAILURE' } as ResolvedEntitlements);
    expect(html).toContain('data-testid="membership-unavailable"');
    expect(html).not.toContain('data-testid="membership-plan"');
  });
  it('E4 an add-on is never AVAILABLE unless it can be obtained (every registry add-on is DRAFT / billing TBD → COMING SOON)', () => {
    for (const a of CONTRACT.addOns) expect(addOnState(a, free), a.addOnId).toBe('COMING_SOON');
    const html = render(createElement(AddOnCollection, { onClose: noop, onOpen: noop }));
    expect(html).not.toContain('data-state="AVAILABLE"');
    expect((html.match(/data-state="COMING_SOON"/g) ?? []).length).toBeGreaterThanOrEqual(CONTRACT.addOns.length);
    expect(visible(html)).not.toMatch(/\$\s?\d/);
  });
  it('E5 the access state follows the contract: granted → ACTIVE, founder → FOUNDER, live + eligible → AVAILABLE, live + not eligible → LOCKED, unknown → UNAVAILABLE', () => {
    const a = CONTRACT.addOns[0]!;
    const live = { ...a, status: 'ACTIVE', billingType: 'RECURRING' } as typeof a;
    expect(addOnState(a, { ...free, addOns: { granted: [a.addOnId], ignored: [] } })).toBe('ACTIVE');
    expect(addOnState(a, founder)).toBe('FOUNDER');
    expect(addOnState({ ...live, eligiblePlans: [free.effectivePlanId] }, free)).toBe('AVAILABLE');
    expect(addOnState({ ...live, eligiblePlans: ['JURNL_BUSINESS'] }, free)).toBe('LOCKED');
    expect(addOnState(a, null)).toBe('UNAVAILABLE');
    expect(hasFounderAccess(free)).toBe(false);
    expect(hasFounderAccess(founder)).toBe(true);
  });
  it('E6 UNLOCK offers no checkout: a coming-soon add-on says so and the only action is NOT NOW', () => {
    const html = render(createElement(UnlockFolio, { addOnId: CONTRACT.addOns[0]!.addOnId, onClose: noop }));
    expect(html).toContain('data-testid="unlock-coming-soon"');
    expect(html).toContain('data-jrn-trigger="unlock-not-now"');
    expect(visible(html)).not.toMatch(/VIEW OPTIONS|BUY|SUBSCRIBE|CHECKOUT|UPGRADE NOW/);
    expect(html).toContain('data-jv3-family="I_FEATURE_UNLOCK"');
  });
  it('E7 plan names come from the registry without doubling the tier (JURNL FREE, JURNL PLUS)', () => {
    expect(planDisplayName('JURNL_FREE')).toBe('JURNL FREE');
    expect(planDisplayName('JURNL_PLUS')).toBe('JURNL PLUS');
  });
});

describe('V3 foundation', () => {
  it('F1 a torn edge is deterministic (the same folio tears the same way every time) and stays inside the box', () => {
    const a = tornClip(7, ['left'], 3.4, 60);
    expect(a).toBe(tornClip(7, ['left'], 3.4, 60));
    expect(a).not.toBe(tornClip(8, ['left'], 3.4, 60));
    const pts = [...a.matchAll(/(-?[\d.]+)% (-?[\d.]+)%/g)].map((m) => [Number(m[1]), Number(m[2])]);
    expect(pts.length).toBe(240);
    for (const [x, y] of pts) {
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThanOrEqual(100);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThanOrEqual(100);
    }
  });
});
