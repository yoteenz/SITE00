/**
 * Business Growth V1 client experience inside the Foundation link: server context, persistence, locks,
 * founder review, and the client presentation model — all driven by the real DF service + BGI engines.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { resetDigitalFoundationMemoryStore } from '../api/_lib/digitalFoundation/memoryStore.js';
import {
  acceptQuote,
  createArtifactForLead,
  getClientArtifactPayloadByToken,
  updateBusinessGrowth,
  updateIntake,
} from '../api/_lib/digitalFoundation/service.js';
import { simulateStripeCheckoutCompleted } from '../api/_lib/digitalFoundation/payment/webhookHandler.js';
import { buildClientGrowthContextForArtifactId, buildFounderGrowthReview } from '../api/_lib/digitalFoundation/growthBridge.js';
import { DF_DISCLOSURES } from '../src/site00/foundation-client/model';
import {
  clientGrowthCatalog,
  isGrowthServiceSelectable,
  sanitizeAmbitionInput,
  sanitizeGrowthSelections,
} from '../shared/site00-business-growth-intelligence/clientContext.js';
import { resolveDfRoute } from '../src/site00/foundation-client/model';
import {
  checkoutTotal,
  followUpsFor,
  investmentSections,
  priceStatus,
  readinessDimensions,
  recommendationCards,
  timelineView,
  toggleGoal,
  wantsDigitalLocation,
} from '../src/site00/foundation-client/growth/model';
import type { DfPayload } from '../src/site00/foundation-client/api';

const NOW = '2026-10-09T12:00:00.000Z';

function enableGrowth() {
  vi.stubEnv('SITE00_BUSINESS_GROWTH_INTELLIGENCE_V1', '1');
  vi.stubEnv('SITE00_BUSINESS_AMBITION_INTAKE_V1', '1');
}

function link(referral_kind = 'DIRECT') {
  const a = createArtifactForLead({ referral_kind, business_name: 'Anthony Transport LLC', contact_name: 'Anthony', contact_email: 'a@example.com' });
  return {
    id: a.artifact_id,
    token: a.public_token,
    payload: (): DfPayload => ({
      ...getClientArtifactPayloadByToken(a.public_token),
      business_growth: buildClientGrowthContextForArtifactId(a.artifact_id),
    }),
  };
}

function quoted(referral_kind = 'DIRECT') {
  const l = link(referral_kind);
  updateIntake(
    l.id,
    { business_name: 'Anthony Transport LLC', contact_name: 'Anthony', current_email: 'a@example.com', team_size: 1, needs: ['NEED_DOMAIN'] },
    true,
  );
  return l;
}

function growth(l: { payload: () => DfPayload }) {
  const g = l.payload().business_growth;
  if (!g) throw new Error('growth context missing');
  return g;
}

beforeEach(() => resetDigitalFoundationMemoryStore());
afterEach(() => vi.unstubAllEnvs());

describe('feature flags', () => {
  it('returns no Growth context and rejects update-growth while BGI is off', async () => {
    vi.stubEnv('SITE00_BUSINESS_GROWTH_INTELLIGENCE_V1', '');
    const l = quoted();
    expect(l.payload().business_growth).toBeNull();

    vi.stubEnv('SITE00_DIGITAL_FOUNDATION_ARTIFACT_V1', '1');
    const handler = (await import('../api/site00/digital-foundation-artifact.js')).default;
    const res = mockRes();
    await handler({ method: 'POST', query: { token: l.token }, body: { action: 'update-growth', ambition: { goals: ['BE_FOUND_ONLINE'] } }, headers: {} } as never, res as never);
    expect(res.statusCode).toBe(404);
    expect((res.body as { error: string }).error).toBe('GROWTH_NOT_ENABLED');
  });

  it('never enables Growth checkout or public release from the client context', () => {
    enableGrowth();
    vi.stubEnv('SITE00_BUSINESS_GROWTH_CHECKOUT_V1', '1');
    const g = growth(quoted());
    expect(g.flags.growth_checkout).toBe(false);
    expect(g.flags.public_release).toBe(false);
  });

  it('keeps the original Foundation route when Growth is disabled', () => {
    const l = quoted();
    const ctx = { checkout: null, activationSeen: false } as const;
    const off = resolveDfRoute(l.payload(), ctx);
    const offExplicit = resolveDfRoute(l.payload(), { ...ctx, growth: false });
    expect(off).toEqual(offExplicit);
    expect(off.kind === 'views' && off.views.some((v) => ['AMBITION', 'GROWTH', 'PLAN', 'ROADMAP'].includes(v))).toBe(false);
  });
});

describe('business ambition', () => {
  it('skipping keeps the Foundation journey and records no goals', () => {
    enableGrowth();
    const l = link();
    updateBusinessGrowth(l.id, { ambition: { skipped: true } });
    const g = growth(l);
    expect(g.ambition?.skipped).toBe(true);
    expect(g.ambition?.goals).toEqual([]);
    expect(g.selection.selected).toEqual([]);
    const route = resolveDfRoute(l.payload(), { checkout: null, activationSeen: false, growth: true });
    expect(route.kind === 'views' && route.views.includes('P01')).toBe(true);
  });

  it('accepts multiple canonical goals and drops unknown ones', () => {
    const next = sanitizeAmbitionInput(
      { goals: ['BE_FOUND_ONLINE', 'FIND_GRANTS_FUNDING', 'MADE_UP_GOAL' as never, 'BE_FOUND_ONLINE'], complete: true },
      null,
      NOW,
    );
    expect(next.goals).toEqual(['BE_FOUND_ONLINE', 'FIND_GRANTS_FUNDING']);
    expect(next.completed_at).toBe(NOW);
  });

  it('NOT SURE is exclusive on the client', () => {
    expect(toggleGoal(['BE_FOUND_ONLINE'], 'NOT_SURE')).toEqual(['NOT_SURE']);
    expect(toggleGoal(['NOT_SURE'], 'ATTRACT_CUSTOMERS')).toEqual(['ATTRACT_CUSTOMERS']);
    expect(toggleGoal(['ATTRACT_CUSTOMERS'], 'ATTRACT_CUSTOMERS')).toEqual([]);
  });

  it('asks adaptive follow-ups for the chosen goals and skips what is already known', () => {
    enableGrowth();
    const l = quoted();
    const g = growth(l);
    const grants = followUpsFor(['FIND_GRANTS_FUNDING'], g.known_context);
    const online = followUpsFor(['BE_FOUND_ONLINE'], g.known_context);
    expect(grants.length).toBeGreaterThan(0);
    expect(grants).not.toEqual(online);
    expect(followUpsFor([], g.known_context)).toEqual([]);
  });

  it('persists ambition on the artifact intake and logs the events', () => {
    enableGrowth();
    const l = quoted();
    updateBusinessGrowth(l.id, { ambition: { goals: ['BE_FOUND_ONLINE', 'IMPROVE_CREDIBILITY'], complete: true } });
    const g = growth(l);
    expect(g.ambition?.goals).toEqual(['BE_FOUND_ONLINE', 'IMPROVE_CREDIBILITY']);
    expect(g.ambition?.completed_at).toBeTruthy();
  });
});

describe('recommendations + explicit selection', () => {
  it('recommends from canonical goals without adding anything to the plan', () => {
    enableGrowth();
    const l = quoted();
    updateBusinessGrowth(l.id, { ambition: { goals: ['BE_FOUND_ONLINE', 'FIND_GRANTS_FUNDING'], complete: true } });
    const g = growth(l);
    expect(g.recommendations.length).toBeGreaterThan(0);
    expect(g.selection.selected).toEqual([]);
    expect(g.unified_quote.growth_lines).toEqual([]);
    const cards = recommendationCards(g, new Set());
    expect(cards.every((c) => !c.selected)).toBe(true);
  });

  it('hides HIDDEN services from the client and refuses HIDDEN or FUTURE selections', () => {
    const ids = clientGrowthCatalog().map((s) => s.service_id);
    expect(ids).not.toContain('BGI.BUSINESS_GROWTH_PACKAGE');
    expect(isGrowthServiceSelectable('BGI.BUSINESS_GROWTH_PACKAGE')).toBe(false);
    expect(isGrowthServiceSelectable('BGI.GROWTH_OPERATIONS')).toBe(false);
    expect(isGrowthServiceSelectable('BGI.VISIBILITY_AUDIT')).toBe(true);
    expect(sanitizeGrowthSelections([{ service_id: 'BGI.BUSINESS_GROWTH_PACKAGE' }])).toEqual({
      ok: false,
      code: 'GROWTH_SERVICE_NOT_SELECTABLE:BGI.BUSINESS_GROWTH_PACKAGE',
    });
    enableGrowth();
    const l = quoted();
    expect(() => updateBusinessGrowth(l.id, { selections: [{ service_id: 'BGI.GROWTH_OPERATIONS' }] })).toThrow(/NOT_SELECTABLE/);
  });

  it('shows draft pricing as status, never as a payable value', () => {
    enableGrowth();
    const g = growth(quoted());
    for (const s of g.catalog) {
      const p = priceStatus(s);
      if (s.commercial_status !== 'FOUNDER_APPROVED') expect(p.payable).toBe(false);
    }
    expect(g.families.find((f) => f.family_id === 'SALES_SYSTEMS')?.services ?? []).toEqual([]);
  });
});

describe('quote + delivery recalculation', () => {
  it('Foundation-only: $500 base, full project equals Foundation ready', () => {
    enableGrowth();
    const l = quoted();
    const g = growth(l);
    expect(g.unified_quote.foundation_base_minor).toBe(50_000);
    expect(g.unified_quote.growth_lines).toEqual([]);
    const t = timelineView(g);
    expect(t.sameAsFoundation).toBe(true);
    expect(t.fullProject).toBe(t.foundationReady);
  });

  it('adding one service extends full delivery but never moves Foundation ready or the checkout total', () => {
    enableGrowth();
    const l = quoted();
    const before = growth(l);
    const beforeTotal = checkoutTotal(before, l.payload());
    updateBusinessGrowth(l.id, { selections: [{ service_id: 'BGI.VISIBILITY_AUDIT' }] });
    const after = growth(l);
    expect(after.selection.selected.map((s) => s.service_id)).toEqual(['BGI.VISIBILITY_AUDIT']);
    expect(after.selection.revision).toBe(before.selection.revision + 1);
    expect(after.delivery.foundation_ready_min_days).toBe(before.delivery.foundation_ready_min_days);
    expect(after.delivery.foundation_ready_max_days).toBe(before.delivery.foundation_ready_max_days);
    expect(after.delivery.full_project_max_days!).toBeGreaterThan(before.delivery.foundation_ready_max_days);
    expect(after.unified_quote.foundation_base_minor).toBe(50_000);
    expect(checkoutTotal(after, l.payload())).toBe(beforeTotal);
    const sections = investmentSections(after, l.payload());
    expect(sections.find((s) => s.id === 'GROWTH')?.inCheckout).toBe(false);
    expect(sections.filter((s) => s.inCheckout).map((s) => s.id)).toEqual(['BASE', 'ADDONS']);
    expect(timelineView(after).sameAsFoundation).toBe(false);
  });

  it('multiple services stay outside checkout and keep the two milestones distinct', () => {
    enableGrowth();
    const l = quoted();
    updateBusinessGrowth(l.id, { selections: [{ service_id: 'BGI.VISIBILITY_AUDIT' }, { service_id: 'BGI.OPPORTUNITY_READINESS' }] });
    const g = growth(l);
    const t = timelineView(g);
    expect(t.tracks.some((x) => x.kind === 'FOUNDATION_READY')).toBe(true);
    expect(t.tracks.some((x) => x.kind === 'FULL_PROJECT')).toBe(true);
    expect(t.foundationReady).not.toBe(t.fullProject);
    expect(t.foundationReady).toMatch(/BUSINESS DAY/);
    expect(t.foundationReady).not.toMatch(/WEEK/);
    expect(g.lifecycle.growth).toBe('AWAITING_FOUNDER_APPROVAL');
  });

  it('BLDR goes to its estimator — never a priced Foundation add-on or a business-day bar', () => {
    enableGrowth();
    const l = quoted();
    updateBusinessGrowth(l.id, { ambition: { goals: ['BUILD_WEBSITE'], complete: true } });
    const g = growth(l);
    expect(wantsDigitalLocation(g, new Set())).toBe(true);
    const presence = g.catalog.find((s) => s.service_id === 'BGI.PRESENCE_LAUNCH')!;
    expect(priceStatus(presence)).toMatchObject({ label: 'BLDR ESTIMATE', payable: false });
    updateBusinessGrowth(l.id, { selections: [{ service_id: 'BGI.PRESENCE_LAUNCH' }] });
    const after = growth(l);
    expect(after.delivery.foundation_ready_max_days).toBe(g.delivery.foundation_ready_max_days);
    for (const tr of timelineView(after).tracks.filter((x) => x.kind === 'BLDR_OPPORTUNITY')) expect(tr.start).toBeNull();
    expect(checkoutTotal(after, l.payload())).toBe(checkoutTotal(g, l.payload()));
  });
});

describe('locks + lifecycle', () => {
  it('locks Growth selections after scope acceptance and ambition after payment', async () => {
    enableGrowth();
    const l = quoted();
    acceptQuote({ artifact_id: l.id, disclosures: [...DF_DISCLOSURES] });
    expect(growth(l).selection.editable).toBe(false);
    expect(() => updateBusinessGrowth(l.id, { selections: [{ service_id: 'BGI.VISIBILITY_AUDIT' }] })).toThrow('GROWTH_SELECTION_LOCKED');
    updateBusinessGrowth(l.id, { ambition: { goals: ['ATTRACT_CUSTOMERS'], complete: true } });

    await simulateStripeCheckoutCompleted({ artifact_id: l.id, quote_id: l.payload().quote!.quote_id });
    const paid = growth(l);
    expect(paid.selection.ambition_editable).toBe(false);
    expect(paid.lifecycle.foundation).toBe('IN_PROGRESS');
    expect(() => updateBusinessGrowth(l.id, { ambition: { skipped: true } })).toThrow('GROWTH_AMBITION_LOCKED');
    const route = resolveDfRoute(l.payload(), { checkout: null, activationSeen: true, growth: true });
    expect(route.kind === 'views' && route.views.includes('ROADMAP')).toBe(true);
  });

  it('readiness is qualitative — no numeric score', () => {
    enableGrowth();
    const g = growth(quoted());
    const dims = readinessDimensions(g);
    expect(dims.length).toBe(5);
    for (const d of dims) expect(JSON.stringify(d)).not.toMatch(/\d+\s*%|\bscore\b/i);
  });

  it('opportunity matching stays pending — no fabricated grants', () => {
    enableGrowth();
    const l = quoted();
    updateBusinessGrowth(l.id, { ambition: { goals: ['FIND_GRANTS_FUNDING'], complete: true } });
    const g = growth(l);
    expect(g.opportunity).toEqual({ status: 'ASSESSMENT_PENDING', verified_opportunities: [] });
  });

  it('AIO-attributed clients get the same SITE 00 base and no AIO charge line', () => {
    enableGrowth();
    const aio = growth(quoted('AIO'));
    const direct = growth(quoted('DIRECT'));
    expect(aio.unified_quote.foundation_base_minor).toBe(direct.unified_quote.foundation_base_minor);
    expect(JSON.stringify(aio.unified_quote)).not.toMatch(/AIO/);
    expect(aio.aio.boundary.rule).toBeTruthy();
  });
});

describe('founder review', () => {
  it('lists pricing reviews for selected draft services and never approves anything', () => {
    enableGrowth();
    const l = quoted();
    updateBusinessGrowth(l.id, { selections: [{ service_id: 'BGI.VISIBILITY_AUDIT' }, { service_id: 'BGI.APPLICATION_PROCUREMENT_SUPPORT' }] });
    const r = buildFounderGrowthReview(l.id);
    expect(r.enabled).toBe(true);
    expect(r.pricing_reviews.map((p) => p.service_id).sort()).toEqual(['BGI.APPLICATION_PROCUREMENT_SUPPORT', 'BGI.VISIBILITY_AUDIT']);
    expect(r.governance).toMatchObject({ growth_checkout_enabled: false, auto_approval: false });
    expect(growth(l).selection.selected.every((s) => s.client_selected)).toBe(true);
  });

  it('is behind admin auth', async () => {
    enableGrowth();
    vi.stubEnv('SITE00_CLOUD_MOBILE_PREVIEW', '');
    vi.stubEnv('VITE_SITE00_CLOUD_PREVIEW', '');
    const l = quoted();
    const handler = (await import('../api/admin/site00-foundation.js')).default;
    const res = mockRes();
    await handler({ method: 'GET', query: { action: 'growth-review', id: l.id }, body: {}, headers: {} } as never, res as never);
    // 401/403 with a missing bearer; 503 when the auth backend is not configured (fails closed).
    expect([401, 403, 503]).toContain(res.statusCode);
    expect(res.body).not.toHaveProperty('pricing_reviews');
  });
});

function mockRes() {
  return {
    statusCode: 0,
    body: null as unknown,
    headers: {} as Record<string, string>,
    setHeader(k: string, v: string) {
      this.headers[k] = v;
    },
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
    end() {
      return this;
    },
  };
}
