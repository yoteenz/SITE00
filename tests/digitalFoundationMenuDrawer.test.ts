/**
 * Digital Foundation mobile menu drawer (DF-C48): step and destination availability follows the server surface,
 * and the portaled drawer carries its own style scope.
 */
import { readFileSync } from 'node:fs';
import { beforeEach, describe, expect, it } from 'vitest';
import { resetDigitalFoundationMemoryStore } from '../api/_lib/digitalFoundation/memoryStore.js';
import {
  acceptQuote,
  createArtifactForLead,
  getClientArtifactPayloadByToken,
  recordRefund,
  updateIntake,
} from '../api/_lib/digitalFoundation/service.js';
import { simulateStripeCheckoutCompleted } from '../api/_lib/digitalFoundation/payment/webhookHandler.js';
import {
  buildDfMenu,
  DF_DISCLOSURES,
  DF_ROADMAP_ANCHOR,
  resolveDfRoute,
  type DfView,
} from '../src/site00/foundation-client/model';

const ctx = { checkout: null, activationSeen: false } as const;

function link() {
  const a = createArtifactForLead({ referral_kind: 'DIRECT', business_name: 'Menu Test LLC' });
  return { id: a.artifact_id, payload: () => getClientArtifactPayloadByToken(a.public_token) };
}

function quoted() {
  const l = link();
  updateIntake(
    l.id,
    { business_name: 'Menu Test LLC', contact_name: 'Ana', current_email: 'a@example.com', team_size: 1, needs: ['NEED_DOMAIN'] },
    true,
  );
  return l;
}

function menuFor(payload: ReturnType<typeof getClientArtifactPayloadByToken>, checkout: 'return' | null = null) {
  const route = resolveDfRoute(payload, { checkout, activationSeen: false });
  if (route.kind !== 'views') throw new Error(`unexpected route ${route.kind}`);
  return { route, menu: buildDfMenu(route.views, route.defaultView) };
}

const stepStates = (menu: ReturnType<typeof buildDfMenu>) => menu.steps.map((s) => `${s.index}:${s.state}`).join(' ');
const openDestinations = (menu: ReturnType<typeof buildDfMenu>) => menu.destinations.filter((d) => d.available).map((d) => d.id);

beforeEach(() => resetDigitalFoundationMemoryStore());

describe('menu drawer follows the server surface', () => {
  it('always shows the full 01–06 journey in the reference order', () => {
    const { menu } = menuFor(link().payload());
    expect(menu.steps.map((s) => `${s.index} ${s.label}`)).toEqual([
      '01 GET STARTED',
      '02 BUSINESS INFORMATION',
      '03 BUILD YOUR FOUNDATION',
      '04 RECOMMENDATION',
      '05 REVIEW + CHECKOUT',
      '06 ACTIVATION',
    ]);
    expect(menu.destinations.map((d) => d.label)).toEqual([
      'PROJECT OVERVIEW',
      'ROADMAP',
      'NEEDS YOU',
      'VIEW MY RECORDS',
      'COMMUNICATION PREFERENCES',
      'VIEW MY DIGITAL LOCATION',
    ]);
  });

  it('prospect: intake open, recommendation onward locked, no client destinations', () => {
    const { menu } = menuFor(link().payload());
    expect(stepStates(menu)).toBe('01:current 02:open 03:open 04:locked 05:locked 06:locked');
    expect(openDestinations(menu)).toEqual([]);
    expect(menu.destinations.map((d) => d.status)).toEqual([
      'AFTER PAYMENT',
      'AFTER PAYMENT',
      'AFTER PAYMENT',
      'WHEN RECORDS EXIST',
      'AFTER PAYMENT',
      'AFTER COMPLETION',
    ]);
  });

  it('accepted quote: intake is complete and cannot be reopened, activation stays locked until payment', () => {
    const l = quoted();
    acceptQuote({ artifact_id: l.id, disclosures: [...DF_DISCLOSURES] });
    const { menu } = menuFor(l.payload());
    expect(stepStates(menu)).toBe('01:done 02:done 03:done 04:open 05:current 06:locked');
    expect(openDestinations(menu)).toEqual([]);
  });

  it('paid: overview and roadmap open; records and digital location wait for completion', async () => {
    const l = quoted();
    acceptQuote({ artifact_id: l.id, disclosures: [...DF_DISCLOSURES] });
    await simulateStripeCheckoutCompleted({ artifact_id: l.id, quote_id: l.payload().quote!.quote_id });
    const { menu } = menuFor(l.payload());
    expect(stepStates(menu)).toBe('01:done 02:done 03:done 04:done 05:done 06:current');
    expect(openDestinations(menu)).toEqual(['overview', 'roadmap', 'needs_you', 'records', 'comm_prefs']);
    const roadmap = menu.destinations.find((d) => d.id === 'roadmap')!;
    expect(roadmap).toMatchObject({ view: 'ROADMAP' });
    expect(menu.destinations.find((d) => d.id === 'location')!.available).toBe(false);
  });

  it('refund pauses on activation and closes the project destinations again', async () => {
    const l = quoted();
    acceptQuote({ artifact_id: l.id, disclosures: [...DF_DISCLOSURES] });
    await simulateStripeCheckoutCompleted({ artifact_id: l.id, quote_id: l.payload().quote!.quote_id });
    recordRefund(l.id, {});
    const { menu } = menuFor(l.payload());
    expect(openDestinations(menu)).toEqual([]);
    expect(menu.steps.find((s) => s.view === 'P06')!.state).toBe('current');
  });

  it('only steps inside the server views are navigable, and the active item is the current view', () => {
    const views: DfView[] = ['P04', 'P05'];
    const menu = buildDfMenu(views, 'P04');
    const navigable = menu.steps.filter((s) => s.state === 'open' || s.state === 'current').map((s) => s.view);
    expect(navigable).toEqual(views);
    expect(menu.steps.filter((s) => s.state === 'current').map((s) => s.view)).toEqual(['P04']);
    expect(buildDfMenu(['P06', 'OVERVIEW'], 'OVERVIEW').destinations.find((d) => d.id === 'overview')!.current).toBe(true);
  });
});

describe('portaled drawer style scope', () => {
  const css = readFileSync(new URL('../src/site00/styles/site00-df-client.css', import.meta.url), 'utf8');

  it('defines the Foundation tokens, text font and button reset on the portaled drawer', () => {
    expect(css).toMatch(/\.df-drawer,\s*\n\.df-portal\s*\{\s*\n\s*--df-bg/);
    expect(css).toMatch(/\.df-drawer,\s*\n\.df-portal\s*\{[^}]*font-family:\s*var\(--df-text\)/);
    expect(css).toContain(':where(.df-root, .df-drawer, .df-portal) :where(button, input, select)');
  });

  it('anchors the drawer right at ~61% width over a dark backdrop', () => {
    expect(css).toMatch(/\.df-drawer__panel\s*\{[^}]*right:\s*0;[^}]*width:\s*clamp\(236px, 61vw, 400px\)/);
    expect(css).toMatch(/\.df-drawer__backdrop\s*\{[^}]*background:\s*rgba\(12, 12, 12, 0\.58\)/);
    expect(css).toMatch(/\.df-drawer__step--current\s*\{\s*color:\s*var\(--df-red\)/);
  });

  it('no longer hides the page footer while the menu is open', () => {
    expect(css).not.toContain('.df-root--menu-open .df-footer');
  });
});
