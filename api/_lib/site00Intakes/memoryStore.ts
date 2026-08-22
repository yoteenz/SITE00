/** In-memory intake store — used only under VITEST (unit tests never touch real Supabase). */
import type { IntakeType } from '../../../shared/site00-intakes/types.js';
import { intakeReferencePrefix } from '../../../shared/site00-intakes/types.js';
import type {
  AccessTokenRecord,
  AdminIntakeFilters,
  CreateAccessTokenInput,
  CreateIntakeEventInput,
  CreateIntakeInput,
  IntakeEventRecord,
  IntakeRecord,
  IntakeUpdate,
} from './types.js';

let intakes: IntakeRecord[] = [];
let tokens: AccessTokenRecord[] = [];
let events: IntakeEventRecord[] = [];
let counter = 0;

function nextId(prefix: string): string {
  counter += 1;
  return `${prefix}_${counter}_${Date.now().toString(36)}`;
}

/** Test-only reset so each test file starts from a clean slate. */
export function resetIntakeMemoryStore(): void {
  intakes = [];
  tokens = [];
  events = [];
  counter = 0;
}

export async function createIntake(input: CreateIntakeInput): Promise<IntakeRecord> {
  const now = new Date().toISOString();
  const id = nextId('intake');
  const record: IntakeRecord = {
    id,
    intakeType: input.intakeType,
    identityId: null,
    userId: input.userId ?? null,
    email: input.email ?? null,
    verifiedEmailAt: null,
    status: 'DRAFT',
    domainLabel: input.domainLabel,
    draftPayload: input.draftPayload ?? {},
    submittedPayload: null,
    currentStep: input.currentStep ?? null,
    totalSteps: input.totalSteps ?? null,
    source: input.source ?? 'WEB',
    sourceRoute: input.sourceRoute ?? null,
    projectId: null,
    publicReference: `${intakeReferencePrefix(input.intakeType)}-${id.toUpperCase().slice(-8)}`,
    createdAt: now,
    updatedAt: now,
    lastSavedAt: null,
    submittedAt: null,
    claimedAt: null,
    claimedByUserId: null,
    version: 1,
    schemaVersion: 1,
  };
  intakes.push(record);
  return record;
}

export async function getIntakeById(intakeType: IntakeType, id: string): Promise<IntakeRecord | null> {
  return intakes.find((r) => r.intakeType === intakeType && r.id === id) ?? null;
}

export async function listIntakesByUserId(userId: string): Promise<IntakeRecord[]> {
  return intakes.filter((r) => r.userId === userId).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function listUnclaimedIntakesByEmail(email: string): Promise<IntakeRecord[]> {
  const lower = email.trim().toLowerCase();
  return intakes.filter(
    (r) => !r.userId && (r.email ?? '').trim().toLowerCase() === lower && r.status !== 'DRAFT' && r.status !== 'ARCHIVED',
  );
}

export async function updateIntake(intakeType: IntakeType, id: string, patch: IntakeUpdate): Promise<IntakeRecord> {
  const record = intakes.find((r) => r.intakeType === intakeType && r.id === id);
  if (!record) throw new Error('INTAKE NOT FOUND');
  Object.assign(record, patch, { updatedAt: new Date().toISOString() });
  return record;
}

export async function listIntakesForAdmin(filters: AdminIntakeFilters): Promise<IntakeRecord[]> {
  let rows = [...intakes];
  if (filters.intakeType) rows = rows.filter((r) => r.intakeType === filters.intakeType);
  if (filters.status) rows = rows.filter((r) => r.status === filters.status);
  if (filters.ownerKind === 'GUEST') rows = rows.filter((r) => !r.userId);
  if (filters.ownerKind === 'AUTHENTICATED') rows = rows.filter((r) => Boolean(r.userId));
  if (filters.search) {
    const term = filters.search.trim().toLowerCase();
    rows = rows.filter(
      (r) =>
        (r.email ?? '').toLowerCase().includes(term) ||
        r.publicReference.toLowerCase().includes(term) ||
        r.domainLabel.toLowerCase().includes(term),
    );
  }
  const sort = filters.sort ?? 'newest';
  rows.sort((a, b) => {
    if (sort === 'oldest') return a.createdAt.localeCompare(b.createdAt);
    if (sort === 'recently_updated') return b.updatedAt.localeCompare(a.updatedAt);
    if (sort === 'recently_submitted') return (b.submittedAt ?? '').localeCompare(a.submittedAt ?? '');
    return b.createdAt.localeCompare(a.createdAt);
  });
  return filters.limit ? rows.slice(0, filters.limit) : rows;
}

export async function createAccessToken(input: CreateAccessTokenInput): Promise<AccessTokenRecord> {
  const record: AccessTokenRecord = {
    ...input,
    id: nextId('token'),
    issuedAt: new Date().toISOString(),
    lastUsedAt: null,
    usedCount: 0,
    revokedAt: null,
    replacedByTokenId: null,
  };
  tokens.push(record);
  return record;
}

export async function getAccessTokenByHash(tokenHash: string): Promise<AccessTokenRecord | null> {
  return tokens.find((t) => t.tokenHash === tokenHash) ?? null;
}

export async function listActiveTokensForIntake(
  intakeType: IntakeType,
  intakeId: string,
  purpose: AccessTokenRecord['purpose'],
): Promise<AccessTokenRecord[]> {
  return tokens.filter(
    (t) => t.intakeType === intakeType && t.intakeId === intakeId && t.purpose === purpose && !t.revokedAt,
  );
}

export async function updateAccessToken(id: string, patch: Partial<AccessTokenRecord>): Promise<AccessTokenRecord> {
  const record = tokens.find((t) => t.id === id);
  if (!record) throw new Error('TOKEN NOT FOUND');
  Object.assign(record, patch);
  return record;
}

export async function createIntakeEvent(input: CreateIntakeEventInput): Promise<IntakeEventRecord> {
  const record: IntakeEventRecord = { ...input, id: nextId('event'), createdAt: new Date().toISOString() };
  events.push(record);
  return record;
}

export async function listEventsForIntake(intakeType: IntakeType, intakeId: string): Promise<IntakeEventRecord[]> {
  return events
    .filter((e) => e.intakeType === intakeType && e.intakeId === intakeId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
