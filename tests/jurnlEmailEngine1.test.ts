/**
 * P0.JURNL.EMAIL-ENGINE.CANONICAL-ARCHITECTURE-AND-CREATIVE-INFRASTRUCTURE1 — the JURNL EDITORIAL CORRESPONDENCE system
 * is complete, internally consistent, firewalled, grounded in repository truth, and sends nothing.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import * as E from '../shared/jurnl-email-engine/index.js';
import { buildJurnlEmailExports } from '../scripts/jurnl/email-engine-export';

const ROOT = path.resolve(E.JURNL_EMAIL_SYSTEM.root);
const read = (p: string) => readFileSync(path.resolve(p), 'utf8');
/** Approximate rendered length: each {token} counts as 12 characters. */
const len = (s: string) => s.replace(/\{[^}]+\}/g, 'x'.repeat(12)).length;

describe('ontology', () => {
  it('names the system and its root', () => {
    expect(E.JURNL_EMAIL_SYSTEM.name).toBe('JURNL EDITORIAL CORRESPONDENCE');
    expect(E.JURNL_EMAIL_SYSTEM.collection).toBe('JURNL EMAILS v1');
    expect(E.JURNL_EMAIL_SYSTEM.centralIdea).toEqual({ app: 'ENVIRONMENT AS INTERFACE', email: 'ARTIFACT AS INTERFACE' });
  });

  it('defines seven families, seventeen components and eight first contracts', () => {
    expect(E.EMAIL_FAMILIES.map((f) => `${f.id} ${f.name}`)).toEqual([
      'E01 WELCOME / ARRIVAL',
      'E02 GUIDANCE / EDUCATION',
      'E03 FINANCIAL BRIEF / DIGEST',
      'E04 MILESTONE / CELEBRATION',
      'E05 REMINDER / NUDGE',
      'E06 SECURITY / ACCOUNT / TRANSACTIONAL',
      'E07 MARKETING / EDITORIAL CAMPAIGN',
    ]);
    expect(E.EMAIL_COMPONENTS.map((c) => c.id)).toEqual(Array.from({ length: 17 }, (_, i) => `EC${String(i + 1).padStart(2, '0')}`));
    expect(E.EMAIL_CONTRACTS.map((e) => [e.id, e.name, e.family, e.traits])).toEqual([
      ['A01', 'WELCOME TO JURNL', 'E01', []],
      ['A02', 'VERIFY YOUR EMAIL', 'E06', []],
      ['A03', 'FINISH SETTING UP JURNL', 'E05', ['E02']],
      ['A04', 'YOUR SAFE TO SPEND IS READY', 'E01', ['E02']],
      ['A05', 'YOUR WEEK IN JURNL', 'E03', []],
      ['A06', 'A PURCHASE MAY NEED A SECOND LOOK', 'E05', []],
      ['A07', 'YOU REACHED A MILESTONE', 'E04', []],
      ['A08', 'RESET YOUR ACCESS', 'E06', []],
    ]);
  });

  it('keeps L3–L5 live HTML and lets imagery own only non-functional material', () => {
    for (const l of E.LAYER_MODEL) expect(l.owner, l.id).toBe(['L1', 'L2'].includes(l.id) ? 'IMAGE' : 'HTML');
    for (const must of ['financial values', 'CTA labels', 'links', 'verification codes', 'reset links', 'unsubscribe links', 'legally required text']) {
      expect(E.OWNERSHIP_MATRIX.htmlMustOwn, must).toContain(must);
    }
    const overlap = E.OWNERSHIP_MATRIX.imageMayOwn.filter((i) => (E.OWNERSHIP_MATRIX.htmlMustOwn as readonly string[]).includes(i));
    expect(overlap).toEqual([]);
    for (const a of E.EMAIL_ASSET_CLASSES.filter((x) => x.id === 'EMAIL_LIVE_CONTENT')) expect(a.layer).toBe('L3');
  });

  it('defines every production state and never infers approval', () => {
    expect(E.PRODUCTION_STATES.map((s) => s.state)).toEqual(['PLANNED', 'CONTRACT_READY', 'CREATIVE_READY', 'AUTHORITY_IN_REVIEW', 'AUTHORITY_APPROVED', 'ASSETS_READY', 'IMPLEMENTATION_READY', 'IMPLEMENTED', 'RESPONSIVE_QA', 'DELIVERY_QA', 'APPROVED', 'LIVE', 'SUPERSEDED', 'ARCHIVED']);
    const founderStates = E.PRODUCTION_STATES.filter((s) => s.requiresFounder).map((s) => s.state);
    for (const e of E.EMAIL_CONTRACTS) {
      expect(e.productionState, e.id).toBe('CONTRACT_READY');
      expect(e.founderApproval.status, e.id).toBe('NOT_REVIEWED');
      expect(founderStates).not.toContain(e.productionState);
      expect(e.copy.status, e.id).toBe('DRAFT_FOR_FOUNDER_REVIEW');
    }
    // Full authority before asset decomposition.
    const step = (n: string) => E.GENERATION_PIPELINE.find((p) => p.name === n)!.step;
    expect(step('FULL EMAIL AUTHORITY')).toBeLessThan(step('ASSET DECOMPOSITION'));
    expect(step('ASSET DECOMPOSITION')).toBeLessThan(step('SIDEKICK / ARTIFACT GENERATION'));
    expect(E.GENERATION_PIPELINE.find((p) => p.name === 'LIVE')!.owner).toEqual(['FOUNDER']);
  });
});

describe('transactional / lifecycle / marketing firewall', () => {
  it('every contract has one consent class its family allows, and components that allow it', () => {
    for (const e of E.EMAIL_CONTRACTS) {
      const fam = E.familyById(e.family);
      const cls = e.trigger.consentClass;
      expect(fam.consentClasses, e.id).toContain(cls);
      for (const id of e.components) {
        const c = E.componentById(id);
        expect([e.family, ...e.traits].some((f) => c.families.includes(f)), `${e.id} ${id} family`).toBe(true);
        expect(c.consentClasses, `${e.id} ${id} consent`).toContain(cls);
      }
      expect(e.components, e.id).toContain('EC16');
      expect(e.components.filter((c) => c === 'EC07' || c === 'EC08'), `${e.id} one primary CTA`).toHaveLength(1);
    }
  });

  it('security mail is plain, always delivered and never unsubscribable', () => {
    for (const e of E.EMAIL_CONTRACTS.filter((x) => x.family === 'E06')) {
      expect(e.trigger.consentClass).toBe('TRANSACTIONAL');
      expect(e.preferenceCategory).toBe('ACCOUNT_SECURITY');
      expect(e.components).toContain('EC13');
      for (const banned of ['EC01', 'EC05', 'EC08', 'EC10', 'EC17'] as const) expect(e.components, `${e.id} ${banned}`).not.toContain(banned);
      expect(e.authorityBrief.environment).toMatch(/^NONE/);
      expect(e.trigger.priority).toBe('CRITICAL');
    }
    const tx = E.CONSENT_CLASSES.find((c) => c.id === 'TRANSACTIONAL')!;
    expect(tx).toMatchObject({ requiresOptIn: false, requiresUnsubscribe: false, marketingContentAllowed: false, sendsWhenMarketingDeclined: true });
    expect(E.PREFERENCE_CATEGORIES.find((p) => p.id === 'ACCOUNT_SECURITY')).toMatchObject({ defaultOn: true, userCanDisable: false });
  });

  it('non-transactional mail carries a category unsubscribe; marketing needs opt-in', () => {
    for (const e of E.EMAIL_CONTRACTS.filter((x) => x.trigger.consentClass !== 'TRANSACTIONAL')) expect(e.components, e.id).toContain('EC17');
    expect(E.CONSENT_CLASSES.find((c) => c.id === 'MARKETING')).toMatchObject({ requiresOptIn: true, requiresUnsubscribe: true });
    expect(E.familyById('E07').consentClasses).toEqual(['MARKETING']);
  });

  it('does not claim product support for email preferences that do not exist yet', () => {
    for (const p of E.PREFERENCE_CATEGORIES) expect(p.supportedToday, p.id).toBe(false);
    const consentSrc = read('src/projects/jurnl/data/foundation/consent.ts');
    for (const p of E.PREFERENCE_CATEGORIES) if (p.proposedConsentKey) expect(consentSrc, p.proposedConsentKey).not.toContain(p.proposedConsentKey);
  });
});

describe('copy', () => {
  it('has every copy field, and subjects / preheaders follow the rules', () => {
    for (const e of E.EMAIL_CONTRACTS) {
      const c = e.copy;
      for (const v of [c.subject, c.preheader, c.fromName, c.replyToPolicy, c.headline, c.cta.label, c.fallbackText]) expect(v.trim().length, e.id).toBeGreaterThan(0);
      expect(c.body.length, e.id).toBeGreaterThan(0);
      expect(len(c.subject), `${e.id} subject`).toBeLessThanOrEqual(50);
      expect(len(c.preheader), `${e.id} preheader`).toBeGreaterThanOrEqual(40);
      expect(len(c.preheader), `${e.id} preheader`).toBeLessThanOrEqual(100);
      // Lock-screen privacy: no figures or financial tokens in subject / preheader.
      for (const s of [c.subject, c.preheader]) {
        expect(s, e.id).not.toMatch(/[$€£]|\d/);
        expect(s, e.id).not.toMatch(/\{(safeToSpend|goalAmount|purchaseAmount|amount)[^}]*\}/);
        expect(s, e.id).not.toBe(s.toUpperCase());
      }
      expect(c.headline, e.id).toBe(c.headline.toUpperCase());
      expect(c.cta.label, e.id).toBe(c.cta.label.toUpperCase());
      for (const p of c.body) expect(p, `${e.id} body is sentence case`).not.toBe(p.toUpperCase());
    }
  });

  it('nudges inform and never shame', () => {
    for (const e of E.EMAIL_CONTRACTS.filter((x) => x.family === 'E05' || x.family === 'E03')) {
      const text = [e.copy.subject, e.copy.preheader, e.copy.headline, ...e.copy.body].join(' ').toLowerCase();
      for (const w of E.NUDGE_COPY_CONSTRAINT.bannedWords) expect(text, `${e.id}: ${w}`).not.toMatch(new RegExp(`\\b${w}\\b`));
    }
    expect(E.contractById('A06').copy.headline).toBe('THIS MAY NEED A SECOND LOOK.');
  });
});

describe('triggers and personalization', () => {
  it('every trigger contract is complete and points at a known event', () => {
    for (const e of E.EMAIL_CONTRACTS) {
      const t = e.trigger;
      expect(t.emailId).toBe(e.id);
      for (const k of ['eligibility', 'suppression', 'personalizationInputs'] as const) expect(t[k].length, `${e.id} ${k}`).toBeGreaterThan(0);
      for (const k of ['cooldown', 'ctaDestination', 'duplicateGuard'] as const) expect(t[k].trim().length, `${e.id} ${k}`).toBeGreaterThan(0);
      expect(E.TRIGGER_EVENTS.map((x) => x.id), e.id).toContain(t.triggerEvent);
      expect(['LIVE', 'DRY_RUN']).not.toContain(t.deliveryState);
    }
    // Auth mail stays with Supabase Auth.
    for (const id of ['A02', 'A08'] as const) expect(E.contractById(id).trigger.deliveryState).toBe('PROVIDER_OWNED');
    expect(E.TRIGGER_EVENTS.filter((t) => t.status === 'EXISTS_PROVIDER_OWNED').map((t) => t.id).sort()).toEqual(['AUTH_PASSWORD_RESET_REQUESTED', 'AUTH_SIGNUP_CONFIRMATION_REQUESTED']);
  });

  it('trigger sources are grounded in files that exist', () => {
    const adapter = read('src/projects/jurnl/runtime/state/supabaseAuthAdapter.ts');
    expect(adapter).toContain('resetPasswordForEmail');
    expect(adapter).toMatch(/auth\.signUp|\.signUp\(/);
    expect(read('src/projects/jurnl/data/f09/safeToSpend.ts')).toContain("'COMPLETE'");
    expect(read('src/projects/jurnl/data/f10/purchaseCheck.ts')).toContain('CHECK_IN');
    expect(read('src/projects/jurnl/data/repository/types.ts')).toContain('SAFE_TO_SPEND_RECALCULATED');
  });

  it('CTA destinations are real JURNL routes', () => {
    const routes = new Set<string>();
    for (const m of read('src/projects/jurnl/runtime/JurnlRuntimeRoot.tsx').matchAll(/path="([^"*]+)"/g)) routes.add(m[1]!);
    for (const f of ['src/projects/jurnl/data/f01/screens.ts', 'src/projects/jurnl/data/f02/screens.ts']) for (const m of read(f).matchAll(/route: '([^']+)'/g)) routes.add(m[1]!);
    const norm = (r: string) => r.replace(/\{[^}]+\}/g, ':id').replace(/:[A-Za-z]+/g, ':id');
    const known = new Set([...routes].map(norm));
    for (const e of E.EMAIL_CONTRACTS) {
      expect(known.has(norm(e.trigger.ctaDestination)), `${e.id} ${e.trigger.ctaDestination}`).toBe(true);
      for (const d of [e.copy.cta.destination, e.copy.secondary?.destination].filter(Boolean) as string[]) {
        const route = d.includes('→') ? d.split('→')[1]!.trim() : d;
        expect(known.has(norm(route)), `${e.id} ${route}`).toBe(true);
      }
    }
  });

  it('personalization never exceeds the family ceiling and financial context is P2+', () => {
    const rank = (p: string) => Number(p.slice(1));
    for (const e of E.EMAIL_CONTRACTS) {
      const max = Math.max(...[e.family, ...e.traits].map((f) => rank(E.familyById(f).maxPersonalization)));
      expect(rank(e.trigger.personalization), e.id).toBeLessThanOrEqual(max);
      const financial = e.trigger.personalizationInputs.some((i) => /safeToSpend|Amount|upcoming|moved/.test(i));
      if (financial) expect(rank(e.trigger.personalization), e.id).toBeGreaterThanOrEqual(2);
    }
  });
});

describe('assets and lineage', () => {
  it('plans assets only (no files), never for live content, inside the right lineage group', () => {
    for (const e of E.EMAIL_CONTRACTS) {
      const group = E.LINEAGE_GROUPS.find((g) => g.id === e.lineageGroup);
      expect(group, e.id).toBeDefined();
      expect(group!.emails, e.id).toContain(e.id);
      for (const a of e.assetPlan) {
        expect(a.assetClass, e.id).not.toBe('EMAIL_LIVE_CONTENT');
        if (a.lineageAction === 'REUSE' || a.lineageAction === 'DERIVE') {
          const founder = E.contractById(group!.founder!);
          expect(founder.id < e.id, `${e.id} reuses from an earlier email`).toBe(true);
        }
      }
      if (E.familyById(e.family).environmentArt === 'NONE') expect(e.assetPlan.some((a) => a.assetClass === 'EMAIL_ENVIRONMENT'), e.id).toBe(false);
    }
    // Contract folders and the empty implementation shelves stay image-free.
    // The first-8 review authorities live in their own folders and on the review boards.
    const imageRel = (dir: string, prefix = ''): string[] =>
      readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
        const rel = prefix ? `${prefix}/${d.name}` : d.name;
        return d.isDirectory() ? imageRel(path.join(dir, d.name), rel) : /\.(png|jpe?g|webp|gif)$/i.test(d.name) ? [rel] : [];
      });
    const images = imageRel(ROOT);
    const authorityFolder = /^A0[1-8]_/;
    const reviewBoard = new Set([
      'REVIEW/first-8-mobile-authorities.png',
      'REVIEW/first-8-desktop-authorities.png',
      'REVIEW/first-8-family-comparison.png',
    ]);
    for (const rel of images) {
      expect(authorityFolder.test(rel) || reviewBoard.has(rel), rel).toBe(true);
    }
    expect(images.filter((rel) => reviewBoard.has(rel))).toHaveLength(3);
  });

  it('shares lineage across the lifecycle', () => {
    expect(E.LINEAGE_GROUPS.find((g) => g.id === 'ARRIVAL')!.emails).toEqual(['A01', 'A04']);
    expect(E.LINEAGE_GROUPS.find((g) => g.id === 'SECURE_CORRESPONDENCE')!.emails).toEqual(['A02', 'A08']);
    expect(E.LINEAGE_GROUPS.find((g) => g.id === 'DESK_NOTE')!.emails).toEqual(['A03', 'A06']);
  });
});

describe('provider and fixtures', () => {
  it('inventories the real provider situation', () => {
    const verdict = (area: string) => E.PROVIDER_INVENTORY.find((p) => p.area.startsWith(area))!.verdict;
    expect(verdict('JURNL email delivery')).toBe('ABSENT');
    expect(verdict('Supabase Auth')).toBe('EXISTS_NOT_MOUNTED');
    expect(verdict('SITE 00 email registry')).toBe('EXISTS_RENDER_ONLY');
    expect(verdict('Resend / SendGrid')).toBe('STUB_ONLY');
    expect(read('api/_lib/site00Evolve/providers/adapters/index.ts')).toContain("resend: new StubEmailAdapter('resend')");
    expect(read('api/_lib/email/sendEmail.ts')).toContain('EMAIL_PROVIDER');
  });

  it('fixtures are demo-only and delivery refuses them; the dry run never sends', async () => {
    const provider = E.createDryRunEmailProvider();
    for (const [id, f] of Object.entries(E.EMAIL_FIXTURES)) {
      expect(f.payload.fixture, id).toBe('DEMO_ONLY');
      expect(JSON.stringify(f.payload)).not.toMatch(/@(?!example\.com)/);
      const c = E.contractById(f.email);
      expect(c.fixture).toBe(id);
      const request = { definition: { id: c.id, family: c.family, consentClass: c.trigger.consentClass, preferenceCategory: c.preferenceCategory, personalization: c.trigger.personalization, templateVersion: '0' }, recipient: E.FIXTURE_RECIPIENT, payload: f.payload, idempotencyKey: id };
      expect(E.deliveryGuard(request, () => true)?.status, id).toBe('REFUSED_FIXTURE');
      expect((await provider.send(request, { subject: '', preheader: '', html: '', text: '' })).status, id).toBe('REFUSED_FIXTURE');
    }
    const real = { definition: { id: 'A05' as const, family: 'E03' as const, consentClass: 'LIFECYCLE_SERVICE' as const, preferenceCategory: 'FINANCIAL_BRIEFS' as const, personalization: 'P3' as const, templateVersion: '0' }, recipient: { ...E.FIXTURE_RECIPIENT }, payload: { state: 'HEALTHY', values: {}, links: {} }, idempotencyKey: 'k' };
    expect(E.deliveryGuard(real, () => false)?.status).toBe('SUPPRESSED');
    expect(E.deliveryGuard({ ...real, recipient: { ...real.recipient, emailVerified: false } }, () => true)?.status).toBe('SUPPRESSED');
    expect(E.deliveryGuard(real, () => true)).toBeNull();
    expect((await provider.send(real, { subject: '', preheader: '', html: '', text: '' })).status).toBe('NOT_SENT_DRY_RUN');
  });

  it('the engine contains no send path', () => {
    const dir = path.resolve('shared/jurnl-email-engine');
    for (const f of readdirSync(dir)) {
      const src = readFileSync(path.join(dir, f), 'utf8');
      expect(src, f).not.toMatch(/\bfetch\(|from ['"](resend|@sendgrid\/mail|nodemailer|postmark|@supabase\/supabase-js)['"]|process\.env/);
    }
  });
});

/** Minimal JSON Schema check for the subset the manifest schemas use. */
function validate(schema: Record<string, unknown>, value: unknown, at = '$'): string[] {
  const s = schema as { type?: string | string[]; required?: string[]; properties?: Record<string, Record<string, unknown>>; items?: Record<string, unknown>; enum?: unknown[]; const?: unknown; pattern?: string; minLength?: number; minItems?: number; minimum?: number; maximum?: number };
  const errs: string[] = [];
  const typeOf = (v: unknown) => (v === null ? 'null' : Array.isArray(v) ? 'array' : Number.isInteger(v) ? 'integer' : typeof v);
  if (s.type) {
    const types = Array.isArray(s.type) ? s.type : [s.type];
    const t = typeOf(value);
    if (!types.includes(t) && !(t === 'integer' && types.includes('number'))) errs.push(`${at}: type ${t} not ${types.join('|')}`);
  }
  if (s.const !== undefined && value !== s.const) errs.push(`${at}: not const`);
  if (s.enum && !s.enum.includes(value)) errs.push(`${at}: ${String(value)} not in enum`);
  if (typeof value === 'string') {
    if (s.pattern && !new RegExp(s.pattern).test(value)) errs.push(`${at}: pattern`);
    if (s.minLength && value.length < s.minLength) errs.push(`${at}: minLength`);
  }
  if (typeof value === 'number') {
    if (s.minimum !== undefined && value < s.minimum) errs.push(`${at}: minimum`);
    if (s.maximum !== undefined && value > s.maximum) errs.push(`${at}: maximum`);
  }
  if (Array.isArray(value)) {
    if (s.minItems && value.length < s.minItems) errs.push(`${at}: minItems`);
    if (s.items) value.forEach((v, i) => errs.push(...validate(s.items!, v, `${at}[${i}]`)));
  }
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    for (const r of s.required ?? []) if (!(r in (value as object))) errs.push(`${at}: missing ${r}`);
    for (const [k, sub] of Object.entries(s.properties ?? {})) if (k in (value as object)) errs.push(...validate(sub, (value as Record<string, unknown>)[k], `${at}.${k}`));
  }
  return errs;
}

describe('manifests and exports', () => {
  it('seven manifests validate against their schemas', () => {
    const m = E.buildManifests();
    expect(Object.keys(m)).toEqual([...E.MANIFEST_IDS]);
    for (const id of E.MANIFEST_IDS) expect(validate(E.MANIFEST_SCHEMAS[id], m[id]), id).toEqual([]);
    const tpl = m['email-template-manifest'] as { templates: { implemented: boolean; live: boolean }[] };
    for (const t of tpl.templates) expect([t.implemented, t.live]).toEqual([false, false]);
  });

  it('JURNL EMAILS v1 has the canonical structure and is in sync with the source', () => {
    for (const d of ['00_SYSTEM', ...E.EMAIL_CONTRACTS.map((e) => e.folder), 'COMPONENTS', 'SIDEKICK_ASSETS', 'EMAIL_SHELLS', 'RESPONSIVE', 'COPY', 'MANIFESTS', 'REVIEW', 'IMPLEMENTATION']) {
      expect(existsSync(path.join(ROOT, d)), d).toBe(true);
    }
    for (const [rel, body] of Object.entries(buildJurnlEmailExports())) expect(readFileSync(path.join(ROOT, rel), 'utf8'), rel).toBe(body);
  });
});
