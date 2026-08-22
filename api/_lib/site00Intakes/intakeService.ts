/**
 * SITE 00 — canonical Identity + Builder intake service.
 *
 * Orchestrates the store adapter, guest access tokens, server-authoritative status transitions,
 * audit events, and (placeholder, non-art-directed) email events. This is the single module the
 * API handlers call into — no route file talks to the store or token modules directly.
 */
import * as store from './storeAdapter.js';
import { issueGuestAccessToken, resolveGuestAccessToken, revokeGuestAccessTokens } from './tokens.js';
import { assertIntakeAccess, IntakeAccessDeniedError, type IntakeAccessContext } from './authorization.js';
import { sendEmailAsync } from '../email/sendEmail.js';
import type { IntakeType, IntakeStatus, IntakeSummary, IntakeDetail } from '../../../shared/site00-intakes/types.js';
import { canTransitionIntakeStatus, normalizeIntakeStatus } from '../../../shared/site00-intakes/types.js';
import type { IntakeRecord, AdminIntakeFilters } from './types.js';
import {
  upsertLoreFromIdentityIntake,
  upsertExperienceFromBuilderIntake,
  getLoreForIntake,
} from '../site00BrandLore/loreService.js';

/**
 * Canonical guest resume/view URL — reuses the existing secure guest access token, same origin
 * convention as api/_lib/site00AccessCredentials/types.ts:buildAccessCredentialPublicUrl. Never a
 * second token system; never includes the guest email.
 */
function intakeGuestAccessUrl(rawToken: string): string {
  const base = (process.env.VITE_SITE00_CANONICAL_ORIGIN?.trim() || 'https://site00.com').replace(/\/$/, '');
  return `${base}/intake/access/${rawToken}`;
}

/** Truthful, human-facing status label for the Intake Access email record card. */
function formatIntakeStatusDisplay(status: IntakeStatus): string {
  switch (status) {
    case 'DRAFT':
      return 'DRAFT';
    case 'AWAITING_EMAIL_VERIFICATION':
      return 'AWAITING VERIFICATION';
    case 'ACTIVE':
      return 'IN PROGRESS';
    case 'SUBMITTED':
      return 'SUBMITTED';
    case 'IN_REVIEW':
      return 'IN REVIEW';
    case 'CONVERTED':
      return 'CONVERTED';
    case 'ARCHIVED':
      return 'ARCHIVED';
    default:
      return status;
  }
}

/** Formats a canonical ISO timestamp for display. Returns undefined (never a fabricated date) when absent/invalid. */
function formatIntakeTimestampDisplay(iso: string | null | undefined): string | undefined {
  if (!iso) return undefined;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return undefined;
  const formatted = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'UTC',
    timeZoneName: 'short',
  }).format(date);
  return formatted.toUpperCase();
}

/**
 * Derives a truthful completion percent ONLY when currentStep encodes a numeric step index
 * (e.g. "step-2") and totalSteps is a known positive count. Returns undefined otherwise — the
 * email renders a non-numeric "IN PROGRESS" treatment rather than fabricating a figure (XXIII).
 */
function deriveIntakeCompletionPercent(currentStep: string | null | undefined, totalSteps: number | null | undefined): number | undefined {
  if (!totalSteps || totalSteps <= 0 || !currentStep) return undefined;
  const match = /(\d+)/.exec(currentStep);
  if (!match) return undefined;
  const stepIndex = Number(match[1]);
  if (!Number.isFinite(stepIndex) || stepIndex <= 0) return undefined;
  return Math.round(Math.min(1, stepIndex / totalSteps) * 100);
}

/** Canonical Intake Access email dynamic payload — one source of truth so no caller fabricates values. */
function intakeAccessEmailVars(record: IntakeRecord, rawToken: string) {
  const status = normalizeIntakeStatus(record.status);
  return {
    intakeReference: record.publicReference,
    intakeType: record.intakeType,
    secureViewUrl: intakeGuestAccessUrl(rawToken),
    ctaUrl: intakeGuestAccessUrl(rawToken),
    intakeStatusDisplay: formatIntakeStatusDisplay(status),
    intakeLastSavedAtDisplay: formatIntakeTimestampDisplay(record.lastSavedAt),
    intakeCompletionPercent: deriveIntakeCompletionPercent(record.currentStep, record.totalSteps),
    nextStep: 'USE YOUR SECURE LINK TO RESUME OR REVIEW YOUR INTAKE.',
  };
}

export class IntakeValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'IntakeValidationError';
  }
}

export class IntakeNotFoundError extends Error {
  constructor(message = 'INTAKE NOT FOUND') {
    super(message);
    this.name = 'IntakeNotFoundError';
  }
}

export { IntakeAccessDeniedError };

function toSummary(r: IntakeRecord): IntakeSummary {
  return {
    id: r.id,
    intakeType: r.intakeType,
    publicReference: r.publicReference,
    status: normalizeIntakeStatus(r.status),
    ownerKind: r.userId ? 'AUTHENTICATED' : 'GUEST',
    email: r.email,
    verifiedEmailAt: r.verifiedEmailAt,
    currentStep: r.currentStep,
    totalSteps: r.totalSteps,
    projectId: r.projectId,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    lastSavedAt: r.lastSavedAt,
    submittedAt: r.submittedAt,
    claimedAt: r.claimedAt,
    domainLabel: r.domainLabel || null,
  };
}

function toDetail(r: IntakeRecord): IntakeDetail {
  return {
    ...toSummary(r),
    draftPayload: r.draftPayload,
    submittedPayload: r.submittedPayload,
    version: r.version,
    source: r.source,
    sourceRoute: r.sourceRoute,
  };
}

export type StartIntakeInput = {
  intakeType: IntakeType;
  domainLabel: string;
  userId?: string | null;
  email?: string | null;
  sourceRoute?: string | null;
  draftPayload?: Record<string, unknown>;
};

/**
 * Starts a new canonical intake draft. Guests (no userId) never require an account. If an
 * authenticated user already has an active (non-terminal) draft of this exact type, that draft
 * is returned instead of creating a duplicate — see XXXI/XXXII (resume, not re-create).
 */
export async function startIntake(input: StartIntakeInput): Promise<IntakeDetail> {
  if (input.userId) {
    const existing = await store.listIntakesByUserId(input.userId);
    const resumable = existing.find(
      (r) => r.intakeType === input.intakeType && !['SUBMITTED', 'IN_REVIEW', 'CONVERTED', 'ARCHIVED'].includes(normalizeIntakeStatus(r.status)),
    );
    if (resumable) return toDetail(resumable);
  }

  const record = await store.createIntake({
    intakeType: input.intakeType,
    userId: input.userId ?? null,
    email: input.email ?? null,
    domainLabel: input.domainLabel,
    draftPayload: input.draftPayload ?? {},
    source: 'WEB',
    sourceRoute: input.sourceRoute ?? null,
  });

  await store.createIntakeEvent({
    intakeType: record.intakeType,
    intakeId: record.id,
    eventType: 'INTAKE_CREATED',
    actor: input.userId ? `user:${input.userId}` : 'guest',
    metadata: { source: 'WEB', sourceRoute: input.sourceRoute ?? null },
  });

  return toDetail(record);
}

export async function getIntakeForAccess(
  intakeType: IntakeType,
  id: string,
  ctx: IntakeAccessContext,
): Promise<IntakeDetail> {
  const record = await store.getIntakeById(intakeType, id);
  if (!record) throw new IntakeNotFoundError();
  assertIntakeAccess(record, ctx);
  return toDetail(record);
}

export type AutosaveInput = {
  currentStep?: string | null;
  totalSteps?: number | null;
  draftPayload?: Record<string, unknown>;
  email?: string | null;
  clientVersion?: number;
};

/**
 * Real server-side autosave. Rejects writes to a record that has already moved past ACTIVE
 * (SUBMITTED/IN_REVIEW/CONVERTED/ARCHIVED) — submitted snapshots are never silently rewritten by
 * a stray autosave tick (XII). Throws (fails loud) rather than silently no-op.
 */
export async function autosaveIntake(
  intakeType: IntakeType,
  id: string,
  ctx: IntakeAccessContext,
  input: AutosaveInput,
): Promise<IntakeDetail> {
  const record = await store.getIntakeById(intakeType, id);
  if (!record) throw new IntakeNotFoundError();
  assertIntakeAccess(record, ctx);

  const status = normalizeIntakeStatus(record.status);
  if (status === 'SUBMITTED' || status === 'IN_REVIEW' || status === 'CONVERTED' || status === 'ARCHIVED') {
    throw new IntakeValidationError('INTAKE ALREADY SUBMITTED — DRAFT CANNOT BE MODIFIED');
  }

  const emailChanged = input.email !== undefined && input.email !== null && input.email.trim().toLowerCase() !== (record.email ?? '').trim().toLowerCase();
  const nextStatus: IntakeStatus = status === 'DRAFT' && (input.draftPayload || input.currentStep) ? 'ACTIVE' : status;

  const updated = await store.updateIntake(intakeType, id, {
    draftPayload: input.draftPayload !== undefined ? { ...record.draftPayload, ...input.draftPayload } : undefined,
    currentStep: input.currentStep,
    totalSteps: input.totalSteps,
    email: input.email !== undefined ? input.email : undefined,
    status: nextStatus !== status ? nextStatus : undefined,
    lastSavedAt: new Date().toISOString(),
    version: record.version + 1,
  });

  if (emailChanged) {
    await store.createIntakeEvent({
      intakeType,
      intakeId: id,
      eventType: 'INTAKE_EMAIL_ASSOCIATED',
      actor: ctx.kind === 'AUTHENTICATED' ? `user:${ctx.userId}` : 'guest',
      metadata: { hasEmail: true },
    });
  }

  let finalRecord = updated;

  if (intakeType === 'IDENTITY' && input.draftPayload?.loreAnswers) {
    const profile = await upsertLoreFromIdentityIntake({
      intakeId: id,
      draftPayload: { ...record.draftPayload, ...input.draftPayload },
      // IntakeRecord has no organizationId column — loreService resolves it from projectId.
      projectId: record.projectId,
    });
    if (profile) {
      finalRecord = await store.updateIntake(intakeType, id, {
        draftPayload: { ...finalRecord.draftPayload, brandLoreProfileId: profile.id },
      });
    }
  }

  if (intakeType === 'BUILDER' && input.draftPayload?.experienceAnswers) {
    const experience = await upsertExperienceFromBuilderIntake({
      intakeId: id,
      draftPayload: { ...record.draftPayload, ...input.draftPayload },
    });
    if (experience) {
      finalRecord = await store.updateIntake(intakeType, id, {
        draftPayload: { ...finalRecord.draftPayload, builderExperienceProfile: experience },
      });
    }
  }

  return toDetail(finalRecord);
}

export type SubmitIntakeInput = {
  requiredFields?: string[];
};

/**
 * Canonical submission. Idempotent: a second submit call on an already-SUBMITTED (or later)
 * record returns the existing submitted record rather than creating a duplicate snapshot or
 * re-sending the completion email (XI/XXIV/XXXII).
 */
export async function submitIntake(
  intakeType: IntakeType,
  id: string,
  ctx: IntakeAccessContext,
  input: SubmitIntakeInput = {},
): Promise<IntakeDetail> {
  const record = await store.getIntakeById(intakeType, id);
  if (!record) throw new IntakeNotFoundError();
  assertIntakeAccess(record, ctx);

  const status = normalizeIntakeStatus(record.status);
  if (status === 'SUBMITTED' || status === 'IN_REVIEW' || status === 'CONVERTED') {
    return toDetail(record);
  }
  if (!canTransitionIntakeStatus(status, 'SUBMITTED')) {
    throw new IntakeValidationError(`CANNOT SUBMIT FROM STATUS ${status}`);
  }

  const missing = (input.requiredFields ?? []).filter((f) => {
    const v = (record.draftPayload as Record<string, unknown>)[f];
    return v === undefined || v === null || v === '';
  });
  if (missing.length > 0) {
    throw new IntakeValidationError(`MISSING REQUIRED FIELDS: ${missing.join(', ')}`);
  }

  const submittedAt = new Date().toISOString();
  const nextVersion = record.version + 1;

  if (intakeType === 'IDENTITY' && (record.draftPayload as Record<string, unknown>).loreAnswers) {
    await upsertLoreFromIdentityIntake({
      intakeId: id,
      draftPayload: record.draftPayload,
      projectId: record.projectId,
    });
  }

  const updated = await store.updateIntake(intakeType, id, {
    status: 'SUBMITTED',
    submittedPayload: record.draftPayload,
    submittedAt,
    version: nextVersion,
  });

  await store.createIntakeEvent({
    intakeType,
    intakeId: id,
    eventType: 'INTAKE_SUBMITTED',
    actor: ctx.kind === 'AUTHENTICATED' ? `user:${ctx.userId}` : 'guest',
    metadata: { submittedAt, version: nextVersion },
  });

  if (updated.email) {
    sendEmailAsync({
      templateType: 'intake-submission-receipt',
      recipientEmail: updated.email,
      eventId: `INTAKE_SUBMITTED:${intakeType}:${id}:${nextVersion}`,
      variables: {
        intakeReference: updated.publicReference,
        intakeType: updated.intakeType,
        nextStep: updated.userId ? 'VIEW YOUR INTAKE IN YOUR ACCOUNT.' : 'A SECURE ACCESS LINK WILL FOLLOW IF ONE WAS ISSUED.',
      },
    });
  }

  return toDetail(updated);
}

export type SendGuestAccessInput = {
  email: string;
};

export type SendGuestAccessResult = {
  intake: IntakeDetail;
  /** Only ever returned to the caller who legitimately owns this intake right now (the request that just created/updated it). Never persisted in plaintext. */
  rawToken: string;
  expiresAt: string;
};

/**
 * Issues (or rotates) a secure guest access token and associates the guest email with the
 * intake. Only usable while the intake has no owning authenticated user — an authenticated
 * intake does not need a guest token (VII).
 */
export async function sendGuestAccess(
  intakeType: IntakeType,
  id: string,
  ctx: IntakeAccessContext,
  input: SendGuestAccessInput,
): Promise<SendGuestAccessResult> {
  const record = await store.getIntakeById(intakeType, id);
  if (!record) throw new IntakeNotFoundError();
  assertIntakeAccess(record, ctx);
  if (record.userId) {
    throw new IntakeValidationError('INTAKE ALREADY OWNED BY AN AUTHENTICATED ACCOUNT');
  }

  const email = input.email.trim().toLowerCase();
  if (!email || !email.includes('@')) {
    throw new IntakeValidationError('VALID EMAIL REQUIRED');
  }

  const status = normalizeIntakeStatus(record.status);
  const nextStatus: IntakeStatus = status === 'DRAFT' ? 'AWAITING_EMAIL_VERIFICATION' : status;
  const updated = await store.updateIntake(intakeType, id, {
    email,
    status: nextStatus !== status ? nextStatus : undefined,
    version: record.version + 1,
  });

  const issued = await issueGuestAccessToken(intakeType, id, email);

  await store.createIntakeEvent({
    intakeType,
    intakeId: id,
    eventType: 'INTAKE_ACCESS_ISSUED',
    actor: 'guest',
    metadata: { expiresAt: issued.expiresAt },
  });

  sendEmailAsync({
    templateType: 'intake-guest-access',
    recipientEmail: email,
    eventId: `INTAKE_ACCESS_REQUESTED:${intakeType}:${id}:${issued.tokenId}`,
    variables: intakeAccessEmailVars(updated, issued.rawToken),
  });

  return { intake: toDetail(updated), rawToken: issued.rawToken, expiresAt: issued.expiresAt };
}

export type GuestTokenResolution =
  | { ok: true; intake: IntakeDetail }
  | { ok: false; reason: 'NOT_FOUND' | 'EXPIRED' | 'REVOKED' };

/** Resolves a raw guest token to the intake it authorizes, recording an INTAKE_RESUMED event. */
export async function resolveIntakeByGuestToken(rawToken: string): Promise<GuestTokenResolution> {
  const resolution = await resolveGuestAccessToken(rawToken);
  if (!resolution.ok) return resolution;

  const record = await store.getIntakeById(resolution.token.intakeType, resolution.token.intakeId);
  if (!record) return { ok: false, reason: 'NOT_FOUND' };

  await store.createIntakeEvent({
    intakeType: record.intakeType,
    intakeId: record.id,
    eventType: 'INTAKE_RESUMED',
    actor: 'guest',
    metadata: {},
  });

  return { ok: true, intake: toDetail(record) };
}

/**
 * Claims all eligible unclaimed guest intakes for the authenticated user's verified email.
 * "Verified" here means the caller is an authenticated Supabase user whose session email we
 * trust as already-verified by Supabase Auth — same-email alone (e.g. an unverified guest
 * typing an email string) is never sufficient (VIII).
 */
export async function claimGuestIntakesForVerifiedEmail(
  userId: string,
  verifiedEmail: string,
): Promise<IntakeDetail[]> {
  const email = verifiedEmail.trim().toLowerCase();
  if (!email) return [];

  const eligible = await store.listUnclaimedIntakesByEmail(email);
  const claimedAt = new Date().toISOString();
  const results: IntakeRecord[] = [];

  for (const record of eligible) {
    const updated = await store.updateIntake(record.intakeType, record.id, {
      userId,
      claimedAt,
      claimedByUserId: userId,
      version: record.version + 1,
    });
    results.push(updated);

    await store.createIntakeEvent({
      intakeType: record.intakeType,
      intakeId: record.id,
      eventType: 'INTAKE_CLAIMED',
      actor: `user:${userId}`,
      metadata: { claimedAt },
    });

    if (updated.email) {
      sendEmailAsync({
        templateType: 'intake-claimed',
        recipientEmail: updated.email,
        eventId: `INTAKE_CLAIMED:${record.intakeType}:${record.id}`,
        variables: {
          intakeReference: updated.publicReference,
          intakeType: updated.intakeType,
          nextStep: 'VIEW YOUR CLAIMED INTAKE IN YOUR ACCOUNT.',
        },
      });
    }
  }

  return results.map(toDetail);
}

export async function listMyIntakes(userId: string): Promise<IntakeSummary[]> {
  const records = await store.listIntakesByUserId(userId);
  return records.map(toSummary);
}

export async function listIntakesForAdmin(filters: AdminIntakeFilters): Promise<IntakeSummary[]> {
  const records = await store.listIntakesForAdmin(filters);
  return records.map(toSummary);
}

export async function getIntakeForAdmin(intakeType: IntakeType, id: string): Promise<IntakeDetail | null> {
  const record = await store.getIntakeById(intakeType, id);
  return record ? toDetail(record) : null;
}

export async function listIntakeAuditEvents(intakeType: IntakeType, id: string) {
  return store.listEventsForIntake(intakeType, id);
}

const ADMIN_ALLOWED_ACTIONS = ['MARK_IN_REVIEW', 'ARCHIVE'] as const;
export type AdminIntakeAction = (typeof ADMIN_ALLOWED_ACTIONS)[number];

/** Conservative admin lifecycle actions only — never rewrites what a client submitted (XVII). */
export async function applyAdminIntakeAction(
  intakeType: IntakeType,
  id: string,
  action: AdminIntakeAction,
  adminEmail: string,
): Promise<IntakeDetail> {
  const record = await store.getIntakeById(intakeType, id);
  if (!record) throw new IntakeNotFoundError();

  const status = normalizeIntakeStatus(record.status);
  const nextStatus: IntakeStatus = action === 'MARK_IN_REVIEW' ? 'IN_REVIEW' : 'ARCHIVED';
  if (!canTransitionIntakeStatus(status, nextStatus)) {
    throw new IntakeValidationError(`CANNOT TRANSITION FROM ${status} TO ${nextStatus}`);
  }

  const updated = await store.updateIntake(intakeType, id, { status: nextStatus, version: record.version + 1 });

  await store.createIntakeEvent({
    intakeType,
    intakeId: id,
    eventType: action === 'MARK_IN_REVIEW' ? 'INTAKE_MARKED_IN_REVIEW' : 'INTAKE_ARCHIVED',
    actor: `admin:${adminEmail}`,
    metadata: {},
  });

  return toDetail(updated);
}

export { toSummary as intakeRecordToSummary, toDetail as intakeRecordToDetail };
