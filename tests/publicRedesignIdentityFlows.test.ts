/**
 * IDNTY redesign: state continuity model, question progression, conditional OTHER, product corrections,
 * and the honest Build Ready verification boundary.
 */
import { describe, expect, it } from 'vitest';
import {
  IDNTY_ASSESSMENT_STATES,
  IDNTY_ASSESSMENT_STATE_LIST,
  IDNTY_EVOLUTION_PATHWAYS,
  idntyAssessmentPath,
} from '../src/site00/config/idnty-assessment';
import {
  CONDITION_SEGMENTS,
  IDENTITY_PUBLIC_STATES,
  IDENTITY_STATE_ORDER,
  identityQuestionCounter,
  identityStateMeta,
  identityStepPresentation,
  isOtherSelected,
} from '../src/site00/config/idnty-public-redesign';
import {
  IDNTY_INVESTMENT_ACTIONS,
  IDNTY_HANDOFF_COPY,
  resolveIdntyStateDestination,
} from '../src/site00/config/idnty-diagnostic';
import { IDNTY_INVESTMENT_TIERS } from '../src/site00/config/identity';
import {
  IDENTITY_AUTHORITY_DOMAINS,
  IDENTITY_AUTHORITY_DOMAIN_ORDER,
  IDENTITY_AUTHORITY_VERIFICATION_BACKEND_AVAILABLE,
  authorityCheckStatus,
  deriveClientAuthorityStatus,
  emptyIdentityEvidence,
  evidenceAnswerKey,
  identityEvidenceFromAnswers,
  identityEvidenceToAnswers,
  isBldrUnlockedByVerification,
  resolveDisplayedAuthorityStatus,
  summarizeIdentityEvidence,
  unavailableIdentityAuthorityGateway,
  type ServerIdentityAuthoritySnapshot,
} from '../src/site00/lib/identityAuthorityVerification';

const ids = (slug: Parameters<typeof identityStateMeta>[0]) => IDNTY_ASSESSMENT_STATES[slug].steps.map((s) => s.id);

describe('state selection + continuity model', () => {
  it('keeps the four canonical states in 00–03 order with stable machine identities', () => {
    expect(IDENTITY_STATE_ORDER.map((s) => IDENTITY_PUBLIC_STATES[s].code)).toEqual(['00', '01', '02', '03']);
    expect(IDENTITY_STATE_ORDER.map((s) => IDENTITY_PUBLIC_STATES[s].machine)).toEqual([
      'foundation',
      'partial',
      'evolution',
      'authority',
    ]);
    expect(new Set(IDENTITY_STATE_ORDER.map((s) => IDENTITY_PUBLIC_STATES[s].machine)).size).toBe(4);
  });

  it('takes pricing from the investment config, not from imagery or copy', () => {
    expect(IDENTITY_PUBLIC_STATES['starting-at-zero'].investmentLabel).toBe(IDNTY_INVESTMENT_TIERS[0].priceLabel);
    expect(IDENTITY_PUBLIC_STATES['some-pieces-exist'].investmentLabel).toBe(IDNTY_INVESTMENT_TIERS[1].priceLabel);
    expect(IDENTITY_PUBLIC_STATES['ready-for-evolution'].investmentLabel).toBe(IDNTY_INVESTMENT_TIERS[2].priceLabel);
    expect(IDENTITY_PUBLIC_STATES['build-ready'].investmentLabel).toBe('NO IDNTY PURCHASE REQUIRED');
  });

  it('every step path stays inside the selected state route family (no separate intake app)', () => {
    for (const state of IDNTY_ASSESSMENT_STATE_LIST) {
      for (const step of state.steps) {
        expect(idntyAssessmentPath(state.slug, step.id)).toBe(`/idnty/${state.slug}/${step.id}`);
      }
    }
  });
});

describe('question progression is compact and secondary', () => {
  it('formats QUESTION nn OF nn for every step', () => {
    expect(identityQuestionCounter('starting-at-zero', 'goal')).toBe('QUESTION 01 OF 04');
    expect(identityQuestionCounter('starting-at-zero', 'budget')).toBe('QUESTION 04 OF 04');
    expect(identityQuestionCounter('some-pieces-exist', 'gaps')).toBe('QUESTION 03 OF 03');
    expect(identityQuestionCounter('ready-for-evolution', 'timeline')).toBe('QUESTION 03 OF 03');
    expect(identityQuestionCounter('build-ready', 'evidence')).toBe('QUESTION 02 OF 03');
    expect(identityQuestionCounter('starting-at-zero', 'nope')).toBeNull();
  });
});

describe('approved product corrections', () => {
  it('FOUNDATION: Goal → Audience → Timeline → Budget (then Review), no WHAT ARE YOU BUILDING?', () => {
    expect(ids('starting-at-zero')).toEqual(['goal', 'audience', 'timeline', 'budget']);
    const serialized = JSON.stringify(IDNTY_ASSESSMENT_STATES['starting-at-zero']);
    expect(serialized).not.toMatch(/WHAT ARE YOU BUILDING/);
    expect(IDNTY_ASSESSMENT_STATES['starting-at-zero'].steps.some((s) => s.id === 'project')).toBe(false);
  });

  it('FOUNDATION primary goal is a single-select (one primary goal)', () => {
    expect(IDNTY_ASSESSMENT_STATES['starting-at-zero'].steps[0]).toMatchObject({ id: 'goal', type: 'single' });
  });

  it('REFINE: Assets → Condition → Gaps; OTHER is conditional, not a screen', () => {
    expect(ids('some-pieces-exist')).toEqual(['assets', 'cohesion-diagnostic', 'gaps']);
    const assets = IDNTY_ASSESSMENT_STATES['some-pieces-exist'].steps[0];
    expect(assets.options?.some((o) => o.id === 'other')).toBe(true);
    expect(assets.conditionalOtherKey).toBe('other-specify');
    expect(ids('some-pieces-exist')).not.toContain('other-specify');
  });

  it('conditional OTHER shows only when OTHER is selected', () => {
    expect(isOtherSelected(['logo', 'other'])).toBe(true);
    expect(isOtherSelected(['logo', 'color'])).toBe(false);
    expect(isOtherSelected('other')).toBe(true);
    expect(isOtherSelected(undefined)).toBe(false);
    expect(isOtherSelected([])).toBe(false);
  });

  it('READY FOR EVOLUTION: Areas → Goals → Timeline using IDNTY-owned domains only', () => {
    expect(ids('ready-for-evolution')).toEqual(['pathways', 'goals', 'timeline']);
    expect(IDNTY_EVOLUTION_PATHWAYS.map((o) => o.id)).toEqual(['brand-strategy', 'visual-identity', 'brand-messaging']);
    const labels = JSON.stringify(IDNTY_ASSESSMENT_STATES['ready-for-evolution']);
    for (const foreign of ['GROWTH SYSTEMS', 'DIGITAL EXPERIENCE', 'LAUNCH & EVOLVE', 'INSTALL', 'TRANSFORM']) {
      expect(labels).not.toContain(foreign);
    }
  });

  it('BUILD READY: Verification → Evidence → Authority Check; legacy services/scope/timeline removed', () => {
    expect(ids('build-ready')).toEqual(['verification', 'evidence', 'authority-check']);
    const serialized = JSON.stringify(IDNTY_ASSESSMENT_STATES['build-ready']);
    for (const legacy of [
      'HOW CAN SITE 00 BUILD YOUR VISION',
      'DESCRIBE WHAT NEEDS TO BE BUILT',
      'STRATEGY & PLANNING',
      'MARKETING & GROWTH',
      'LAUNCH & SUPPORT',
    ]) {
      expect(serialized).not.toContain(legacy);
    }
    expect(IDNTY_ASSESSMENT_STATES['build-ready'].steps.map((s) => s.id)).not.toEqual(
      expect.arrayContaining(['services']),
    );
    expect(IDNTY_ASSESSMENT_STATES['build-ready'].steps.every((s) => s.type === 'custom')).toBe(true);
  });

  it('BUILD READY never uses percentages as authority', () => {
    const build = JSON.stringify([IDNTY_ASSESSMENT_STATES['build-ready'], IDENTITY_PUBLIC_STATES['build-ready']]);
    expect(build).not.toMatch(/\d+\s*%|READY\s*%|PERCENT/i);
  });

  it('BUILD READY no longer routes straight into BLDR or claims IDENTITY VERIFIED', () => {
    expect(resolveIdntyStateDestination('build-ready', false)).toBe('/idnty/build-ready');
    expect(resolveIdntyStateDestination('build-ready', false)).not.toMatch(/bldr/);
    expect(IDNTY_INVESTMENT_ACTIONS['build-ready'].cta).toBe('BEGIN VERIFICATION →');
    expect(IDNTY_INVESTMENT_ACTIONS['build-ready'].statusLabel).not.toMatch(/VERIFIED/);
    expect(IDNTY_INVESTMENT_ACTIONS['build-ready'].verified).toBeUndefined();
    expect(IDNTY_HANDOFF_COPY['build-ready'].requirement).not.toMatch(/VERIFIED/);
    expect(IDNTY_HANDOFF_COPY['build-ready'].cta).not.toMatch(/ENTER BLDR/);
    const meta = JSON.stringify(IDENTITY_PUBLIC_STATES['build-ready']);
    expect(meta).not.toMatch(/VERIFIED|LOCKED AND|ENTER BLDR/);
    expect(IDNTY_ASSESSMENT_STATES['build-ready'].recommendedActions.some((a) => /BLDR/.test(a.label))).toBe(false);
  });

  it('other states keep their destinations', () => {
    expect(resolveIdntyStateDestination('starting-at-zero', false)).toBe('/idnty/starting-at-zero');
    expect(resolveIdntyStateDestination('some-pieces', false)).toBe('/idnty/some-pieces-exist');
    expect(resolveIdntyStateDestination('ready-evolution', false)).toBe('/idnty/ready-for-evolution');
  });
});

describe('selector grammar per step', () => {
  it('assigns an icon/grammar for every redesigned question', () => {
    for (const [slug, stepIds] of [
      ['starting-at-zero', ['goal', 'audience', 'timeline', 'budget']],
      ['some-pieces-exist', ['assets', 'cohesion-diagnostic', 'gaps']],
      ['ready-for-evolution', ['pathways', 'goals', 'timeline']],
    ] as const) {
      for (const stepId of stepIds) {
        expect(identityStepPresentation(slug, stepId), `${slug}:${stepId}`).toBeDefined();
      }
    }
    // every option of an icon-driven step has an icon
    const goal = identityStepPresentation('starting-at-zero', 'goal')!;
    for (const o of IDNTY_ASSESSMENT_STATES['starting-at-zero'].steps[0].options!) expect(goal.icons?.[o.id]).toBeTruthy();
  });

  it('condition meter is visual only and ordered (missing < scattered < cohesive)', () => {
    expect(CONDITION_SEGMENTS['missing-key-pieces']).toBeLessThan(CONDITION_SEGMENTS['scattered-pieces']);
    expect(CONDITION_SEGMENTS['scattered-pieces']).toBeLessThan(CONDITION_SEGMENTS['mostly-cohesive']);
  });
});

describe('BUILD READY — honest provisional verification model', () => {
  it('declares that no verification backend exists', () => {
    expect(IDENTITY_AUTHORITY_VERIFICATION_BACKEND_AVAILABLE).toBe(false);
    expect(unavailableIdentityAuthorityGateway.available).toBe(false);
  });

  it('covers the five identity domains in order', () => {
    expect(IDENTITY_AUTHORITY_DOMAIN_ORDER).toEqual(['STRATEGY', 'VISUAL', 'VOICE', 'VALUES', 'EXPERIENCE']);
    expect(IDENTITY_AUTHORITY_DOMAINS.map((d) => d.id)).toEqual(IDENTITY_AUTHORITY_DOMAIN_ORDER);
  });

  it('derives only descriptive client statuses from user-supplied evidence', () => {
    const none = emptyIdentityEvidence();
    expect(deriveClientAuthorityStatus(none, 'VOICE')).toBe('NOT_PROVIDED');

    const some = identityEvidenceFromAnswers({ [evidenceAnswerKey('STRATEGY')]: ['positioning', 'brand-strategy'] });
    expect(deriveClientAuthorityStatus(some, 'STRATEGY')).toBe('EVIDENCE_RECEIVED');

    const flagged = { ...some, reviewFlags: ['STRATEGY' as const] };
    expect(deriveClientAuthorityStatus(flagged, 'STRATEGY')).toBe('REVIEW_REQUIRED');

    for (const domain of IDENTITY_AUTHORITY_DOMAIN_ORDER) {
      for (const ev of [none, some, flagged]) {
        expect(deriveClientAuthorityStatus(ev, domain)).not.toBe('AUTHORITY_ESTABLISHED');
        expect(deriveClientAuthorityStatus(ev, domain)).not.toBe('PENDING_REVIEW');
      }
    }
  });

  it('authority check reports PENDING REVIEW / GAP IDENTIFIED — never ESTABLISHED — without a server snapshot', () => {
    const ev = identityEvidenceFromAnswers({ [evidenceAnswerKey('VISUAL')]: ['logo-files'] });
    expect(authorityCheckStatus(ev, 'VISUAL', null)).toBe('PENDING_REVIEW');
    expect(authorityCheckStatus(ev, 'VOICE', null)).toBe('GAP_IDENTIFIED');
    expect(authorityCheckStatus({ ...ev, reviewFlags: ['VOICE'] }, 'VOICE', null)).toBe('REVIEW_REQUIRED');
    for (const d of IDENTITY_AUTHORITY_DOMAIN_ORDER) {
      expect(authorityCheckStatus(ev, d, null)).not.toBe('AUTHORITY_ESTABLISHED');
    }
  });

  it('AUTHORITY_ESTABLISHED is representable only from a server snapshot', () => {
    const snapshot: ServerIdentityAuthoritySnapshot = {
      intakeId: 'srv-1',
      reviewedAt: '2026-10-01T00:00:00Z',
      domains: { STRATEGY: 'AUTHORITY_ESTABLISHED', VISUAL: 'AUTHORITY_ESTABLISHED', VOICE: 'GAP_IDENTIFIED', VALUES: 'AUTHORITY_ESTABLISHED', EXPERIENCE: 'REVIEW_REQUIRED' },
    };
    expect(resolveDisplayedAuthorityStatus(emptyIdentityEvidence(), 'STRATEGY', snapshot)).toBe('AUTHORITY_ESTABLISHED');
    expect(resolveDisplayedAuthorityStatus(emptyIdentityEvidence(), 'STRATEGY', null)).toBe('NOT_PROVIDED');
  });

  it('never unlocks BLDR from client-only state', () => {
    expect(isBldrUnlockedByVerification(null)).toBe(false);
    const partial: ServerIdentityAuthoritySnapshot = {
      intakeId: 'srv-1',
      reviewedAt: null,
      domains: { STRATEGY: 'AUTHORITY_ESTABLISHED', VISUAL: 'AUTHORITY_ESTABLISHED', VOICE: 'GAP_IDENTIFIED', VALUES: 'AUTHORITY_ESTABLISHED', EXPERIENCE: 'AUTHORITY_ESTABLISHED' },
    };
    expect(isBldrUnlockedByVerification(partial)).toBe(false);
    const all = { ...partial, domains: { ...partial.domains, VOICE: 'AUTHORITY_ESTABLISHED' as const } };
    expect(isBldrUnlockedByVerification(all)).toBe(true);
  });

  it('submission for verification reports the capability unavailable and never fakes success', async () => {
    const result = await unavailableIdentityAuthorityGateway.submitForVerification({ intakeId: 'x', evidence: emptyIdentityEvidence() });
    expect(result).toEqual({ ok: false, reason: 'BACKEND_UNAVAILABLE' });
    expect(await unavailableIdentityAuthorityGateway.fetchSnapshot('x')).toBeNull();
  });

  it('summarizes evidence as counts, never a score or percentage', () => {
    const ev = identityEvidenceFromAnswers({
      [evidenceAnswerKey('STRATEGY')]: ['positioning'],
      [evidenceAnswerKey('VISUAL')]: ['logo-files'],
      [evidenceAnswerKey('VALUES')]: ['core-values'],
    });
    expect(summarizeIdentityEvidence(ev)).toEqual({ provided: 3, requireReview: 0, notProvided: 2 });
    expect(Object.keys(summarizeIdentityEvidence(ev)).join()).not.toMatch(/percent|score|ready/i);
  });

  it('round-trips through the existing answer store and ignores unknown source ids', () => {
    const ev = identityEvidenceFromAnswers({
      [evidenceAnswerKey('VOICE')]: ['messaging', 'bogus-source'],
      'review-flags': ['VOICE', 'NOPE'],
    });
    expect(ev.sourcesByDomain.VOICE).toEqual(['messaging']);
    expect(ev.reviewFlags).toEqual(['VOICE']);
    expect(identityEvidenceFromAnswers(identityEvidenceToAnswers(ev))).toEqual(ev);
  });
});
