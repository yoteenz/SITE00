import type { IntakeType } from '../../../shared/site00-intakes/types.js';

/** Internal normalized row shape shared by the memory and Supabase store implementations. */
export type IntakeRecord = {
  id: string;
  intakeType: IntakeType;
  identityId: string | null;
  userId: string | null;
  email: string | null;
  verifiedEmailAt: string | null;
  status: string;
  /** identity_state for IDENTITY, build_class for BUILDER — required domain discriminator. */
  domainLabel: string;
  draftPayload: Record<string, unknown>;
  submittedPayload: Record<string, unknown> | null;
  currentStep: string | null;
  totalSteps: number | null;
  source: string;
  sourceRoute: string | null;
  projectId: string | null;
  publicReference: string;
  createdAt: string;
  updatedAt: string;
  lastSavedAt: string | null;
  submittedAt: string | null;
  claimedAt: string | null;
  claimedByUserId: string | null;
  version: number;
  schemaVersion: number;
};

export type CreateIntakeInput = {
  intakeType: IntakeType;
  userId?: string | null;
  email?: string | null;
  domainLabel: string;
  draftPayload?: Record<string, unknown>;
  currentStep?: string | null;
  totalSteps?: number | null;
  source?: string;
  sourceRoute?: string | null;
};

export type IntakeUpdate = Partial<
  Pick<
    IntakeRecord,
    | 'userId'
    | 'email'
    | 'verifiedEmailAt'
    | 'status'
    | 'domainLabel'
    | 'draftPayload'
    | 'submittedPayload'
    | 'currentStep'
    | 'totalSteps'
    | 'projectId'
    | 'lastSavedAt'
    | 'submittedAt'
    | 'claimedAt'
    | 'claimedByUserId'
    | 'version'
  >
>;

export type AdminIntakeFilters = {
  intakeType?: IntakeType;
  status?: string;
  ownerKind?: 'GUEST' | 'AUTHENTICATED';
  search?: string;
  sort?: 'newest' | 'oldest' | 'recently_updated' | 'recently_submitted';
  limit?: number;
};

export type AccessTokenPurpose = 'GUEST_ACCESS' | 'EMAIL_VERIFICATION';

export type AccessTokenRecord = {
  id: string;
  intakeType: IntakeType;
  intakeId: string;
  tokenHash: string;
  purpose: AccessTokenPurpose;
  guestEmail: string | null;
  issuedAt: string;
  expiresAt: string;
  lastUsedAt: string | null;
  usedCount: number;
  revokedAt: string | null;
  replacedByTokenId: string | null;
};

export type CreateAccessTokenInput = Omit<AccessTokenRecord, 'id' | 'issuedAt' | 'lastUsedAt' | 'usedCount' | 'revokedAt' | 'replacedByTokenId'>;

export type IntakeEventRecord = {
  id: string;
  intakeType: IntakeType;
  intakeId: string;
  eventType: string;
  actor: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export type CreateIntakeEventInput = Omit<IntakeEventRecord, 'id' | 'createdAt'>;
