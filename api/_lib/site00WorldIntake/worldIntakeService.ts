/**
 * World-class client guest intake service.
 */

import { randomUUID } from 'node:crypto';
import {
  DEFAULT_INVITE_TTL_MS,
  WORLD_INTAKE_SECTIONS,
  WORLD_INTELLIGENCE_SNAPSHOT_VERSION,
  WORLD_INTAKE_TYPE,
  adminAmbitionToExperienceClass,
  worldIntakeGuestUrl,
} from '../../../shared/site00-world-intake/constants.js';
import type {
  CreateIntakeInviteInput,
  CreateIntakeInviteResult,
  GuestIntakeSession,
  IntakeInviteRecord,
  RawAnswerRecord,
  WorldIntelligenceSnapshot,
} from '../../../shared/site00-world-intake/types.js';
import { WORLD_INTAKE_STEPS } from '../../../shared/site00-world-intake/questions.js';
import {
  createWorldIntelligenceSnapshot,
  synthesizeSessionIntelligence,
} from '../../../shared/site00-world-intake/synthesis.js';
import { evaluateWorldFormationReadiness } from '../../../shared/site00-world-intake/readiness.js';
import { generateRawIntakeToken, hashIntakeToken } from './tokens.js';
import * as store from './storeAdapter.js';

function nowIso(): string {
  return new Date().toISOString();
}

function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
  return `${base || 'client'}-${randomUUID().slice(0, 8)}`;
}

function computeCompletion(session: GuestIntakeSession): number {
  const total = WORLD_INTAKE_STEPS.length;
  const answered = WORLD_INTAKE_STEPS.filter((s) => session.rawAnswers[s.id]).length;
  return Math.min(100, Math.round((answered / total) * 100));
}

export async function createClientIntakeInvite(input: CreateIntakeInviteInput): Promise<CreateIntakeInviteResult> {
  const rawToken = generateRawIntakeToken();
  const tokenHash = hashIntakeToken(rawToken);
  const projectId = randomUUID();
  const projectSlug = slugify(input.projectDisplayName);
  const expiresAt = input.expiresAt ?? new Date(Date.now() + DEFAULT_INVITE_TTL_MS).toISOString();

  await store.saveProjectStub({ projectId, slug: projectSlug, name: input.projectDisplayName });

  const invite: IntakeInviteRecord = {
    inviteId: randomUUID(),
    tokenHash,
    projectId,
    orgId: null,
    projectSlug,
    projectDisplayName: input.projectDisplayName,
    intakeType: WORLD_INTAKE_TYPE,
    projectExperienceClass: adminAmbitionToExperienceClass(input.experienceAmbition),
    status: 'ACTIVE',
    createdBy: input.createdBy ?? null,
    createdAt: nowIso(),
    expiresAt,
    startedAt: null,
    completedAt: null,
    revokedAt: null,
    lastSavedAt: null,
    recipientLabel: input.recipientLabel,
    recipientEmail: input.recipientEmail ?? null,
    allowedSections: [...WORLD_INTAKE_SECTIONS],
    intelligenceSnapshotVersion: WORLD_INTELLIGENCE_SNAPSHOT_VERSION,
    metadata: { experienceAmbition: input.experienceAmbition },
    claimableByEmail: input.recipientEmail ?? null,
    claimedByUserId: null,
    claimedAt: null,
  };

  await store.saveInvite(invite);

  return {
    invite,
    privateLink: worldIntakeGuestUrl(rawToken),
    rawToken,
  };
}

export type InviteTokenResolution =
  | { ok: true; invite: IntakeInviteRecord; session: GuestIntakeSession }
  | { ok: false; reason: 'NOT_FOUND' | 'EXPIRED' | 'REVOKED' | 'INVALID' };

export async function resolveInviteByRawToken(rawToken: string): Promise<InviteTokenResolution> {
  if (!rawToken || rawToken.trim().length < 16) return { ok: false, reason: 'INVALID' };
  const tokenHash = hashIntakeToken(rawToken.trim());
  const invite = await store.getInviteByTokenHash(tokenHash);
  if (!invite) return { ok: false, reason: 'NOT_FOUND' };
  if (invite.revokedAt || invite.status === 'REVOKED') return { ok: false, reason: 'REVOKED' };
  if (invite.expiresAt && new Date(invite.expiresAt).getTime() < Date.now()) {
    return { ok: false, reason: 'EXPIRED' };
  }

  let session = await store.getSessionByInviteId(invite.inviteId);
  if (!session) {
    session = {
      sessionId: randomUUID(),
      inviteId: invite.inviteId,
      projectId: invite.projectId,
      startedAt: nowIso(),
      lastActivityAt: nowIso(),
      currentSection: 'BUSINESS',
      currentStep: WORLD_INTAKE_STEPS[0]?.id ?? null,
      completionPercentage: 0,
      completedSections: [],
      rawAnswers: {},
      draftState: {},
      synthesized: {},
      clientDeviceMetadata: {},
      submittedAt: null,
      version: 1,
    };
    await store.saveSession(session);
    if (invite.status === 'ACTIVE' || invite.status === 'CREATED') {
      await store.saveInvite({ ...invite, status: 'STARTED', startedAt: invite.startedAt ?? nowIso() });
    }
  }

  return { ok: true, invite, session };
}

export async function autosaveGuestIntake(params: {
  rawToken: string;
  answers: Array<{ questionId: string; section: string; value: unknown; verbatim?: string }>;
  currentSection?: string;
  currentStep?: string;
  clientDeviceMetadata?: Record<string, unknown>;
}): Promise<{ invite: IntakeInviteRecord; session: GuestIntakeSession }> {
  const resolved = await resolveInviteByRawToken(params.rawToken);
  if (!resolved.ok) throw new Error(`INTAKE_ACCESS_${resolved.reason}`);

  const { invite } = resolved;
  let session = resolved.session;

  if (invite.status === 'COMPLETED') {
    return { invite, session };
  }

  const rawAnswers = { ...session.rawAnswers };
  for (const a of params.answers) {
    rawAnswers[a.questionId] = {
      questionId: a.questionId,
      section: a.section,
      value: a.value,
      verbatim: a.verbatim ?? (typeof a.value === 'string' ? a.value : null),
      capturedAt: nowIso(),
    } satisfies RawAnswerRecord;
  }

  session = {
    ...session,
    rawAnswers,
    currentSection: (params.currentSection as GuestIntakeSession['currentSection']) ?? session.currentSection,
    currentStep: params.currentStep ?? session.currentStep,
    clientDeviceMetadata: { ...session.clientDeviceMetadata, ...params.clientDeviceMetadata },
    lastActivityAt: nowIso(),
    version: session.version + 1,
  };

  session.synthesized = synthesizeSessionIntelligence(session);
  session.completionPercentage = computeCompletion(session);

  await store.saveSession(session);
  await store.saveInvite({ ...invite, lastSavedAt: nowIso(), status: 'STARTED' });

  return { invite, session };
}

export async function submitGuestIntake(rawToken: string): Promise<{
  invite: IntakeInviteRecord;
  session: GuestIntakeSession;
  snapshot: WorldIntelligenceSnapshot;
}> {
  const resolved = await resolveInviteByRawToken(rawToken);
  if (!resolved.ok) throw new Error(`INTAKE_ACCESS_${resolved.reason}`);

  let { invite, session } = resolved;
  session.synthesized = synthesizeSessionIntelligence(session);
  session.completionPercentage = computeCompletion(session);
  session.submittedAt = nowIso();
  session.lastActivityAt = nowIso();

  await store.saveSession(session);

  const snapshot = createWorldIntelligenceSnapshot(invite, session);
  await store.saveSnapshot(snapshot);

  invite = {
    ...invite,
    status: 'COMPLETED',
    completedAt: nowIso(),
    lastSavedAt: nowIso(),
  };
  await store.saveInvite(invite);

  return { invite, session, snapshot };
}

export async function revokeClientIntakeInvite(inviteId: string): Promise<IntakeInviteRecord> {
  const invite = await store.getInviteById(inviteId);
  if (!invite) throw new Error('Invite not found');
  const updated = { ...invite, status: 'REVOKED' as const, revokedAt: nowIso() };
  return store.saveInvite(updated);
}

export async function regenerateClientIntakeLink(inviteId: string): Promise<CreateIntakeInviteResult> {
  const invite = await store.getInviteById(inviteId);
  if (!invite) throw new Error('Invite not found');
  await revokeClientIntakeInvite(inviteId);
  return createClientIntakeInvite({
    projectDisplayName: invite.projectDisplayName,
    recipientLabel: invite.recipientLabel,
    experienceAmbition: (invite.metadata.experienceAmbition as CreateIntakeInviteInput['experienceAmbition']) ?? 'UNSURE',
    recipientEmail: invite.recipientEmail,
    createdBy: invite.createdBy,
  });
}

export async function listClientIntakeInvites() {
  const invites = await store.listInvites();
  const summaries = await Promise.all(
    invites.map(async (invite) => {
      const session = await store.getSessionByInviteId(invite.inviteId);
      const readiness = session
        ? evaluateWorldFormationReadiness(session).state
        : 'WORLD_INTAKE_INCOMPLETE';
      return {
        inviteId: invite.inviteId,
        projectDisplayName: invite.projectDisplayName,
        projectSlug: invite.projectSlug,
        recipientLabel: invite.recipientLabel,
        projectExperienceClass: invite.projectExperienceClass,
        status: invite.status,
        completionPercentage: session?.completionPercentage ?? 0,
        worldFormationReadiness: readiness,
        lastSavedAt: invite.lastSavedAt,
        createdAt: invite.createdAt,
        expiresAt: invite.expiresAt,
      };
    }),
  );
  return summaries;
}

export async function getClientIntakeIntelligence(inviteId: string) {
  const invite = await store.getInviteById(inviteId);
  if (!invite) return null;
  const session = await store.getSessionByInviteId(invite.inviteId);
  const snapshot = await store.getSnapshotByInviteId(inviteId);
  return { invite, session, snapshot };
}

export async function markReadyForFutureWorldFormation(inviteId: string) {
  const intel = await getClientIntakeIntelligence(inviteId);
  if (!intel?.session) throw new Error('Session not found');
  const readiness = evaluateWorldFormationReadiness(intel.session);
  if (readiness.state !== 'WORLD_FORMATION_READY') {
    throw new Error(`Not world-formation-ready: ${readiness.state}`);
  }
  return intel;
}
