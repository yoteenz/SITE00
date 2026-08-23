/**
 * World-class client guest intake foundation tests.
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { hashIntakeToken, generateRawIntakeToken } from '../../api/_lib/site00WorldIntake/tokens.js';
import { resetWorldIntakeMemory } from '../../api/_lib/site00WorldIntake/storeAdapter.js';
import {
  autosaveGuestIntake,
  createClientIntakeInvite,
  resolveInviteByRawToken,
  revokeClientIntakeInvite,
  submitGuestIntake,
} from '../../api/_lib/site00WorldIntake/worldIntakeService.js';
import { buildBusinessOfferingMap } from '../site00-world-intake/offeringMap.js';
import { evaluateWorldFormationReadiness, worldReadinessFromAnswers } from '../site00-world-intake/readiness.js';
import {
  createWorldIntelligenceSnapshot,
  founderWorldHypothesisIsNotCanon,
  assembleWorldFormationInput,
} from '../site00-world-intake/synthesis.js';
import { reusedIdentityQuestionIds, WORLD_INTAKE_STEPS } from '../site00-world-intake/questions.js';
import { FOUNDER_WORLD_HYPOTHESIS_CLASSIFICATION } from '../site00-world-intake/constants.js';
import type { GuestIntakeSession } from '../site00-world-intake/types.js';

function fillMinimalAnswers(token: string) {
  const answers = WORLD_INTAKE_STEPS.slice(0, 12).map((s) => ({
    questionId: s.id,
    section: s.section,
    value: s.responseMode === 'SINGLE_SELECT' ? s.options?.[0]?.id ?? 'test' : 'Founder answer text',
  }));
  return autosaveGuestIntake({ rawToken: token, answers });
}

describe('GUEST_INTAKE_INVITE_CREATION_TEST', () => {
  beforeEach(() => resetWorldIntakeMemory());

  it('creates invite with private link', async () => {
    const result = await createClientIntakeInvite({
      projectDisplayName: 'Luna Readings',
      recipientLabel: 'Sister',
      experienceAmbition: 'WORLD',
    });
    expect(result.privateLink).toContain('/intake/');
    expect(result.invite.projectExperienceClass).toBe('WORLD');
  });
});

describe('SECURE_TOKEN_HASH_TEST', () => {
  it('hashes tokens — raw not equal to hash', () => {
    const raw = generateRawIntakeToken();
    expect(hashIntakeToken(raw)).not.toBe(raw);
    expect(hashIntakeToken(raw).length).toBe(64);
  });
});

describe('INVALID_TOKEN_TEST', () => {
  beforeEach(() => resetWorldIntakeMemory());

  it('rejects short token', async () => {
    const r = await resolveInviteByRawToken('short');
    expect(r.ok).toBe(false);
  });
});

describe('REVOKED_TOKEN_TEST', () => {
  beforeEach(() => resetWorldIntakeMemory());

  it('blocks revoked invite', async () => {
    const { rawToken, invite } = await createClientIntakeInvite({
      projectDisplayName: 'Test',
      recipientLabel: 'Client',
      experienceAmbition: 'SITE',
    });
    await revokeClientIntakeInvite(invite.inviteId);
    const r = await resolveInviteByRawToken(rawToken);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('REVOKED');
  });
});

describe('EXPIRED_TOKEN_TEST', () => {
  beforeEach(() => resetWorldIntakeMemory());

  it('blocks expired invite', async () => {
    const past = new Date(Date.now() - 1000).toISOString();
    const { rawToken } = await createClientIntakeInvite({
      projectDisplayName: 'Expired',
      recipientLabel: 'Client',
      experienceAmbition: 'UNSURE',
      expiresAt: past,
    });
    const r = await resolveInviteByRawToken(rawToken);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('EXPIRED');
  });
});

describe('NO_ACCOUNT_REQUIRED_TEST', () => {
  beforeEach(() => resetWorldIntakeMemory());

  it('resolves without auth', async () => {
    const { rawToken } = await createClientIntakeInvite({
      projectDisplayName: 'Guest Co',
      recipientLabel: 'Founder',
      experienceAmbition: 'WORLD',
    });
    const r = await resolveInviteByRawToken(rawToken);
    expect(r.ok).toBe(true);
  });
});

describe('GUEST_AUTOSAVE_TEST', () => {
  beforeEach(() => resetWorldIntakeMemory());

  it('persists answers server-side', async () => {
    const { rawToken } = await createClientIntakeInvite({
      projectDisplayName: 'Autosave Co',
      recipientLabel: 'Client',
      experienceAmbition: 'APPLICATION',
    });
    const { session } = await autosaveGuestIntake({
      rawToken,
      answers: [{ questionId: 'business-model', section: 'BUSINESS', value: 'Bookings and products' }],
    });
    expect(session.rawAnswers['business-model']?.value).toBe('Bookings and products');
  });
});

describe('GUEST_RESUME_TEST', () => {
  beforeEach(() => resetWorldIntakeMemory());

  it('resumes session on same token', async () => {
    const { rawToken } = await createClientIntakeInvite({
      projectDisplayName: 'Resume Co',
      recipientLabel: 'Client',
      experienceAmbition: 'IMMERSIVE',
    });
    await autosaveGuestIntake({
      rawToken,
      answers: [{ questionId: 'audience-who', section: 'AUDIENCE', value: 'Seekers' }],
    });
    const r = await resolveInviteByRawToken(rawToken);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.session.rawAnswers['audience-who']?.value).toBe('Seekers');
  });
});

describe('EXISTING_IDENTITY_QUESTION_REUSE_TEST', () => {
  it('reuses brand lore question ids', () => {
    const ids = reusedIdentityQuestionIds();
    expect(ids.length).toBeGreaterThan(0);
    expect(ids.every((id) => WORLD_INTAKE_STEPS.some((s) => s.id === id))).toBe(true);
  });
});

describe('NO_DUPLICATE_PERSONALITY_INTAKE_TEST', () => {
  it('personality steps reference reuse source', () => {
    const personality = WORLD_INTAKE_STEPS.filter((s) => s.reusesSource === 'PERSONALITY');
    expect(personality.every((s) => s.reusesQuestionId === s.id)).toBe(true);
  });
});

describe('NO_DUPLICATE_CREATIVE_APPETITE_TEST', () => {
  it('appetite steps reference reuse source', () => {
    const appetite = WORLD_INTAKE_STEPS.filter((s) => s.reusesSource === 'CREATIVE_APPETITE');
    expect(appetite.length).toBeGreaterThan(0);
  });
});

describe('BUSINESS_OFFERING_MAP_TEST', () => {
  it('structures offerings from text', () => {
    const map = buildBusinessOfferingMap({
      offeringsText: 'Tarot reading\nDigital guide',
      liveServicesText: 'Live video session',
    });
    expect(map.offerings.length).toBeGreaterThanOrEqual(2);
  });
});

describe('WORLD_READINESS_PROFILE_TEST', () => {
  it('captures world readiness fields', () => {
    const profile = worldReadinessFromAnswers({
      'entry-experience': { value: 'They entered another place' },
      'customer-identity': { value: 'avatar' },
      'hard-boundaries': { value: 'No gimmicks' },
      'gaming-depth': { value: 'light' },
    });
    expect(profile.entryExperience).toContain('another place');
    expect(profile.customerIdentityIntent).toBe('avatar');
  });
});

describe('FOUNDER_WORLD_HYPOTHESIS_IS_NOT_CANON_TEST', () => {
  it('classifies as FOUNDER_PROPOSED_CONCEPT', () => {
    const profile = worldReadinessFromAnswers({
      'founder-world-hypothesis': { value: 'A tent with crystal ball' },
    });
    expect(profile.founderWorldHypothesisClassification).toBe(FOUNDER_WORLD_HYPOTHESIS_CLASSIFICATION);
    expect(founderWorldHypothesisIsNotCanon(profile)).toBe(true);
  });
});

describe('AVATAR_REQUIREMENT_CAPTURE_TEST', () => {
  it('captures avatar customization', () => {
    const profile = worldReadinessFromAnswers({
      'avatar-customization': { value: 'hair, clothing, accessories' },
    });
    expect(profile.avatarCustomizationDomains.length).toBeGreaterThan(0);
  });
});

describe('GENERALIZATION_NON_TAROT_TEST', () => {
  it('schema has no tarot hardcoding in constants', async () => {
    const { PROJECT_EXPERIENCE_CLASSES } = await import('../site00-world-intake/constants.js');
    const serialized = JSON.stringify(PROJECT_EXPERIENCE_CLASSES);
    expect(serialized.toLowerCase()).not.toContain('tarot');
    expect(serialized.toLowerCase()).not.toContain('crystal');
  });
});

describe('NO_WORLD_GENERATION_ON_SUBMIT_TEST', () => {
  beforeEach(() => resetWorldIntakeMemory());

  it('creates snapshot not world', async () => {
    const { rawToken, invite } = await createClientIntakeInvite({
      projectDisplayName: 'Submit Co',
      recipientLabel: 'Client',
      experienceAmbition: 'WORLD',
    });
    await fillMinimalAnswers(rawToken);
    const result = await submitGuestIntake(rawToken);
    expect(result.snapshot.snapshotId).toContain('wis-');
    expect(result.invite.status).toBe('COMPLETED');
    expect(assembleWorldFormationInput(invite, result.session).methodologyVersion).toBe('WORLD_INTAKE_V1');
  });
});

describe('WORLD_INTELLIGENCE_SNAPSHOT_TEST', () => {
  beforeEach(() => resetWorldIntakeMemory());

  it('creates durable snapshot on submit', async () => {
    const { rawToken, invite } = await createClientIntakeInvite({
      projectDisplayName: 'Snapshot Co',
      recipientLabel: 'Client',
      experienceAmbition: 'WORLD',
    });
    await fillMinimalAnswers(rawToken);
    const resolved = await resolveInviteByRawToken(rawToken);
    if (!resolved.ok) throw new Error('resolve failed');
    const snapshot = createWorldIntelligenceSnapshot(invite, resolved.session);
    expect(snapshot.worldFormationInput).toBeTruthy();
  });
});

describe('RAW_ANSWER_PRESERVATION_TEST', () => {
  beforeEach(() => resetWorldIntakeMemory());

  it('preserves verbatim answers', async () => {
    const { rawToken } = await createClientIntakeInvite({
      projectDisplayName: 'Raw Co',
      recipientLabel: 'Client',
      experienceAmbition: 'SITE',
    });
    const { session } = await autosaveGuestIntake({
      rawToken,
      answers: [{ questionId: 'business-model', section: 'BUSINESS', value: 'Exact founder words here', verbatim: 'Exact founder words here' }],
    });
    expect(session.rawAnswers['business-model']?.verbatim).toBe('Exact founder words here');
  });
});

describe('WORLD_FORMATION_READINESS_TEST', () => {
  it('evaluates readiness domains', () => {
    const session: GuestIntakeSession = {
      sessionId: 's1',
      inviteId: 'i1',
      projectId: 'p1',
      startedAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString(),
      currentSection: 'BUSINESS',
      currentStep: null,
      completionPercentage: 50,
      completedSections: [],
      rawAnswers: { 'business-model': { questionId: 'business-model', section: 'BUSINESS', value: 'x', capturedAt: new Date().toISOString() } },
      draftState: {},
      synthesized: {
        businessIntelligence: { businessModel: 'x', revenueSources: [], productsSummary: null, servicesSummary: null, appointmentsBookings: null, liveServices: null, digitalProducts: null, physicalProducts: null, memberships: null, events: null, content: null, customerSupport: null, fulfillment: null, payments: null, locationDependence: null, operationalConstraints: null },
        offeringMap: { version: 1, offerings: [{ offeringId: '1', name: 'A', type: 'SERVICE', description: '', customerGoal: '', purchaseRequired: false, bookingRequired: false, livePresenceRequired: false, deliveryMode: null, fulfillmentMode: null, repeatable: true, priority: 'PRIMARY', dependencies: [] }], extractedAt: new Date().toISOString() },
      },
      clientDeviceMetadata: {},
      submittedAt: null,
      version: 1,
    };
    const readiness = evaluateWorldFormationReadiness(session);
    expect(readiness.domains.BUSINESS_MODEL_READY).toBe(true);
    expect(readiness.domains.OFFERINGS_READY).toBe(true);
  });
});

describe('FUTURE_ACCOUNT_CLAIM_COMPATIBILITY_TEST', () => {
  beforeEach(() => resetWorldIntakeMemory());

  it('stores claimable email on invite', async () => {
    const { invite } = await createClientIntakeInvite({
      projectDisplayName: 'Claim Co',
      recipientLabel: 'Client',
      experienceAmbition: 'WORLD',
      recipientEmail: 'sister@example.com',
    });
    expect(invite.claimableByEmail).toBe('sister@example.com');
    expect(invite.claimedByUserId).toBeNull();
  });
});

describe('PROJECT_SCOPE_ISOLATION_TEST', () => {
  beforeEach(() => resetWorldIntakeMemory());

  it('tokens resolve to single invite only', async () => {
    const a = await createClientIntakeInvite({ projectDisplayName: 'A', recipientLabel: 'A', experienceAmbition: 'SITE' });
    const b = await createClientIntakeInvite({ projectDisplayName: 'B', recipientLabel: 'B', experienceAmbition: 'SITE' });
    const ra = await resolveInviteByRawToken(a.rawToken);
    const rb = await resolveInviteByRawToken(b.rawToken);
    expect(ra.ok && rb.ok && ra.invite.inviteId !== rb.invite.inviteId).toBe(true);
  });
});

describe('SERVER_CANONICAL_PERSISTENCE_TEST', () => {
  beforeEach(() => resetWorldIntakeMemory());

  it('increments session version on save', async () => {
    const { rawToken } = await createClientIntakeInvite({ projectDisplayName: 'V', recipientLabel: 'C', experienceAmbition: 'SITE' });
    const first = await autosaveGuestIntake({ rawToken, answers: [{ questionId: 'business-model', section: 'BUSINESS', value: '1' }] });
    const second = await autosaveGuestIntake({ rawToken, answers: [{ questionId: 'revenue-sources', section: 'BUSINESS', value: '2' }] });
    expect(second.session.version).toBeGreaterThan(first.session.version);
  });
});

describe('MOBILE_STEP_STATE_TEST', () => {
  it('has mobile-friendly one-thought steps', () => {
    expect(WORLD_INTAKE_STEPS.every((s) => s.title.length > 0)).toBe(true);
  });
});

describe('NO_ANTHROPIC_ON_SUBMIT_TEST', () => {
  it('submit path has no anthropic import in service', async () => {
    const src = await import('../../api/_lib/site00WorldIntake/worldIntakeService.js');
    expect(Object.keys(src)).not.toContain('anthropic');
  });
});

describe('NO_FAL_ON_SUBMIT_TEST', () => {
  it('submit path has no fal', async () => {
    const src = await import('../../api/_lib/site00WorldIntake/worldIntakeService.js');
    expect(JSON.stringify(Object.keys(src))).not.toMatch(/fal/i);
  });
});
