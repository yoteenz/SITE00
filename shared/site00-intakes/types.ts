/**
 * SITE 00 — canonical Identity + Builder intake persistence types.
 *
 * Identity and Builder intake answers are stored in two separate, domain-specific tables
 * (site00_idnty_submissions, site00_bldr_intakes) because their questions/answers differ.
 * This module defines the SHARED lifecycle shape both intake types expose to the API,
 * client surfaces, and admin Intake Inbox — so the two domains share infrastructure
 * without merging their schemas.
 */

export type IntakeType = 'IDENTITY' | 'BUILDER';

/**
 * Canonical lifecycle status. Builder's underlying table also accepts the legacy values
 * IN_PROGRESS / REVIEWED for backward compatibility with the existing BLDR Intakes admin
 * page — see normalizeIntakeStatus().
 */
export type IntakeStatus =
  | 'DRAFT'
  | 'AWAITING_EMAIL_VERIFICATION'
  | 'ACTIVE'
  | 'SUBMITTED'
  | 'IN_REVIEW'
  | 'CONVERTED'
  | 'ARCHIVED';

/** Raw status values that may exist in the DB (canonical ∪ legacy). */
export type RawIntakeStatus = IntakeStatus | 'IN_PROGRESS' | 'REVIEWED' | 'COMPLETE';

export function normalizeIntakeStatus(raw: string): IntakeStatus {
  switch (raw) {
    case 'IN_PROGRESS':
      return 'ACTIVE';
    case 'REVIEWED':
      return 'IN_REVIEW';
    case 'COMPLETE':
      return 'SUBMITTED';
    default:
      return raw as IntakeStatus;
  }
}

/** Server-authoritative legal transition map. Illegal transitions are rejected, never trusted from the client. */
export const ALLOWED_INTAKE_STATUS_TRANSITIONS: Record<IntakeStatus, IntakeStatus[]> = {
  DRAFT: ['DRAFT', 'AWAITING_EMAIL_VERIFICATION', 'ACTIVE', 'SUBMITTED', 'ARCHIVED'],
  // A guest may submit immediately after providing their email (VI/VII) — email capture is for
  // ownership/resume/receipt, not a hard gate on submission, so SUBMITTED must be reachable here.
  AWAITING_EMAIL_VERIFICATION: ['AWAITING_EMAIL_VERIFICATION', 'ACTIVE', 'SUBMITTED', 'ARCHIVED'],
  ACTIVE: ['ACTIVE', 'AWAITING_EMAIL_VERIFICATION', 'SUBMITTED', 'ARCHIVED'],
  SUBMITTED: ['SUBMITTED', 'IN_REVIEW', 'CONVERTED', 'ARCHIVED'],
  IN_REVIEW: ['IN_REVIEW', 'SUBMITTED', 'CONVERTED', 'ARCHIVED'],
  CONVERTED: ['CONVERTED', 'ARCHIVED'],
  ARCHIVED: ['ARCHIVED'],
};

export function canTransitionIntakeStatus(from: IntakeStatus, to: IntakeStatus): boolean {
  if (from === to) return true;
  return ALLOWED_INTAKE_STATUS_TRANSITIONS[from]?.includes(to) ?? false;
}

export type IntakeOwnerKind = 'GUEST' | 'AUTHENTICATED';

/** Client-and-admin-safe summary shape (list rows). Never includes token hashes or service-role-only metadata. */
export type IntakeSummary = {
  id: string;
  intakeType: IntakeType;
  publicReference: string;
  status: IntakeStatus;
  ownerKind: IntakeOwnerKind;
  email: string | null;
  verifiedEmailAt: string | null;
  currentStep: string | null;
  totalSteps: number | null;
  projectId: string | null;
  createdAt: string;
  updatedAt: string;
  lastSavedAt: string | null;
  submittedAt: string | null;
  claimedAt: string | null;
  /** Domain-specific label for list display (Identity state slug or Builder build class). */
  domainLabel: string | null;
};

/** Client-and-admin-safe detail shape. Excludes internal-only fields (token hashes, raw audit payload). */
export type IntakeDetail = IntakeSummary & {
  draftPayload: Record<string, unknown>;
  submittedPayload: Record<string, unknown> | null;
  version: number;
  source: string;
  sourceRoute: string | null;
};

export type IntakeAuditEventType =
  | 'INTAKE_CREATED'
  | 'INTAKE_EMAIL_ASSOCIATED'
  | 'INTAKE_SAVED'
  | 'INTAKE_ACCESS_ISSUED'
  | 'INTAKE_RESUMED'
  | 'INTAKE_SUBMITTED'
  | 'INTAKE_CLAIMED'
  | 'INTAKE_MARKED_IN_REVIEW'
  | 'INTAKE_CONVERTED'
  | 'INTAKE_ARCHIVED';

export type IntakeAuditEvent = {
  id: string;
  intakeType: IntakeType;
  intakeId: string;
  eventType: IntakeAuditEventType;
  actor: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export function isIntakeType(value: unknown): value is IntakeType {
  return value === 'IDENTITY' || value === 'BUILDER';
}

export function intakeReferencePrefix(type: IntakeType): 'IDN' | 'BLD' {
  return type === 'IDENTITY' ? 'IDN' : 'BLD';
}
