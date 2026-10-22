/**
 * Phase 2 — client boards 10, 11, 12, 13A and record detail on engine-generated review fixtures.
 */
import { createElement, type ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { ClientDigitalFoundationPayload } from '../shared/site00-digital-foundation/clientProjection.js';
import { buildClientRecords } from '../shared/site00-digital-foundation/clientRecords.js';
import { foundationCreditDisplay } from '../shared/site00-digital-foundation/creditPresentation.js';
import type { FoundationBuildCredit } from '../shared/site00-digital-foundation/types.js';
import { PLACE_OPTIONS } from '../src/site00/builder-experience/spatialStudio/types';
import {
  FOUNDATION_BUILD_PATHS,
  P11FoundationComplete,
  P12DigitalLocation,
  creditSubline,
  foundationStatusRows,
} from '../src/site00/foundation-client/parents/FoundationMilestone';
import {
  P07ProjectOverview,
  P10NeedsYou,
  RecordDetail,
  RecordsLibrary,
  signaturePreviewFields,
} from '../src/site00/foundation-client/parents/ProjectPortal';
import { DfReviewInertProvider } from '../src/site00/foundation-client/reviewInert';
import { parseClientDigitalFoundationPayload } from '../src/site00/foundation-client/validateClientPayload';
import snapshots from '../src/site00/pages/foundation/generated/reviewFixtureSnapshots.json';
import { visibleLowercase, visibleText } from './helpers/dfUppercaseAudit';

type FixtureKey = keyof typeof snapshots.fixtures;
const fixture = (key: FixtureKey): ClientDigitalFoundationPayload =>
  parseClientDigitalFoundationPayload(structuredClone(snapshots.fixtures[key].payload));

const render = (el: ReactElement) => renderToStaticMarkup(createElement(DfReviewInertProvider, null, el));
const noop = () => undefined;
const reload = async () => undefined;

function credit(over: Partial<FoundationBuildCredit>): FoundationBuildCredit {
  return {
    ...(fixture('M_COMPLETE_CREDIT').credit as FoundationBuildCredit),
    ...over,
  };
}

describe('board 10 · we need your approval', () => {
  const payload = fixture('J_SIGNATURE_APPROVAL');

  it('renders the open signature approval with decisions in the duo', () => {
    const out = render(createElement(P10NeedsYou, { token: 'review-inert', payload, onReload: reload, onOverview: noop }));
    expect(out).toContain('WE NEED');
    expect(out).toContain('APPROVAL');
    expect(out).toContain('BUSINESS SIGNATURE PREVIEW');
    expect(out).toContain('data-df-action="approve"');
    expect(out).toContain('data-df-action="request-change"');
    expect(out).toContain('ONE ITEM REQUIRES YOUR DECISION.');
    expect(visibleLowercase(out)).toEqual([]);
  });

  it('signature preview only shows values the project holds', () => {
    const f = signaturePreviewFields(payload);
    const out = render(createElement(P10NeedsYou, { token: 'review-inert', payload, onReload: reload, onOverview: noop }));
    if (f.mailbox) expect(out).toContain(f.mailbox);
    if (!f.phone) expect(out).not.toContain('df-icon--telephone');
  });

  it('shows nothing-needs-you when no action is open', () => {
    const p = fixture('J_SIGNATURE_APPROVAL');
    p.client_actions = p.client_actions.map((a) => ({ ...a, status: 'COMPLETED' as const }));
    const out = render(createElement(P10NeedsYou, { token: 'x', payload: p, onReload: reload, onOverview: noop }));
    expect(out).toContain('NOTHING');
    expect(out).not.toContain('data-df-action="approve"');
  });
});

describe('board 13A · records and record detail', () => {
  const payload = fixture('M_COMPLETE_CREDIT');
  const rows = buildClientRecords(payload);

  it('lists only records that exist, with category tab counts', () => {
    const out = render(createElement(RecordsLibrary, { payload, onOpen: noop, onOverview: noop }));
    expect(out).toContain('ALL IN ONE PLACE');
    for (const tab of ['ALL', 'DOMAIN', 'EMAIL', 'SECURITY', 'PAYMENTS']) expect(visibleText(out)).toContain(tab);
    for (const r of rows) expect(out).toContain(`data-row-id="${r.id}"`);
    expect(out).toMatch(/<button[^>]*disabled[^>]*data-df-action="download-all-records"|data-df-action="download-all-records"[^>]*disabled/);
    expect(visibleLowercase(out)).toEqual([]);
  });

  it('record detail shows tabs, machine values in their own case, and no credentials', () => {
    const domain = rows.find((r) => r.category === 'DOMAIN')!;
    const out = render(createElement(RecordDetail, { payload, recordId: domain.id, onBack: noop }));
    for (const tab of ['OVERVIEW', 'DOCUMENTS', 'SETTINGS', 'HISTORY']) expect(visibleText(out)).toContain(tab);
    expect(out).toContain('RECORD DETAILS');
    expect(out).toContain(payload.ownership_record!.domain!);
    expect(out).not.toMatch(/password|secret|token/i);
    expect(visibleLowercase(out)).toEqual([]);
  });

  it('unknown record ids render not-found instead of an invented record', () => {
    const out = render(createElement(RecordDetail, { payload, recordId: 'nope', onBack: noop }));
    expect(out).toContain('NOT FOUND');
  });
});

describe('board 11 · your foundation is complete', () => {
  it('status rows follow project evidence, not the board sample', () => {
    const payload = fixture('M_COMPLETE_CREDIT');
    const rows = foundationStatusRows(payload);
    expect(rows.map((r) => r.id)).toEqual(expect.arrayContaining(['domain', 'email', 'ownership']));
    expect(rows.find((r) => r.id === 'domain')?.sub.text).toBe(payload.ownership_record!.domain);
    const inProgress = fixture('J_PAYMENT_SUCCESS');
    expect(foundationStatusRows(inProgress).some((r) => r.status === 'ACTIVE' && r.id === 'ownership')).toBe(false);
  });

  it('renders the milestone with records and next threshold, using the client business name', () => {
    const payload = fixture('M_COMPLETE_CREDIT');
    payload.artifact.intake.business_name = 'Zeta Phase Two Holdings';
    if (payload.ownership_record) payload.ownership_record.owner = 'Zeta Phase Two Holdings';
    const out = render(createElement(P11FoundationComplete, { payload, onRecords: noop, onLocation: noop, onOverview: noop }));
    expect(out).toContain('IS COMPLETE');
    expect(out).toContain('ZETA PHASE TWO HOLDINGS');
    expect(out).toContain('data-df-action="view-records"');
    expect(out).toContain('data-df-action="next-threshold"');
    expect(out).toContain('VERIFIED. DELIVERED. OWNED.');
    expect(visibleLowercase(out)).toEqual([]);
  });

  it('an incomplete project never claims completion', () => {
    const out = render(
      createElement(P11FoundationComplete, { payload: fixture('J_PAYMENT_SUCCESS'), onRecords: noop, onLocation: noop, onOverview: noop }),
    );
    expect(out).toContain('IS IN PROGRESS');
    expect(out).not.toContain('data-df-action="next-threshold"');
  });
});

describe('board 12 · your digital location', () => {
  it('build paths come from the builder PLACE options (WORLD excluded) — no invented prices', () => {
    expect(FOUNDATION_BUILD_PATHS.map((p) => p.label)).toEqual(
      PLACE_OPTIONS.filter((p) => p.id !== 'WORLD').map((p) => p.label),
    );
    const payload = fixture('M_COMPLETE_CREDIT');
    const out = render(createElement(P12DigitalLocation, { token: 'review-inert', payload, reload, onOverview: noop }));
    for (const p of FOUNDATION_BUILD_PATHS) expect(out).toContain(p.hint);
    const money = visibleText(out).match(/\$[\d,.]+/g) ?? [];
    expect(money).toEqual(['$200']);
    expect(out).toContain('CONCEPT PREVIEW — NOT FINAL DESIGN');
    expect(out).toContain('IT IS NOT APPLIED UNTIL THEN.');
    expect(visibleLowercase(out)).toEqual([]);
  });

  it('credit states derive from the eligibility contract', () => {
    const now = new Date(credit({}).valid_from);
    const st = (completion: string, c: FoundationBuildCredit | null) =>
      foundationCreditDisplay({ completion_state: completion, credit: c, now }).state;
    expect(st('COMPLETE', credit({ status: 'AVAILABLE' }))).toBe('AVAILABLE');
    expect(st('IN_PROGRESS', credit({ status: 'AVAILABLE' }))).toBe('PENDING_VERIFICATION');
    expect(st('COMPLETE', credit({ status: 'APPLIED' }))).toBe('REDEEMED');
    expect(st('COMPLETE', credit({ status: 'AVAILABLE', expires_at: '2020-01-01T00:00:00.000Z' }))).toBe('EXPIRED');
    expect(st('COMPLETE', null)).toBe('NOT_ELIGIBLE');
    expect(st('IN_PROGRESS', null)).toBe('NOT_ELIGIBLE');
  });

  it('a redeemed credit is described as already applied to a build, never as applied here', () => {
    const d = foundationCreditDisplay({ completion_state: 'COMPLETE', credit: credit({ status: 'APPLIED' }) });
    expect(d.redeemable).toBe(false);
    expect(creditSubline(d)).toBe('ALREADY APPLIED TO A SITE 00 BUILD');
    const payload = fixture('M_COMPLETE_CREDIT');
    payload.credit = credit({ status: 'APPLIED' });
    const out = render(createElement(P12DigitalLocation, { token: 'x', payload, reload, onOverview: noop }));
    expect(out).toContain('REDEEMED');
    expect(out).not.toContain('IT IS NOT APPLIED UNTIL THEN.');
  });
});

describe('post-completion portal', () => {
  it('overview keeps the four portal areas and adds the milestone rows when complete', () => {
    const payload = fixture('M_COMPLETE_CREDIT');
    const out = render(
      createElement(P07ProjectOverview, {
        payload,
        verify: null,
        onRoadmap: noop,
        onNeedsYou: noop,
        onRecords: noop,
        onStage: noop,
        onActivation: noop,
        onPrefs: noop,
        onComplete: noop,
        onLocation: noop,
      }),
    );
    expect(out).toContain('YOUR FOUNDATION IS COMPLETE');
    expect(out).toContain('YOUR DIGITAL LOCATION');
  });
});
