import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { REFERRAL_COMMISSION_POLICY, AIO_PARTNER_DISPLAY, CARD_STUDIO_COPY } from '../src/site00/admin/founder-workspace/config/referralPolicy';
import { intentChip } from '../src/site00/admin/founder-workspace/data/emailIntents';
import { FOUNDATION_VIEWS, inView, sortFoundationRows, toFoundationRows } from '../src/site00/admin/founder-workspace/data/foundationViews';
import { flattenTasks, stageIndex } from '../src/site00/admin/founder-workspace/data/opsTasks';
import { buildSystemModules, sortStatusFirst } from '../src/site00/admin/founder-workspace/data/systemModules';
import { OVERLAY_MODES, REFERRAL_OVERLAY_IDS, WORKSPACE_OVERLAY_IDS } from '../src/site00/admin/founder-workspace/overlay/overlayRegistry';
import type { FounderReadinessReport } from '../src/site00/admin/services/foundationReadinessApi';

const ROOT = join(import.meta.dirname, '..');
const FW = 'src/site00/admin/founder-workspace';
const read = (rel: string) => readFileSync(join(ROOT, rel), 'utf8');
const srcFiles = (dir: string): string[] =>
  readdirSync(join(ROOT, dir), { withFileTypes: true }).flatMap((d) => (d.isDirectory() ? srcFiles(`${dir}/${d.name}`) : d.name.endsWith('.tsx') || d.name.endsWith('.ts') ? [`${dir}/${d.name}`] : []));

const row = (state: string, payment = 'NONE', mins = 10, name = 'Fictional Co') => ({
  artifact_id: `id-${state}-${mins}`,
  public_token: 't',
  state,
  payment_state: payment,
  business_name: name,
  created_at: new Date(Date.now() - mins * 60000 - 1000).toISOString(),
  last_activity_at: new Date(Date.now() - mins * 60000).toISOString(),
});

describe('founder workspace visual recovery 2 — full propagation', () => {
  it('every page renders through the ported authority grammar (no generic ifw panels, no native selects)', () => {
    for (const p of ['FoundationsPage', 'ClientRecordPage', 'ReviewsPage', 'OperationsPage', 'CorrespondencePage', 'SystemPage', 'ReferralsPage']) {
      const src = read(`${FW}/pages/${p}.tsx`);
      expect(src, p).not.toMatch(/className="ifw-(panel|btn|lede|muted|kv|list|inline-error)/);
      expect(src, p).not.toContain('<select');
    }
    for (const f of srcFiles(FW)) expect(read(f), f).not.toMatch(/<select[\s>]|type="checkbox"|type="radio"/);
  });

  it('keeps the data and action contracts of every page', () => {
    expect(read(`${FW}/pages/FoundationsPage.tsx`)).toContain('foundationAdminApi.list()');
    expect(read(`${FW}/pages/ClientRecordPage.tsx`)).toContain('.completionGate(artifactId)');
    expect(read(`${FW}/pages/ReviewsPage.tsx`)).toContain('foundationAdminApi.approvalResolve');
    expect(read(`${FW}/pages/OperationsPage.tsx`)).toContain('.workbench(id)');
    expect(read(`${FW}/pages/CorrespondencePage.tsx`)).toContain('.emailTimeline()');
    expect(read(`${FW}/pages/SystemPage.tsx`)).toContain('foundationReadinessApi.readinessReport');
    for (const [page, ids] of [
      ['FoundationsPage', ['OL-01', 'OL-06', 'OL-07', 'OL-19']],
      ['ClientRecordPage', ['OL-06', 'OL-08', 'OL-09', 'OL-10', 'OL-14']],
      ['OperationsPage', ['OL-12', 'OL-13']],
      ['CorrespondencePage', ['OL-14', 'OL-15']],
      ['SystemPage', ['OL-16', 'OL-17']],
    ] as const)
      for (const id of ids) expect(read(`${FW}/pages/${page}.tsx`), `${page} ${id}`).toContain(`'${id}'`);
  });

  it('assigns an OPUS container mode to all 40 overlay families', () => {
    for (const id of [...WORKSPACE_OVERLAY_IDS, ...REFERRAL_OVERLAY_IDS]) {
      const m = OVERLAY_MODES[id];
      expect(m, id).toBeTruthy();
      expect(['full', 'sheet', 'drawer', 'action']).toContain(m.m);
    }
    // Families are not one generic modal: several container kinds are in use at every tier.
    expect(new Set(Object.values(OVERLAY_MODES).map((m) => m.d)).size).toBeGreaterThanOrEqual(4);
    expect(new Set(Object.values(OVERLAY_MODES).map((m) => m.m)).size).toBe(4);
    // Financial / destructive confirmations never close on a scrim click.
    for (const id of ['OL-08', 'OL-10', 'OL-17', 'RO-12', 'RO-15', 'RO-16', 'RO-17', 'RO-20'] as const) expect(OVERLAY_MODES[id].scrimLocked, id).toBe(true);
  });

  it('overlay host keeps focus trap, unsaved-change confirmation and is never undismissable', () => {
    const host = read(`${FW}/overlay/OverlayHost.tsx`);
    expect(host).toContain("e.key !== 'Tab'");
    expect(host).toContain('DISCARD CHANGES');
    expect(host).toContain('label="CLOSE"');
    const ctx = read(`${FW}/overlay/OverlayContext.tsx`);
    expect(ctx).toContain("e.key === 'Escape'");
    expect(ctx).not.toContain('window.confirm');
  });

  it('toasts support success · error · info · action · blocked and never fade errors', () => {
    const ctx = read(`${FW}/overlay/OverlayContext.tsx`);
    for (const t of ['success', 'error', 'info', 'action', 'blocked']) expect(ctx).toContain(`'${t}'`);
    expect(ctx).toContain("(t === 'success' || t === 'info')");
  });

  it('foundation status views and sort come from the real lifecycle reading', () => {
    const rows = toFoundationRows([row('INTAKE_COMPLETE', 'NONE', 5), row('INVITED', 'NONE', 50), row('IN_PROGRESS', 'PAID', 1), row('COMPLETE', 'PAID', 900)], []);
    const count = (v: string) => rows.filter((r) => inView(r, v)).length;
    expect(FOUNDATION_VIEWS.map((v) => v.label)).toEqual(['ALL', 'NEEDS YOU', 'INVITED', 'INTAKE', 'QUOTE', 'ACTIVE', 'COMPLETE']);
    expect(count('VIEW:NEEDS_YOU')).toBe(1);
    expect(count('VIEW:INVITED')).toBe(1);
    expect(count('VIEW:ACTIVE')).toBe(1);
    expect(count('VIEW:COMPLETE')).toBe(1);
    expect(count('INVITED')).toBe(1);
    expect(sortFoundationRows(rows, 'lifecycle')[0].state).toBe('INTAKE_COMPLETE');
  });

  it('system modules never claim health the report does not state', () => {
    const none = buildSystemModules(null);
    expect(none.every((m) => m.chip[0] === 'unver')).toBe(true);
    const report = {
      overall_status: 'ACTION_REQUIRED',
      ready: [],
      needs_founder: [],
      blocked: [],
      unverified: [],
      env_var_groups: [],
      database_security: null,
      activation: { e2e_authorized: false, synthetic_intake_ready: false, remote_migration_applied: false, deployment_performed: false, founder_login_verified: false },
      staging_identities: { expected_frontend_origin: 'a', expected_api_origin: 'b', configured_public_origin: null, effective_public_origin: 'c', supabase_project_ref: null, supabase_staging_isolation_verified: false, persistence_store: 'memory', email_sending_enabled: false, stripe_key_mode: 'live', e2e_passed: false },
      env: { founder_test_mode: false, transactional_send_flag: false, resend_configured: false, allowlist_configured: false, supabase_persistence: false, stripe_secret_present: false, stripe_webhook_secret_present: false, resend_webhook_secret_present: false, transactional_from_present: false, transactional_reply_to_present: false },
      deployment: { commit_short: null, pr1642_reference: '', package_marker: '' },
      env_vars: [],
    } as FounderReadinessReport;
    const mods = sortStatusFirst(buildSystemModules(report));
    expect(mods[0].id).toBe('stripe');
    expect(mods.find((m) => m.id === 'stripe')?.chip[0]).toBe('fail');
    expect(mods.find((m) => m.id === 'api')?.chip[0]).toBe('unver');
    expect(mods.find((m) => m.id === 'db')?.chip[1]).toBe('NOT PROBED');
    expect(mods.find((m) => m.id === 'email')?.chip[0]).toBe('policy');
    expect(mods.filter((m) => m.chip[0] === 'ok')).toHaveLength(0);
  });

  it('send intents never read as delivered unless the provider says so', () => {
    expect(intentChip('DRY_RUN')).toEqual(['policy', 'DRY RUN']);
    expect(intentChip('QUEUED')[1]).toContain('NOT SENT');
    expect(intentChip('ACCEPTED')[0]).toBe('unver');
    expect(intentChip('DELIVERED')).toEqual(['ok', 'DELIVERED']);
  });

  it('operations reads tasks from the workbench by_mode projection and preserves execution modes', () => {
    const t = flattenTasks({ by_mode: { ASSISTED: [{ task_id: 'a', status: 'READY', execution_mode: 'ASSISTED' }], EXTERNAL_MANUAL: [{ task_id: 'b', status: 'SUPERSEDED', execution_mode: 'EXTERNAL_MANUAL' }] } });
    expect(t.map((x) => x.task_id)).toEqual(['a']);
    expect(stageIndex('04_DNS_SECURITY')).toBe(3);
    expect(stageIndex(null)).toBe(-1);
    const ops = read(`${FW}/data/opsTasks.ts`);
    expect(ops).toContain("COMPLETE: 'done'");
    expect(ops).toContain("IN_PROGRESS: 'work'");
  });

  it('referrals: founder card copy, fixed-fee policy, no fabricated money, no AIO activation', () => {
    expect(CARD_STUDIO_COPY).toMatchObject({ frontLine1: 'YOUR BUSINESS.', frontLine2: 'BUILT TO LAST.', backLine: 'START HERE.', partnerName: 'ALL IN ONE ENTERPRISES INC.' });
    expect(AIO_PARTNER_DISPLAY.autoActive).toBe(false);
    expect(REFERRAL_COMMISSION_POLICY).toMatchObject({ standardUsd: 25, establishedUsd: 35, strategicMaxUsd: 50, universalCapUsd: 50, qualifyingBasePackageUsd: 500, attributionWindowDays: 90, holdDaysAfterVerifiedPayment: 14, payoutTargetDayOfMonth: 15 });
    const page = read(`${FW}/pages/ReferralsPage.tsx`);
    const kit = read(`${FW}/referrals/rfKit.tsx`);
    expect(page).not.toContain('/invite/aio-demo');
    expect(kit).toContain('FounderCard');
    expect(kit).toContain('rcard__foil');
    expect(kit).not.toMatch(/TERRITORY|rcard--A|rcard--B|rcard--C/);
    // Percentage offers are rejected for cards and terms (layout widths like w="70%" are not copy).
    expect(page + kit).not.toMatch(/\d+\s?%\s*(COMMISSION|OFF|OF|REFERRAL)/i);
    expect(page + kit).not.toContain('15%');
    // Every commission / payout signal without a ledger renders an em dash, never $0.00 or an invented total.
    expect(page).toContain("const noLedger = '—'");
    expect(page).not.toMatch(/\$\d+\.\d\d/);
    const ro = read(`${FW}/overlays/bodies/ReferralOverlayBody.tsx`);
    expect(ro).toContain('primaryDisabled');
    expect(ro).not.toMatch(/foundationAdminApi|fetch\(/);
  });

  it('no page carries the authority demo fixtures', () => {
    for (const f of srcFiles(`${FW}/pages`)) for (const n of ['Horizon Freight', 'HORIZON FREIGHT', 'Carter & Lane', 'Meridian', 'Kestrel', 'Anthony']) expect(read(f), `${f} ${n}`).not.toContain(n);
  });

  it('referral styles are the OPUS3 rf.css scoped under .ws', () => {
    const css = read(`${FW}/styles/ifw-referrals.css`);
    expect(css).toContain('.ws .ldg');
    expect(css).toContain('.ws .rcard--founder');
    expect(css).not.toMatch(/^\.(ldg|prt|rcard|cs)\b/m);
  });
});
