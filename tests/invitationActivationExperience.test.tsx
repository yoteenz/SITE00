/**
 * P0.SITE00.INVITATION-SYSTEM.INVITATION001-PHYSICAL-AND-IMMERSIVE-ACTIVATION-OPUS1
 * `/invite/:code` five-stage activation: journey logic, every presentation state, gating, privacy, accessibility.
 * Live interaction (focus, double submit, real backend handoff) is proven in the browser by
 * scripts/site00/invitation001/qa-invitation-activation.mjs.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import type { InvitationEntryPresentation } from '../shared/site00-invitation-system/contracts/entryPresentation';
import {
  InvitationExperience,
  maskEmail,
  stageForView,
  type InvitationExperienceProps,
  type InvitationView,
} from '../src/site00/pages/invitation/InvitationEntryPage';
import {
  FOUNDATION_PROGRESS_COPY,
  classifyFailure,
  clearInvitationDeviceRecord,
  formatMinor,
  foundationProgress,
  invitationAvailability,
  isFoundationRoute,
  isPlausibleEmail,
  readInvitationDeviceRecord,
  writeInvitationDeviceRecord,
} from '../src/site00/pages/invitation/invitationJourney';

const CODE = 'aio-office-inv001';

const presentation: InvitationEntryPresentation = {
  phase: 'WELCOME',
  resolution: 'VALID',
  collection_label: 'INVITATION 001',
  partner_presented_through: 'PRESENTED THROUGH ALL IN ONE ENTERPRISES INC',
  headline_candidates: ['YOUR BUSINESS HAS AN ADDRESS.'],
  primary_service: 'SITE 00 DIGITAL FOUNDATION',
  secondary_expansion: 'SITE 00 BLDR',
  activation: { can_begin: true, activation_id: null, requires_identity_verification: true },
  foundation: { route: null, artifact_state: null },
  next_address: { bldr_available: false },
  policy_version: '1.0.0-draft',
  invitation_system_version: '1.0.0',
};

const config = {
  base_price_minor: 50000,
  base_currency: 'USD',
  base_min_business_days: 2,
  base_max_business_days: 3,
  third_party_cost_notice: 'Provider subscriptions are typically paid directly to those providers.',
};

const noop = () => {};

function render(view: InvitationView, overrides: Partial<InvitationExperienceProps> = {}): string {
  const props: InvitationExperienceProps = {
    view,
    presentation,
    delivery: 'DEVELOPMENT_INLINE',
    inMemory: true,
    config,
    busy: false,
    error: null,
    announcement: 'STEP 02 OF 05: WELCOME TO YOUR NEXT ADDRESS',
    reducedMotion: false,
    onRetry: noop,
    onBegin: noop,
    onBack: noop,
    onSubmitEmail: noop,
    onSubmitCode: noop,
    onStartFresh: noop,
    ...overrides,
  };
  return renderToStaticMarkup(createElement(MemoryRouter, null, createElement(InvitationExperience, props)));
}

const text = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

function memoryStorage() {
  const map = new Map<string, string>();
  return {
    map,
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
  };
}

describe('Invitation resolution → availability', () => {
  it('opens valid and returning resolutions', () => {
    for (const r of ['VALID', 'RETURNING_USER', 'EXISTING_FOUNDATION', 'EXISTING_BLDR', 'ALREADY_ACTIVATED', 'VERIFICATION_REQUIRED'] as const) {
      expect(invitationAvailability(r)).toBe('OPEN');
    }
  });

  it('collapses unknown, revoked and unavailable into one treatment (no code enumeration)', () => {
    expect(invitationAvailability('UNKNOWN')).toBe('UNAVAILABLE');
    expect(invitationAvailability('REVOKED')).toBe('UNAVAILABLE');
    expect(invitationAvailability('UNAVAILABLE')).toBe('UNAVAILABLE');
  });

  it('distinguishes expired and paused so the visitor knows what to do', () => {
    expect(invitationAvailability('EXPIRED')).toBe('EXPIRED');
    expect(invitationAvailability('PAUSED')).toBe('PAUSED');
  });
});

describe('Foundation status from the real Digital Foundation payload', () => {
  const p = (artifact: Partial<{ state: string; intake_state: string; payment_state: string; completion_state: string }>) =>
    foundationProgress({
      artifact: { state: 'OPENED', intake_state: 'NOT_STARTED', payment_state: 'NONE', completion_state: 'NOT_STARTED', ...artifact },
    });

  it('maps payload states to returning-visitor progress', () => {
    expect(p({})).toBe('NOT_STARTED');
    expect(p({ state: 'INTAKE_IN_PROGRESS', intake_state: 'IN_PROGRESS' })).toBe('IN_PROGRESS');
    expect(p({ state: 'AWAITING_PAYMENT', intake_state: 'COMPLETE' })).toBe('AWAITING_PAYMENT');
    expect(p({ state: 'PAID', payment_state: 'PAID', intake_state: 'COMPLETE' })).toBe('IN_PRODUCTION');
    expect(p({ state: 'COMPLETE', payment_state: 'PAID', completion_state: 'COMPLETE' })).toBe('COMPLETE');
  });

  it('places completed Foundations on stage 05 and everything else on stage 04', () => {
    expect(FOUNDATION_PROGRESS_COPY.COMPLETE.stage).toBe(4);
    expect(FOUNDATION_PROGRESS_COPY.IN_PROGRESS.stage).toBe(3);
  });
});

describe('Helpers', () => {
  it('formats catalog minor units without inventing a price', () => {
    expect(formatMinor(50000, 'USD')).toBe('$500');
    expect(formatMinor(7550, 'USD')).toBe('$75.50');
  });

  it('only follows local Foundation routes', () => {
    expect(isFoundationRoute('/foundation/abcDEF123_-x')).toBe(true);
    expect(isFoundationRoute('https://evil.example/foundation/abc')).toBe(false);
    expect(isFoundationRoute('/foundation/../admin')).toBe(false);
    expect(isFoundationRoute('javascript:alert(1)')).toBe(false);
    expect(isFoundationRoute(null)).toBe(false);
  });

  it('validates email shape before any request', () => {
    expect(isPlausibleEmail('owner@business.com')).toBe(true);
    expect(isPlausibleEmail('owner@business')).toBe(false);
    expect(isPlausibleEmail('not-an-email')).toBe(false);
  });

  it('classifies API failures', () => {
    expect(classifyFailure(500, 'Invitation system unavailable')).toBe('SERVER');
    expect(classifyFailure(403, 'Verification failed')).toBe('VERIFICATION');
    expect(classifyFailure(403, 'Activation not found')).toBe('SESSION_LOST');
    expect(classifyFailure(400, 'Visit not valid for this invitation')).toBe('SESSION_LOST');
    expect(classifyFailure(400, 'Invitation not available')).toBe('UNAVAILABLE');
    expect(classifyFailure(404, 'ARTIFACT_NOT_FOUND')).toBe('SESSION_LOST');
  });

  it('masks the email shown on the verification step', () => {
    expect(maskEmail('founder.review@example.com')).toBe('f•••••@example.com');
    expect(maskEmail('a@b.co')).toBe('a••@b.co');
  });
});

describe('Device memory (privacy)', () => {
  it('stores only the visitor’s own Foundation route — no email, activation id or code', () => {
    const storage = memoryStorage();
    writeInvitationDeviceRecord(CODE, '/foundation/tok_ABCDEFGH12', storage);
    const raw = [...storage.map.values()][0];
    expect(raw).toContain('/foundation/tok_ABCDEFGH12');
    expect(raw).not.toMatch(/@|activation|secret|email/i);
    expect(readInvitationDeviceRecord(CODE, storage)?.foundation_route).toBe('/foundation/tok_ABCDEFGH12');
  });

  it('ignores tampered records and other codes', () => {
    const storage = memoryStorage();
    storage.setItem(`site00.invitation.v1.${CODE}`, JSON.stringify({ foundation_route: 'https://evil.example' }));
    expect(readInvitationDeviceRecord(CODE, storage)).toBeNull();
    storage.setItem(`site00.invitation.v1.${CODE}`, '{not json');
    expect(readInvitationDeviceRecord(CODE, storage)).toBeNull();
    writeInvitationDeviceRecord(CODE, '/foundation/tok_ABCDEFGH12', storage);
    expect(readInvitationDeviceRecord('another-code', storage)).toBeNull();
  });

  it('clears on "not you"', () => {
    const storage = memoryStorage();
    writeInvitationDeviceRecord(CODE, '/foundation/tok_ABCDEFGH12', storage);
    clearInvitationDeviceRecord(CODE, storage);
    expect(readInvitationDeviceRecord(CODE, storage)).toBeNull();
  });
});

describe('Five-stage presentation', () => {
  it('maps views to the canonical stages', () => {
    expect(stageForView({ kind: 'WELCOME' })).toBe(1);
    expect(stageForView({ kind: 'ACTIVATE_EMAIL' })).toBe(2);
    expect(stageForView({ kind: 'ACTIVATE_BLOCKED' })).toBe(2);
    expect(stageForView({ kind: 'ACTIVATE_VERIFY', activationId: 'a', email: 'e@x.co', developmentCode: null })).toBe(2);
    expect(stageForView({ kind: 'READY', route: '/foundation/x' })).toBe(3);
    expect(stageForView({ kind: 'RETURNING', route: '/foundation/x', progress: 'COMPLETE' })).toBe(4);
  });

  it('welcome: arrival copy, all five stages, campaign label, subtle partner line', () => {
    const html = render({ kind: 'WELCOME' });
    const t = text(html);
    expect(t).toContain('YOUR BUSINESS HAS AN ADDRESS.');
    expect(t).toContain('NOW GIVE IT A PRESENCE.');
    for (const label of ['SCAN THE INVITATION', 'WELCOME TO YOUR NEXT ADDRESS', 'ACTIVATE YOUR FOUNDATION', 'COMPLETE YOUR DIGITAL FOUNDATION', 'DISCOVER WHAT COMES NEXT']) {
      expect(t).toContain(label);
    }
    expect(t).toContain('INVITATION 001');
    expect(html).toMatch(/<footer[^>]*>.*PRESENTED THROUGH ALL IN ONE ENTERPRISES INC/s);
    expect(html).toMatch(/data-state="current" aria-current="step"><span class="s00inv__rail-n">02/);
  });

  it('welcome: discloses the catalog price, never "free", never charges on activation', () => {
    const t = text(render({ kind: 'WELCOME' }));
    expect(t).toContain('FROM $500');
    expect(t).toContain('2–3 business days');
    expect(t).toContain('ACTIVATING DOES NOT CHARGE YOU');
    expect(t).not.toMatch(/\bfree\b/i);
    expect(t).not.toMatch(/discount|% off/i);
  });

  it('welcome without catalog still states that price is shown before checkout', () => {
    const t = text(render({ kind: 'WELCOME' }, { config: null }));
    expect(t).not.toContain('$');
    expect(t).toContain('SHOWN BEFORE CHECKOUT');
  });

  it('welcome explains the shared code is not an account', () => {
    expect(text(render({ kind: 'WELCOME' }))).toContain('IT OPENS THIS INVITATION, NOT AN ACCOUNT');
  });

  it('unknown/revoked: generic copy with no campaign or partner details', () => {
    const html = render({ kind: 'UNAVAILABLE', availability: 'UNAVAILABLE' });
    const t = text(html.replace(/<div class="s00inv__world"[\s\S]*?<div class="s00inv__column">/, ''));
    expect(t).toContain('THIS INVITATION IS NOT AVAILABLE.');
    expect(html).toContain('s00inv__collection">INVITATION<');
    expect(t).not.toContain('INVITATION 001');
    expect(t).not.toContain('ALL IN ONE');
    expect(t).not.toContain('ACTIVATE YOUR FOUNDATION');
  });

  it('expired and paused states', () => {
    expect(text(render({ kind: 'UNAVAILABLE', availability: 'EXPIRED' }))).toContain('THIS INVITATION HAS EXPIRED.');
    expect(text(render({ kind: 'UNAVAILABLE', availability: 'PAUSED' }))).toContain('THIS INVITATION IS PAUSED.');
  });

  it('network and server failures offer retry and hide the progress rail', () => {
    const net = render({ kind: 'FAILED', failure: 'NETWORK' });
    expect(text(net)).toContain('YOU APPEAR TO BE OFFLINE.');
    expect(text(net)).toContain('TRY AGAIN');
    expect(net).not.toContain('s00inv__rail');
    expect(text(render({ kind: 'FAILED', failure: 'SERVER' }))).toContain('THIS INVITATION COULD NOT OPEN.');
  });

  it('production delivery pending: blocked state collects no email', () => {
    const html = render({ kind: 'ACTIVATE_BLOCKED' }, { delivery: 'PENDING_IDNTY' });
    expect(text(html)).toContain('VERIFICATION REQUIRED · NOT YET AVAILABLE');
    expect(html).not.toContain('type="email"');
    expect(html).not.toContain('foundation-handoff');
  });

  it('email step: labelled email input with autocomplete', () => {
    const html = render({ kind: 'ACTIVATE_EMAIL' });
    expect(html).toContain('for="s00inv-email"');
    expect(html).toMatch(/id="s00inv-email"[^>]*type="email"/);
    expect(html).toContain('autoComplete="email"');
    expect(html).not.toContain('foundation-handoff');
  });

  it('verify step: development code is labelled as development and absent otherwise', () => {
    const withCode = render({ kind: 'ACTIVATE_VERIFY', activationId: 'act', email: 'owner@business.com', developmentCode: 'B3975473' });
    expect(text(withCode)).toContain('DEVELOPMENT ONLY · NOT PRODUCTION DELIVERY');
    expect(text(withCode)).toContain('B3975473');
    expect(withCode).toContain('autoComplete="one-time-code"');
    expect(text(withCode)).toContain('o••••@business.com');
    expect(text(withCode)).not.toContain('owner@business.com');

    const without = render({ kind: 'ACTIVATE_VERIFY', activationId: 'act', email: 'owner@business.com', developmentCode: null });
    expect(without).not.toContain('s00inv__devpanel');
    expect(without).not.toContain('foundation-handoff');
  });

  it('verification error is announced', () => {
    const html = render(
      { kind: 'ACTIVATE_VERIFY', activationId: 'act', email: 'owner@business.com', developmentCode: null },
      { error: 'THAT CODE DID NOT MATCH. CHECK IT AND TRY AGAIN.' },
    );
    expect(html).toMatch(/role="alert"[^>]*>THAT CODE DID NOT MATCH/);
  });

  it('ready: hands off to the existing Foundation route, discloses in-memory persistence, offers BLDR', () => {
    const html = render({ kind: 'READY', route: '/foundation/tok_ABCDEFGH12' });
    expect(html).toMatch(/data-testid="foundation-handoff" href="\/foundation\/tok_ABCDEFGH12"/);
    expect(text(html)).toContain('ACTIVATIONS ARE HELD IN SERVER MEMORY');
    expect(html).toContain('href="/bldr"');
    expect(text(html)).toContain('Exploring it does not start a project or a charge.');
    expect(text(render({ kind: 'READY', route: '/foundation/tok_ABCDEFGH12' }, { inMemory: false }))).not.toContain('SERVER MEMORY');
  });

  it('returning: copy follows Foundation progress, with "not you" escape', () => {
    for (const progress of ['NOT_STARTED', 'IN_PROGRESS', 'AWAITING_PAYMENT', 'IN_PRODUCTION', 'COMPLETE'] as const) {
      const t = text(render({ kind: 'RETURNING', route: '/foundation/tok_ABCDEFGH12', progress }));
      expect(t).toContain(FOUNDATION_PROGRESS_COPY[progress].headline);
      expect(t).toContain(FOUNDATION_PROGRESS_COPY[progress].action);
      expect(t).toContain('NOT YOU? START A NEW ACTIVATION');
    }
    expect(text(render({ kind: 'RETURNING', route: '/foundation/tok_ABCDEFGH12', progress: null }))).toContain('could not confirm');
  });

  it('stale device record: honest reset message', () => {
    expect(text(render({ kind: 'RESET' }))).toContain('WE COULD NOT FIND YOUR FOUNDATION.');
  });

  it('accessibility scaffolding: one h1, polite live region, decorative world hidden', () => {
    const html = render({ kind: 'WELCOME' });
    expect(html.match(/<h1/g)?.length).toBe(1);
    expect(html).toContain('aria-live="polite"');
    expect(html).toMatch(/class="s00inv__world"[^>]*aria-hidden="true"/);
    expect(html).toContain('aria-label="Invitation progress"');
  });

  it('reduced motion is reflected on the root', () => {
    expect(render({ kind: 'WELCOME' }, { reducedMotion: true })).toContain('data-motion="reduced"');
    expect(render({ kind: 'WELCOME' })).toContain('data-motion="full"');
  });
});

describe('Source guardrails', () => {
  const root = path.resolve(__dirname, '..');
  const page = readFileSync(path.join(root, 'src/site00/pages/invitation/InvitationEntryPage.tsx'), 'utf8');
  const css = readFileSync(path.join(root, 'src/site00/styles/site00-invitation.css'), 'utf8');
  const routes = readFileSync(path.join(root, 'src/routes/Site00Routes.tsx'), 'utf8');

  it('has a reduced-motion stylesheet path and no Three.js', () => {
    expect(css).toContain('@media (prefers-reduced-motion: reduce)');
    expect(page).not.toMatch(/from 'three'|@react-three/);
  });

  it('never reads the activation id or email back from storage', () => {
    expect(page).not.toMatch(/localStorage\.setItem/);
  });

  it('renders natively on phones (no scaled presentation artboard around the invite route)', () => {
    const start = routes.indexOf('path={SITE00_ROUTES.invitationEntry}');
    const block = routes.slice(start, routes.indexOf('/>', routes.indexOf('</Site00Layout>', start)));
    expect(block).toContain('<InvitationEntryPage />');
    expect(block).not.toContain('Site00PublicRouteShell');
  });
});

describe('API origin', () => {
  it('routes every invitation fetch through site00ApiUrl (static hosting has no /api)', () => {
    const journey = readFileSync(path.resolve(__dirname, '../src/site00/pages/invitation/invitationJourney.ts'), 'utf8');
    expect(journey).toContain('fetch(site00ApiUrl(path), init)');
    expect(journey.match(/fetch\(/g)?.length).toBe(1);
  });
});
