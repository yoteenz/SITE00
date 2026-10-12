import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  FNDATN01_EMAILS,
  FNDATN01_FIXTURE_CONTEXT,
  FNDATN01_STATUS,
  derive02,
  derive04,
  derive05,
  derive06,
  derive07,
  fixtureFor,
  progressSteps,
  renderFndatn01Email,
  renderFndatn01Previews,
  type Fndatn01EmailId,
} from '../shared/site00-correspondence-studio/fndatn01/index.js';
import { FNDATN01_PACK_IMPORT_CONTRACT, fndatn01VersionId, listFndatn01TemplateIds } from '../shared/site00-correspondence-studio/import/fndatn01PackImport.js';
import { DIGITAL_FOUNDATION_LIFECYCLE_EVENT_MAP } from '../shared/site00-digital-foundation/communications/eventMap.js';
import type { QuoteAcceptanceRecord } from '../shared/site00-digital-foundation/types.js';
import { getCorrespondenceWorkspace, resetCorrespondenceWorkspaceCache } from '../shared/site00-correspondence-studio/workspace.js';
import { listCorrespondencePacks, listLibraryRows } from '../shared/site00-correspondence-studio/workspaceLibrary.js';

const ctx = FNDATN01_FIXTURE_CONTEXT;
const ids = FNDATN01_EMAILS.map((e) => e.id);
const at = (iso: string) => ({ ...ctx, now: new Date(iso) });

function send(id: Fndatn01EmailId, payload = fixtureFor(id), extra: Record<string, unknown> = {}) {
  return renderFndatn01Email(id, payload, { ...ctx, mode: 'send', assetBase: 'https://site00.com', founderAuthorized: id === '01', ...extra });
}

describe('FNDATN-01 registration', () => {
  it('registers seven emails with fourteen device authorities that exist in the repository', () => {
    expect(FNDATN01_EMAILS).toHaveLength(7);
    for (const e of FNDATN01_EMAILS) {
      expect(fs.existsSync(path.join('public', e.authority.desktop)), e.authority.desktop).toBe(true);
      expect(fs.existsSync(path.join('public', e.authority.mobile)), e.authority.mobile).toBe(true);
      expect(e.dispatch_enabled).toBe(false);
    }
    expect(new Set(FNDATN01_EMAILS.flatMap((e) => [e.authority.desktop, e.authority.mobile])).size).toBe(14);
  });

  it('appends a FNDATN-01 version at founder review without dropping earlier versions', () => {
    resetCorrespondenceWorkspaceCache();
    const m = getCorrespondenceWorkspace();
    expect(FNDATN01_PACK_IMPORT_CONTRACT.auto_approve).toBe(false);
    expect(FNDATN01_PACK_IMPORT_CONTRACT.dispatch_enabled).toBe(false);
    for (const id of listFndatn01TemplateIds()) {
      const t = m.templates[id];
      const v = t.versions.find((x) => x.version_id === fndatn01VersionId(id))!;
      expect(t.current_version_id).toBe(v.version_id);
      expect(v.review_state).toBe('founder_review');
      expect(v.reference_authority).toBeDefined();
      expect(t.versions.some((x) => x.version_id === `${id}@v1-pack-registry`)).toBe(true);
      if (v.preview_source.kind !== 'repository_html') throw new Error('expected repository html');
      expect(fs.existsSync(path.join('public', v.preview_source.publicPreviewPath!))).toBe(true);
    }
    expect(m.templates['payment-confirmed'].versions.some((x) => x.version_id === 'payment-confirmed@r4-premium')).toBe(true);
    expect(m.templates['project-activated'].current_version_id).toBe('project-activated@r4-premium');
  });

  it('uses existing template ids and adds only the two reminder templates, without duplicates', () => {
    const tids = listFndatn01TemplateIds();
    expect(new Set(tids).size).toBe(7);
    expect(FNDATN01_EMAILS.filter((e) => e.new_template).map((e) => e.template_id)).toEqual(['intake-resume-reminder', 'quote-expiry-reminder']);
    const rows = listLibraryRows(getCorrespondenceWorkspace(), { brandAuthorityId: 'site00-dna' });
    expect(new Set(rows.map((r) => r.template_id)).size).toBe(rows.length);
  });

  it('exposes the pack to the library in pack order with its status', () => {
    const [pack] = listCorrespondencePacks(getCorrespondenceWorkspace());
    expect(pack.pack_id).toBe('FNDATN-01');
    expect(pack.template_ids).toEqual(listFndatn01TemplateIds());
    expect(pack.status).toBe(FNDATN01_STATUS);
  });

  it('leaves every lifecycle event trigger off', () => {
    expect(DIGITAL_FOUNDATION_LIFECYCLE_EVENT_MAP.every((m) => !m.enabled)).toBe(true);
  });

  it('applies red correspondence marks on display headers only, not Saira body copy', () => {
    const r = send('01');
    if (!r.ok) throw new Error(r.eligibility.reasons.join());
    expect(r.html).toContain('keep-red');
    expect(r.html).not.toContain('marks/comma.png');
    expect(r.html).not.toContain('marks/semicolon.png');
    expect(r.html).not.toContain('marks/asterisk.png');
  });
});

describe('FNDATN-01 eligibility guards', () => {
  it('01 needs founder authorization and an unsubmitted intake', () => {
    expect(send('01', fixtureFor('01'), { founderAuthorized: false }).ok).toBe(false);
    const submitted = fixtureFor('01');
    submitted.artifact.intake_state = 'COMPLETE';
    expect(send('01', submitted).ok).toBe(false);
    expect(send('01').ok).toBe(true);
  });

  it('02 requires a persisted INTAKE_COMPLETED event and uses its timestamp', () => {
    const noEvent = fixtureFor('02');
    noEvent.events = noEvent.events.filter((e) => e.event_type !== 'INTAKE_COMPLETED');
    expect(derive02(noEvent, ctx).eligibility.reasons).toContain('NO_PERSISTED_INTAKE_COMPLETED_EVENT');
    expect(derive02(fixtureFor('02'), ctx).data?.receivedAt).toBe('OCT 9, 2026 · 12:24 PM ET');
  });

  it('03 maps the real quote and never hardcodes $500', () => {
    const r = send('03');
    if (!r.ok) throw new Error(r.eligibility.reasons.join());
    expect(r.html).toContain('$1,334.00 USD');
    expect(r.html).not.toMatch(/\$500\b/);
    expect(r.html).toContain('ADDITIONAL MAILBOX');
    const draft = fixtureFor('03');
    draft.quote!.founder_commercial_ready = false;
    expect(send('03', draft).ok).toBe(false);
    const expired = fixtureFor('03');
    expired.quote!.expires_at = '2026-10-01T00:00:00.000Z';
    expect(send('03', expired).ok).toBe(false);
  });

  it('04 claims activation only when PROJECT_ACTIVATED is persisted and never fabricates a card', () => {
    expect(derive04(fixtureFor('04'), ctx).data?.activation).toBe('active');
    expect(derive04(fixtureFor('04', 'activation_pending'), ctx).data?.activation).toBe('pending');
    const pending = send('04', fixtureFor('04', 'activation_pending'));
    if (!pending.ok) throw new Error('pending fixture should render');
    expect(pending.html).toContain('ACTIVATION PENDING');
    expect(pending.html).not.toContain('IS NOW IN PROGRESS');
    expect(pending.html).not.toMatch(/ENDING IN|VISA|MASTERCARD/);
    const unpaid = fixtureFor('04');
    unpaid.events = unpaid.events.filter((e) => e.event_type !== 'PAYMENT_CONFIRMED');
    expect(derive04(unpaid, ctx).eligibility.eligible).toBe(false);
  });

  it('05 refuses to claim completion while any item is pending verification', () => {
    const partial = fixtureFor('05');
    partial.stages = partial.stages.map((s) => (s.stage_code === '05_DEVICE_SIGNATURE' ? { ...s, status: 'IN_PROGRESS' as const } : s));
    expect(derive05(partial, ctx).eligibility.reasons).toContain('DEVICE_PENDING_VERIFICATION');
    expect(send('05', partial).ok).toBe(false);
  });

  it('06 never shows or requires payment, and never sends after submission or without saved progress', () => {
    const steps = progressSteps(fixtureFor('06'));
    expect(steps.map((s) => s.key)).not.toContain('payment');
    const r = send('06');
    if (!r.ok) throw new Error(r.eligibility.reasons.join());
    expect(r.html).not.toMatch(/PAYMENT/);
    const submitted = fixtureFor('06');
    submitted.events.push({ ...submitted.events[0], event_id: 'evt-x', event_type: 'INTAKE_COMPLETED', created_at: '2026-10-09T00:00:00.000Z' });
    expect(derive06(submitted, ctx).eligibility.reasons).toContain('INTAKE_ALREADY_SUBMITTED');
    const empty = fixtureFor('06');
    empty.artifact.intake = { needs: [] };
    empty.events = empty.events.filter((e) => e.event_type !== 'INTAKE_UPDATED');
    expect(derive06(empty, ctx).eligibility.reasons).toContain('NO_SAVED_INTAKE');
    expect(derive06(fixtureFor('06'), at('2026-10-09T12:00:00.000Z')).eligibility.reasons).toContain('REMINDER_DELAY_NOT_REACHED');
    expect(derive06(fixtureFor('06'), ctx, { reminderAlreadySentForActivity: true }).eligibility.eligible).toBe(false);
  });

  it('07 requires an unpaid, unaccepted quote with a real expiry inside the reminder window', () => {
    expect(derive07(fixtureFor('07'), ctx).data?.remaining).toEqual({ days: 1, hours: 12, minutes: 59 });
    expect(derive07(fixtureFor('07'), at('2026-10-14T04:00:00.000Z')).eligibility.reasons).toContain('QUOTE_EXPIRED');
    expect(derive07(fixtureFor('07'), at('2026-10-05T00:00:00.000Z')).eligibility.reasons).toContain('REMINDER_WINDOW_NOT_REACHED');
    const paid = fixtureFor('07');
    paid.artifact.payment_state = 'PAID';
    expect(derive07(paid, ctx).eligibility.eligible).toBe(false);
    const accepted = fixtureFor('07');
    accepted.acceptance = {} as QuoteAcceptanceRecord;
    expect(derive07(accepted, ctx).eligibility.reasons).toContain('QUOTE_ALREADY_ACCEPTED');
    const undated = fixtureFor('07');
    undated.quote!.expires_at = '';
    expect(derive07(undated, ctx).eligibility.reasons).toContain('QUOTE_HAS_NO_EXPIRATION');
    const r = send('07');
    if (!r.ok) throw new Error('07 should render');
    expect(r.html).not.toMatch(/SECONDS/);
  });
});

describe('FNDATN-01 HTML safety', () => {
  it('escapes personalized values', () => {
    const p = fixtureFor('02');
    p.lead.contact_name = '<script>alert(1)</script> Eve';
    const r = send('02', p);
    if (!r.ok) throw new Error('should render');
    expect(r.html).not.toContain('<script>alert');
    expect(r.html).toContain('&lt;SCRIPT&gt;');
  });

  it('send mode uses only absolute https assets and links, and no script', () => {
    for (const id of ids) {
      const r = send(id);
      if (!r.ok) throw new Error(`${id}: ${r.eligibility.reasons.join()}`);
      expect(r.html).not.toMatch(/<script/i);
      expect(r.html).not.toMatch(/class="inbox"/);
      for (const m of r.html.matchAll(/(?:src|href|background)="([^"]+)"/g)) expect(m[1], `${id} ${m[1]}`).toMatch(/^https:\/\//);
      for (const m of r.html.matchAll(/url\('([^']+)'\)/g)) expect(m[1], `${id} ${m[1]}`).toMatch(/^https:\/\//);
      expect(r.html).toContain('fixture-fndatn01-client-example');
      expect(r.html).not.toMatch(/@(?!example\.invalid|example-studio\.invalid|font-face|media)[a-z0-9-]+\.[a-z]/i);
    }
  });

  it('refuses a non-https asset base in send mode', () => {
    expect(() => renderFndatn01Email('02', fixtureFor('02'), { ...ctx, mode: 'send', assetBase: '' })).toThrow();
    expect(() => renderFndatn01Email('02', fixtureFor('02'), { ...ctx, mode: 'send', assetBase: 'http://site00.com' })).toThrow();
  });

  it('keeps every email under the Gmail clipping threshold', () => {
    for (const id of ids) {
      const r = send(id);
      if (!r.ok) throw new Error(id);
      expect(Buffer.byteLength(r.html), id).toBeLessThan(102 * 1024);
    }
  });

  it('commits review previews that match the renderer', () => {
    for (const preview of renderFndatn01Previews()) {
      const onDisk = fs.readFileSync(path.join('public', preview.publicPath), 'utf8');
      expect(onDisk === preview.html, `${preview.publicPath} is stale; run npx tsx scripts/correspondence-studio/fndatn01/render-previews.ts`).toBe(true);
    }
  });
});
