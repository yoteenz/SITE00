import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  FNDATN01_DEMO_NOTE,
  FNDATN01_DEMO_SCENARIO_IDS,
  FNDATN01_DEMO_TIMELINE,
  FNDATN01_EMAIL_SCENARIO,
  FNDATN01_EMAILS,
  FNDATN01_STATUS,
  demoScenario,
  derive03,
  derive02,
  derive04,
  derive05,
  derive06,
  derive07,
  fixtureContextFor,
  fixtureFor,
  isFndatn01DemoPayload,
  progressSteps,
  renderFndatn01Email,
  renderFndatn01Previews,
  type Fndatn01EmailId,
} from '../shared/site00-correspondence-studio/fndatn01/index.js';
import { displayHeadlineMetrics, displaySubtextMetrics } from '../shared/site00-correspondence-studio/fndatn01/html.js';
import { FNDATN01_PACK_IMPORT_CONTRACT, fndatn01VersionId, listFndatn01TemplateIds } from '../shared/site00-correspondence-studio/import/fndatn01PackImport.js';
import { DIGITAL_FOUNDATION_LIFECYCLE_EVENT_MAP } from '../shared/site00-digital-foundation/communications/eventMap.js';
import type { DigitalFoundationArtifactPayload, QuoteAcceptanceRecord } from '../shared/site00-digital-foundation/types.js';
import { getCorrespondenceWorkspace, resetCorrespondenceWorkspaceCache } from '../shared/site00-correspondence-studio/workspace.js';
import { listCorrespondencePacks, listLibraryRows } from '../shared/site00-correspondence-studio/workspaceLibrary.js';

const ids = FNDATN01_EMAILS.map((e) => e.id);
/** The instant each email's demo scenario is viewed at. */
const ctxOf = (id: Fndatn01EmailId) => fixtureContextFor(id);
const at = (iso: string) => ({ ...fixtureContextFor('01'), now: new Date(iso) });

/** A demo payload re-keyed to look like a live record, so send-mode behaviour can be exercised. */
function live(payload: DigitalFoundationArtifactPayload): DigitalFoundationArtifactPayload {
  const p = structuredClone(payload);
  p.artifact.artifact_id = 'df-test-0001';
  p.artifact.public_token = 'test-token-0001';
  p.artifact.lead_id = 'lead-test-0001';
  p.lead.lead_id = 'lead-test-0001';
  p.events = p.events.map((e) => ({ ...e, artifact_id: 'df-test-0001', actor: 'SYSTEM' }));
  return p;
}

function send(id: Fndatn01EmailId, payload = fixtureFor(id), extra: Record<string, unknown> = {}) {
  return renderFndatn01Email(id, live(payload), { ...ctxOf(id), mode: 'send', assetBase: 'https://site00.com', founderAuthorized: id === '01', ...extra });
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

  it('shows the selected pack\'s version of a template two packs share', () => {
    const manifest = getCorrespondenceWorkspace();
    const scope = { brandAuthorityId: 'site00-dna' };
    for (const id of listFndatn01TemplateIds()) {
      const fndatn = listLibraryRows(manifest, { ...scope, packId: 'FNDATN-01' }).find((r) => r.template_id === id);
      expect(fndatn?.current_version.pack_id).toBe('FNDATN-01');
    }
    const r4 = listLibraryRows(manifest, { ...scope, packId: 'R4-PREMIUM' }).find((r) => r.template_id === 'intake-completed');
    expect(r4?.current_version.pack_id).toBe('R4-PREMIUM');
  });

  it('exposes the pack to the library in pack order with its status', () => {
    const pack = listCorrespondencePacks(getCorrespondenceWorkspace()).find((p) => p.pack_id === 'FNDATN-01');
    expect(pack).toBeDefined();
    if (!pack) return;
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
    expect(derive02(noEvent, ctxOf('02')).eligibility.reasons).toContain('NO_PERSISTED_INTAKE_COMPLETED_EVENT');
    expect(derive02(fixtureFor('02'), ctxOf('02')).data?.receivedAt).toBe('OCT 2, 2026 · 12:24 PM ET');
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
    expect(derive04(fixtureFor('04'), ctxOf('04')).data?.activation).toBe('active');
    expect(derive04(fixtureFor('04', 'activation_pending'), ctxOf('04')).data?.activation).toBe('pending');
    const pending = send('04', fixtureFor('04', 'activation_pending'));
    if (!pending.ok) throw new Error('pending fixture should render');
    expect(pending.html).toContain('YOUR PAYMENT IS CONFIRMED');
    expect(pending.html).not.toContain('IS NOW IN PROGRESS');
    expect(pending.html).not.toMatch(/ENDING IN|VISA|MASTERCARD/);
    const unpaid = fixtureFor('04');
    unpaid.events = unpaid.events.filter((e) => e.event_type !== 'PAYMENT_CONFIRMED');
    expect(derive04(unpaid, ctxOf('04')).eligibility.eligible).toBe(false);
  });

  it('05 refuses to claim completion while any item is pending verification', () => {
    const partial = fixtureFor('05');
    partial.stages = partial.stages.map((s) => (s.stage_code === '05_DEVICE_SIGNATURE' ? { ...s, status: 'IN_PROGRESS' as const } : s));
    expect(derive05(partial, ctxOf('05')).eligibility.reasons).toContain('DEVICE_PENDING_VERIFICATION');
    expect(send('05', partial).ok).toBe(false);
  });

  it('06 never shows or requires payment, and never sends after submission or without saved progress', () => {
    const steps = progressSteps(fixtureFor('06'));
    expect(steps.map((s) => s.key)).not.toContain('payment');
    const r = send('06');
    if (!r.ok) throw new Error(r.eligibility.reasons.join());
    expect(r.html).not.toMatch(/PAYMENT/);
    const submitted = fixtureFor('06');
    submitted.events.push({ ...submitted.events[0], event_id: 'evt-x', event_type: 'INTAKE_COMPLETED', created_at: '2026-09-30T00:00:00.000Z' });
    expect(derive06(submitted, ctxOf('06')).eligibility.reasons).toContain('INTAKE_ALREADY_SUBMITTED');
    const empty = fixtureFor('06');
    empty.artifact.intake = { needs: [] };
    empty.events = empty.events.filter((e) => e.event_type !== 'INTAKE_UPDATED');
    expect(derive06(empty, ctxOf('06')).eligibility.reasons).toContain('NO_SAVED_INTAKE');
    expect(derive06(fixtureFor('06'), at('2026-09-30T12:00:00.000Z')).eligibility.reasons).toContain('REMINDER_DELAY_NOT_REACHED');
    expect(derive06(fixtureFor('06'), ctxOf('06'), { reminderAlreadySentForActivity: true }).eligibility.eligible).toBe(false);
  });

  it('07 requires an unpaid, unaccepted quote with a real expiry inside the reminder window', () => {
    expect(derive07(fixtureFor('07'), ctxOf('07')).data?.remaining).toEqual({ days: 1, hours: 12, minutes: 59 });
    expect(derive07(fixtureFor('07'), at('2026-10-20T04:00:00.000Z')).eligibility.reasons).toContain('QUOTE_EXPIRED');
    expect(derive07(fixtureFor('07'), at('2026-10-10T00:00:00.000Z')).eligibility.reasons).toContain('REMINDER_WINDOW_NOT_REACHED');
    const paid = fixtureFor('07');
    paid.artifact.payment_state = 'PAID';
    expect(derive07(paid, ctxOf('07')).eligibility.eligible).toBe(false);
    const accepted = fixtureFor('07');
    accepted.acceptance = {} as QuoteAcceptanceRecord;
    expect(derive07(accepted, ctxOf('07')).eligibility.reasons).toContain('QUOTE_ALREADY_ACCEPTED');
    const undated = fixtureFor('07');
    undated.quote!.expires_at = '';
    expect(derive07(undated, ctxOf('07')).eligibility.reasons).toContain('QUOTE_HAS_NO_EXPIRATION');
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
      expect(r.html).toContain('test-token-0001');
      expect(r.html).not.toMatch(/@(?!avery-studio\.invalid|font-face|media)[a-z0-9-]+\.[a-z]/i);
    }
  });

  it('refuses a non-https asset base in send mode', () => {
    expect(() => renderFndatn01Email('02', live(fixtureFor('02')), { ...ctxOf('02'), mode: 'send', assetBase: '' })).toThrow();
    expect(() => renderFndatn01Email('02', live(fixtureFor('02')), { ...ctxOf('02'), mode: 'send', assetBase: 'http://site00.com' })).toThrow();
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

  it('bumps display header size +4px and tightens line spacing −2px', () => {
    expect(displayHeadlineMetrics(44)).toEqual({ fontSize: 48, lineHeight: 43 });
    expect(displayHeadlineMetrics(30)).toEqual({ fontSize: 34, lineHeight: 29 });
    expect(displaySubtextMetrics(10.5, 15)).toEqual({ fontSize: 8.5, lineHeight: 13 });
  });
});

describe('FNDATN-01 demo scenarios', () => {
  it('defines exactly the seven named scenarios, one per email', () => {
    expect([...FNDATN01_DEMO_SCENARIO_IDS]).toEqual([
      'INVITED',
      'INTAKE_IN_PROGRESS',
      'INTAKE_SUBMITTED',
      'QUOTE_READY_UNPAID',
      'QUOTE_EXPIRING_UNPAID',
      'PAID_PROJECT_ACTIVE',
      'FOUNDATION_VERIFIED_COMPLETE',
    ]);
    expect(new Set(Object.values(FNDATN01_EMAIL_SCENARIO)).size).toBe(7);
  });

  it('keeps one client, one artifact and one quote across every snapshot', () => {
    const snaps = FNDATN01_DEMO_SCENARIO_IDS.map((id) => demoScenario(id));
    expect(new Set(snaps.map((s) => s.payload.artifact.artifact_id)).size).toBe(1);
    expect(new Set(snaps.map((s) => s.payload.lead.contact_name)).size).toBe(1);
    const quotes = snaps.map((s) => s.payload.quote).filter((q) => q !== null);
    expect(quotes.length).toBe(4);
    expect(new Set(quotes.map((q) => `${q!.quote_id}|${q!.subtotal_minor}|${q!.created_at}|${q!.expires_at}`)).size).toBe(1);
    const times = Object.values(FNDATN01_DEMO_TIMELINE);
    expect([...times].sort()).toEqual(times);
    const nows = snaps.map((s) => s.context.now.toISOString());
    expect([...nows].sort()).toEqual(nows);
  });

  it('renders every email in its own scenario, labelled as demo data', () => {
    for (const id of ids) {
      const s = demoScenario(FNDATN01_EMAIL_SCENARIO[id]);
      const r = renderFndatn01Email(id, s.payload, { ...s.context, mode: 'review', assetBase: '', founderAuthorized: id === '01', reviewNote: `${FNDATN01_DEMO_NOTE} · ${s.label}` });
      if (!r.ok) throw new Error(`${id}: ${r.eligibility.reasons.join()}`);
      expect(r.html).toContain('DEMO DATA');
    }
  });

  it('never shows payment while the intake is in progress', () => {
    const s = demoScenario('INTAKE_IN_PROGRESS');
    expect(s.payload.artifact.payment_state).toBe('NONE');
    expect(s.payload.events.some((e) => e.event_type === 'PAYMENT_CONFIRMED')).toBe(false);
    expect(s.payload.quote).toBeNull();
  });

  it('activation pending only exists for the paid scenario and drops the activation event', () => {
    expect(() => demoScenario('INVITED', 'activation_pending')).toThrow();
    const pending = demoScenario('PAID_PROJECT_ACTIVE', 'activation_pending').payload;
    expect(pending.events.some((e) => e.event_type === 'PROJECT_ACTIVATED')).toBe(false);
    expect(pending.payment_state ?? pending.artifact.payment_state).toBe('PAID');
  });
});

describe('FNDATN-01 demo data isolation and live data safety', () => {
  it('send mode refuses any demo payload', () => {
    for (const id of ids) {
      expect(isFndatn01DemoPayload(fixtureFor(id))).toBe(true);
      expect(() => renderFndatn01Email(id, fixtureFor(id), { ...ctxOf(id), mode: 'send', assetBase: 'https://site00.com', founderAuthorized: true })).toThrow(/demo/);
    }
    expect(isFndatn01DemoPayload(live(fixtureFor('02')))).toBe(false);
  });

  it('omits a missing field instead of substituting a value', () => {
    const p = live(fixtureFor('03'));
    p.recommendation = null;
    p.lead.contact_name = null;
    p.lead.business_name = null;
    p.artifact.intake = { needs: [] };
    expect(derive03(p, ctxOf('03')).data?.recommendation).toBeNull();
    const r = renderFndatn01Email('03', p, { ...ctxOf('03'), mode: 'send', assetBase: 'https://site00.com' });
    if (!r.ok) throw new Error(r.eligibility.reasons.join());
    const card = r.html.slice(r.html.indexOf('class="card-fields"'), r.html.indexOf('class="card-tags"'));
    expect(card).toContain('$1,334.00 USD');
    expect(card).not.toMatch(/>RECOMMENDATION</);
    expect(card).not.toMatch(/>CLIENT</);
    expect(r.html).not.toMatch(/JORDAN|AVERY/);
  });

  it('refuses rather than defaults when a required value is missing', () => {
    const p = live(fixtureFor('07'));
    p.quote!.expires_at = '';
    const r = renderFndatn01Email('07', p, { ...ctxOf('07'), mode: 'send', assetBase: 'https://site00.com' });
    expect(r.ok).toBe(false);
  });

  it('escapes personalized values inside the card', () => {
    const p = live(fixtureFor('01'));
    p.lead.contact_name = '<img src=x onerror=alert(1)> Eve';
    const r = renderFndatn01Email('01', p, { ...ctxOf('01'), mode: 'send', assetBase: 'https://site00.com', founderAuthorized: true });
    if (!r.ok) throw new Error('should render');
    const card = r.html.slice(r.html.indexOf('class="card-fields"'));
    expect(card).toContain('&lt;IMG SRC=X ONERROR=ALERT(1)&gt; EVE');
    expect(r.html).not.toContain('<img src=x');
  });
});

describe('FNDATN-01 personalized data lives in the artifacts', () => {
  const cards: Record<string, string[]> = {
    '01': ['JORDAN AVERY'],
    '02': ['JORDAN AVERY', 'RECEIVED · UNDER REVIEW', 'OCT 2, 2026 · 12:24 PM ET', 'DF-DEMO-0001'],
    '03': ['JORDAN AVERY', 'YOUR DIGITAL FOUNDATION', '$1,334.00 USD', 'OCT 19, 2026', 'REVIEW PROPOSAL'],
    '04': ['JORDAN AVERY', '$1,334.00 USD', 'OCT 19, 2026', 'Q-DEMO-0001', 'PAID'],
    '07': ['JORDAN AVERY', '$1,334.00 USD', 'OCT 5, 2026', 'OCT 19, 2026', 'AWAITING ACCEPTANCE'],
  };

  it('puts each card field inside the hero art, on desktop and mobile', () => {
    for (const preview of renderFndatn01Previews().filter((p) => p.variant === 'default')) {
      const expected = cards[preview.id];
      // Each chunk runs from a hero to the next hero (desktop) or to the first band after it (mobile).
      const heroes = preview.html.split('class="hero ').slice(1);
      const desk = heroes.find((h) => h.startsWith('desk-only'))!;
      const mob = heroes.find((h) => h.startsWith('mob-only'))!;
      if (!expected) {
        expect(desk).not.toContain('card-fields');
        continue;
      }
      for (const value of expected) {
        expect(desk.slice(0, desk.indexOf('class="walk')), `${preview.id} desktop ${value}`).toContain(value);
        if (preview.id !== '04') expect(mob.slice(0, mob.indexOf('class="walk')), `${preview.id} mobile ${value}`).toContain(value);
      }
    }
  });

  it('no longer repeats the card in a generic data grid below the art', () => {
    for (const preview of renderFndatn01Previews()) expect(preview.html).not.toContain('class="ledger');
  });

  it('labels every studio preview with its demo scenario without changing version ids', () => {
    resetCorrespondenceWorkspaceCache();
    const m = getCorrespondenceWorkspace();
    for (const e of FNDATN01_EMAILS) {
      const v = m.templates[e.template_id].versions.find((x) => x.version_id === fndatn01VersionId(e.template_id))!;
      expect(v.state_previews?.length).toBeGreaterThan(0);
      for (const sp of v.state_previews!) expect(sp.label.startsWith('DEMO · ')).toBe(true);
    }
    const v04 = m.templates[FNDATN01_EMAILS[3].template_id].versions.find((x) => x.version_id === fndatn01VersionId(FNDATN01_EMAILS[3].template_id))!;
    expect(v04.state_previews!.map((s) => s.id)).toEqual(['activation_confirmed', 'activation_pending']);
  });
});

describe('FNDATN-01 angled-edge buttons', () => {
  it('draws every CTA as the angled-edge shape, with an Outlook pentagon and one exposed link', () => {
    for (const id of ids) {
      const r = send(id);
      if (!r.ok) throw new Error(id);
      const tables = r.html.match(/<table class="btn-full"[\s\S]*?<\/table>/g) ?? [];
      expect(tables.length, id).toBeGreaterThan(0);
      for (const t of tables) {
        // The tip: white border triangles cut the top and bottom corners of a 17 px red cell, meeting at 23 px.
        expect(t).toMatch(/border-left:17px solid #[0-9a-f]{6};border-top:23px solid #ffffff/);
        expect(t).toMatch(/border-left:17px solid #[0-9a-f]{6};border-bottom:23px solid #ffffff/);
        expect(t).toContain('&rarr;');
        expect((t.match(/<a /g) ?? []).length).toBe(4);
        expect((t.match(/aria-hidden="true" tabindex="-1"/g) ?? []).length).toBe(3);
      }
      expect((r.html.match(/<v:shape /g) ?? []).length).toBe(tables.length);
      expect(r.html).not.toContain('<v:rect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w=');
    }
  });
});

describe('FNDATN-01 band markup', () => {
  it('never shows escaped markup as visible text', () => {
    for (const preview of renderFndatn01Previews()) expect(preview.html, preview.publicPath).not.toMatch(/&lt;(br|span|p|a)\b/);
  });
});

describe('FNDATN-01 lifecycle subject system', () => {
  const subjects: Record<string, string> = {
    '01': 'YOUR INVITATION TO BEGIN',
    '02': "WE'VE RECEIVED YOUR INTAKE",
    '03': 'YOUR FOUNDATION RECOMMENDATION IS READY',
    '04': 'YOUR DIGITAL FOUNDATION IS UNDERWAY',
    '05': 'YOUR DIGITAL FOUNDATION IS COMPLETE',
    '06': 'CONTINUE YOUR FOUNDATION INTAKE',
    '07': 'REMINDER: YOUR QUOTE EXPIRES SOON',
  };

  it('uses lifecycle subjects for default demo scenarios', () => {
    for (const id of ids) {
      const r = send(id);
      if (!r.ok) throw new Error(id);
      expect(r.subject).toBe(subjects[id]);
    }
  });

  it('uses payment-confirmed subject when activation is still pending', () => {
    const r = send('04', fixtureFor('04', 'activation_pending'));
    if (!r.ok) throw new Error('pending 04');
    expect(r.subject).toBe('YOUR PAYMENT IS CONFIRMED');
  });

  it('does not expose internal classification labels in client HTML', () => {
    for (const id of ids) {
      const r = send(id);
      if (!r.ok) throw new Error(id);
      expect(r.html).not.toMatch(/CLASSIFICATION · TRANSACTIONAL/);
      expect(r.html).not.toMatch(/CORRESPONDENCE STUDIO/i);
    }
  });
});
